import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Problem } from './models/entities/problem/problem';
import { TestCase } from './models/entities/test-case/test-case';
import { CreateProblemDto } from './dto/create-problem-dto';

@Injectable()
export class ProblemsService {
    private problemsRepository: Repository<Problem>;
    private testCasesRepository: Repository<TestCase>;

    constructor(private poolConexion: DataSource) {
        this.problemsRepository = poolConexion.getRepository(Problem);
        this.testCasesRepository = poolConexion.getRepository(TestCase);
    }

    /**
     * Creates a new problem with its test cases
     * @param CreateProblemDto - Data transfer object containing problem details and test cases
     * @returns The created problem with test cases
     */
    public async createProblem(CreateProblemDto: CreateProblemDto): Promise<Problem> {
        const { testCases, ...problemData } = CreateProblemDto;

        // Create and save the problem
        const problem = this.problemsRepository.create(problemData);
        const savedProblem = await this.problemsRepository.save(problem);

        // Create and save test cases if provided
        if (testCases && testCases.length > 0) {
            const testCaseEntities = testCases.map(tc => {
                return this.testCasesRepository.create({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isSample: tc.isSample || false,
                    score: tc.score || 0,
                    problem: savedProblem,
                });
            });

            await this.testCasesRepository.save(testCaseEntities);
        }

        return this.findOne(savedProblem.codProblem);
    }

    /**
     * Finds a problem by its ID including all test cases
     * @param id - Problem ID
     * @throws NotFoundException if problem not found
     * @returns The requested problem
     */
    public async findOne(id: string): Promise<Problem> {
        const problem = await this.problemsRepository.findOne({
            where: { codProblem: id },
            relations: ['testCases'],
        });

        if (!problem) {
            throw new NotFoundException(`Problem with ID ${id} not found`);
        }

        return problem;
    }

    /**
     * Finds all problems with optional filters
     * @param options - Filter options (isPublic: boolean, tags: string[])
     * @returns List of problems (only sample test cases included by default)
     */
    public async findAll(options?: { isPublic?: boolean; tags?: string[] }): Promise<Problem[]> {
        const query = this.problemsRepository.createQueryBuilder('problem')
            .leftJoinAndSelect('problem.testCases', 'testCase', 'testCase.isSample = :isSample', { isSample: true });

        if (options?.isPublic !== undefined) {
            query.andWhere('problem.isPublic = :isPublic', { isPublic: options.isPublic });
        }

        if (options?.tags && options.tags.length > 0) {
            query.andWhere('problem.tags && :tags', { tags: options.tags });
        }

        return query.getMany();
    }

    /**
     * Updates a problem and its test cases
     * @param id - Problem ID to update
     * @param updateProblemDto - Updated problem data
     * @returns The updated problem
     */
    public async update(id: string, updateProblemDto: CreateProblemDto): Promise<Problem> {
        const problem = await this.findOne(id);

        // Update problem properties
        const { testCases, ...problemData } = updateProblemDto;
        Object.assign(problem, problemData);

        await this.problemsRepository.save(problem);

        // Update test cases if provided
        if (testCases && testCases.length > 0) {
            // Delete existing test cases
            await this.testCasesRepository.delete({ problem: { codProblem: id } });

            // Create new test cases
            const testCaseEntities = testCases.map(tc => {
                return this.testCasesRepository.create({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isSample: tc.isSample || false,
                    score: tc.score || 0,
                    problem: problem,
                });
            });

            await this.testCasesRepository.save(testCaseEntities);
        }

        return this.findOne(id);
    }

    /**
     * Deletes a problem and its associated test cases (cascade)
     * @param id - Problem ID to delete
     */
    public async remove(id: string): Promise<void> {
        const problem = await this.findOne(id);
        await this.problemsRepository.remove(problem);
    }
}
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

    public async createProblem(CreateProblemDto: CreateProblemDto): Promise<Problem> {
        const { testCases, ...problemData } = CreateProblemDto;

        const problem = this.problemsRepository.create(problemData);
        const savedProblem = await this.problemsRepository.save(problem);

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

    // tags?: string[]; // Se puede usar para filtrar problemas por etiquetas

    public async findAll(options?: { isPublic?: boolean; }): Promise<Problem[]> {
        const query = this.problemsRepository.createQueryBuilder('problem')
            .leftJoinAndSelect('problem.testCases', 'testCase', 'testCase.isSample = :isSample', { isSample: true });

        if (options?.isPublic !== undefined) {
            query.andWhere('problem.isPublic = :isPublic', { isPublic: options.isPublic });
        }

        //if (options?.tags && options.tags.length > 0) {
        //    // Buscar problemas que contengan al menos una de las etiquetas
        //    query.andWhere('problem.tags && :tags', { tags: options.tags });
        //}

        return query.getMany();
    }

    public async update(id: string, updateProblemDto: CreateProblemDto): Promise<Problem> {
        const problem = await this.findOne(id);

        // Actualizar propiedades del problema
        const { testCases, ...problemData } = updateProblemDto;
        Object.assign(problem, problemData);

        await this.problemsRepository.save(problem);

        // Si se proporcionan casos de prueba, actualizar
        if (testCases && testCases.length > 0) {
            // Eliminar casos de prueba existentes
            await this.testCasesRepository.delete({ problem: { codProblem: id } });

            // Crear nuevos casos de prueba
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

    public async remove(id: string): Promise<void> {
        const problem = await this.findOne(id);
        await this.problemsRepository.remove(problem);
    }
}

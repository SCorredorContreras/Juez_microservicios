import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Problem } from './models/entities/problem/problem';
import { CreateProblemDto } from './dto/create-problem-dto';
import { TestCasesService } from 'src/test-cases/test-cases.service';
import { SubmissionsService } from 'src/submissions/submissions.service';

@Injectable()
export class ProblemsService {
  constructor(
    @InjectRepository(Problem)
    private readonly problemRepository: Repository<Problem>,
    private readonly testCasesService: TestCasesService,
  ) {}

  /**
   * Creates a new problem with associated test cases
   * @param createProblemDto DTO containing problem data and test cases
   * @returns The created problem with all details including test cases
   */
  async createProblem(createProblemDto: CreateProblemDto): Promise<Problem> {
    const { testCases, ...problemData } = createProblemDto;
    const problem = this.problemRepository.create(problemData);
    const savedProblem = await this.problemRepository.save(problem);

    if (testCases && testCases.length > 0) {
      await this.testCasesService.createTestCasesForProblem(
        testCases,
        savedProblem,
      );
    }

    return this.getProblemWithDetails(savedProblem.codProblem);
  }

  /**
   * Retrieves a problem by ID with all its test cases
   * @param id Problem ID
   * @throws NotFoundException if problem is not found
   * @returns The requested problem with test cases
   */
  async getProblemWithDetails(id: string): Promise<Problem> {
    const problem = await this.problemRepository.findOne({
      where: { codProblem: id },
      relations: ['testCases'],
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    return problem;
  }

  /**
   * Alias for getProblemWithDetails (maintained for compatibility)
   * @param id Problem ID
   * @returns The requested problem with test cases
   */
  async findOne(id: string): Promise<Problem> {
    return this.getProblemWithDetails(id);
  }

  /**
   * Retrieves all problems with optional filters
   * @param options Filtering options (isPublic, tags, difficulty)
   * @returns Array of problems (only includes sample test cases by default)
   */
  async findAllProblems(options?: {
    isPublic?: boolean;
    tags?: string[];
    difficulty?: string;
  }): Promise<Problem[]> {
    const query = this.problemRepository
      .createQueryBuilder('problem')
      .leftJoinAndSelect(
        'problem.testCases',
        'testCase',
        'testCase.isSample = :isSample',
        { isSample: true },
      );

    if (options?.isPublic !== undefined) {
      query.andWhere('problem.isPublic = :isPublic', {
        isPublic: options.isPublic,
      });
    }

    if (options?.tags && options.tags.length > 0) {
      query.andWhere('problem.tags && :tags', { tags: options.tags });
    }

    if (options?.difficulty) {
      query.andWhere('problem.difficulty = :difficulty', {
        difficulty: options.difficulty,
      });
    }

    return query.getMany();
  }

  /**
   * Updates a problem and its test cases
   * @param id Problem ID to update
   * @param updateProblemDto Updated problem data including test cases
   * @returns The updated problem with all details
   */
  async updateProblem(
    id: string,
    updateProblemDto: CreateProblemDto,
  ): Promise<Problem> {
    const problem = await this.getProblemWithDetails(id);
    const { testCases, ...problemData } = updateProblemDto;

    Object.assign(problem, problemData);
    await this.problemRepository.save(problem);

    if (testCases) {
      await this.testCasesService.updateTestCasesForProblem(id, testCases);
    }

    return this.getProblemWithDetails(id);
  }

  /**
   * Deletes a problem and its associated test cases (via CASCADE)
   * @param id Problem ID to delete
   */
  async deleteProblem(id: string): Promise<void> {
    const problem = await this.getProblemWithDetails(id);
    await this.problemRepository.remove(problem);
  }

  /**
   * Retrieves problems by difficulty level
   * @param difficulty Difficulty level to filter by
   * @returns Array of problems matching the difficulty
   */
  async findByDifficulty(difficulty: string): Promise<Problem[]> {
    return this.findAllProblems({ difficulty });
  }

  /**
   * Retrieves problems by category/tag
   * @param tag Category/tag to filter by
   * @returns Array of problems matching the category
   */
  async findByCategory(tag: string): Promise<Problem[]> {
    return this.findAllProblems({ tags: [tag] });
  }

  /**
   * Retrieves problems solved by a specific user
   * @param userId ID of the user
   * @returns Array of problems the user has solved
   */
  async findSolvedProblems(userId: string): Promise<Problem[]> {
    return this.problemRepository
      .createQueryBuilder('problem')
      .innerJoin(
        'problem.submissions',
        'submission',
        'submission.userId = :userId AND submission.verdict = :verdict',
        {
          userId,
          verdict: 'ACCEPTED',
        },
      )
      .getMany();
  }

  /**
   * Retrieves problems not solved by a specific user
   * @param userId ID of the user
   * @returns Array of problems the user hasn't solved
   */
  async findUnsolvedProblems(userId: string): Promise<Problem[]> {
    const solvedProblems = await this.findSolvedProblems(userId);
    const solvedProblemIds = solvedProblems.map((p) => p.codProblem);

    return this.problemRepository
      .createQueryBuilder('problem')
      .where('problem.codProblem NOT IN (:...solvedProblemIds)', {
        solvedProblemIds,
      })
      .getMany();
  }
}

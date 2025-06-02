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
   * Crea un nuevo problema con sus test cases
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
   * Obtiene un problema por ID con todos sus test cases
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
   * Alias para getProblemWithDetails (mantenemos compatibilidad)
   */
  async findOne(id: string): Promise<Problem> {
    return this.getProblemWithDetails(id);
  }

  /**
   * Obtiene todos los problemas con filtros opcionales
   * Solo incluye test cases de muestra por defecto
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
   * Actualiza un problema y sus test cases
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
   * Elimina un problema y sus test cases (por CASCADE)
   */
  async deleteProblem(id: string): Promise<void> {
    const problem = await this.getProblemWithDetails(id);
    await this.problemRepository.remove(problem);
  }

  /**
   * Obtiene problemas por dificultad
   */
  async findByDifficulty(difficulty: string): Promise<Problem[]> {
    return this.findAllProblems({ difficulty });
  }

  /**
   * Obtiene problemas por categoría/tag
   */
  async findByCategory(tag: string): Promise<Problem[]> {
    return this.findAllProblems({ tags: [tag] });
  }

  /**
   * Obtiene problemas resueltos por el usuario
   * (Implementación de ejemplo - ajustar según tu lógica real)
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
   * Obtiene problemas no resueltos por el usuario
   * (Implementación de ejemplo - ajustar según tu lógica real)
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

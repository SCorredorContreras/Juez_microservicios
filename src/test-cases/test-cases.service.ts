import { Injectable } from '@nestjs/common';
import { TestCase } from './models/entities/test-case/test-case';
import { DataSource, Repository } from 'typeorm';
import { Problem } from 'src/problems/models/entities/problem/problem';
import { CreateTestCaseDto } from './dto/create-test-case-dto/create-test-case-dto';

@Injectable()
export class TestCasesService {
  private testCasesRepository: Repository<TestCase>;

  constructor(private poolConexion: DataSource) {
    this.testCasesRepository = poolConexion.getRepository(TestCase);
  }

  /**
   * Creates a new test case associated with a specific problem
   * @param testCaseData DTO containing test case details
   * @param problem The problem entity this test case belongs to
   * @returns The created test case entity
   */

  public async createTestCase(
    testCaseData: CreateTestCaseDto,
    problem: Problem,
  ): Promise<TestCase> {
    const testCase = this.testCasesRepository.create({
      ...testCaseData,
      problem,
      isSample: testCaseData.isSample || false,
      score: testCaseData.score || 0,
    });
    return this.testCasesRepository.save(testCase);
  }

  /**
   * Creates multiple test cases for a problem in a single operation
   * @param testCases Array of test case DTOs
   * @param problem The problem entity these test cases belong to
   * @returns Array of created test case entities
   */

  public async createTestCasesForProblem(
    testCases: CreateTestCaseDto[],
    problem: Problem,
  ): Promise<TestCase[]> {
    const createdTestCases = await Promise.all(
      testCases.map((tc) => this.createTestCase(tc, problem)),
    );
    return createdTestCases;
  }

  /**
   * Replaces all existing test cases for a problem with new ones
   * @param problemId ID of the problem to update
   * @param testCases Array of new test case DTOs
   * @returns Array of the newly created test case entities
   */
  public async updateTestCasesForProblem(
    problemId: string,
    testCases: CreateTestCaseDto[],
  ): Promise<TestCase[]> {
    await this.testCasesRepository.delete({
      problem: { codProblem: problemId },
    });
    const problem = { codProblem: problemId } as Problem;
    return this.createTestCasesForProblem(testCases, problem);
  }

  /**
   * Retrieves all test cases associated with a specific problem
   * @param problemId ID of the problem to get test cases for
   * @returns Array of test case entities for the specified problem
   */

  public async getTestCasesForProblem(problemId: string): Promise<TestCase[]> {
    return this.testCasesRepository.find({
      where: { problem: { codProblem: problemId } },
    });
  }
}

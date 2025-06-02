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

  public async createTestCasesForProblem(
    testCases: CreateTestCaseDto[],
    problem: Problem,
  ): Promise<TestCase[]> {
    const createdTestCases = await Promise.all(
      testCases.map((tc) => this.createTestCase(tc, problem)),
    );
    return createdTestCases;
  }

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

  public async getTestCasesForProblem(problemId: string): Promise<TestCase[]> {
    return this.testCasesRepository.find({
      where: { problem: { codProblem: problemId } },
    });
  }
}

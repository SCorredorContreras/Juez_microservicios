import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { TestCasesService } from './test-cases.service';
import { TestCase } from './models/entities/test-case/test-case';
import { Problem } from 'src/problems/models/entities/problem/problem';
import { CreateTestCaseDto } from './dto/create-test-case-dto/create-test-case-dto';

@Controller('test-cases')
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create test cases for a problem' })
  @ApiResponse({
    status: 201,
    description: 'Test cases created',
    type: [TestCase],
  })
  @ApiParam({ name: 'problemId', description: 'ID of the problem' })
  async createTestCases(
    @Param('problemId') problemId: string,
    @Body() testCases: CreateTestCaseDto[],
  ): Promise<TestCase[]> {
    const problem = { codProblem: problemId } as Problem;
    return this.testCasesService.createTestCasesForProblem(testCases, problem);
  }

  @Get()
  @ApiOperation({ summary: 'Get all test cases for a problem' })
  @ApiResponse({
    status: 200,
    description: 'List of test cases',
    type: [TestCase],
  })
  @ApiParam({ name: 'problemId', description: 'ID of the problem' })
  async getTestCases(
    @Param('problemId') problemId: string,
  ): Promise<TestCase[]> {
    return this.testCasesService.getTestCasesForProblem(problemId);
  }

  @Patch()
  @ApiOperation({ summary: 'Replace all test cases for a problem' })
  @ApiResponse({
    status: 200,
    description: 'Updated test cases',
    type: [TestCase],
  })
  @ApiParam({ name: 'problemId', description: 'ID of the problem' })
  async updateTestCases(
    @Param('problemId') problemId: string,
    @Body() testCases: CreateTestCaseDto[],
  ): Promise<TestCase[]> {
    return this.testCasesService.updateTestCasesForProblem(
      problemId,
      testCases,
    );
  }
}

import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { TestCasesService } from './test-cases.service';
import { CreateTestCaseDto } from './dto/create-test-case-dto/create-test-case-dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TestCase } from './models/entities/test-case/test-case';
import { Problem } from 'src/problems/models/entities/problem/problem';

@ApiBearerAuth()
@ApiTags('Test Cases')
@Controller('test-cases')
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Create a single test case',
    description: 'Adds a new test case to the specified problem',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created test case',
    type: TestCase,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreateTestCaseDto })
  createTestCase(
    @Body() testCaseData: CreateTestCaseDto,
    @Body('problemId') problemId: string,
  ) {
    const problem = { codProblem: problemId } as Problem;
    return this.testCasesService.createTestCase(testCaseData, problem);
  }

  @Post('bulk-create/:problemId')
  @ApiOperation({
    summary: 'Bulk create test cases',
    description: 'Creates multiple test cases for a problem in one operation',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created test cases',
    type: [TestCase],
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiParam({
    name: 'problemId',
    description: 'UUID of the target problem',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: [CreateTestCaseDto] })
  createTestCasesForProblem(
    @Param('problemId') problemId: string,
    @Body() testCases: CreateTestCaseDto[],
  ) {
    const problem = { codProblem: problemId } as Problem;
    return this.testCasesService.createTestCasesForProblem(testCases, problem);
  }

  @Put('update/:problemId')
  @ApiOperation({
    summary: 'Replace problem test cases',
    description:
      'Deletes all existing test cases for a problem and creates new ones',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully replaced test cases',
    type: [TestCase],
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiParam({
    name: 'problemId',
    description: 'UUID of the target problem',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: [CreateTestCaseDto] })
  updateTestCasesForProblem(
    @Param('problemId') problemId: string,
    @Body() testCases: CreateTestCaseDto[],
  ) {
    return this.testCasesService.updateTestCasesForProblem(
      problemId,
      testCases,
    );
  }

  @Get('problem/:problemId')
  @ApiOperation({
    summary: 'Get problem test cases',
    description: 'Retrieves all test cases associated with a specific problem',
  })
  @ApiResponse({
    status: 200,
    description: 'List of test cases',
    type: [TestCase],
  })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  @ApiParam({
    name: 'problemId',
    description: 'UUID of the target problem',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  getTestCasesForProblem(@Param('problemId') problemId: string) {
    return this.testCasesService.getTestCasesForProblem(problemId);
  }
}

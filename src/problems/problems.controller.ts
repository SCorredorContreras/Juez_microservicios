import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem-dto';
import { Problem } from './models/entities/problem/problem';

@ApiBearerAuth()
@ApiTags('Problems')
@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new problem',
    description: 'Creates a new problem with its test cases',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created problem',
    type: Problem,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createProblem(
    @Body() createProblemDto: CreateProblemDto,
  ): Promise<Problem> {
    return this.problemsService.createProblem(createProblemDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all problems',
    description: 'Retrieves all problems with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'List of problems',
    type: [Problem],
  })
  @ApiQuery({
    name: 'isPublic',
    required: false,
    description: 'Filter by public/private status',
    example: true,
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated list of tags to filter by',
    example: 'array,sorting',
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    description: 'Filter by difficulty level',
    example: 'medium',
  })
  async getAllProblems(
    @Query('isPublic') isPublic?: boolean,
    @Query('tags') tags?: string,
    @Query('difficulty') difficulty?: string,
  ): Promise<Problem[]> {
    const options: {
      isPublic?: boolean;
      tags?: string[];
      difficulty?: string;
    } = {};
    if (isPublic !== undefined) options.isPublic = isPublic;
    if (tags) options.tags = tags.split(',');
    if (difficulty) options.difficulty = difficulty;

    return this.problemsService.findAllProblems(options);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get problem by ID',
    description: 'Retrieves a specific problem with all its test cases',
  })
  @ApiResponse({
    status: 200,
    description: 'The requested problem',
    type: Problem,
  })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  @ApiParam({
    name: 'id',
    description: 'Problem UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async getProblem(@Param('id') id: string): Promise<Problem> {
    return this.problemsService.getProblemWithDetails(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a problem',
    description: 'Updates problem data and replaces all test cases',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated problem',
    type: Problem,
  })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  @ApiParam({
    name: 'id',
    description: 'Problem UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async updateProblem(
    @Param('id') id: string,
    @Body() updateProblemDto: CreateProblemDto,
  ): Promise<Problem> {
    return this.problemsService.updateProblem(id, updateProblemDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a problem',
    description: 'Deletes a problem and all its test cases',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted problem',
  })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  @ApiParam({
    name: 'id',
    description: 'Problem UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async deleteProblem(@Param('id') id: string): Promise<void> {
    return this.problemsService.deleteProblem(id);
  }

  @Get('difficulty/:difficulty')
  @ApiOperation({
    summary: 'Get problems by difficulty',
    description: 'Retrieves problems filtered by difficulty level',
  })
  @ApiResponse({
    status: 200,
    description: 'List of problems matching the difficulty',
    type: [Problem],
  })
  @ApiParam({
    name: 'difficulty',
    description: 'Difficulty level (easy, medium, hard)',
    example: 'medium',
  })
  async getProblemsByDifficulty(
    @Param('difficulty') difficulty: string,
  ): Promise<Problem[]> {
    return this.problemsService.findByDifficulty(difficulty);
  }

  @Get('category/:tag')
  @ApiOperation({
    summary: 'Get problems by category',
    description: 'Retrieves problems filtered by tag/category',
  })
  @ApiResponse({
    status: 200,
    description: 'List of problems matching the tag',
    type: [Problem],
  })
  @ApiParam({
    name: 'tag',
    description: 'Problem category/tag',
    example: 'dynamic-programming',
  })
  async getProblemsByCategory(@Param('tag') tag: string): Promise<Problem[]> {
    return this.problemsService.findByCategory(tag);
  }

  @Get('solved/:userId')
  @ApiOperation({
    summary: 'Get solved problems',
    description: 'Retrieves problems solved by a specific user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of problems solved by the user',
    type: [Problem],
  })
  @ApiParam({
    name: 'userId',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async getSolvedProblems(@Param('userId') userId: string): Promise<Problem[]> {
    return this.problemsService.findSolvedProblems(userId);
  }

  @Get('unsolved/:userId')
  @ApiOperation({
    summary: 'Get unsolved problems',
    description: 'Retrieves problems not solved by a specific user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of problems not solved by the user',
    type: [Problem],
  })
  @ApiParam({
    name: 'userId',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async getUnsolvedProblems(
    @Param('userId') userId: string,
  ): Promise<Problem[]> {
    return this.problemsService.findUnsolvedProblems(userId);
  }
}

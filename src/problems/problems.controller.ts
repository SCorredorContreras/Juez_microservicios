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
  @ApiOperation({ summary: 'Create a new problem' })
  @ApiResponse({ status: 201, description: 'Problem created', type: Problem })
  async createProblem(
    @Body() createProblemDto: CreateProblemDto,
  ): Promise<Problem> {
    return this.problemsService.createProblem(createProblemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all problems' })
  @ApiResponse({
    status: 200,
    description: 'List of problems',
    type: [Problem],
  })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiQuery({ name: 'tags', required: false, type: String })
  @ApiQuery({ name: 'difficulty', required: false, type: String })
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
  @ApiOperation({ summary: 'Get problem by ID' })
  @ApiResponse({
    status: 200,
    description: 'The requested problem',
    type: Problem,
  })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  @ApiParam({ name: 'id', description: 'Problem ID' })
  async getProblem(@Param('id') id: string): Promise<Problem> {
    return this.problemsService.getProblemWithDetails(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a problem' })
  @ApiResponse({ status: 200, description: 'Problem updated', type: Problem })
  @ApiParam({ name: 'id', description: 'Problem ID' })
  async updateProblem(
    @Param('id') id: string,
    @Body() updateProblemDto: CreateProblemDto,
  ): Promise<Problem> {
    return this.problemsService.updateProblem(id, updateProblemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a problem' })
  @ApiResponse({ status: 200, description: 'Problem deleted' })
  @ApiParam({ name: 'id', description: 'Problem ID' })
  async deleteProblem(@Param('id') id: string): Promise<void> {
    return this.problemsService.deleteProblem(id);
  }

  @Get('difficulty/:difficulty')
  @ApiOperation({ summary: 'Get problems by difficulty level' })
  @ApiResponse({
    status: 200,
    description: 'List of problems filtered by difficulty',
    type: [Problem],
  })
  @ApiParam({
    name: 'difficulty',
    description: 'Difficulty level (easy, medium, hard)',
  })
  async getProblemsByDifficulty(
    @Param('difficulty') difficulty: string,
  ): Promise<Problem[]> {
    return this.problemsService.findByDifficulty(difficulty);
  }

  @Get('category/:tag')
  @ApiOperation({ summary: 'Get problems by category/tag' })
  @ApiResponse({
    status: 200,
    description: 'List of problems filtered by tag',
    type: [Problem],
  })
  @ApiParam({ name: 'tag', description: 'Problem category/tag' })
  async getProblemsByCategory(@Param('tag') tag: string): Promise<Problem[]> {
    return this.problemsService.findByCategory(tag);
  }

  @Get('solved/:userId')
  @ApiOperation({ summary: 'Get problems solved by a user' })
  @ApiResponse({
    status: 200,
    description: 'List of problems solved by the user',
    type: [Problem],
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getSolvedProblems(@Param('userId') userId: string): Promise<Problem[]> {
    return this.problemsService.findSolvedProblems(userId);
  }

  @Get('unsolved/:userId')
  @ApiOperation({ summary: 'Get problems not solved by a user' })
  @ApiResponse({
    status: 200,
    description: 'List of problems not solved by the user',
    type: [Problem],
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getUnsolvedProblems(
    @Param('userId') userId: string,
  ): Promise<Problem[]> {
    return this.problemsService.findUnsolvedProblems(userId);
  }
}

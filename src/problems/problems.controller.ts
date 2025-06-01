import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem-dto';
import { 
    ApiOperation, 
    ApiResponse, 
    ApiTags, 
    ApiQuery, 
    ApiParam,
    ApiBearerAuth 
} from '@nestjs/swagger';
import { Problem } from './models/entities/problem/problem';

@ApiBearerAuth()
@ApiTags('Problems')
@Controller('problems')
export class ProblemsController {
    constructor(private readonly ProblemsService: ProblemsService) { }

    @Get("all")
    @ApiOperation({ 
        summary: 'Get all problems', 
        description: 'Returns all problems. Can be filtered by public status and tags.' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'List of problems', 
        type: [Problem] 
    })
    @ApiQuery({ 
        name: 'isPublic', 
        required: false, 
        description: 'Filter by public status (true/false)' 
    })
    @ApiQuery({ 
        name: 'tags', 
        required: false, 
        description: 'Comma-separated list of tags to filter by' 
    })
    public findAllProblems(
        @Query('isPublic') isPublic?: boolean,
        @Query('tags') tags?: string
    ): Promise<Problem[]> {
        const options: { isPublic?: boolean; tags?: string[] } = {};

        if (isPublic !== undefined) {
            options.isPublic = isPublic;
        }

        if (tags) {
            options.tags = tags.split(',');
        }

        return this.ProblemsService.findAll(options);
    }

    @Get('findOne/:id')
    @ApiOperation({ summary: 'Get problem by ID', description: 'Returns a single problem with all its test cases' })
    @ApiResponse({ status: 200, description: 'The requested problem', type: Problem })
    @ApiResponse({ status: 404, description: 'Problem not found' })
    @ApiParam({ name: 'id', description: 'Problem ID' })
    public findOne(@Param('id') id: string): Promise<Problem> {
        return this.ProblemsService.findOne(id);
    }

    @Post("create")
    @ApiOperation({ summary: 'Create new problem', description: 'Creates a new problem with its test cases' })
    @ApiResponse({ status: 201, description: 'Problem created successfully', type: Problem })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    public createProblem(@Body() CreateProblemDto: CreateProblemDto): Promise<Problem> {
        return this.ProblemsService.createProblem(CreateProblemDto);
    }

    @Patch('update/:id')
    @ApiOperation({ summary: 'Update problem', description: 'Updates a problem and its test cases' })
    @ApiResponse({ status: 200, description: 'Problem updated successfully', type: Problem })
    @ApiResponse({ status: 404, description: 'Problem not found' })
    @ApiParam({ name: 'id', description: 'Problem ID to update' })
    public updateProblem(
        @Param('id') id: string, 
        @Body() updateProblemDto: CreateProblemDto
    ): Promise<Problem> {
        return this.ProblemsService.update(id, updateProblemDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete problem', description: 'Deletes a problem and its associated test cases' })
    @ApiResponse({ status: 200, description: 'Problem deleted successfully' })
    @ApiResponse({ status: 404, description: 'Problem not found' })
    @ApiParam({ name: 'id', description: 'Problem ID to delete' })
    public removeProblem(@Param('id') id: string): Promise<void> {
        return this.ProblemsService.remove(id);
    }
}
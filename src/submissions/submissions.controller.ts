import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission-dto/create-submission-dto';
import { SubmissionsService } from './submissions.service';
import { 
    ApiOperation, 
    ApiResponse, 
    ApiTags, 
    ApiBody, 
    ApiQuery, 
    ApiParam,
    ApiBearerAuth 
} from '@nestjs/swagger';
import { Submission } from './models/entities/submission/submission';

@ApiBearerAuth()
@ApiTags('Submissions')
@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    @Post("create")
    @ApiOperation({ 
        summary: 'Create new submission', 
        description: 'Submit a solution for a problem. Evaluation is performed asynchronously.' 
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Submission created successfully', 
        type: Submission 
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 404, description: 'Problem not found' })
    @ApiBody({ type: CreateSubmissionDto })
    create(@Body() createSubmissionDto: CreateSubmissionDto) {
        return this.submissionsService.createSubmission(createSubmissionDto);
    }

    @Get("all")
    @ApiOperation({ 
        summary: 'Get all submissions', 
        description: 'Can be filtered by problem or user using query params' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'List of submissions', 
        type: [Submission] 
    })
    @ApiQuery({ 
        name: 'problemId', 
        required: false, 
        description: 'Filter by problem ID' 
    })
    @ApiQuery({ 
        name: 'userId', 
        required: false, 
        description: 'Filter by user ID' 
    })
    findAll(
        @Query('problemId') problemId?: string,
        @Query('userId') userId?: string,
    ) {
        if (problemId) {
            return this.submissionsService.findByProblem(problemId);
        }

        if (userId) {
            return this.submissionsService.findByUser(userId);
        }

        return this.submissionsService.findAll();
    }

    @Get('findOne/:id')
    @ApiOperation({ 
        summary: 'Get specific submission', 
        description: 'Get all details of a submission including evaluation results' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Submission details', 
        type: Submission 
    })
    @ApiResponse({ status: 404, description: 'Submission not found' })
    @ApiParam({ 
        name: 'id', 
        description: 'Submission ID',
        example: '550e8400-e29b-41d4-a716-446655440000' 
    })
    findOne(@Param('id') id: string) {
        return this.submissionsService.findOne(id);
    }

    @Get('rankings')
    @ApiOperation({ 
        summary: 'Get user rankings', 
        description: 'Get top users by score ordered descending' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'List of users with scores',
        schema: {
            example: [
                { userId: '550e8400-e29b-41d4-a716-446655440000', totalScore: 500 },
                { userId: '550e8400-e29b-41d4-a716-446655440001', totalScore: 450 }
            ]
        } 
    })
    @ApiQuery({ 
        name: 'limit', 
        required: false, 
        description: 'Results limit (default: 10)',
        example: 5 
    })
    getScoreRankings(@Query('limit') limit: number = 10) {
        return this.submissionsService.getTopUsersByScore(limit);
    }

    @Post('scores')
    @ApiOperation({ 
        summary: 'Get scores for multiple users', 
        description: 'Returns accumulated scores for a list of users' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Requested users scores',
        schema: {
            example: {
                '550e8400-e29b-41d4-a716-446655440000': 500,
                '550e8400-e29b-41d4-a716-446655440001': 450
            }
        }
    })
    @ApiBody({
        description: 'User IDs',
        schema: {
            type: 'object',
            properties: {
                userIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001']
                }
            }
        }
    })
    getUserScores(@Body() body: { userIds: string[] }) {
        return this.submissionsService.getUserScores(body.userIds);
    }
}
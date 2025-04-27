import { Controller } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission-dto/create-submission-dto';
import { SubmissionsService } from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    @Post("create")
    create(@Body() createSubmissionDto: CreateSubmissionDto) {
        return this.submissionsService.createSubmission(createSubmissionDto);
    }

    @Get("all")
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
    findOne(@Param('id') id: string) {
        return this.submissionsService.findOne(id);
    }
}

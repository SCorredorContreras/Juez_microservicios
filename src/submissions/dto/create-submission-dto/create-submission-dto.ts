import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubmissionDto {
    @ApiProperty({
        description: 'Solution source code',
        example: 'function solution() { return 42; }'
    })
    @IsNotEmpty()
    @IsString()
    sourceCode: string;

    @ApiProperty({
        description: 'Programming language',
        example: 'javascript',
        enum: ['javascript', 'python', 'java', 'c', 'cpp']
    })
    @IsNotEmpty()
    @IsString()
    language: string;

    @ApiProperty({
        description: 'Problem ID to solve',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsNotEmpty()
    @IsUUID()
    problemId: string;

    @ApiProperty({
        description: 'User ID (optional if obtained from token)',
        required: false,
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsOptional()
    @IsUUID()
    userId?: string;
}
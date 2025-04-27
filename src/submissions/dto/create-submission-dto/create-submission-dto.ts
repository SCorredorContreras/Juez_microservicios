import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateSubmissionDto {
    @IsNotEmpty()
    @IsString()
    sourceCode: string;

    @IsNotEmpty()
    @IsString()
    language: string;

    @IsNotEmpty()
    @IsUUID()
    problemId: string;

    @IsOptional()
    @IsUUID()
    userId?: string;
}

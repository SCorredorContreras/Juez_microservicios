import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateTestCaseDto } from "./create-test-case.dto";
import { Type } from "class-transformer";

export class CreateProblemDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    inputFormat: string;

    @IsNotEmpty()
    @IsString()
    outputFormat: string;

    @IsArray()
    @IsString({ each: true })
    constraints: string[];

    @IsNumber()
    timeLimit: number;

    @IsNumber()
    memoryLimit: number;

    @IsString()
    difficulty: string;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateTestCaseDto)
    testCases: CreateTestCaseDto[];
}

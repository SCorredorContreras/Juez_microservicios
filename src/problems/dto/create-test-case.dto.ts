import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTestCaseDto {

    @IsNotEmpty()
    @IsString()
    input: string;

    @IsNotEmpty()
    @IsString()
    expectedOutput: string;

    @IsOptional()
    @IsBoolean()
    isSample?: boolean;

    @IsOptional()
    @IsNumber()
    score?: number;
}

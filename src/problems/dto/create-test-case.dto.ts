import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestCaseDto {
    @ApiProperty({
        description: 'Input data for the test case',
        example: '4\n2 7 11 15\n9',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    input: string;

    @ApiProperty({
        description: 'Expected output for the given input',
        example: '0 1',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    expectedOutput: string;

    @ApiProperty({
        description: 'Whether this test case should be visible to users',
        required: false,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    isSample?: boolean;

    @ApiProperty({
        description: 'Points awarded for passing this test case',
        required: false,
        default: 0
    })
    @IsOptional()
    @IsNumber()
    score?: number;
}
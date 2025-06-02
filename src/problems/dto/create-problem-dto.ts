import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTestCaseDto } from 'src/test-cases/dto/create-test-case-dto/create-test-case-dto';

export class CreateProblemDto {
  @ApiProperty({
    description: 'Title of the programming problem',
    example: 'Two Sum',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the problem statement',
    example:
      'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Specification of the input format',
    example:
      'First line contains N (number of elements). Second line contains N space-separated integers. Third line contains the target sum.',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  inputFormat: string;

  @ApiProperty({
    description: 'Specification of the expected output format',
    example:
      'Two space-separated integers representing the indices of the elements that sum to the target.',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  outputFormat: string;

  @ApiProperty({
    description: 'List of constraints for the problem',
    type: [String],
    example: [
      '2 ≤ nums.length ≤ 10^4',
      '-10^9 ≤ nums[i] ≤ 10^9',
      '-10^9 ≤ target ≤ 10^9',
    ],
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  constraints: string[];

  @ApiProperty({
    description: 'Time limit for execution in milliseconds',
    example: 1000,
    required: true,
  })
  @IsNumber()
  timeLimit: number;

  @ApiProperty({
    description: 'Memory limit in kilobytes',
    example: 256000,
    required: true,
  })
  @IsNumber()
  memoryLimit: number;

  @ApiProperty({
    description: 'Difficulty level of the problem',
    enum: ['easy', 'medium', 'hard'],
    example: 'medium',
    required: true,
  })
  @IsString()
  difficulty: string;

  @ApiProperty({
    description: 'Whether the problem is visible to all users',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Tags/categories for the problem',
    type: [String],
    example: ['array', 'hash-table', 'sorting'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Test cases for the problem',
    type: [CreateTestCaseDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestCaseDto)
  testCases: CreateTestCaseDto[];
}

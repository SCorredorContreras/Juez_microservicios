import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Submission } from 'src/submissions/models/entities/submission/submission';
import { TestCase } from 'src/test-cases/models/entities/test-case/test-case';

@Entity('Problem', { schema: 'public' })
export class Problem {
  @ApiProperty({
    description: 'Unique identifier for the problem',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid', { name: 'cod_problema' })
  public codProblem: string;

  @ApiProperty({
    description: 'Title of the problem',
    example: 'Two Sum',
  })
  @Column({ name: 'title_problem', type: 'varchar' })
  public title: string;

  @ApiProperty({
    description: 'Detailed description of the problem',
    example:
      'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
  })
  @Column({ name: 'description_problem', type: 'varchar' })
  public description: string;

  @ApiProperty({
    description: 'Expected input format',
    example:
      'The first line contains N, the number of elements. The second line contains N space-separated integers.',
  })
  @Column({ name: 'inputFormat', type: 'varchar' })
  public inputFormat: string;

  @ApiProperty({
    description: 'Expected output format',
    example: 'Print two space-separated integers representing the indices.',
  })
  @Column({ name: 'outputFormat', type: 'varchar' })
  public outputFormat: string;

  @ApiProperty({
    description: 'Problem constraints',
    type: [String],
    example: ['2 ≤ nums.length ≤ 10^4', '-10^9 ≤ nums[i] ≤ 10^9'],
  })
  @Column({ name: 'constraints_problem', type: 'varchar', array: true })
  public constraints: string[];

  @ApiProperty({
    description: 'Time limit in milliseconds',
    example: 1000,
  })
  @Column({ name: 'timeLimit', type: 'integer' })
  public timeLimit: number;

  @ApiProperty({
    description: 'Memory limit in kilobytes',
    example: 256000,
  })
  @Column({ name: 'memoryLimit', type: 'integer' })
  public memoryLimit: number;

  @ApiProperty({
    description: 'Difficulty level',
    enum: ['easy', 'medium', 'hard'],
    example: 'medium',
  })
  @Column({ name: 'difficulty_problem', type: 'varchar' })
  public difficulty: string;

  @ApiProperty({
    description: 'Whether the problem is publicly visible',
    example: true,
  })
  @Column({ name: 'isPublic', type: 'boolean', default: true })
  public isPublic: boolean;

  @ApiProperty({
    description: 'Problem tags/categories',
    type: [String],
    example: ['array', 'hash-table'],
  })
  @Column({ name: 'tags_problem', type: 'varchar', array: true })
  public tags: string[];

  @ApiProperty({
    description: 'Test cases for the problem',
    type: () => [TestCase],
  })
  @OneToMany(() => TestCase, (testCase) => testCase.problem, { cascade: true })
  testCases: TestCase[];

  @ApiProperty({
    description: 'Submissions for this problem',
    type: () => [Submission],
  })
  @OneToMany(() => Submission, (submission) => submission.problem, {
    cascade: true,
  })
  submissions: Submission[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-05-15T12:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-05-15T12:30:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}

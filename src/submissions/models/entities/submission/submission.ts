import { ApiProperty } from '@nestjs/swagger';
import { Problem } from 'src/problems/models/entities/problem/problem';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Submission', { schema: 'public' })
export class Submission {
  @ApiProperty({
    description: 'Unique submission ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid', { name: 'cod_submission' })
  public codSubmission: string;

  @ApiProperty({
    description: 'Submitted source code',
    example: 'console.log("Hello World");',
  })
  @Column({ name: 'sourceCode', type: 'varchar' })
  public sourceCode: string;

  @ApiProperty({
    description: 'Programming language name',
    example: 'javascript',
  })
  @Column({ name: 'language_problem', type: 'varchar' })
  public language: string;

  @ApiProperty({
    description: 'Language ID for Judge0',
    example: 63,
  })
  @Column({ name: 'language_id', type: 'integer' })
  public languageId: number;

  @ApiProperty({
    description: 'Submission status',
    enum: [
      'pending',
      'evaluating',
      'accepted',
      'wrong_answer',
      'time_limit_exceeded',
      'compilation_error',
      'runtime_error',
      'internal_error',
    ],
    example: 'accepted',
  })
  @Column({ name: 'status_submission', type: 'varchar', default: 'pending' })
  public status: string;

  @ApiProperty({
    description: 'Judge0 tracking token',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'judge0Token', type: 'varchar', nullable: true })
  public judge0Token: string;

  @ApiProperty({
    description: 'Detailed evaluation results',
    example: {
      testResults: [
        {
          testCaseId: '550e8400-e29b-41d4-a716-446655440000',
          status: 'accepted',
          executionTime: 0.5,
          memoryUsed: 1024,
          stdout: 'Hello World\n',
          stderr: '',
          compileOutput: '',
          message: '',
          exitCode: 0,
        },
      ],
    },
  })
  @Column({ name: 'result', type: 'jsonb', nullable: true })
  public result: any;

  @ApiProperty({
    description: 'Maximum execution time (in seconds)',
    required: false,
    example: 1.25,
  })
  @Column({ name: 'executionTime', type: 'float', nullable: true })
  public executionTime: number;

  @ApiProperty({
    description: 'Maximum memory used (in KB)',
    required: false,
    example: 2048,
  })
  @Column({ name: 'memoryUsage', type: 'integer', nullable: true })
  public memoryUsage: number;

  @ApiProperty({
    description: 'Total score obtained',
    required: false,
    example: 100,
  })
  @Column({ name: 'score_submission', type: 'integer', nullable: true })
  public score: number;

  @ApiProperty({
    description: 'User ID who submitted',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'userId', nullable: true })
  public userId: string;

  @ApiProperty({
    description: 'Associated problem',
    type: () => Problem,
  })
  @ManyToOne(() => Problem, (problem) => problem.submissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  problem: Problem;

  @ApiProperty({
    description: 'Submission creation timestamp',
    example: '2023-05-15T12:00:00.000Z',
  })
  @CreateDateColumn()
  submittedAt: Date;
}

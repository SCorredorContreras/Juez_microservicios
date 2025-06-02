import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Submission } from './models/entities/submission/submission';
import { ProblemsService } from 'src/problems/problems.service';
import { Judge0Service } from 'src/judge0/judge0.service';
import { CreateSubmissionDto } from './dto/create-submission-dto/create-submission-dto';

interface TestCaseResult {
  testCaseId: string;
  status: string;
  executionTime: number;
  memoryUsed: number;
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  exitCode: number;
}

@Injectable()
export class SubmissionsService {
  private submissionsRepository: Repository<Submission>;
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private poolConexion: DataSource,
    private problemsService: ProblemsService,
    private judge0Service: Judge0Service,
  ) {
    this.submissionsRepository = poolConexion.getRepository(Submission);
  }

  /**
   * Creates a new code submission and initiates asynchronous evaluation
   * @param createSubmissionDto Submission data including source code, language, and problem ID
   * @returns The created submission with 'pending' status
   */
  public async createSubmission(
    createSubmissionDto: CreateSubmissionDto,
  ): Promise<Submission> {
    const { sourceCode, language, problemId, userId } = createSubmissionDto;

    // Get the problem details
    const problem = await this.problemsService.findOne(problemId);

    // Convert language name to Judge0 language ID
    const languageId = this.judge0Service.getLanguageIdByName(language);

    // Create and save the submission with initial 'pending' status
    const submission = this.submissionsRepository.create({
      sourceCode,
      language,
      languageId,
      problem,
      userId,
      status: 'pending',
    });

    const savedSubmission = await this.submissionsRepository.save(submission);

    // Initiate asynchronous evaluation
    this.evaluateSubmission(savedSubmission.codSubmission);

    return savedSubmission;
  }

  /**
   * Retrieves all submissions with their associated problems
   * @returns Array of all submissions
   */
  public async findAll(): Promise<Submission[]> {
    return this.submissionsRepository.find({
      relations: ['problem'],
    });
  }

  /**
   * Finds a single submission by ID with detailed information
   * @param id Submission ID
   * @throws NotFoundException if submission not found
   * @returns The requested submission with problem and test cases
   */
  public async findOne(id: string): Promise<Submission> {
    const submission = await this.submissionsRepository.findOne({
      where: { codSubmission: id },
      relations: ['problem', 'problem.testCases'],
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    return submission;
  }

  /**
   * Finds all submissions for a specific problem
   * @param problemId Problem ID to filter by
   * @returns Array of submissions for the specified problem
   */
  public async findByProblem(problemId: string): Promise<Submission[]> {
    return this.submissionsRepository.find({
      where: { problem: { codProblem: problemId } },
    });
  }

  /**
   * Finds all submissions by a specific user
   * @param userId User ID to filter by
   * @returns Array of submissions by the specified user
   */
  public async findByUser(userId: string): Promise<Submission[]> {
    return this.submissionsRepository.find({
      where: { userId },
      relations: ['problem'],
    });
  }

  /**
   * Evaluates a submission by running all test cases through Judge0
   * @param submissionId ID of the submission to evaluate
   */
  private async evaluateSubmission(submissionId: string): Promise<void> {
    try {
      const submission = await this.findOne(submissionId);
      const problem = submission.problem;

      // Update status to 'evaluating'
      submission.status = 'evaluating';
      await this.submissionsRepository.save(submission);

      const testCases = problem.testCases;
      const results: TestCaseResult[] = [];
      let totalScore = 0;
      let maxExecutionTime = 0;
      let maxMemoryUsed = 0;
      let overallStatus = 'accepted';

      // Evaluate each test case
      for (const testCase of testCases) {
        // Submit to Judge0 for execution
        const token = await this.judge0Service.createSubmission({
          sourceCode: submission.sourceCode,
          languageId: submission.languageId,
          stdin: testCase.input,
          expectedOutput: testCase.expectedOutput,
          timeLimit: problem.timeLimit, // in milliseconds
          memoryLimit: problem.memoryLimit, // in KB
        });

        const judge0Result = await this.waitForJudge0(token);

        // Determine test case status based on Judge0 response
        let testCaseStatus = 'error';
        const statusId = judge0Result.status.id;

        if (statusId === 3) {
          // Accepted
          testCaseStatus = 'accepted';
          totalScore += testCase.score;
        } else if (statusId === 5) {
          // Time Limit Exceeded
          testCaseStatus = 'time_limit_exceeded';
          overallStatus =
            overallStatus === 'accepted'
              ? 'time_limit_exceeded'
              : overallStatus;
        } else if (statusId === 6) {
          // Memory Limit Exceeded
          testCaseStatus = 'memory_limit_exceeded';
          overallStatus =
            overallStatus === 'accepted'
              ? 'memory_limit_exceeded'
              : overallStatus;
        } else if (statusId === 4) {
          // Wrong Answer
          testCaseStatus = 'wrong_answer';
          overallStatus =
            overallStatus === 'accepted' ? 'wrong_answer' : overallStatus;
        } else if (statusId === 11) {
          // Compilation Error
          testCaseStatus = 'compilation_error';
          overallStatus = 'compilation_error';
          break; // Stop evaluation on compilation error
        } else if (statusId === 12) {
          // Runtime Error
          testCaseStatus = 'runtime_error';
          overallStatus =
            overallStatus === 'accepted' ? 'runtime_error' : overallStatus;
        } else {
          overallStatus =
            overallStatus === 'accepted' ? 'error' : overallStatus;
        }

        // Update execution statistics
        const executionTime = parseFloat(judge0Result.time || '0');
        const memoryUsed = judge0Result.memory || 0;

        maxExecutionTime = Math.max(maxExecutionTime, executionTime);
        maxMemoryUsed = Math.max(maxMemoryUsed, memoryUsed);

        // Store test case result
        results.push({
          testCaseId: testCase.codTestCase,
          status: testCaseStatus,
          executionTime,
          memoryUsed,
          stdout: judge0Result.stdout,
          stderr: judge0Result.stderr,
          compileOutput: judge0Result.compile_output,
          message: judge0Result.message,
          exitCode: judge0Result.exit_code,
        });
      }

      // Update submission with final results
      submission.status = overallStatus;
      submission.result = { testResults: results };
      submission.executionTime = maxExecutionTime;
      submission.memoryUsage = maxMemoryUsed;
      submission.score = totalScore;

      await this.submissionsRepository.save(submission);
    } catch (error) {
      this.logger.error(
        `Error evaluating submission ${submissionId}: ${error.message}`,
      );

      // Mark submission as errored if evaluation fails
      const submission = await this.findOne(submissionId);
      submission.status = 'internal_error';
      submission.result = { error: error.message };
      await this.submissionsRepository.save(submission);
    }
  }

  /**
   * Polls Judge0 for submission results until completion or timeout
   * @param token Judge0 submission token
   * @param maxTries Maximum polling attempts
   * @param delay Delay between polling attempts in ms
   * @returns Judge0 submission result
   * @throws Error if polling times out
   */
  private async waitForJudge0(
    token: string,
    maxTries = 10,
    delay = 1000,
  ): Promise<any> {
    for (let i = 0; i < maxTries; i++) {
      const result = await this.judge0Service.getSubmissionResult(token);
      const finishedStates = [3, 4, 5, 6, 11, 12]; // Completed states

      if (finishedStates.includes(result.status.id)) {
        return result;
      }

      await new Promise((res) => setTimeout(res, delay));
    }

    throw new Error('Judge0 result timed out.');
  }

  /**
   * Gets total scores for multiple users (only counts accepted submissions)
   * @param userIds Array of user IDs to get scores for
   * @returns Object mapping user IDs to their total scores
   */
  public async getUserScores(
    userIds: string[],
  ): Promise<Record<string, number>> {
    const scores = await this.submissionsRepository
      .createQueryBuilder('submission')
      .select('submission.userId', 'userId')
      .addSelect('SUM(submission.score)', 'totalScore')
      .where('submission.userId IN (:...userIds)', { userIds })
      .andWhere('submission.status = :status', { status: 'accepted' })
      .groupBy('submission.userId')
      .getRawMany();

    return scores.reduce((acc, curr) => {
      acc[curr.userId] = parseInt(curr.totalScore) || 0;
      return acc;
    }, {});
  }

  /**
   * Gets top users by total score (only counts accepted submissions)
   * @param limit Maximum number of users to return
   * @returns Array of users with their total scores, ordered highest to lowest
   */
  public async getTopUsersByScore(
    limit: number = 10,
  ): Promise<{ userId: string; totalScore: number }[]> {
    return this.submissionsRepository
      .createQueryBuilder('submission')
      .select('submission.userId', 'userId')
      .addSelect('SUM(submission.score)', 'totalScore')
      .where('submission.status = :status', { status: 'accepted' })
      .groupBy('submission.userId')
      .orderBy('totalScore', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}

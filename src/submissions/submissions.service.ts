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

    constructor(
        private poolConexion: DataSource,
        private problemsService: ProblemsService,
        private judge0Service: Judge0Service) {

        this.submissionsRepository = poolConexion.getRepository(Submission);

    }

    public async createSubmission(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
        const { sourceCode, language, problemId, userId } = createSubmissionDto;

        // Obtener problema
        const problem = await this.problemsService.findOne(problemId);

        // Obtener ID del lenguaje para Judge0
        const languageId = this.judge0Service.getLanguageIdByName(language);

        // Crear envío
        const submission = this.submissionsRepository.create({
            sourceCode,
            language,
            languageId,
            problem,
            userId,
            status: 'pending',
        });

        const savedSubmission = await this.submissionsRepository.save(submission);

        // Iniciar evaluación asíncrona
        this.evaluateSubmission(savedSubmission.codSubmission);

        return savedSubmission;
    }

    public async findAll(): Promise<Submission[]> {
        return this.submissionsRepository.find({
            relations: ['problem'],
        });

    }

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

    public async findByProblem(problemId: string): Promise<Submission[]> {
        return this.submissionsRepository.find({
            where: { problem: { codProblem: problemId } },
        });
    }

    public async findByUser(userId: string): Promise<Submission[]> {
        return this.submissionsRepository.find({
            where: { userId },
            relations: ['problem'],
        });
    }

    private async evaluateSubmission(submissionId: string): Promise<void> {
        try {
            const submission = await this.findOne(submissionId);
            const problem = submission.problem;

            // Actualizar estado a "evaluando"
            submission.status = 'evaluating';
            await this.submissionsRepository.save(submission);

            // Obtener casos de prueba
            const testCases = problem.testCases;

            const results: TestCaseResult[] = [];
            let totalScore = 0;
            let maxExecutionTime = 0;
            let maxMemoryUsed = 0;
            let overallStatus = 'accepted';

            // Evaluar cada caso de prueba
            for (const testCase of testCases) {
                // Enviar a Judge0
                const token = await this.judge0Service.createSubmission({
                    sourceCode: submission.sourceCode,
                    languageId: submission.languageId,
                    stdin: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    timeLimit: problem.timeLimit,       // en milisegundos
                    memoryLimit: problem.memoryLimit,   // en KB
                });

                // Esperar un poco para que Judge0 procese la solicitud
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Obtener resultado
                const judge0Result = await this.judge0Service.getSubmissionResult(token);

                // Determinar estado del caso de prueba
                let testCaseStatus = 'error';

                if (judge0Result.status.id === 3) { // Accepted
                    testCaseStatus = 'accepted';
                    totalScore += testCase.score;
                } else if (judge0Result.status.id === 5) { // Time Limit Exceeded
                    testCaseStatus = 'time_limit_exceeded';
                    overallStatus = overallStatus === 'accepted' ? 'time_limit_exceeded' : overallStatus;
                } else if (judge0Result.status.id === 6) { // Memory Limit Exceeded
                    testCaseStatus = 'memory_limit_exceeded';
                    overallStatus = overallStatus === 'accepted' ? 'memory_limit_exceeded' : overallStatus;
                } else if (judge0Result.status.id === 4) { // Wrong Answer
                    testCaseStatus = 'wrong_answer';
                    overallStatus = overallStatus === 'accepted' ? 'wrong_answer' : overallStatus;
                } else if (judge0Result.status.id === 11) { // Compilation Error
                    testCaseStatus = 'compilation_error';
                    overallStatus = 'compilation_error';
                    break; // No tiene sentido seguir evaluando
                } else if (judge0Result.status.id === 12) { // Runtime Error
                    testCaseStatus = 'runtime_error';
                    overallStatus = overallStatus === 'accepted' ? 'runtime_error' : overallStatus;
                } else {
                    overallStatus = overallStatus === 'accepted' ? 'error' : overallStatus;
                }

                // Actualizar estadísticas
                const executionTime = parseFloat(judge0Result.time || '0');
                const memoryUsed = judge0Result.memory || 0;

                maxExecutionTime = Math.max(maxExecutionTime, executionTime);
                maxMemoryUsed = Math.max(maxMemoryUsed, memoryUsed);

                // Guardar resultado del caso de prueba
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

            // Actualizar el envío con los resultados
            submission.status = overallStatus;
            submission.result = { testResults: results };
            submission.executionTime = maxExecutionTime;
            submission.memoryUsage = maxMemoryUsed;
            submission.score = totalScore;

            await this.submissionsRepository.save(submission);

        } catch (error) {
            // En caso de error, marcar como error interno
            const submission = await this.findOne(submissionId);
            submission.status = 'internal_error';
            submission.result = { error: error.message };
            await this.submissionsRepository.save(submission);
        }
    }

}

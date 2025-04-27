import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Judge0LanguageId, Judge0SubmissionRequest, Judge0SubmissionResponse, Judge0SubmissionResult } from './interfaces/judge0/judge0.interface';
import axios from 'axios';

@Injectable()
export class Judge0Service {

    private readonly baseUrl: string;
    private readonly apiKey: string;
    private readonly apiSecret: string;
    private readonly defaultTimeout: number;
    private readonly defaultMemoryLimit: number;

    constructor(private configService: ConfigService) {
        this.baseUrl = this.configService.get<string>('JUDGE0_API_URL', 'http://localhost:2358');
        this.apiKey = this.configService.get<string>('JUDGE0_API_KEY', '');
        this.apiSecret = this.configService.get<string>('JUDGE0_API_SECRET', '');
        this.defaultTimeout = this.configService.get<number>('JUDGE0_DEFAULT_TIMEOUT', 10); // 10 segundos
        this.defaultMemoryLimit = this.configService.get<number>('JUDGE0_DEFAULT_MEMORY_LIMIT', 262144); // 128MB en KB
    }


    public async createSubmission(params: {
        sourceCode: string;
        languageId: number;
        stdin?: string;
        expectedOutput?: string;
        timeLimit?: number;
        memoryLimit?: number;
    }): Promise<string> {
        const { sourceCode, languageId, stdin, expectedOutput, timeLimit, memoryLimit } = params;

        const submissionData: Judge0SubmissionRequest = {
            source_code: sourceCode,
            language_id: languageId,
            stdin: stdin || '',
            expected_output: expectedOutput,
            cpu_time_limit: (timeLimit ?? 1000) / 1000, // en segundos, 1000 ms = 1s
            memory_limit: memoryLimit ?? 128000, // en KB
            number_of_runs: 1,
        };

        try {
            const headers = this.getHeaders();
            const response = await axios.post<Judge0SubmissionResponse>(
                `${this.baseUrl}/submissions?wait=false`,
                submissionData,
                { headers: this.getHeaders() }
            );

            return response.data.token;
        } catch (error) {
            throw new HttpException(
                `Failed to create submission: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    public async getSubmissionResult(token: string): Promise<Judge0SubmissionResult> {
        try {
            const headers = this.getHeaders();
            const response = await axios.get<Judge0SubmissionResult>(
                `${this.baseUrl}/submissions/${token}?fields=stdout,stderr,compile_output,message,time,memory,status,exit_code`,
                { headers }
            );

            return response.data;
        } catch (error) {
            throw new HttpException(
                `Failed to get submission result: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    public async getLanguages() {
        try {
            const headers = this.getHeaders();
            const response = await axios.get(`${this.baseUrl}/languages`, { headers });
            return response.data;
        } catch (error) {
            throw new HttpException(
                `Failed to get languages: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    public getLanguageIdByName(language: string): number {
        const languageLower = language.toLowerCase();

        switch (languageLower) {
            case 'c':
                return Judge0LanguageId.C;
            case 'cpp':
            case 'c++':
                return Judge0LanguageId.CPP;
            case 'java':
                return Judge0LanguageId.JAVA;
            case 'python':
            case 'py':
                return Judge0LanguageId.PYTHON;
            case 'javascript':
            case 'js':
                return Judge0LanguageId.JAVASCRIPT;
            case 'ruby':
                return Judge0LanguageId.RUBY;
            case 'go':
                return Judge0LanguageId.GO;
            case 'rust':
                return Judge0LanguageId.RUST;
            default:
                throw new HttpException(
                    `Unsupported language: ${language}`,
                    HttpStatus.BAD_REQUEST
                );
        }
    }

    private getHeaders() {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.apiKey) {
            headers['X-Auth-Token'] = this.apiKey;
        }

        if (this.apiSecret) {
            headers['X-Auth-Secret'] = this.apiSecret;
        }

        return headers;
    }

}

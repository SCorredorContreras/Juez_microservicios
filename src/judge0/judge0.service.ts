import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Judge0LanguageId, Judge0SubmissionRequest, Judge0SubmissionResponse, Judge0SubmissionResult } from './interfaces/judge0/judge0.interface';
import axios from 'axios';

/**
 * Service for interacting with the Judge0 API for code execution
 */
@Injectable()
export class Judge0Service {
    private readonly baseUrl: string;          // Base URL for Judge0 API
    private readonly apiKey: string;          // API key for authentication
    private readonly apiSecret: string;       // API secret for authentication
    private readonly defaultTimeout: number;  // Default execution timeout in seconds
    private readonly defaultMemoryLimit: number; // Default memory limit in KB

    constructor(private configService: ConfigService) {
        this.baseUrl = this.configService.get<string>('JUDGE0_API_URL','');
        this.apiKey = this.configService.get<string>('JUDGE0_API_KEY', '');
        this.apiSecret = this.configService.get<string>('JUDGE0_API_SECRET', '');
        this.defaultTimeout = this.configService.get<number>('JUDGE0_DEFAULT_TIMEOUT', 10);
        this.defaultMemoryLimit = this.configService.get<number>('JUDGE0_DEFAULT_MEMORY_LIMIT', 262144); // 256MB in KB
    }

    /**
     * Creates a new code submission in Judge0
     * @param params Submission parameters including source code and execution constraints
     * @returns Promise resolving to the submission token
     * @throws HttpException if submission fails
     */
    public async createSubmission(params: {
        sourceCode: string;    // Source code to execute
        languageId: number;    // Language ID from Judge0LanguageId
        stdin?: string;        // Input data (optional)
        expectedOutput?: string; // Expected output (optional)
        timeLimit?: number;    // Time limit in milliseconds (optional)
        memoryLimit?: number;  // Memory limit in KB (optional)
    }): Promise<string> {
        const { sourceCode, languageId, stdin, expectedOutput, timeLimit, memoryLimit } = params;

        const submissionData: Judge0SubmissionRequest = {
            source_code: sourceCode,
            language_id: languageId,
            stdin: stdin || '',
            expected_output: expectedOutput,
            cpu_time_limit: (timeLimit ?? 1000) / 1000, // Convert ms to seconds
            memory_limit: memoryLimit ?? this.defaultMemoryLimit,
            number_of_runs: 1,
        };

        try {
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

    /**
     * Retrieves the result of a submission from Judge0
     * @param token Submission token obtained from createSubmission
     * @returns Promise resolving to the submission result
     * @throws HttpException if result retrieval fails
     */
    public async getSubmissionResult(token: string): Promise<Judge0SubmissionResult> {
        try {
            const response = await axios.get<Judge0SubmissionResult>(
                `${this.baseUrl}/submissions/${token}?fields=stdout,stderr,compile_output,message,time,memory,status,exit_code`,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            throw new HttpException(
                `Failed to get submission result: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Retrieves the list of supported languages from Judge0
     * @returns Promise resolving to the list of supported languages
     * @throws HttpException if language retrieval fails
     */
    public async getLanguages() {
        try {
            const response = await axios.get(`${this.baseUrl}/languages`, { headers: this.getHeaders() });
            return response.data;
        } catch (error) {
            throw new HttpException(
                `Failed to get languages: ${error.message}`,
                HttpStatus.BAD_REQUEST
            );
        }
    }

    /**
     * Converts a language name to its corresponding Judge0 language ID
     * @param language Name of the programming language (case-insensitive)
     * @returns Judge0 language ID
     * @throws HttpException if language is not supported
     */
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

    /**
     * Generates the required headers for Judge0 API requests
     * @returns Object containing authentication headers
     */
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
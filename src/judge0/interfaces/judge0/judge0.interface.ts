/**
 * Interfaces for Judge0 API communication
 */
export interface Judge0SubmissionRequest {
    source_code: string;         // The source code to be executed
    language_id: number;         // ID of the programming language
    stdin?: string;              // Input to be passed to the program
    expected_output?: string;    // Expected output for correctness checking
    cpu_time_limit?: number;     // CPU time limit in seconds
    cpu_extra_time?: number;     // Extra CPU time in seconds
    wall_time_limit?: number;    // Wall time limit in seconds
    memory_limit?: number;       // Memory limit in KB
    stack_limit?: number;        // Stack size limit in KB
    max_processes_and_or_threads?: number; // Process/thread limit
    enable_per_process_and_thread_time_limit?: boolean; // Enable per-process time limits
    enable_per_process_and_thread_memory_limit?: boolean; // Enable per-process memory limits
    max_file_size?: number;      // Maximum file size in KB
    number_of_runs?: number;     // Number of times to run the submission
    additional_files?: string;   // Additional files needed for execution
}

export interface Judge0SubmissionResponse {
    token: string;  // Unique token for the created submission
}

export interface Judge0SubmissionResult {
    stdout: string;         // Standard output from the program
    stderr: string;         // Standard error from the program
    compile_output: string; // Compiler output (if any)
    message: string;        // Additional messages from the execution
    exit_code: number;      // Program exit code
    status: {              // Execution status
        id: number;        // Status ID (3=Accepted, 4=Wrong Answer, etc.)
        description: string; // Status description
    };
    time: string;          // Execution time in seconds
    memory: number;        // Memory used in KB
}

/**
 * Supported programming languages in Judge0 with their respective IDs
 */
export enum Judge0LanguageId {
    C = 50,          // C programming language
    CPP = 54,        // C++ programming language
    JAVA = 62,       // Java programming language
    PYTHON = 71,     // Python programming language
    JAVASCRIPT = 63, // JavaScript programming language
    RUBY = 72,       // Ruby programming language
    GO = 60,         // Go programming language
    RUST = 73,       // Rust programming language
}
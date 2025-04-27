export interface Judge0SubmissionRequest {
    source_code: string;
    language_id: number;
    stdin?: string;
    expected_output?: string;
    cpu_time_limit?: number;  // segundos
    cpu_extra_time?: number;  // segundos
    wall_time_limit?: number; // segundos
    memory_limit?: number;    // KB
    stack_limit?: number;     // KB
    max_processes_and_or_threads?: number;
    enable_per_process_and_thread_time_limit?: boolean;
    enable_per_process_and_thread_memory_limit?: boolean;
    max_file_size?: number;   // KB
    number_of_runs?: number;
    additional_files?: string;
}

export interface Judge0SubmissionResponse {
    token: string;
}

export interface Judge0SubmissionResult {
    stdout: string;
    stderr: string;
    compile_output: string;
    message: string;
    exit_code: number;
    status: {
        id: number;
        description: string;
    };
    time: string;  // segundos
    memory: number; // KB
}

// Mapeo de lenguajes soportados por Judge0
export enum Judge0LanguageId {
    C = 50,
    CPP = 54,
    JAVA = 62,
    PYTHON = 71,
    JAVASCRIPT = 63,
    RUBY = 72,
    GO = 60,
    RUST = 73,
}

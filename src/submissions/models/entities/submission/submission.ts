import { Problem } from "src/problems/models/entities/problem/problem";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("Submission", { schema: "public" })
export class Submission {

    @PrimaryGeneratedColumn("uuid", { name: "cod_submission" })
    public codSubmission: string;

    @Column({ name: "sourceCode", type: "varchar" })
    public sourceCode: string;

    @Column({ name: "language_problem", type: "varchar" })
    public language: string;

    @Column({ name: "language_id", type: "integer" })
    public languageId: number;

    @Column({ name: "status_submission", type: "varchar", default: "pending" })
    public status: string;

    @Column({ name: "judge0Token", type: "varchar", nullable: true })
    public judge0Token: string;

    @Column({ name: "result", type: "jsonb", nullable: true })
    public result: any;

    @Column({ name: "executionTime", type: "float", nullable: true })
    public executionTime: number;

    @Column({ name: "memoryUsage", type: "integer", nullable: true })
    public memoryUsage: number;

    @Column({ name: "score_submission", type: "integer", nullable: true })
    public score: number;

    @Column({ name: "userId", nullable: true })
    public userId: string;

    constructor(
        cod: string,
        src: string,
        lang: string,
        langId: number,
        stat: string = "pending",
        token: string,
        res: any,
        execTime: number,
        memUsage: number,
        score: number,
        userId: string
    ) {
        this.codSubmission = cod;
        this.sourceCode = src;
        this.language = lang;
        this.languageId = langId;
        this.status = stat;
        this.judge0Token = token;
        this.result = res;
        this.executionTime = execTime;
        this.memoryUsage = memUsage;
        this.score = score;
        this.userId = userId;
    }

    @ManyToOne(() => Problem, problem => problem.submissions)
    @JoinColumn()
    problem: Problem;

    @CreateDateColumn()
    submittedAt: Date;

}

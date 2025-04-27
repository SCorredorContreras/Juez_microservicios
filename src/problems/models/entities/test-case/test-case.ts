import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Problem } from "../problem/problem";

@Entity("TestCase", { schema: "public" })
export class TestCase {

    @PrimaryColumn("uuid", { name: "cod_test" })
    public codTestCase: string;

    @Column({ name: "input_test", type: "varchar" })
    public input: string;

    @Column({ name: "expectedOutput_test", type: "varchar" })
    public expectedOutput: string;

    @Column({ name: "isSample", type: "boolean", default: false })
    public isSample: boolean;

    @Column({ name: "score_test", default: 0 })
    public score: number;

    constructor(
        cod: string,
        inp: string,
        exp: string,
        isS: boolean = false,
        score: number = 0
    ) {
        this.codTestCase = cod;
        this.input = inp;
        this.expectedOutput = exp;
        this.isSample = isS;
        this.score = score;

    }

    @ManyToOne(() => Problem, problem => problem.testCases, { onDelete: 'CASCADE' })
    @JoinColumn()
    problem: Problem;

}

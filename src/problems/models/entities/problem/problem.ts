import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("problem", { schema: "public" })
export class Problem {
    @PrimaryGeneratedColumn("uuid", { name: "cod_problema" })
    public codProblem: string;

    @Column({ name: "title_problem", type: "varchar" })
    public title: string;

    @Column({ name: "description_problem", type: "varchar" })
    public description: string;

    @Column({ name: "inputFormat", type: "varchar" })
    public inputFormat: string;

    @Column({ name: "outputFormat", type: "varchar" })
    public outputFormat: string;

    @Column({ name: "constraints_problem", type: "varchar", array: true })
    public constraints: string[];

    @Column({ name: "timeLimit", type: "integer" })
    public timeLimit: number;

    @Column({ name: "memoryLimit", type: "integer" })
    public memoryLimit: number;

    @Column({ name: "dificulty_problem", type: "varchar" })
    public dificulty: string;

    @Column({ name: "isPublic", type: "boolean", default: true })
    public isPublic: boolean;

    @Column({ name: "tags_problem", type: "varchar", array: true })
    public tags: string[];

    constructor(
        cod: string,
        tit: string,
        des: string,
        inp: string,
        out: string,
        cons: string[],
        time: number,
        memory: number,
        diff: string = "medium",
        pub: boolean = true,
        tags: string[]
    ) {
        this.codProblem = cod;
        this.title = tit;
        this.description = des;
        this.inputFormat = inp;
        this.outputFormat = out;
        this.constraints = cons;
        this.timeLimit = time;
        this.memoryLimit = memory;
        this.dificulty = diff;
        this.isPublic = pub;
        this.tags = tags;

    }

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;

}

import { ApiProperty } from '@nestjs/swagger';
import { Problem } from 'src/problems/models/entities/problem/problem';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("TestCase", { schema: "public" })
export class TestCase {
    @ApiProperty({
        description: 'Unique identifier for the test case',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @PrimaryGeneratedColumn("uuid", { name: "cod_test" })
    public codTestCase: string;

    @ApiProperty({
        description: 'Input data for the test case',
        example: '5\n1 2 3 4 5\n10'
    })
    @Column({ name: "input_test", type: "varchar" })
    public input: string;

    @ApiProperty({
        description: 'Expected output for the test case',
        example: '0 4'
    })
    @Column({ name: "expectedOutput_test", type: "varchar" })
    public expectedOutput: string;

    @ApiProperty({
        description: 'Whether this is a sample test case',
        example: true
    })
    @Column({ name: "isSample", type: "boolean", default: false })
    public isSample: boolean;

    @ApiProperty({
        description: 'Points awarded for passing this test case',
        example: 20
    })
    @Column({ name: "score_test", default: 0 })
    public score: number;

    @ApiProperty({
        description: 'Associated problem',
        type: () => Problem
    })
    @ManyToOne(() => Problem, problem => problem.testCases, { onDelete: 'CASCADE' })
    @JoinColumn()
    problem: Problem;
}
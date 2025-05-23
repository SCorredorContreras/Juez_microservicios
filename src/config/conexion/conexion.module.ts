import { Module } from '@nestjs/common';
import { Problem } from 'src/problems/models/entities/problem/problem';
import { TestCase } from 'src/problems/models/entities/test-case/test-case';
import { Submission } from 'src/submissions/models/entities/submission/submission';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';


@Module({
    
    imports: [],
    controllers: [],
    providers: [
        {
            provide: DataSource,
            inject: [],
            useFactory: async () => {
                try {

                    const poolConexion = new DataSource({
                        type: 'postgres',
                        host: String(process.env.HOST),
                        port: Number(process.env.PORT),
                        username: String(process.env.USER_DB),
                        database: String(process.env.DATA_BASE),
                        password: String(process.env.PASSWORD),
                        synchronize: true,
                        logging: true,
                        namingStrategy: new SnakeNamingStrategy(),
                        entities: [Problem, TestCase, Submission]
                    });
                    await poolConexion.initialize();

                    
                    console.log('Conexión a la base de datos establecida correctamente' + String(process.env.BASE_DATOS));
                    return poolConexion;

                } catch (elError) {
                    console.log('Error al conectar a la base de datos');
                    throw elError;

                }
            }
        }
    ], exports: [DataSource]
})
export class ConexionModule { }

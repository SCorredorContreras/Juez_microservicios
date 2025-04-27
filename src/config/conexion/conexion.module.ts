import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
    imports: [],
    controllers: [],
    providers: [
        {
            provide: DataSource,
            inject:[],
            useFactory: async () => {
                try {
                    
                    const poolConexion = new DataSource({
                        type: 'postgres',
                        host: String(process.env.HOST),
                        port: Number(process.env.PUERTO),
                        username: String(process.env.USUARIO),
                        database: String(process.env.BASE_DATOS),
                        password: String(process.env.CLAVE),
                        synchronize: true,
                        logging: true,  
                        namingStrategy: new SnakeNamingStrategy(),
                        entities: []
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
export class ConexionModule {}

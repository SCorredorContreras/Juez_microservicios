import { Module } from '@nestjs/common';
import { ConexionModule } from 'src/config/conexion/conexion.module';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';

@Module({
    imports: [ConexionModule],
    controllers: [ProblemsController],
    providers: [ProblemsService],
    exports: [ProblemsService]
})
export class ProblemsModule { }

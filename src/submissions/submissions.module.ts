import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { ConexionModule } from 'src/config/conexion/conexion.module';
import { ProblemsModule } from 'src/problems/problems.module';
import { Judge0Module } from 'src/judge0/judge0.module';

@Module({
  imports: [ConexionModule, ProblemsModule, Judge0Module],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}

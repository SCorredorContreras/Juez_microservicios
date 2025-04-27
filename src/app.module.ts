import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConexionModule } from './config/conexion/conexion.module';
import { ConfigModule } from '@nestjs/config';
import { ProblemsModule } from './problems/problems.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { Judge0Module } from './judge0/judge0.module';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }), ConexionModule, ProblemsModule, SubmissionsModule, Judge0Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

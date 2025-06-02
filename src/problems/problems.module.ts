import { Module } from '@nestjs/common';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Problem } from './models/entities/problem/problem';
import { TestCasesModule } from 'src/test-cases/test-cases.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Problem]),
    TestCasesModule, // necesitas importar el módulo si usas TestCasesService
  ],
  controllers: [ProblemsController],
  providers: [ProblemsService],
  exports: [ProblemsService],
})
export class ProblemsModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConexionModule } from './config/conexion/conexion.module';

@Module({
  imports: [ConexionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

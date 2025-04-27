import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConexionModule } from './config/conexion/conexion.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }), ConexionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

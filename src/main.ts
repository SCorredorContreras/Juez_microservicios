import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  let puerto: number = Number(process.env.SERVER_PORT);

  const config = new DocumentBuilder()
    .setTitle('Juez')
    .setDescription('The Juez API description')
    .setVersion('1.0')
    .addTag('Juez')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.setGlobalPrefix('api')

  app.enableCors();

  await app.listen(puerto, () => {
    console.log("servidor funcionando en el puerto: " + puerto)
  });
}
bootstrap();

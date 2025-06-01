import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Enable CORS
  app.enableCors();
  
  // Add global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Get port from environment or default to 3000
  const port = Number(process.env.SERVER_PORT) || 3000;

  // Swagger documentation configuration
  const config = new DocumentBuilder()
    .setTitle('Online Judge Evaluation API')
    .setDescription(`
      ## Microservice API Documentation
      Core evaluation system for programming submissions.

      ### Key Features:
      - Problem management (CRUD operations)
      - Test cases configuration
      - Code submissions evaluation
      - Real-time execution results
      - Performance metrics (time/memory usage)

      ### Architecture Notes:
      - This microservice handles only evaluation logic
      - Authentication is managed by a separate service
    `)
    .setVersion('1.0')
    .addTag('Problems', 'Manage programming problems and test cases')
    .addTag('Submissions', 'Handle code submissions and evaluation results')
    .build();

  // Create Swagger document
  const document = SwaggerModule.createDocument(app, config);
  
  // Setup Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true
    },
    customSiteTitle: 'Evaluation Service API'
  });

  // Start the application
  await app.listen(port, () => {
    console.log(`🚀 Evaluation service running on http://localhost:${port}/api`);
    console.log(`📚 API docs available at http://localhost:${port}/api/docs`);
  });
}

bootstrap();
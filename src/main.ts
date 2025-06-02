import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

/**
 * Initializes and configures the NestJS application
 */
async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);

  // Set global API prefix for all routes
  app.setGlobalPrefix('api');

  // Enable Cross-Origin Resource Sharing (CORS)
  app.enableCors();

  // Configure global validation pipe for request data transformation and validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Return error if non-whitelisted values are provided
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // Get port from environment variables or default to 3000
  const port = Number(process.env.SERVER_PORT) || 3000;

  /**
   * Swagger/OpenAPI Documentation Configuration
   *
   * Sets up API documentation with detailed descriptions and organization
   */
  const config = new DocumentBuilder()
    .setTitle('Online Judge Evaluation API')
    .setDescription(
      `
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
      - Uses Judge0 as the execution backend
    `,
    )
    .setVersion('1.0')
    .addTag(
      'Problems',
      'Endpoints for managing programming problems and test cases',
    )
    .addTag(
      'Submissions',
      'Endpoints for handling code submissions and evaluation results',
    )
    .addTag('Test Cases', 'Endpoints for managing individual test cases')
    .build();

  // Generate the OpenAPI/Swagger documentation
  const document = SwaggerModule.createDocument(app, config);

  /**
   * Swagger UI Setup
   *
   * Configures the interactive API documentation interface
   */
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha', // Sort tags alphabetically
      operationsSorter: 'alpha', // Sort operations alphabetically
      docExpansion: 'none', // Keep all documentation sections collapsed by default
      filter: true, // Enable search/filter functionality
      persistAuthorization: true, // Maintain authorization across refreshes
    },
    customSiteTitle: 'Online Judge API Documentation',
  });

  /**
   * Start the application server
   */
  await app.listen(port, () => {
    console.log(
      `🚀 Evaluation service running on http://localhost:${port}/api`,
    );
    console.log(`📚 API docs available at http://localhost:${port}/api/docs`);
    console.log(`🛡️  CORS enabled for all origins`);
    console.log(`⚙️  Validation pipe configured with whitelist protection`);
  });
}

// Initialize and start the application
bootstrap();

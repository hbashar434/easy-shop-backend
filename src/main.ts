import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Easy Shop API')
    .setDescription('The Easy Shop API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('PORT', 5000);
  await app.listen(port);
}

bootstrap()
  .then(() =>
    console.log(
      `Application is running on: http://localhost:${process.env.PORT ?? 5000}\nAPI documentation available at: http://localhost:${process.env.PORT ?? 5000}/api-docs`,
    ),
  )
  .catch((error) => {
    console.error('Application failed:', error);
    process.exit(1);
  });

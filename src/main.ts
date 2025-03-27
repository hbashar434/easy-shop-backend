import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 5000);
}

bootstrap()
  .then(() =>
    console.log(
      `Application is running on: http://localhost:${process.env.PORT ?? 5000}`,
    ),
  )
  .catch((error) => {
    console.error('Application failed:', error);
    process.exit(1);
  });

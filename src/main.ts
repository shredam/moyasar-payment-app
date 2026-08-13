import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\n🚀 Moyasar Payment App running on: http://localhost:${port}`);
  console.log(`📊 GraphQL Playground:             http://localhost:${port}/graphql`);
  console.log(`💳 Payment UI:                     http://localhost:${port}/\n`);
}

bootstrap();

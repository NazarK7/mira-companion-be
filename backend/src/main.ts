// backend/src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });
  const MAX_LIMIT = 4 * 1024 * 1024 * 1024; // 4GB
  app.use(json({ limit: MAX_LIMIT }));
  app.use(urlencoded({ limit: MAX_LIMIT, extended: true }));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new BigIntInterceptor());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4242',
    credentials: false,
  });

  const port = process.env.PORT || 3000;
  // Forza il bind su tutte le interfacce IPv4
  await app.listen(port, '0.0.0.0');

  Logger.log(`🚀 Backend listening on http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  // In development, allow all origins. In production, restrict to specific domains.
  app.enableCors({
    origin: true, // Reflects request origin - allows any origin in dev
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🛡️ ShepScan API running on http://localhost:${port}`);
}
bootstrap();

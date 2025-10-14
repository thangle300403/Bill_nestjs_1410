import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const FRONTEND_URL = configService.get<string>('FRONTEND_URL');
  const EXPRESS_URL = configService.get<string>('EXPRESS_URL');
  const NEST_URL = configService.get<string>('NEST_URL');

  app.use(cookieParser());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://apis.google.com'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", EXPRESS_URL, 'data:'].filter(Boolean) as string[],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  app.enableCors({
    origin: [FRONTEND_URL],
    credentials: true,
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);

  console.log(`Server is running on ${NEST_URL}`);
}
bootstrap();

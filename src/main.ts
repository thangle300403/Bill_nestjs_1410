import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
// import { getSSLOptions } from './sslOptions';

async function bootstrap() {
  // const httpsOptions = getSSLOptions(
  //   'C:\\Users\\Administrator\\Desktop\\ssl\\billbad.top',
  // );

  // const app = await NestFactory.create(AppModule, { httpsOptions });
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // const FRONTEND_URL = configService.get<string>('FRONTEND_URL');
  const EXPRESS_URL = configService.get<string>('EXPRESS_URL');
  // const NEST_URL = configService.get<string>('NEST_URL');

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
    origin: [
      'http://localhost:3000',
      'http://localhost:80',
      'http://localhost',
      'http://14.225.192.76:3000',
      'http://14.225.192.76:80',
      'http://14.225.192.76',
      'https://billbad.com',
      'https://www.billbad.com',
    ],
    credentials: true,
  });

  const port = 3091;
  await app.listen(port);
  // console.log(`✅ HTTPS NestJS running at https://billbad.top:${port}`);
  console.log(`✅ HTTP NestJS running at http://localhost:${port}`);
}
bootstrap();

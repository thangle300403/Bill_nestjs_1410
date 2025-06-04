import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { ProductModule } from './modules/product.module';

@Module({
  imports: [
    // Load .env variables globally
    ConfigModule.forRoot({
      envFilePath: '.env.local',
      isGlobal: true,
    }),

    // Serve static files from /public/images at /images
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public', 'images'),
      serveRoot: '/images',
    }),

    // Setup TypeORM (MySQL) configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: 3306,
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    // Mailer Module setup
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          auth: {
            user: configService.get<string>('SMTP_USERNAME'),
            pass: configService.get<string>('SMTP_SECRET'),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>('SMTP_USERNAME')}>`,
        },
      }),
    }),

    // Feature Modules
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

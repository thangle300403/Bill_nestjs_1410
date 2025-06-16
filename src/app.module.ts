import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { ProductModule } from './modules/product.module';
import { CategoryModule } from './modules/category.module';
import { ContactModule } from './modules/contact.module';
import { AuthModule } from './modules/auth.module';
import { OrdersModule } from './modules/order.module';
import { TransportModule } from './modules/transport.module';
import { AddressModule } from './modules/address.module';
import { CustomerModule } from './modules/customer.module';

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
        synchronize: false,
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
          from: `"No Reply" <${configService.get<string>('FRONTEND_URL')}>`,
        },
      }),
    }),

    // Feature Modules
    ProductModule,
    CategoryModule,
    ContactModule,
    AuthModule,
    OrdersModule,
    TransportModule,
    AddressModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

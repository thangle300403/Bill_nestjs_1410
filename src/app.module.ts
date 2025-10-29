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
import { AthleteGearModule } from './modules/athlete-gear.module';
import { VnpayModule } from 'nestjs-vnpay';
import { HashAlgorithm, ignoreLogger } from 'vnpay';
import { VnpayController } from './controllers/vnpay.controller';

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

      serveStaticOptions: {
        setHeaders: (res) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          res.setHeader('Access-Control-Allow-Origin', '*');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        },
      },
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

    VnpayModule.register({
      tmnCode: '94KSVO7C',
      secureSecret: 'V09NH8NL651Q8LP4ZRZ9A8CXQNXL1FSC',
      vnpayHost: 'https://sandbox.vnpayment.vn',

      // tuỳ chọn
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      enableLog: true,
      loggerFn: ignoreLogger,
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
    AthleteGearModule,
  ],
  controllers: [AppController, VnpayController],
  providers: [AppService],
})
export class AppModule {}

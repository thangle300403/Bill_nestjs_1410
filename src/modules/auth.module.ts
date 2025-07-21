import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../services/auth.service';
import { Customer } from '../entities/customer.entity';
import { Ward } from 'src/entities/ward.entity';
import { District } from 'src/entities/district.entity';
import { Province } from 'src/entities/province.entity';
import { Transport } from 'src/entities/transport.entity';
import { Order } from 'src/entities/order.entity';
import { Brand } from 'src/entities/brand.entity';
import { Status } from 'src/entities/status.entity';
import { AuthController } from 'src/controllers/auth/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from 'src/auth/google.strategy';
import { ConfigModule } from '@nestjs/config';
import { JwtConfig } from 'src/config/jwt.config';
import { OAuthController } from 'src/controllers/auth/oAuth.controller';
import { DiscordStrategy } from 'src/auth/discord.strategy';
import { CustomerModule } from './customer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Ward,
      District,
      Province,
      Transport,
      Order,
      Brand,
      Status,
    ]),
    ConfigModule.forRoot(),
    PassportModule,
    JwtConfig,
    CustomerModule,
  ],
  controllers: [AuthController, OAuthController],
  providers: [AuthService, GoogleStrategy, DiscordStrategy],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { ContactController } from '../controllers/contact.controller';
import { ContactService } from '../services/contact.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MailerModule, ConfigModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}

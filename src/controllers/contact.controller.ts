import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ContactService } from '../services/contact.service';

@Controller('api/v1/contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly configService: ConfigService,
  ) {}

  @Post('sendEmail')
  async sendEmail(
    @Body('fullname') fullname: string,
    @Body('email') email: string,
    @Body('mobile') mobile: string,
    @Body('content') content: string,
    @Res() res: Response,
  ) {
    try {
      const web = this.configService.get<string>('FRONTEND_URL');
      const to = this.configService.get<string>('SHOP_OWNER');
      const subject = 'G';
      const emailContent = `
        Hello shop owner, <br>
        Here is the contact information from the customer: <br>
        Name: ${fullname}<br>
        Email: ${email}<br>
        Mobile: ${mobile}<br>
        Message: ${content}<br>
        From website: ${web}
      `;

      await this.contactService.sendEmail(to!, subject, emailContent);
      return res.status(HttpStatus.OK).send('Send mail successful!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(message);
    }
  }
}

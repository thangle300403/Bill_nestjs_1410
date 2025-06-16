import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ContactService } from '../services/contact.service';

@Controller('api/v1')
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
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; color: #333;">📬 Thông tin liên hệ của khách hàng</h2>
    <p style="margin: 8px 0;"><strong>👤 Tên:</strong> ${fullname}</p>
    <p style="margin: 8px 0;"><strong>✉️ Email:</strong> ${email}</p>
    <p style="margin: 8px 0;"><strong>📞 Mobile:</strong> ${mobile}</p>
    <p style="margin: 8px 0;"><strong>📝 Nội dung:</strong></p>
    <div style="background-color: #fff; border: 1px solid #ccc; border-radius: 4px; padding: 12px; margin-bottom: 16px; color: #333;">
      ${content}
    </div>
    <p style="font-size: 12px; color: #666;">Sent from: ${web}</p>
  </div>
`;

      await this.contactService.sendEmail(to!, subject, emailContent);
      return res.status(HttpStatus.OK).send('Send mail successful!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(message);
    }
  }
}

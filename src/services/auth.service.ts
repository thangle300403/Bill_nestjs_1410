import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Customer } from '../entities/customer.entity';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { OAuthUser } from 'src/type/customer';
import { CustomerService } from './customer.service';
import setAuthCookies from 'src/auth/setAuthCookies';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly customerService: CustomerService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string, res: Response) {
    const customer = await this.customerRepository.findOne({
      where: { email },
      relations: ['ward', 'ward.province'],
    });

    if (!customer) {
      throw new NotFoundException(`Email ${email} không tồn tại.`);
    }

    const isMatch = bcrypt.compareSync(password, customer.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu không đúng.');
    }

    if (!customer.is_active) {
      throw new ForbiddenException('Tài khoản chưa được kích hoạt.');
    }

    // ✅ Generate JWT token
    setAuthCookies(customer, res, this.configService);

    // Flatten province ID
    const provinceId = customer.ward?.province?.id || null;

    // Remove sensitive info
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ward, ...userWithoutPassword } = customer;

    // Add province_id
    const responsePayload = {
      user: {
        ...userWithoutPassword,
        province_id: provinceId,
      },
    };

    return responsePayload;
  }

  async register({
    fullname,
    email,
    password,
    mobile,
  }: {
    fullname: string;
    email: string;
    password: string;
    mobile: string;
  }) {
    try {
      // 1. Check if email already exists
      const existing = await this.customerRepository.findOne({
        where: { email },
      });

      if (existing) {
        throw new ConflictException(
          `Email ${email} đã tồn tại trong hệ thống.`,
        );
      }

      // 2. Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // 3. Save new user to DB
      const newCustomer = this.customerRepository.create({
        name: fullname,
        email,
        password: hashedPassword,
        mobile,
        shipping_name: fullname,
        shipping_mobile: mobile,
        login_by: 'form',
        is_active: 0,
      });

      await this.customerRepository.save(newCustomer);

      // 4. Send activation email
      const jwtSecret = this.configService.get<string>('JWT_KEY') || '';
      const token = jwt.sign({ email }, jwtSecret, { expiresIn: '3d' });
      const web = process.env.FRONTEND_URL;
      const link = `${web}/active_account?token=${token}`;

      const subject = 'Godashop - Verify your email.';
      const content = `
            <!DOCTYPE html>
            <html lang="vi">
              <head>
                <meta charset="UTF-8" />
                <title>Kích hoạt tài khoản</title>
                <style>
                  .brutalist-card {
                    width: 320px;
                    border: 4px solid #000;
                    background-color: #fff;
                    padding: 1.5rem;
                    box-shadow: 10px 10px 0 #000;
                    font-family: "Arial", sans-serif;
                  }
            
                  .brutalist-card__header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    border-bottom: 2px solid #000;
                    padding-bottom: 1rem;
                  }
            
                  .brutalist-card__alert {
                    font-weight: 900;
                    color: #000;
                    font-size: 1.5rem;
                    text-transform: uppercase;
                  }
            
                  .brutalist-card__message {
                    margin-top: 1rem;
                    color: #000;
                    font-size: 0.9rem;
                    line-height: 1.4;
                    border-bottom: 2px solid #000;
                    padding-bottom: 1rem;
                    font-weight: 600;
                  }
            
                  .brutalist-card__actions {
                    margin-top: 1rem;
                  }
            
                  .brutalist-card__button {
                    display: block;
                    width: 100%;
                    padding: 0.75rem;
                    text-align: center;
                    font-size: 1rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    border: 3px solid #000;
                    background-color: #fff;
                    color: #000;
                    position: relative;
                    transition: all 0.2s ease;
                    box-shadow: 5px 5px 0 #000;
                    overflow: hidden;
                    text-decoration: none;
                    margin-bottom: 1rem;
                  }
            
                  .brutalist-card__button--mark:hover {
                    background-color: #296fbb;
                    border-color: #296fbb;
                    color: #fff;
                    box-shadow: 7px 7px 0 #004280;
                  }
                </style>
              </head>
              <body>
                <div class="brutalist-card">
                  <div class="brutalist-card__header">
                    <div class="brutalist-card__alert">Kích hoạt tài khoản</div>
                  </div>
                  <div class="brutalist-card__message">
                    Xin chào ${email},<br>
                    Click vào nút bên dưới để kích hoạt tài khoản.<br><br>
                    Được gửi từ web <a href="${web}">${web}</a>
                  </div>
                  <div class="brutalist-card__actions">
                    <a class="brutalist-card__button brutalist-card__button--mark" href="${link}">
                      Kích hoạt tài khoản
                    </a>
                  </div>
                </div>
              </body>
            </html>
            `;

      await this.mailerService.sendMail({
        to: email,
        subject,
        html: content,
      });
      return {
        message: `Đã đăng ký tài khoản thành công. Vui lòng kiểm tra ${email} để kích hoạt tài khoản.`,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi khi đăng ký tài khoản.',
      );
    }
  }

  async activateAccount(token: string) {
    try {
      console.log('Starting account activation process...');

      const jwtKey = this.configService.get<string>('JWT_KEY') || '';

      // Decode token
      const decoded = jwt.verify(token, jwtKey) as { email: string };

      const email = decoded.email;

      // Find customer by email
      const customer = await this.customerRepository.findOne({
        where: { email },
      });

      if (!customer) {
        console.log('No customer found with the provided email.');
        throw new NotFoundException('Người dùng không tồn tại.');
      }

      // Update account to active
      customer.is_active = 1;
      await this.customerRepository.save(customer);

      const response = {
        message: 'Đã kích hoạt tài khoản thành công.',
        user: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          access_token: token,
        },
      };
      return response;
    } catch (error) {
      console.error('Error activating account:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Kích hoạt thất bại: ${errorMessage}`);
    }
  }

  async checkIfEmailExists(email: string): Promise<boolean> {
    const customer = await this.customerRepository.findOne({
      where: { email },
    });
    return !!customer;
  }

  async getProfile(id: number) {
    const user = await this.customerRepository.findOne({
      where: { id },
      relations: ['ward', 'ward.province'],
    });

    return user;
  }

  async handleOAuthLogin(user: OAuthUser, res: Response): Promise<void> {
    if (user.provider === 'google' && !user.email_verified) {
      throw new UnauthorizedException('Google email not verified');
    }

    const existingUser: Customer | null =
      await this.customerService.findByEmail(user.email);

    const FRONTEND_URL = this.configService.get<string>('FRONTEND_URL') || '';

    if (!existingUser) {
      const confirmUrl = `${FRONTEND_URL}/oauth/confirm?email=${encodeURIComponent(
        user.email,
      )}&name=${encodeURIComponent(user.name)}`;

      // ❗ return ngay, không thực hiện bất kỳ logic nào phía sau
      return res.redirect(confirmUrl);
    }

    // ✅ Chỉ tạo token khi chắc chắn user tồn tại và có ID hợp lệ
    if (!existingUser.id) {
      console.warn('[OAuth]', 'Invalid user record, missing ID.');
      throw new UnauthorizedException('Invalid user record.');
    }

    // Use setAuthCookies to set tokens
    setAuthCookies(existingUser, res, this.configService);

    return res.redirect(`${FRONTEND_URL}/oauth-success`);
  }
}

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entities/customer.entity';
import { District } from 'src/entities/district.entity';
import { Ward } from 'src/entities/ward.entity';
import {
  CustomerUpdateFields,
  EnrichedCustomer,
  UpdateInfoDto,
  UpdateShippingDto,
} from 'src/type/customer';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,

    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,

    private readonly mailerService: MailerService,
  ) {}

  async updateShippingDefault(
    customerId: number,
    body: UpdateShippingDto,
  ): Promise<EnrichedCustomer> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const updatedFields: Partial<CustomerUpdateFields> = {
      shipping_name: body.fullname,
      shipping_mobile: body.mobile,
      housenumber_street: body.address,
      ward_id: body.ward,
    };

    for (const key of Object.keys(
      updatedFields,
    ) as (keyof typeof updatedFields)[]) {
      if (updatedFields[key] == null) {
        delete updatedFields[key];
      }
    }

    await this.customerRepository.update(customerId, updatedFields);

    const updatedCustomer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    //Get province and district
    let districtId: string | null = null;
    let provinceId: string | null = null;

    if (updatedCustomer?.ward_id) {
      const ward = await this.wardRepository.findOne({
        where: { id: updatedCustomer.ward_id },
        relations: ['district'],
      });

      if (ward?.district?.id) {
        districtId = ward.district.id;

        const district = await this.districtRepository.findOne({
          where: { id: districtId },
          relations: ['province'],
        });

        if (district?.province?.id) {
          provinceId = district.province.id;
        }
      }
    }

    return {
      ...updatedCustomer,
      district_id: districtId,
      province_id: provinceId,
    } as EnrichedCustomer;
  }

  async updateInfoById(customerId: number, dto: UpdateInfoDto) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const { fullname, mobile, current_password, password } = dto;

    customer.name = fullname || customer.name;
    customer.mobile = mobile || customer.mobile;

    if (current_password && password) {
      const isMatch = bcrypt.compareSync(current_password, customer.password);
      if (!isMatch) {
        throw new UnauthorizedException('Mật khẩu hiện tại không đúng.');
      }

      const salt = bcrypt.genSaltSync(10);
      customer.password = bcrypt.hashSync(password, salt);
    }

    const updateData = {
      name: customer.name,
      mobile: customer.mobile,
      password: customer.password,
    };

    await this.customerRepository.update(customer.id, updateData);

    return this.customerRepository.findOne({ where: { id: customer.id } });
  }

  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const customer = await this.customerRepository.findOne({
      where: { email },
    });

    if (!customer) {
      throw new NotFoundException('Email không tồn tại trong hệ thống.');
    }

    const jwtKey = process.env.JWT_KEY || '';
    const frontendUrl = process.env.FRONTEND_URL;

    const token = jwt.sign({ email }, jwtKey, { algorithm: 'HS256' });
    const resetLink = `${frontendUrl}/reset_password?token=${token}`;

    const htmlContent = `
            <!DOCTYPE html>
            <html lang="vi">
              <head>
                <meta charset="UTF-8" />
                <title>ĐẶT LẠI MẬT KHẨU</title>
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
                    <div class="brutalist-card__alert">Đặt lại mật khẩu</div>
                  </div>
                  <div class="brutalist-card__message">
                    Xin chào ${email},<br>
                    Click vào nút bên dưới để đặt lại mật khẩu.<br><br>
                    Email được gửi từ web <a href="${frontendUrl}">${frontendUrl}</a>
                  </div>
                  <div class="brutalist-card__actions">
                    <a class="brutalist-card__button brutalist-card__button--mark" href="${resetLink}">
                      Đặt lại
                    </a>
                  </div>
                </div>
              </body>
            </html>
            `;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Godashop - Reset password',
      html: htmlContent,
    });

    return {
      success: true,
      message: `Vui lòng kiểm tra ${email} để tạo mới mật khẩu.`,
    };
  }

  async updatePassword(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!token) {
      throw new UnauthorizedException('Missing token.');
    }

    const jwtKey = process.env.JWT_KEY || '';
    const decoded = jwt.verify(token, jwtKey) as { email: string };
    const email = decoded.email;

    const customer = await this.customerRepository.findOne({
      where: { email },
    });
    if (!customer) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    await this.customerRepository.update(customer.id, {
      password: hashedPassword,
    });

    return {
      success: true,
      message: 'Đã tạo mới mật khẩu thành công.',
    };
  }
}

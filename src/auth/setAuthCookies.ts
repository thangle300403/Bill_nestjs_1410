import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config'; // if used in context
import { Customer } from 'src/entities/customer.entity';

export default function setAuthCookies(
  customer: Customer,
  res: Response,
  configService: ConfigService,
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const expiresIn = configService.get('JWT_ACCESS_EXPIRES_IN');

  const accessToken = jwt.sign(
    {
      id: customer.id,
      email: customer.email,
      name: customer.name,
    },
    configService.get<string>('JWT_KEY') || '',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    { expiresIn },
  );

  const refreshToken = jwt.sign(
    {
      id: customer.id,
      email: customer.email,
    },
    configService.get<string>('JWT_REFRESH_SECRET') || '',
    { expiresIn: '7d' },
  );

  const cookieMaxAge = parseInt(
    configService.get('JWT_ACCESS_COOKIE_MAXAGE') || '900000',
  );

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    maxAge: cookieMaxAge,
    sameSite: 'lax',
    secure: false,
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax',
    secure: false,
  });
}

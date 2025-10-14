// auth/strategies/discord.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { Injectable } from '@nestjs/common';
import { CustomerService } from 'src/services/customer.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(
    private readonly customerService: CustomerService, // you must inject this
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: ['identify', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: { id: string; username: string; email: string },
  ): Promise<any> {
    const { username, email } = profile;

    let customer = await this.customerService.findByEmail(email);
    if (!customer) {
      customer = await this.customerService.create({
        email,
        name: username,
        login_by: 'discord',
        is_active: 1,
      });
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    };
  }
}

import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, StrategyOptionsWithRequest } from 'passport-google-oauth20';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Request } from 'express';
import { OAuthUser } from 'src/type/customer';

interface RichGoogleProfile extends GoogleProfile {
  emails: Array<{ value: string; verified?: boolean }>;
  name: {
    givenName: string;
    familyName: string;
  };
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const options: StrategyOptionsWithRequest = {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(options);
  }

  validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: RichGoogleProfile,
    done: (err: any, user?: any) => void,
  ): any {
    const email = profile.emails?.[0]?.value;
    const email_verified = profile.emails?.[0]?.verified ?? true;

    const name =
      `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();

    const user: Partial<OAuthUser> = {
      id: 0,
      name,
      email,
      provider: 'google',
      email_verified,
      isConfirmed: false,
    };

    done(null, user);
  }
}

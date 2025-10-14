import * as jwt from 'jsonwebtoken';

export function getTokenExpiry(token: string): number {
  try {
    const decoded = jwt.decode(token) as { exp?: number };

    if (!decoded || !decoded.exp) {
      throw new Error('Invalid token or missing expiration (exp) field');
    }

    return decoded.exp;
  } catch (err) {
    console.error('[getTokenExpiry] Failed to decode token:', err);
    throw err;
  }
}

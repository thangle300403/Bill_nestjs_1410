// middleware/conditional-csurf.ts
import { Request, Response, NextFunction } from 'express';
import csurf from 'csurf';

import { RequestHandler } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const csrfProtection: RequestHandler = csurf({
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: false,
    domain: 'localhost',
  },
});

export function conditionalCsrf(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // exclude /api/v1/refresh from CSRF check
  if (
    req.path === '/api/v1/refresh' ||
    req.path === '/api/v1/products/product-change'
  ) {
    return next();
  }

  csrfProtection(req, res, next);
}

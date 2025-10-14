// csrf.controller.ts
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

// Extend Express Request type to include csrfToken
declare module 'express-serve-static-core' {
  interface Request {
    csrfToken(): string;
  }
}

@Controller('api/v1/csrf')
export class CsrfController {
  @Get('token')
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const token = req.csrfToken();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    res.json({ csrfToken: token });
  }
}

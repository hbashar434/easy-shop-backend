import type { Request as ExpressRequest } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthRequest extends ExpressRequest {
  user: JwtPayload;
}

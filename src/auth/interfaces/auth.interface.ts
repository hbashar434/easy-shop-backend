import { User } from '@prisma/client';
import { Role } from '@prisma/client';
import type { Request as ExpressRequest } from 'express';

export interface JwtPayloadType {
  sub: string;
  email: string;
  role: string;
}

export interface AuthResponseType {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

export interface UserResponseType {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestWithUser extends ExpressRequest {
  user: JwtPayloadType;
}

export type SafeUser = Omit<
  User,
  'password' | 'verificationToken' | 'verificationExpires' | 'refreshToken'
>;

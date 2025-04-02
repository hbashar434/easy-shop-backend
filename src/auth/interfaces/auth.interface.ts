import { Role } from '@prisma/client';

export interface JwtPayloadType {
  sub: string;
  email: string;
  role: Role;
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

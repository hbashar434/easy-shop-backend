import { User } from '@prisma/client';
import { Role } from '@prisma/client';

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

export type SafeUser = Omit<
  User,
  'password' | 'verificationToken' | 'verificationExpires' | 'refreshToken'
>;

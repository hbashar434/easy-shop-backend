import { User, Role, Status } from '@prisma/client';

export interface AuthResponseType {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: Role;
    status: Status;
    avatar?: string;
  };
}

export interface UserResponseType {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: Role;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<
  User,
  'password' | 'verificationToken' | 'verificationExpires' | 'refreshToken'
>;

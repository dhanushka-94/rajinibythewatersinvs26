export type UserRole = "super_admin" | "admin" | "manager" | "staff" | "viewer";

export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreate {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UserUpdate {
  username?: string;
  password?: string;
  fullName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

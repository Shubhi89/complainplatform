export type UserRole = 'CONSUMER' | 'BUSINESS' | 'ADMIN';

export interface User {
  _id: string;
  googleId: string;
  displayName: string;
  email: string;
  role: UserRole;
  customId?: string; 
  isVerified?: boolean; 
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}
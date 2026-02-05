import { UserSession } from '../rbac/types';

export interface AuthProvider {
  getSession(): UserSession | null;
  signIn(email: string, password: string, rememberMe?: boolean): Promise<UserSession>;
  signUp(
    name: string,
    email: string,
    password: string,
    scope: 'BACKOFFICE' | 'PORTAL',
    rememberMe?: boolean
  ): Promise<UserSession>;
  signInWithGoogle(): Promise<UserSession>;
  signOut(): Promise<void>;
}

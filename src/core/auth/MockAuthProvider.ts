import { AuthProvider } from './types';
import { UserSession } from '../rbac/types';
import {
  loadSession,
  saveSession,
  clearSession,
  mockSignIn,
  mockSignUp,
  mockGoogleSignIn,
} from '../rbac/mockStore';

export class MockAuthProviderImpl implements AuthProvider {
  private session: UserSession | null = null;

  constructor() {
    this.session = loadSession();
  }

  getSession(): UserSession | null {
    return this.session;
  }

  async signIn(email: string, password: string, rememberMe = false): Promise<UserSession> {
    await this.simulateDelay();

    const user = mockSignIn(email, password);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    this.session = user;
    saveSession(user, rememberMe);
    return user;
  }

  async signUp(
    name: string,
    email: string,
    password: string,
    scope: 'BACKOFFICE' | 'PORTAL',
    rememberMe = false
  ): Promise<UserSession> {
    await this.simulateDelay();

    const user = mockSignUp(name, email, password, scope);
    this.session = user;
    saveSession(user, rememberMe);
    return user;
  }

  async signInWithGoogle(): Promise<UserSession> {
    await this.simulateDelay();

    const user = mockGoogleSignIn();
    this.session = user;
    saveSession(user, true);
    return user;
  }

  async signOut(): Promise<void> {
    await this.simulateDelay();

    this.session = null;
    clearSession();
  }

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export const mockAuthProvider = new MockAuthProviderImpl();

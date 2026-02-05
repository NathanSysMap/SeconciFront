import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserSession, LegacyUser } from '../rbac/types';
import { mockAuthProvider } from './MockAuthProvider';
import { SEED_USERS, isRememberMeEnabled } from '../rbac/mockStore';

interface AuthContextType {
  session: UserSession | null;
  user: LegacyUser | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    scope: 'BACKOFFICE' | 'PORTAL',
    rememberMe?: boolean
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signInAsAdminMaster: () => Promise<void>;
  signInAsClientAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSessionToLegacyUser(session: UserSession | null): LegacyUser | null {
  if (!session) return null;

  let role: 'admin' | 'operational' | 'company';

  if (session.scope === 'BACKOFFICE') {
    role = session.isAdminMaster ? 'admin' : 'operational';
  } else {
    role = 'company';
  }

  return {
    id: session.id,
    email: session.email,
    full_name: session.name,
    role,
    company_id: session.tenantId || undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSession = mockAuthProvider.getSession();
    setSession(currentSession);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string, rememberMe = false) => {
    const user = await mockAuthProvider.signIn(email, password, rememberMe);
    setSession(user);
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    scope: 'BACKOFFICE' | 'PORTAL',
    rememberMe = false
  ) => {
    const user = await mockAuthProvider.signUp(name, email, password, scope, rememberMe);
    setSession(user);
  };

  const signInWithGoogle = async () => {
    const user = await mockAuthProvider.signInWithGoogle();
    setSession(user);
  };

  const signOut = async () => {
    await mockAuthProvider.signOut();
    setSession(null);
  };

  const signInAsAdminMaster = async () => {
    const rememberMe = isRememberMeEnabled();
    await mockAuthProvider.signIn(SEED_USERS.adminMaster.email, 'demo', rememberMe);
    setSession(SEED_USERS.adminMaster);
  };

  const signInAsClientAdmin = async () => {
    const rememberMe = isRememberMeEnabled();
    await mockAuthProvider.signIn(SEED_USERS.clientAdmin.email, 'demo', rememberMe);
    setSession(SEED_USERS.clientAdmin);
  };

  const user = mapSessionToLegacyUser(session);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        signInAsAdminMaster,
        signInAsClientAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

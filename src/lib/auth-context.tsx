import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company_id?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    autoLogin();
  }, []);

  const autoLogin = async () => {
    try {
      const adminUserId = '11111111-1111-1111-1111-111111111111';
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', adminUserId)
        .maybeSingle();

      if (!error && data) {
        setUser({
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          company_id: data.company_id
        });
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Sign in:', email, password);
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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

export function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

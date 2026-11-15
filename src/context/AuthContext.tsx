import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, TOKEN_KEY, type User } from '../lib/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) { setLoading(false); return; }
    api<{ user: User }>('/auth/me').then((data) => setUser(data.user)).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setLoading(false));
  }, []);
  async function establish(path: string, values: object) {
    const result = await api<{ user: User; token: string }>(path, { method: 'POST', body: JSON.stringify(values) });
    localStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
  }
  return <AuthContext.Provider value={{
    user, loading,
    login: (email, password) => establish('/auth/login', { email, password }),
    register: (name, email, password) => establish('/auth/register', { name, email, password }),
    logout: () => { localStorage.removeItem(TOKEN_KEY); setUser(null); },
  }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

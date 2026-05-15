import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro';
  resumeCount: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user for the frontend-only demo
const DEMO_USER: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@resumeiq.dev',
  plan: 'pro',
  resumeCount: 3,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedToken = localStorage.getItem('resumeiq_token');
    const storedUser = localStorage.getItem('resumeiq_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo';
    const loggedUser = { ...DEMO_USER, email };
    setToken(mockToken);
    setUser(loggedUser);
    localStorage.setItem('resumeiq_token', mockToken);
    localStorage.setItem('resumeiq_user', JSON.stringify(loggedUser));
    setIsLoading(false);
  };

  const register = async (name: string, email: string, _password: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo';
    const newUser: User = { ...DEMO_USER, name, email, plan: 'free', resumeCount: 0 };
    setToken(mockToken);
    setUser(newUser);
    localStorage.setItem('resumeiq_token', mockToken);
    localStorage.setItem('resumeiq_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('resumeiq_token');
    localStorage.removeItem('resumeiq_user');
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      login, register, logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

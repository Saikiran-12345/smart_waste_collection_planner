import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types/User';

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: () => {}
});

// Demo credentials (passwords are plain for demo only)
const demoUsers: Record<string, { password: string; role: User['role'] }> = {
  admin: { password: 'admin123', role: 'ADMIN' },
  operator: { password: 'operator123', role: 'OPERATOR' },
  driver: { password: 'driver123', role: 'DRIVER' }
};

// Read stored user synchronously to avoid flash-redirect on page reload
function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem('authUser');
    if (stored) return JSON.parse(stored) as User;
  } catch {
    // corrupted data – ignore
  }
  return null;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  // Mark loading complete after first render
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const record = demoUsers[username];
    if (record && record.password === password) {
      const loggedUser: User = { username, role: record.role };
      setUser(loggedUser);
      localStorage.setItem('authUser', JSON.stringify(loggedUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

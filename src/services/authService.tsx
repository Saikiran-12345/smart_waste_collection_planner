import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types/User';

interface AuthContextProps {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: async () => false,
  logout: () => {}
});

// Demo credentials (passwords are plain for demo only)
const demoUsers: Record<string, { password: string; role: User['role'] }> = {
  admin: { password: 'admin123', role: 'ADMIN' },
  operator: { password: 'operator123', role: 'OPERATOR' },
  driver: { password: 'driver123', role: 'DRIVER' }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      setUser(JSON.parse(stored) as User);
    }
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
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

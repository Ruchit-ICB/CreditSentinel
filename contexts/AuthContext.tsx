import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Manager' | 'Analyst' | 'Auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for persistent session
    const storedUser = localStorage.getItem('cs_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string) => {
    // Mock Authentication Logic
    let role: UserRole = 'Analyst';
    let name = 'Alex Chen';
    
    if (email.includes('admin') || email.includes('manager')) {
      role = 'Manager';
      name = 'Sarah Jenkins';
    } else if (email.includes('audit')) {
      role = 'Auditor';
      name = 'Michael Ross';
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`
    };

    setUser(newUser);
    localStorage.setItem('cs_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cs_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
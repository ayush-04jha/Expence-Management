import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Company } from '../types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, companyName: string, country: string, currency: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_COMPANIES: Company[] = [
  {
    id: 'company-1',
    name: 'Tech Solutions Inc',
    country: 'United States',
    baseCurrency: 'USD',
    createdAt: new Date().toISOString(),
  },
];

const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    companyId: 'company-1',
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    companyId: 'company-1',
    email: 'manager@example.com',
    fullName: 'Manager User',
    role: 'manager',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-3',
    companyId: 'company-1',
    email: 'employee@example.com',
    fullName: 'Employee User',
    role: 'employee',
    managerId: 'user-2',
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedCompany = localStorage.getItem('company');

    if (storedUser && storedCompany) {
      setUser(JSON.parse(storedUser));
      setCompany(JSON.parse(storedCompany));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const foundUser = MOCK_USERS.find(u => u.email === email);

    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    const foundCompany = MOCK_COMPANIES.find(c => c.id === foundUser.companyId);

    if (!foundCompany) {
      throw new Error('Company not found');
    }

    setUser(foundUser);
    setCompany(foundCompany);
    localStorage.setItem('user', JSON.stringify(foundUser));
    localStorage.setItem('company', JSON.stringify(foundCompany));
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    companyName: string,
    country: string,
    currency: string
  ) => {
    const newCompany: Company = {
      id: `company-${Date.now()}`,
      name: companyName,
      country,
      baseCurrency: currency,
      createdAt: new Date().toISOString(),
    };

    const newUser: User = {
      id: `user-${Date.now()}`,
      companyId: newCompany.id,
      email,
      fullName,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };

    MOCK_COMPANIES.push(newCompany);
    MOCK_USERS.push(newUser);

    setUser(newUser);
    setCompany(newCompany);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('company', JSON.stringify(newCompany));
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('user');
    localStorage.removeItem('company');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

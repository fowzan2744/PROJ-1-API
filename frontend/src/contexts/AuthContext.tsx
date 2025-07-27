import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  role: 'Admin' | 'Client' | 'User';
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing token on app start
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, role?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Mock authentication for demo - replace with actual API endpoint
      let response;
      try {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role }),
        });
      } catch {
        response = { ok: false };
      }

      // If API fails, use mock authentication
      if (!response.ok) {
        // Determine role based on username or provided role parameter
        let userRole: 'Admin' | 'Client' | 'User';
        if (role) {
          userRole = role as 'Admin' | 'Client' | 'User';
        } else {
          userRole = username === 'admin' ? 'Admin' : username === 'client' ? 'Client' : 'User';
        }
        
        response = {
          ok: true,
          json: () => Promise.resolve({
            token: 'mock_jwt_token_' + Date.now(),
            user: {
              id: '1',
              username,
              role: userRole,
              email: `${username}@example.com`
            }
          })
        };
      }

      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        setUser(data.user);

        // Redirect based on role
        switch (data.user.role) {
          case 'Admin':
            navigate('/admin');
            break;
          case 'Client':
            navigate('/client');
            break;
          case 'User':
            navigate('/user');
            break;
          default:
            navigate('/');
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
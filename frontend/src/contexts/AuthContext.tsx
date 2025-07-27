import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';

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

  // Function to fetch user profile from backend
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authAPI.getProfile();
      // The backend now returns the user object directly
      console.log('User profile fetched successfully:', userData);
      setUser(userData);
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      console.error('Error response:', error.response?.data);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing token and fetch user profile on app start
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      console.log('Found token, fetching user profile...');
      fetchUserProfile();
    } else {
      console.log('No token found, setting loading to false');
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string, role?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login(username, password, role);
      
      if (response.token && response.user) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        setUser(response.user);

        // Redirect based on role
        switch (response.user.role) {
          case 'Admin':
            navigate('/dashboard/admin');
            break;
          case 'Client':
            navigate('/dashboard/client');
            break;
          case 'User':
            navigate('/dashboard/user');
            break;
          default:
            navigate('/dashboard');
        }
        
        toast.success('Login successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint if needed
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    }
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
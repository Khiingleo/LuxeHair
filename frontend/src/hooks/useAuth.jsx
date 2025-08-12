import { useState, useEffect, createContext, useContext } from 'react';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (formData) => {
    try {
      const res = await api.post('auth/login/', formData);
      console.log('Login response:', res.data);
      const { access, refresh } = res.data.tokens;

      localStorage.setItem(ACCESS_TOKEN, access);
      localStorage.setItem(REFRESH_TOKEN, refresh);

      const decoded = jwtDecode(access);
      const userData = {
        email: decoded.email,
        full_name: decoded.full_name,
        isAdmin: decoded.is_staff,
      };

      setUser(userData); // Save in state
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      await api.post('auth/register/', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
      });

      // return {
      //   success: true,
      //   message: 'Registration successful! Please check your email to verify your account.',
      // };
    } catch (error) {
      console.error('Registration failed', error);
      console.log("Error response:", error.response?.data);
      const errorMsg =
        error.response?.data?.detail ||
        Object.values(error.response?.data || {})[0] ||
        'Registration failed. Please try again.';
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN);
    if (!refresh) return logout();

    try {
      const res = await api.post('auth/token/refresh/', { refresh: refresh });
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      if (res.data.refresh) {
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      }
      const decoded = jwtDecode(res.data.access);
      const userData = {
        email: decoded.email,
        full_name: decoded.full_name,
        isAdmin: decoded.is_staff,
      };
      setUser(userData);
      // setUser(decoded);
      setIsAuthenticated(true);
    } catch (err) {
      logout();
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      logout();
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        await refreshToken();
      } else {
        const userData = {
          email: decoded.email,
          full_name: decoded.full_name,
          isAdmin: decoded.is_staff,
        };
        setUser(userData);
        // setUser(decoded);
        setIsAuthenticated(true);
      }
    } catch (e) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default useAuth;

import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email, password, twoFactorCode) => {
    try {
      const response = await axios.post('/api/login', {
        email,
        password,
        two_factor_code: twoFactorCode
      });
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Ein Fehler ist aufgetreten'
      };
    }
  };

  const register = async (email, password) => {
    try {
      const response = await axios.post('/api/register', {
        email,
        password
      });
      
      return {
        success: true,
        twoFactorSecret: response.data.two_factor_secret
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Ein Fehler ist aufgetreten'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

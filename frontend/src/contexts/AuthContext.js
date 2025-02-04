import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Konfiguriere axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Prüfe beim Start, ob der Benutzer bereits eingeloggt ist
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/check-auth');
        if (response.data.authenticated) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Wenn der Auth-Status sich ändert, leite entsprechend weiter
    if (!loading) {
      if (isAuthenticated) {
        navigate('/');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, loading, navigate]);

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
      setUser(null);
      setIsAuthenticated(false);
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
        twoFactorSecret: response.data.two_factor_secret,
        qrCode: response.data.qr_code
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Ein Fehler ist aufgetreten'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  if (loading) {
    return null; // oder eine Loading-Komponente
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

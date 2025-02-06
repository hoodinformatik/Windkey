import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import Vault from './components/Vault';
import Tools from './components/Tools';
import Stats from './components/Stats'; // Import Stats component
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const createAppTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#175DDC',
      light: '#2C6FE5',
      dark: '#1252C9',
    },
    secondary: {
      main: '#175DDC',
    },
    background: {
      default: darkMode ? '#1F242E' : '#FFFFFF',
      paper: darkMode ? '#2F343D' : '#FFFFFF',
      alternate: darkMode ? '#292D37' : '#FBFBFB',
    },
    text: {
      primary: darkMode ? '#FFFFFF' : '#1F242E',
      secondary: darkMode ? '#BEC5D0' : '#4C525F',
    },
    error: {
      main: '#FF3E3E',
    },
    divider: darkMode ? '#363B45' : '#E8E8E8',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Helvetica Neue',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontSize: '0.9375rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 3,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: darkMode ? '#2F343D' : '#FFFFFF',
          borderBottom: `1px solid ${darkMode ? '#363B45' : '#E8E8E8'}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9375rem',
          padding: '6px 16px',
          minHeight: 36,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: darkMode ? '#363B45' : '#E8E8E8',
          '&:hover': {
            borderColor: '#175DDC',
            backgroundColor: 'rgba(23, 93, 220, 0.04)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 3,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: darkMode 
            ? '0 2px 8px rgba(0, 0, 0, 0.35)' 
            : '0 2px 8px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 3,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 40,
          fontSize: '0.9375rem',
        },
      },
    },
  },
});

function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return null; // or a Loading component
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

function ThemedApp() {
  const { darkMode } = useTheme();
  const theme = createAppTheme(darkMode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="vault" element={<Vault />} />
                <Route path="tools" element={<Tools />} />
                <Route path="stats" element={<Stats />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;

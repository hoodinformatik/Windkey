import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import Tools from './components/Tools';
import Stats from './components/Stats';
import History from './components/History';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const createAppTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1D4ED8',
    },
    secondary: {
      main: '#2563EB',
    },
    background: {
      default: darkMode ? '#111827' : '#F9FAFB',
      paper: darkMode ? '#1F2937' : '#FFFFFF',
      alternate: darkMode ? '#374151' : '#F3F4F6',
    },
    text: {
      primary: darkMode ? '#F9FAFB' : '#111827',
      secondary: darkMode ? '#D1D5DB' : '#4B5563',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3B82F6',
    },
    success: {
      main: '#10B981',
    },
    divider: darkMode ? '#374151' : '#E5E7EB',
  },
  typography: {
    fontFamily: [
      'Inter',
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
      fontWeight: 700,
      fontSize: '1.875rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: darkMode ? '#1F2937' : '#F3F4F6',
          },
          '&::-webkit-scrollbar-thumb': {
            background: darkMode ? '#4B5563' : '#9CA3AF',
            borderRadius: '3px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
          borderBottom: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '8px 16px',
          minHeight: 40,
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: darkMode ? '#374151' : '#E5E7EB',
          '&:hover': {
            borderColor: darkMode ? '#4B5563' : '#D1D5DB',
            backgroundColor: darkMode ? 'rgba(75, 85, 99, 0.1)' : 'rgba(229, 231, 235, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: darkMode 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
        elevation1: {
          boxShadow: darkMode
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.12)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            transition: 'all 0.2s ease-in-out',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? '#4B5563' : '#D1D5DB',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '20px',
          padding: '8px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          height: '8px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
});

function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return null;
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
                <Route path="tools" element={<Tools />} />
                <Route path="stats" element={<Stats />} />
                <Route path="history" element={<History />} />
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

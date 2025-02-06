import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !twoFactorCode) {
      setError('All fields are required');
      return;
    }

    const result = await login(email, password, twoFactorCode);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={1}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backgroundColor: 'background.paper',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <SecurityIcon 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main',
                mb: 2,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                  '50%': {
                    opacity: 0.8,
                    transform: 'scale(1.05)',
                  },
                },
              }} 
            />
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
                letterSpacing: '-0.02em',
              }}
            >
              Willkommen zurück
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: '80%',
                mx: 'auto',
              }}
            >
              Melden Sie sich an, um auf Ihre sicheren Passwörter zuzugreifen
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-Mail Adresse"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error && !email}
              helperText={error && !email ? 'Email is required' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailIcon color="action" sx={{ fontSize: '1.25rem' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.02)',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Passwort"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error && !password}
              helperText={error && !password ? 'Password is required' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" sx={{ fontSize: '1.25rem' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ 
                        color: 'text.secondary',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.05)'
                              : 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.02)',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="twoFactorCode"
              label="2FA Code"
              type="text"
              id="twoFactorCode"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              error={!!error && !twoFactorCode}
              helperText={error && !twoFactorCode ? '2FA Code is required' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon color="action" sx={{ fontSize: '1.25rem' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.02)',
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
              }}
            >
              Anmelden
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <MuiLink
                component={RouterLink}
                to="/register"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: 'primary.dark',
                    textDecoration: 'none',
                  },
                }}
              >
                Noch kein Konto? Jetzt registrieren
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

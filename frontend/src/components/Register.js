import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  QrCode2 as QrCode2Icon,
} from '@mui/icons-material';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    const result = await register(email, password);
    if (result.success) {
      setTwoFactorSecret(result.twoFactorSecret);
      setQrCode(result.qrCode);
      setShowTwoFactorDialog(true);
    } else {
      setError(result.error);
    }
  };

  const handleDialogClose = () => {
    setShowTwoFactorDialog(false);
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 5,
              width: '100%',
              borderRadius: 4,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <SecurityIcon 
                sx={{ 
                  fontSize: 48, 
                  color: 'primary.main',
                  mb: 2,
                }} 
              />
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  letterSpacing: '-0.5px',
                }}
              >
                Konto erstellen
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  color: 'text.secondary',
                }}
              >
                Erstellen Sie ein Konto, um Ihre Passwörter sicher zu verwalten
              </Typography>
            </Box>

            {error && (
              <Box sx={{ mb: 2 }}>
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              </Box>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Passwort"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Passwort bestätigen"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Registrieren
              </Button>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Bereits ein Konto?{' '}
                  <Link
                    href="/login"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Anmelden
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>

      <Dialog
        open={showTwoFactorDialog}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCode2Icon color="primary" />
            <Typography variant="h6">Zwei-Faktor-Authentifizierung</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Bitte scannen Sie den folgenden QR-Code mit Ihrer Authenticator-App:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              my: 2,
            }}
          >
            {qrCode && (
              <img
                src={qrCode}
                alt="2FA QR Code"
                style={{ maxWidth: '200px', height: 'auto' }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Alternativ können Sie auch diesen Code manuell in Ihre App eingeben:
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'monospace',
              bgcolor: 'background.default',
              p: 2,
              borderRadius: 1,
              mt: 1,
              wordBreak: 'break-all',
            }}
          >
            {twoFactorSecret}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} variant="contained">
            Verstanden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

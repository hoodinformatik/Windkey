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
} from '@mui/material';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);

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
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Registrieren
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Passwort"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Passwort bestätigen"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Registrieren
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" variant="body2">
                {"Bereits ein Konto? Jetzt anmelden"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Dialog open={showTwoFactorDialog} onClose={handleDialogClose}>
        <DialogTitle>2FA Einrichtung</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Bitte speichern Sie diesen 2FA-Schlüssel sicher:
          </Typography>
          <Typography variant="h6" component="div" sx={{ mt: 2, mb: 2 }}>
            {twoFactorSecret}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verwenden Sie diesen Schlüssel in Ihrer Authenticator-App, um 2FA-Codes zu generieren.
            Sie benötigen diese bei jeder Anmeldung.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Verstanden</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Container,
  Menu,
  MenuItem,
  useTheme as useMuiTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  FormHelperText,
  LinearProgress,
  Tooltip,
  Slider,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Folder as FolderIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  AccountCircle,
  Brightness4,
  Brightness7,
  Visibility,
  VisibilityOff,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

export default function Layout() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const muiTheme = useMuiTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openNewPasswordDialog, setOpenNewPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState({
    title: '',
    password: '',
    url: '',
    notes: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Kein Passwort', color: 'error' });
  const [generatorSettings, setGeneratorSettings] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true,
  });
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'Kein Passwort', color: 'error' };
    
    let score = 0;
    const checks = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      length_bonus: password.length >= 16
    };
    
    if (checks.length) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.numbers) score += 20;
    if (checks.special) score += 20;
    if (checks.length_bonus) score += 20;
    
    score = Math.min(score, 100);
    
    if (score < 20) return { score, label: 'Sehr schwach', color: 'error' };
    if (score < 40) return { score, label: 'Schwach', color: 'error' };
    if (score < 60) return { score, label: 'Mittel', color: 'warning' };
    if (score < 80) return { score, label: 'Stark', color: 'info' };
    return { score, label: 'Sehr stark', color: 'success' };
  };

  const generatePassword = () => {
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let availableChars = '';
    if (generatorSettings.uppercase) availableChars += charset.uppercase;
    if (generatorSettings.lowercase) availableChars += charset.lowercase;
    if (generatorSettings.numbers) availableChars += charset.numbers;
    if (generatorSettings.special) availableChars += charset.special;

    if (!availableChars) {
      setError('Please select at least one character type');
      return;
    }

    let password = '';
    for (let i = 0; i < generatorSettings.length; i++) {
      const randomIndex = Math.floor(Math.random() * availableChars.length);
      password += availableChars[randomIndex];
    }

    // Ensure at least one character of each selected type is included
    let finalPassword = password;
    if (generatorSettings.uppercase && !/[A-Z]/.test(password)) {
      const randomChar = charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)];
      const randomPos = Math.floor(Math.random() * password.length);
      finalPassword = finalPassword.substring(0, randomPos) + randomChar + finalPassword.substring(randomPos + 1);
    }
    if (generatorSettings.lowercase && !/[a-z]/.test(password)) {
      const randomChar = charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)];
      const randomPos = Math.floor(Math.random() * password.length);
      finalPassword = finalPassword.substring(0, randomPos) + randomChar + finalPassword.substring(randomPos + 1);
    }
    if (generatorSettings.numbers && !/[0-9]/.test(password)) {
      const randomChar = charset.numbers[Math.floor(Math.random() * charset.numbers.length)];
      const randomPos = Math.floor(Math.random() * password.length);
      finalPassword = finalPassword.substring(0, randomPos) + randomChar + finalPassword.substring(randomPos + 1);
    }
    if (generatorSettings.special && !/[^A-Za-z0-9]/.test(password)) {
      const randomChar = charset.special[Math.floor(Math.random() * charset.special.length)];
      const randomPos = Math.floor(Math.random() * password.length);
      finalPassword = finalPassword.substring(0, randomPos) + randomChar + finalPassword.substring(randomPos + 1);
    }

    setNewPassword(prev => ({ ...prev, password: finalPassword }));
    setPasswordStrength(calculatePasswordStrength(finalPassword));
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleNewPasswordClick = () => {
    setOpenNewPasswordDialog(true);
    generatePassword(); // Generate a password immediately when opening the dialog
  };

  const handleNewPasswordClose = () => {
    setOpenNewPasswordDialog(false);
    setNewPassword({
      title: '',
      password: '',
      url: '',
      notes: '',
    });
    setError('');
    setPasswordStrength({ score: 0, label: 'Kein Passwort', color: 'error' });
  };

  const handleNewPasswordSubmit = async () => {
    try {
      if (!newPassword.title || !newPassword.password) {
        setError('Title and password are required');
        return;
      }

      await axios.post('/api/passwords', newPassword);
      handleNewPasswordClose();
      // Refresh the current page to show the new password
      window.location.reload();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create password');
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewPassword(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleGeneratorSettingChange = (event) => {
    const { name, value, checked } = event.target;
    setGeneratorSettings(prev => {
      const newSettings = {
        ...prev,
        [name]: name === 'length' ? value : checked
      };
      
      // Schedule the password generation after the state update
      setTimeout(() => generatePassword(), 0);
      
      return newSettings;
    });
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newPassword.password);
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              color: 'text.primary',
              textDecoration: 'none',
              fontWeight: 600,
              mr: 4,
            }}
          >
            Windkey
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5 }}>
            <Button
              component={Link}
              to="/dashboard"
              variant="text"
              color="inherit"
              startIcon={<FolderIcon />}
              sx={{
                color: location.pathname === '/dashboard' ? 'primary.main' : 'text.secondary',
                minWidth: 'auto',
                px: 1.5,
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              to="/vault"
              variant="text"
              color="inherit"
              startIcon={<FolderIcon />}
              sx={{
                color: location.pathname === '/vault' ? 'primary.main' : 'text.secondary',
                minWidth: 'auto',
                px: 1.5,
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              Mein Tresor
            </Button>
            <Button
              component={Link}
              to="/tools"
              variant="text"
              color="inherit"
              startIcon={<FolderIcon />}
              sx={{
                color: location.pathname === '/tools' ? 'primary.main' : 'text.secondary',
                minWidth: 'auto',
                px: 1.5,
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              Tools
            </Button>
            <Button
              component={Link}
              to="/stats"
              variant="text"
              color="inherit"
              startIcon={<AssessmentIcon />}
              sx={{
                color: location.pathname === '/stats' ? 'primary.main' : 'text.secondary',
                minWidth: 'auto',
                px: 1.5,
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              Statistiken
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewPasswordClick}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              Neu
            </Button>

            <IconButton
              onClick={toggleDarkMode}
              color="inherit"
              sx={{ color: 'text.secondary' }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <IconButton
              onClick={handleMenu}
              color="inherit"
              sx={{ color: 'text.secondary' }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              onClick={handleClose}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* New Password Dialog */}
      <Dialog 
        open={openNewPasswordDialog} 
        onClose={handleNewPasswordClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Neues Passwort erstellen</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Title"
              value={newPassword.title}
              onChange={(e) => setNewPassword(prev => ({ ...prev, title: e.target.value }))}
              error={!newPassword.title}
              helperText={!newPassword.title ? 'Title is required' : ''}
            />
            
            <FormControl 
              fullWidth 
              margin="normal"
              error={!newPassword.password}
            >
              <InputLabel htmlFor="password">Passwort</InputLabel>
              <OutlinedInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword.password}
                onChange={(e) => setNewPassword(prev => ({ ...prev, password: e.target.value }))}
                endAdornment={
                  <InputAdornment position="end">
                    <Tooltip title="Passwort kopieren">
                      <IconButton onClick={handleCopyPassword} edge="end" sx={{ mr: 1 }}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Neues Passwort generieren">
                      <IconButton onClick={generatePassword} edge="end" sx={{ mr: 1 }}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Passwort"
              />
              {!newPassword.password && (
                <FormHelperText error>Password is required</FormHelperText>
              )}
              <FormHelperText>
                Stärke: {passwordStrength.label}
              </FormHelperText>
            </FormControl>

            <LinearProgress 
              variant="determinate" 
              value={passwordStrength.score}
              color={passwordStrength.color}
              sx={{ height: 8, borderRadius: 4 }}
            />

            {/* Password Generator Settings */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Passwort-Generator Einstellungen
              </Typography>
              <Box sx={{ px: 2 }}>
                <Typography id="password-length-slider" gutterBottom>
                  Länge: {generatorSettings.length} Zeichen
                </Typography>
                <Slider
                  name="length"
                  value={generatorSettings.length}
                  onChange={(_, value) => handleGeneratorSettingChange({ target: { name: 'length', value }})}
                  min={8}
                  max={64}
                  aria-labelledby="password-length-slider"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={generatorSettings.uppercase}
                      onChange={handleGeneratorSettingChange}
                      name="uppercase"
                    />
                  }
                  label="Großbuchstaben (A-Z)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={generatorSettings.lowercase}
                      onChange={handleGeneratorSettingChange}
                      name="lowercase"
                    />
                  }
                  label="Kleinbuchstaben (a-z)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={generatorSettings.numbers}
                      onChange={handleGeneratorSettingChange}
                      name="numbers"
                    />
                  }
                  label="Zahlen (0-9)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={generatorSettings.special}
                      onChange={handleGeneratorSettingChange}
                      name="special"
                    />
                  }
                  label="Sonderzeichen (!@#$%^&*)"
                />
              </Box>
            </Box>

            <TextField
              name="url"
              label="URL"
              value={newPassword.url}
              onChange={handleInputChange}
              fullWidth
            />

            <TextField
              name="notes"
              label="Notizen"
              value={newPassword.notes}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={4}
            />

            {showCopiedMessage && (
              <Alert severity="success" sx={{ mt: 1 }}>
                Passwort wurde in die Zwischenablage kopiert
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewPasswordClose}>Abbrechen</Button>
          <Button onClick={handleNewPasswordSubmit} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      <Toolbar /> {/* Spacer */}
      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

import React, { useState, useEffect } from 'react';
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
  Select,
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
  History as HistoryIcon,
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
  const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newPassword, setNewPassword] = useState({
    title: '',
    password: '',
    url: '',
    notes: '',
    category_id: ''
  });
  const [changePasswordData, setChangePasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePasswords, setShowChangePasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Kein Passwort', color: 'error' });
  const [generatorSettings, setGeneratorSettings] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true,
  });
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

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
    fetchCategories(); // Fetch latest categories when opening dialog
  };

  const handleNewPasswordClose = () => {
    setOpenNewPasswordDialog(false);
    setNewPassword({
      title: '',
      password: '',
      url: '',
      notes: '',
      category_id: ''
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

  const handleChangePasswordClick = () => {
    setOpenChangePasswordDialog(true);
    setChangePasswordError('');
    setChangePasswordSuccess('');
    handleClose(); // Close the user menu
  };

  const handleChangePasswordClose = () => {
    setOpenChangePasswordDialog(false);
    setChangePasswordData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setChangePasswordError('');
    setChangePasswordSuccess('');
    setShowChangePasswords({
      current: false,
      new: false,
      confirm: false
    });
  };

  const handleChangePasswordSubmit = async () => {
    try {
      // Validate passwords match
      if (changePasswordData.new_password !== changePasswordData.confirm_password) {
        setChangePasswordError('New passwords do not match');
        return;
      }

      // Validate password length
      if (changePasswordData.new_password.length < 8) {
        setChangePasswordError('New password must be at least 8 characters long');
        return;
      }

      const response = await axios.post('/api/change-password', {
        current_password: changePasswordData.current_password,
        new_password: changePasswordData.new_password
      });

      setChangePasswordSuccess('Password changed successfully!');
      setChangePasswordError('');
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        handleChangePasswordClose();
      }, 2000);
      
    } catch (error) {
      setChangePasswordError(error.response?.data?.error || 'Failed to change password');
      setChangePasswordSuccess('');
    }
  };

  const handleChangePasswordInputChange = (event) => {
    const { name, value } = event.target;
    setChangePasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setChangePasswordError(''); // Clear error when user types
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
            <Button
              component={Link}
              to="/history"
              variant="text"
              color="inherit"
              startIcon={<HistoryIcon />}
              sx={{
                color: location.pathname === '/history' ? 'primary.main' : 'text.secondary',
                minWidth: 'auto',
                px: 1.5,
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              Verlauf
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
            >
              <MenuItem onClick={handleChangePasswordClick}>Change Password</MenuItem>
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

            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Kategorie</InputLabel>
              <Select
                labelId="category-label"
                value={newPassword.category_id}
                onChange={(e) => setNewPassword(prev => ({ ...prev, category_id: e.target.value }))}
                label="Kategorie"
              >
                <MenuItem value="">
                  <em>Keine Kategorie</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
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

      {/* Change Password Dialog */}
      <Dialog 
        open={openChangePasswordDialog} 
        onClose={handleChangePasswordClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {changePasswordError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {changePasswordError}
              </Alert>
            )}
            {changePasswordSuccess && (
              <Alert severity="success" sx={{ mb: 1 }}>
                {changePasswordSuccess}
              </Alert>
            )}
            
            <FormControl fullWidth required>
              <InputLabel htmlFor="current-password">Current Password</InputLabel>
              <OutlinedInput
                id="current-password"
                name="current_password"
                type={showChangePasswords.current ? 'text' : 'password'}
                value={changePasswordData.current_password}
                onChange={handleChangePasswordInputChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowChangePasswords(prev => ({
                        ...prev,
                        current: !prev.current
                      }))}
                      edge="end"
                    >
                      {showChangePasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Current Password"
              />
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel htmlFor="new-password">New Password</InputLabel>
              <OutlinedInput
                id="new-password"
                name="new_password"
                type={showChangePasswords.new ? 'text' : 'password'}
                value={changePasswordData.new_password}
                onChange={handleChangePasswordInputChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowChangePasswords(prev => ({
                        ...prev,
                        new: !prev.new
                      }))}
                      edge="end"
                    >
                      {showChangePasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="New Password"
              />
              <FormHelperText>Password must be at least 8 characters long</FormHelperText>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel htmlFor="confirm-password">Confirm New Password</InputLabel>
              <OutlinedInput
                id="confirm-password"
                name="confirm_password"
                type={showChangePasswords.confirm ? 'text' : 'password'}
                value={changePasswordData.confirm_password}
                onChange={handleChangePasswordInputChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowChangePasswords(prev => ({
                        ...prev,
                        confirm: !prev.confirm
                      }))}
                      edge="end"
                    >
                      {showChangePasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Confirm New Password"
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChangePasswordClose}>Cancel</Button>
          <Button 
            onClick={handleChangePasswordSubmit} 
            variant="contained"
            disabled={
              !changePasswordData.current_password || 
              !changePasswordData.new_password || 
              !changePasswordData.confirm_password ||
              changePasswordData.new_password !== changePasswordData.confirm_password
            }
          >
            Change Password
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

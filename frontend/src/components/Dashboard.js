import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Box,
  InputAdornment,
  Chip,
  Tooltip,
  CardActionArea,
  Divider,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
  Link as LinkIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import axios from 'axios';

export default function Dashboard() {
  const [passwords, setPasswords] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    password: '',
    url: '',
    notes: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const response = await axios.get('/api/passwords');
      setPasswords(response.data);
    } catch (error) {
      showSnackbar('Fehler beim Laden der Passwörter', 'error');
    }
  };

  const filteredPasswords = passwords.filter(password =>
    password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpen = (password = null) => {
    if (password) {
      setEditingPassword(password);
      setFormData({
        title: password.title,
        password: '',
        url: password.url || '',
        notes: password.notes || '',
      });
    } else {
      setEditingPassword(null);
      setFormData({
        title: '',
        password: '',
        url: '',
        notes: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPassword(null);
    setFormData({
      title: '',
      password: '',
      url: '',
      notes: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPassword) {
        await axios.put(`/api/passwords/${editingPassword.id}`, formData);
        showSnackbar('Passwort erfolgreich aktualisiert');
      } else {
        await axios.post('/api/passwords', formData);
        showSnackbar('Passwort erfolgreich gespeichert');
      }
      handleClose();
      fetchPasswords();
    } catch (error) {
      showSnackbar('Fehler beim Speichern des Passworts', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/passwords/${id}`);
      showSnackbar('Passwort erfolgreich gelöscht');
      fetchPasswords();
    } catch (error) {
      showSnackbar('Fehler beim Löschen des Passworts', 'error');
    }
  };

  const handleGeneratePassword = async () => {
    try {
      const response = await axios.get('/api/generate-password');
      setFormData({ ...formData, password: response.data.password });
    } catch (error) {
      showSnackbar('Fehler beim Generieren des Passworts', 'error');
    }
  };

  const handleCopyPassword = async (id) => {
    try {
      const password = passwords.find((p) => p.id === id);
      await navigator.clipboard.writeText(password.password);
      showSnackbar('Passwort in die Zwischenablage kopiert');
    } catch (error) {
      showSnackbar('Fehler beim Kopieren des Passworts', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Passwörter durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ minWidth: 200 }}
        >
          Neues Passwort
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredPasswords.map((password) => (
          <Grid item xs={12} sm={6} md={4} key={password.id}>
            <Card 
              elevation={0}
              sx={{
                height: '100%',
                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon 
                    sx={{ 
                      color: 'primary.main',
                      mr: 1,
                      fontSize: 28,
                    }} 
                  />
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {password.title}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpen(password)}
                    sx={{ 
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      mr: 1,
                      '&:hover': {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete(password.id)}
                    sx={{ 
                      backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                      '&:hover': {
                        backgroundColor: (theme) => alpha(theme.palette.error.main, 0.2),
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                {password.url && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LinkIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {password.url}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={showPassword[password.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    onClick={() => togglePasswordVisibility(password.id)}
                    sx={{ 
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    {showPassword[password.id] ? 'Verbergen' : 'Anzeigen'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => handleCopyPassword(password.id)}
                    sx={{ 
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    Kopieren
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {editingPassword ? 'Passwort bearbeiten' : 'Neues Passwort'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Titel"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Passwort"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      onClick={handleGeneratePassword}
                      sx={{ 
                        minWidth: 'auto',
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      <KeyIcon />
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="URL"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Notizen"
              multiline
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose}>Abbrechen</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{ minWidth: 100 }}
          >
            {editingPassword ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

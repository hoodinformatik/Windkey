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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import axios from 'axios';

export default function Dashboard() {
  const [passwords, setPasswords] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Neues Passwort
          </Button>
        </Grid>
        {passwords.map((password) => (
          <Grid item xs={12} sm={6} md={4} key={password.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {password.title}
                </Typography>
                {password.url && (
                  <Typography color="text.secondary" gutterBottom>
                    {password.url}
                  </Typography>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton onClick={() => handleCopyPassword(password.id)}>
                    <CopyIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpen(password)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(password.id)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingPassword ? 'Passwort bearbeiten' : 'Neues Passwort'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Titel"
            fullWidth
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Passwort"
            type="password"
            fullWidth
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <Button
            variant="outlined"
            onClick={handleGeneratePassword}
            sx={{ mt: 1 }}
          >
            Passwort generieren
          </Button>
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Notizen"
            fullWidth
            multiline
            rows={4}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Abbrechen</Button>
          <Button onClick={handleSubmit} variant="contained">
            Speichern
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
    </Container>
  );
}

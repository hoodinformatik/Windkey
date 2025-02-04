import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';

const Stats = ({ passwords, showSnackbar }) => {
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

  const getPasswordStats = () => {
    const stats = {
      total: passwords.length,
      strength: {
        veryWeak: 0,
        weak: 0,
        medium: 0,
        strong: 0,
        veryStrong: 0
      },
      duplicates: 0,
      averageLength: 0,
      shortPasswords: 0,
      longPasswords: 0
    };

    // Zähle doppelte Passwörter
    const passwordCounts = {};
    passwords.forEach(p => {
      passwordCounts[p.password] = (passwordCounts[p.password] || 0) + 1;
    });
    stats.duplicates = Object.values(passwordCounts).filter(count => count > 1).length;

    // Berechne andere Statistiken
    passwords.forEach(p => {
      const strength = calculatePasswordStrength(p.password);
      
      if (strength.score < 20) stats.strength.veryWeak++;
      else if (strength.score < 40) stats.strength.weak++;
      else if (strength.score < 60) stats.strength.medium++;
      else if (strength.score < 80) stats.strength.strong++;
      else stats.strength.veryStrong++;

      stats.averageLength += p.password.length;
      if (p.password.length < 8) stats.shortPasswords++;
      if (p.password.length > 16) stats.longPasswords++;
    });

    stats.averageLength = stats.total ? Math.round(stats.averageLength / stats.total) : 0;

    return stats;
  };

  const stats = getPasswordStats();

  const [openDuplicatesDialog, setOpenDuplicatesDialog] = useState(false);
  
  const getDuplicateGroups = () => {
    const groups = {};
    passwords.forEach(p => {
      if (!groups[p.password]) {
        groups[p.password] = [];
      }
      groups[p.password].push(p);
    });
    return Object.values(groups).filter(group => group.length > 1);
  };

  const duplicateGroups = getDuplicateGroups();

  const StatCard = ({ title, value, icon, color, tooltip }) => (
    <Tooltip title={tooltip}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {icon}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="h4" color={color}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Tooltip>
  );

  const StrengthBar = ({ label, value, total, color }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          {value} ({total ? Math.round((value / total) * 100) : 0}%)
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={total ? (value / total) * 100 : 0}
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Passwort-Statistiken
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              cursor: stats.duplicates > 0 ? 'pointer' : 'default',
              '&:hover': stats.duplicates > 0 ? {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s'
              } : {}
            }}
            onClick={() => stats.duplicates > 0 && setOpenDuplicatesDialog(true)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="warning" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Duplikate
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {stats.duplicates}
              </Typography>
              {stats.duplicates > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Klicken für Details
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Gesamt"
            value={stats.total}
            icon={<SecurityIcon color="primary" />}
            color="primary"
            tooltip="Gesamtzahl der gespeicherten Passwörter"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ø Länge"
            value={stats.averageLength}
            icon={<InfoIcon color="info" />}
            color="info"
            tooltip="Durchschnittliche Passwortlänge"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sehr stark"
            value={stats.strength.veryStrong}
            icon={<CheckCircleIcon color="success" />}
            color="success"
            tooltip="Anzahl der sehr starken Passwörter"
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Passwort-Stärke Verteilung
        </Typography>
        <StrengthBar
          label="Sehr stark"
          value={stats.strength.veryStrong}
          total={stats.total}
          color="success"
        />
        <StrengthBar
          label="Stark"
          value={stats.strength.strong}
          total={stats.total}
          color="info"
        />
        <StrengthBar
          label="Mittel"
          value={stats.strength.medium}
          total={stats.total}
          color="warning"
        />
        <StrengthBar
          label="Schwach"
          value={stats.strength.weak}
          total={stats.total}
          color="error"
        />
        <StrengthBar
          label="Sehr schwach"
          value={stats.strength.veryWeak}
          total={stats.total}
          color="error"
        />
      </Paper>

      {/* Dialog für Duplikate */}
      <Dialog
        open={openDuplicatesDialog}
        onClose={() => setOpenDuplicatesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Gefundene Duplikate
          </Box>
        </DialogTitle>
        <DialogContent>
          {duplicateGroups.map((group, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="warning.main" sx={{ mb: 1 }}>
                Gruppe {index + 1} ({group.length} Einträge)
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {group.map((item, i) => (
                  <Box 
                    key={i} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: i < group.length - 1 ? 1 : 0,
                      pb: i < group.length - 1 ? 1 : 0,
                      borderBottom: i < group.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <Box>
                      <Typography variant="body1">{item.title}</Typography>
                      {item.url && (
                        <Typography variant="caption" color="text.secondary">
                          {item.url}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Passwort kopieren">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(item.password);
                            showSnackbar('Passwort wurde kopiert', 'success');
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDuplicatesDialog(false)}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Stats;

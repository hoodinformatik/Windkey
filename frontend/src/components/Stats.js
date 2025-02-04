import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const Stats = ({ passwords }) => {
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
            title="Duplikate"
            value={stats.duplicates}
            icon={<WarningIcon color="warning" />}
            color="warning"
            tooltip="Anzahl der Passwörter, die mehrfach verwendet werden"
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
    </Box>
  );
};

export default Stats;

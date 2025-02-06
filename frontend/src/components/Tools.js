import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  Password as PasswordIcon,
  Security as SecurityIcon,
  Compare as CompareIcon,
  DataUsage as DataUsageIcon,
  VerifiedUser as VerifiedUserIcon,
  Extension as ExtensionIcon,
  ImportExport as ImportExportIcon,
} from '@mui/icons-material';

export default function Tools() {
  const tools = [
    {
      id: 1,
      name: 'Passwort Generator',
      description: 'Erstellen Sie starke, zufällige Passwörter',
      icon: <PasswordIcon />,
      category: 'GENERATOR',
    },
    {
      id: 2,
      name: 'Passwort Gesundheit',
      description: 'Überprüfen Sie die Stärke Ihrer gespeicherten Passwörter',
      icon: <SecurityIcon />,
      category: 'SICHERHEIT',
    },
    {
      id: 3,
      name: 'Datenleck Scanner',
      description: 'Prüfen Sie, ob Ihre Daten in bekannten Datenlecks gefunden wurden',
      icon: <DataUsageIcon />,
      category: 'SICHERHEIT',
    },
    {
      id: 4,
      name: 'Authentifikator',
      description: 'Zwei-Faktor-Authentifizierungscodes (TOTP)',
      icon: <VerifiedUserIcon />,
      category: 'SICHERHEIT',
    },
    {
      id: 5,
      name: 'Import/Export',
      description: 'Importieren oder exportieren Sie Ihre Tresor-Daten',
      icon: <ImportExportIcon />,
      category: 'ANDERE',
    },
  ];

  // Group tools by category
  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  return (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={3}>
        {Object.entries(groupedTools).map(([category, categoryTools]) => (
          <Grid item xs={12} key={category}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 2, px: 1 }}
            >
              {category}
            </Typography>
            <Grid container spacing={2}>
              {categoryTools.map((tool) => (
                <Grid item xs={12} sm={6} md={4} key={tool.id}>
                  <Paper
                    sx={{
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? '0 4px 12px rgba(0, 0, 0, 0.45)'
                            : '0 4px 12px rgba(0, 0, 0, 0.25)',
                        cursor: 'pointer',
                      },
                    }}
                  >
                    <ListItemButton
                      sx={{
                        height: '100%',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          color: 'white',
                        }}
                      >
                        {tool.icon}
                      </Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        {tool.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.4 }}
                      >
                        {tool.description}
                      </Typography>
                    </ListItemButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

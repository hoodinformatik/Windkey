import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Security as SecurityIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: 'none',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ padding: '8px 0' }}>
            <SecurityIcon sx={{ color: 'primary.main', fontSize: 32, mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ 
              flexGrow: 1, 
              color: 'text.primary',
              fontWeight: 600,
              letterSpacing: '-0.5px',
            }}>
              WindKey
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SecurityIcon />}
                sx={{ mr: 2 }}
              >
                Neues Passwort
              </Button>

              <Tooltip title="Account Einstellungen">
                <IconButton
                  onClick={handleMenu}
                  size="small"
                  sx={{ 
                    border: '2px solid',
                    borderColor: 'primary.main',
                    padding: '4px'
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      color: 'white',
                    }}
                  >
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  minWidth: 180,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  mt: 1.5,
                },
              }}
            >
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                <AccountCircleIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Typography variant="body1">Profil</Typography>
              </MenuItem>
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                <SettingsIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Typography variant="body1">Einstellungen</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 2 }} />
                <Typography variant="body1">Abmelden</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          py: 4,
        }}
      >
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
}

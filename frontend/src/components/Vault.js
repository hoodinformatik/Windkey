import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Label as LabelIcon,
  Key as KeyIcon,
  CreditCard as CreditCardIcon,
  Note as NoteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';

export default function Vault() {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const response = await axios.get('/api/passwords');
        setPasswords(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch passwords:', err);
        setError('Failed to load passwords');
        setLoading(false);
      }
    };

    fetchPasswords();
  }, []);

  // Calculate counts
  const getFolderCounts = () => {
    return {
      favorites: passwords.filter(p => p.favorite).length,
      deleted: passwords.filter(p => p.deleted).length,
      archived: passwords.filter(p => p.archived).length
    };
  };

  const getTypeCounts = () => {
    return {
      login: passwords.filter(p => p.type === 'login').length,
      note: passwords.filter(p => p.type === 'note').length,
      card: passwords.filter(p => p.type === 'card').length,
      identity: passwords.filter(p => p.type === 'identity').length
    };
  };

  const getCollectionCounts = () => {
    const collections = {};
    passwords.forEach(p => {
      if (p.collection) {
        collections[p.collection] = (collections[p.collection] || 0) + 1;
      }
    });
    return collections;
  };

  const folderCounts = getFolderCounts();
  const typeCounts = getTypeCounts();
  const collectionCounts = getCollectionCounts();

  const folders = [
    { id: 'favorites', name: 'Favoriten', icon: <StarIcon />, count: folderCounts.favorites },
    { id: 'deleted', name: 'Gelöschte Objekte', icon: <DeleteIcon />, count: folderCounts.deleted },
    { id: 'archived', name: 'Archiv', icon: <ArchiveIcon />, count: folderCounts.archived },
  ];

  const types = [
    { id: 'login', name: 'Anmeldedaten', icon: <KeyIcon />, count: typeCounts.login },
    { id: 'note', name: 'Sichere Notizen', icon: <NoteIcon />, count: typeCounts.note },
    { id: 'card', name: 'Kreditkarten', icon: <CreditCardIcon />, count: typeCounts.card },
    { id: 'identity', name: 'Identitäten', icon: <PersonIcon />, count: typeCounts.identity },
  ];

  const collections = Object.entries(collectionCounts).map(([name, count], index) => ({
    id: index + 1,
    name,
    icon: <LabelIcon />,
    count
  }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', pt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Filter passwords based on selection
  const getFilteredPasswords = () => {
    let filtered = [...passwords];
    
    if (selectedFolder) {
      switch (selectedFolder) {
        case 'favorites':
          filtered = filtered.filter(p => p.favorite);
          break;
        case 'deleted':
          filtered = filtered.filter(p => p.deleted);
          break;
        case 'archived':
          filtered = filtered.filter(p => p.archived);
          break;
      }
    }

    if (selectedType) {
      filtered = filtered.filter(p => p.type === selectedType);
    }

    if (selectedCollection) {
      filtered = filtered.filter(p => p.collection === selectedCollection);
    }

    return filtered;
  };

  const filteredPasswords = getFilteredPasswords();

  return (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={2}>
        {/* Left Sidebar */}
        <Grid item xs={12} sm={4} md={3}>
          <Paper 
            sx={{ 
              height: '100%',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <List>
              {folders.map((folder) => (
                <ListItemButton
                  key={folder.id}
                  selected={selectedFolder === folder.id}
                  onClick={() => setSelectedFolder(folder.id === selectedFolder ? null : folder.id)}
                >
                  <ListItemIcon>{folder.icon}</ListItemIcon>
                  <ListItemText 
                    primary={folder.name}
                    secondary={`${folder.count} Objekte`}
                  />
                </ListItemButton>
              ))}

              <Divider sx={{ my: 1 }} />

              <ListItem>
                <ListItemText 
                  primary="OBJEKTTYPEN"
                  primaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                />
              </ListItem>

              {types.map((type) => (
                <ListItemButton
                  key={type.id}
                  selected={selectedType === type.id}
                  onClick={() => setSelectedType(type.id === selectedType ? null : type.id)}
                >
                  <ListItemIcon>{type.icon}</ListItemIcon>
                  <ListItemText 
                    primary={type.name}
                    secondary={`${type.count} Objekte`}
                  />
                </ListItemButton>
              ))}

              <Divider sx={{ my: 1 }} />

              <ListItem>
                <ListItemText 
                  primary="SAMMLUNGEN"
                  primaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                />
              </ListItem>

              {collections.map((collection) => (
                <ListItemButton
                  key={collection.id}
                  selected={selectedCollection === collection.name}
                  onClick={() => setSelectedCollection(collection.name === selectedCollection ? null : collection.name)}
                >
                  <ListItemIcon>{collection.icon}</ListItemIcon>
                  <ListItemText 
                    primary={collection.name}
                    secondary={`${collection.count} Objekte`}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} sm={8} md={9}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedFolder ? folders.find(f => f.id === selectedFolder)?.name :
               selectedType ? types.find(t => t.id === selectedType)?.name :
               selectedCollection ? collections.find(c => c.name === selectedCollection)?.name :
               'Alle Objekte'}
            </Typography>
            
            <Grid container spacing={2}>
              {filteredPasswords.map((password) => (
                <Grid item xs={12} sm={6} md={4} key={password.id}>
                  <Paper 
                    sx={{ 
                      p: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <Typography variant="subtitle1">{password.title}</Typography>
                    {password.url && (
                      <Typography variant="body2" color="text.secondary">
                        {password.url}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

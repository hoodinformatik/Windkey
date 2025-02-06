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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Menu,
  Tooltip,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  Archive as ArchiveIcon,
  Label as LabelIcon,
  Key as KeyIcon,
  CreditCard as CreditCardIcon,
  Note as NoteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

export default function Vault() {
  const theme = useTheme();
  const [passwords, setPasswords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'Folder',
    color: theme.palette.primary.main
  });
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);
  const [selectedCategoryForMenu, setSelectedCategoryForMenu] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    fetchPasswords();
    fetchCategories();
  }, []);

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

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAddCategory = () => {
    setCategoryToEdit(null);
    setNewCategory({
      name: '',
      icon: 'Folder',
      color: theme.palette.primary.main
    });
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setCategoryToEdit(category);
    setNewCategory({
      name: category.name,
      icon: category.icon,
      color: category.color
    });
    setCategoryDialogOpen(true);
    handleCloseMenu();
  };

  const handleDeleteCategory = async (category) => {
    try {
      await axios.delete(`/api/categories/${category.id}`);
      fetchCategories();
      if (selectedCategory?.id === category.id) {
        setSelectedCategory(null);
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
    handleCloseMenu();
  };

  const handleSaveCategory = async () => {
    try {
      if (categoryToEdit) {
        await axios.put(`/api/categories/${categoryToEdit.id}`, newCategory);
      } else {
        await axios.post('/api/categories', newCategory);
      }
      fetchCategories();
      setCategoryDialogOpen(false);
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleCategoryMenuClick = (event, category) => {
    event.stopPropagation();
    setSelectedCategoryForMenu(category);
    setCategoryMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setCategoryMenuAnchor(null);
    setSelectedCategoryForMenu(null);
  };

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

  const getFilteredPasswords = () => {
    let filtered = [...passwords];
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory.id);
    }

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Left Sidebar - Categories */}
      <Paper
        sx={{
          width: 280,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h2">
            Kategorien
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddCategory}
            size="small"
          >
            Neu
          </Button>
        </Box>
        <Divider />
        <List>
          <ListItemButton
            selected={!selectedCategory}
            onClick={() => setSelectedCategory(null)}
          >
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Alle Passwörter"
              secondary={`${passwords.length} Einträge`}
            />
          </ListItemButton>
          {categories.map((category) => (
            <ListItemButton
              key={category.id}
              selected={selectedCategory?.id === category.id}
              onClick={() => handleCategoryClick(category)}
            >
              <ListItemIcon sx={{ color: category.color }}>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText 
                primary={category.name}
                secondary={`${category.password_count} Einträge`}
              />
              <IconButton
                size="small"
                onClick={(e) => handleCategoryMenuClick(e, category)}
              >
                <MoreVertIcon />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ my: 1 }} />
        <ListItem>
          <ListItemText 
            primary="ORDNER"
            primaryTypographyProps={{
              variant: 'caption',
              color: 'text.secondary',
              fontWeight: 500,
            }}
          />
        </ListItem>
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
      </Paper>

      {/* Main Content - Password List */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {selectedCategory ? selectedCategory.name : 'Alle Passwörter'}
        </Typography>
        <Grid container spacing={2}>
          {getFilteredPasswords().map((password) => (
            <Grid item xs={12} sm={6} md={4} key={password.id}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Typography variant="h6" component="h3" gutterBottom>
                  {password.title}
                </Typography>
                {password.url && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {password.url}
                  </Typography>
                )}
                {password.notes && (
                  <Typography variant="body2" color="text.secondary">
                    {password.notes}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Category Menu */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleEditCategory(selectedCategoryForMenu)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Bearbeiten</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteCategory(selectedCategoryForMenu)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Löschen</ListItemText>
        </MenuItem>
      </Menu>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)}>
        <DialogTitle>
          {categoryToEdit ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Farbe"
            fullWidth
            value={newCategory.color}
            onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
            type="color"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSaveCategory} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

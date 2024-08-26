// src/components/InventoryDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Grid,
  IconButton,
  Fade,
  Alert,
  AlertTitle,
  Zoom
} from '@mui/material';
import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { firestore } from '../firebase/config';
import { collection, doc, getDoc, query, where, onSnapshot, Timestamp, updateDoc } from 'firebase/firestore';
import InventoryList from './InventoryList';
import InventoryItemForm from './InventoryItemForm';

interface InventoryDashboardProps {
  organizationId: string;
}

interface AlertItem {
  id: string;
  type: 'low_stock' | 'near_expiry';
  itemName: string;
  quantity: number;
  expiryDate: Timestamp;
  status: 'new' | 'dismissed';
}

const DashboardPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: theme.palette.common.white,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.common.white,
    color: '#2196F3',
    '&:hover': {
      backgroundColor: theme.palette.grey[100],
    },
  },
  '&.MuiButton-outlined': {
    borderColor: theme.palette.common.white,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&:hover fieldset': {
      borderColor: 'white',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputBase-input': {
    color: 'white',
  },
}));

export default function InventoryDashboard({ organizationId }: InventoryDashboardProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const docRef = doc(firestore, 'organizations', organizationId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCategories(docSnap.data().categories || []);
      }
    };
    fetchCategories();
  }, [organizationId]);

  const handleAddCategory = async () => {
    if (newCategory && !categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];
      await updateDoc(doc(firestore, 'organizations', organizationId), {
        categories: updatedCategories
      });
      setCategories(updatedCategories);
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };

  useEffect(() => {
    const fetchAlerts = () => {
      const alertsQuery = query(
        collection(firestore, `organizations/${organizationId}/alerts`),
        where('status', '==', 'new')
      );

      const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
        const newAlerts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AlertItem));
        setAlerts(newAlerts);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchAlerts();
    return () => unsubscribe();
  }, [organizationId]);

  const handleDismissAlert = async (alertId: string) => {
    await updateDoc(doc(firestore, `organizations/${organizationId}/alerts`, alertId), {
      status: 'dismissed'
    });
  };

  const triggerInventoryMonitoring = async () => {
    try {
      const response = await fetch('/api/monitorInventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Inventory monitoring result:', data);

      // Set dialog content and open the dialog
      setDialogContent(data.analysis);
      setOpenDialog(true);

    } catch (error) {
      console.error('Error monitoring inventory:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Fade in={true} timeout={1000}>
      <Box>
        <DashboardPaper elevation={3}>
          <Typography variant="h4" gutterBottom>Inventory Dashboard</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <ActionButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddingItem(true)}
                fullWidth
              >
                Add New Item
              </ActionButton>
            </Grid>
            <Grid item xs={12} sm={4}>
              <ActionButton
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setIsAddingCategory(true)}
                fullWidth
              >
                Add Category
              </ActionButton>
            </Grid>
            <Grid item xs={12} sm={4}>
              <SearchTextField
                fullWidth
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <IconButton edge="start">
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
                placeholder="Search inventory..."
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ActionButton variant="contained" onClick={triggerInventoryMonitoring} fullWidth>Run Inventory Check</ActionButton>
            </Grid>
          </Grid>
        </DashboardPaper>

        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Categories:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => (
              <Zoom in={true} key={category}>
                <Chip 
                  label={category} 
                  sx={{ 
                    backgroundColor: '#2196F3', 
                    color: 'white',
                    '&:hover': { backgroundColor: '#1976D2' }
                  }} 
                />
              </Zoom>
            ))}
          </Box>
        </Paper>

        {isAddingItem && (
          <InventoryItemForm
            organizationId={organizationId}
            onComplete={() => setIsAddingItem(false)}
            categories={categories}
          />
        )}
       
        {alerts.length > 0 && (
          <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: '#FFF3E0' }}>
            <Typography variant="h6" gutterBottom>Alerts:</Typography>
            {alerts.map(alert => (
              <Alert 
                key={alert.id} 
                severity={alert.type === 'low_stock' ? 'warning' : 'error'}
                onClose={() => handleDismissAlert(alert.id)}
                sx={{ mb: 1 }}
              >
                <AlertTitle>{alert.type === 'low_stock' ? 'Low Stock' : 'Near Expiry'}</AlertTitle>
                {alert.type === 'low_stock' 
                  ? `${alert.itemName} is running low (Quantity: ${alert.quantity})`
                  : `${alert.itemName} is near expiry (Expires: ${alert.expiryDate.toDate().toLocaleDateString()})`
                }
              </Alert>
            ))}
          </Paper>
        )}
        
        <InventoryList organizationId={organizationId} searchTerm={searchTerm} />

        <Dialog open={isAddingCategory} onClose={() => setIsAddingCategory(false)}>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Category Name"
              fullWidth
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddingCategory(false)} color="primary">Cancel</Button>
            <Button onClick={handleAddCategory} color="primary">Add</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for displaying monitored items */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Inventory Monitoring Results</DialogTitle>
          <DialogContent>
            <Typography>{dialogContent}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}

// src/components/InventoryList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase/config';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  Paper,
  Fade,
  Grow
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';

interface InventoryListProps {
  organizationId: string;
  searchTerm: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  color: theme.palette.common.white,
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

export default function InventoryList({ organizationId, searchTerm }: InventoryListProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(firestore, 'organizations', organizationId, 'inventory'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const inventoryItems: InventoryItem[] = [];
      const categoriesSet = new Set<string>();
      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() } as InventoryItem;
        inventoryItems.push(item);
        categoriesSet.add(item.category);
      });
      setItems(inventoryItems);
      setCategories(Array.from(categoriesSet));
    });

    return () => unsubscribe();
  }, [organizationId]);

  useEffect(() => {
    let filtered = items;
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    setFilteredItems(filtered);
  }, [items, searchTerm, categoryFilter]);
  console.log('Categories:', categories);
  return (
    <Fade in={true} timeout={1000}>
      <StyledPaper elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Inventory Items</Typography>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as string)}
            displayEmpty
            size="small"
            sx={{ backgroundColor: 'white', color: 'black' }}
          >
            <MenuItem key="all" value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </Box>
        <List>
          {filteredItems.map((item, index) => (
            <Grow
              in={true}
              style={{ transformOrigin: '0 0 0' }}
              timeout={1000 + index * 100}
              key={item.id} // Unique key for each item
            >
              <StyledListItem>
                <ListItemText
                  primary={item.name}
                  secondary={`Quantity: ${item.quantity} | Expiry: ${item.expiryDate} | Category: ${item.category}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </StyledListItem>
            </Grow>
          ))}
        </List>
      </StyledPaper>
    </Fade>
  );
}

// src/components/InventoryItemForm.tsx
'use client';

import React, { useState } from 'react';
import { TextField, Button, Box, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import { firestore } from '../firebase/config';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

interface InventoryItemFormProps {
  organizationId: string;
  onComplete: () => void;
  itemId?: string;
  initialData?: InventoryItem;
  categories: string[];
}

interface InventoryItem {
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
}

export default function InventoryItemForm({ organizationId, onComplete, itemId, initialData, categories }: InventoryItemFormProps) {
  const [item, setItem] = useState<InventoryItem>(initialData || {
    name: '',
    quantity: 0,
    expiryDate: '',
    category: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (itemId) {
        await updateDoc(doc(firestore, 'organizations', organizationId, 'inventory', itemId), {
          name: item.name,
          quantity: item.quantity,
          expiryDate: item.expiryDate,
          category: item.category,
        });
      } else {
        await addDoc(collection(firestore, 'organizations', organizationId, 'inventory'), item);
      }
      onComplete();
    } catch (error) {
      console.error("Error saving inventory item:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        name="name"
        label="Item Name"
        value={item.name}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        name="quantity"
        label="Quantity"
        type="number"
        value={item.quantity}
        onChange={handleChange}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        name="expiryDate"
        label="Expiry Date"
        type="date"
        value={item.expiryDate}
        onChange={handleChange}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select
          name="category"
          value={item.category}
          onChange={handleSelectChange}
          required
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>{category}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        {itemId ? 'Update Item' : 'Add Item'}
      </Button>
    </Box>
  );
}
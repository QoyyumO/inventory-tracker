// src/components/ProductForm.tsx
import React, { useState } from 'react';
import { firestore } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  SelectChangeEvent, 
  Box, 
  Typography,
  Paper,
  Fade
} from '@mui/material';
import { styled } from '@mui/system';

interface ProductFormProps {
  categories: string[];
  organizationId: string;
}

interface ProductData {
  name: string;
  category: string;
  quantity: number;
  expiryDate: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: theme.palette.common.white,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
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

export default function ProductForm({ categories, organizationId }: ProductFormProps) {
  const [product, setProduct] = useState<ProductData>({
    name: '',
    category: '',
    quantity: 0,
    expiryDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(firestore, 'products'), {
        ...product,
        organizationId,
      });
      // Handle successful submission
      setProduct({ name: '', category: '', quantity: 0, expiryDate: '' });
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };

  return (
    <Fade in={true} timeout={1000}>
      <StyledPaper elevation={3}>
        <Typography variant="h6" gutterBottom>Add New Product</Typography>
        <Box component="form" noValidate autoComplete="off">
          <StyledTextField
            fullWidth
            name="name"
            label="Product Name"
            value={product.name}
            onChange={handleChange}
          />
          <Select
            fullWidth
            name="category"
            value={product.category}
            onChange={handleChange}
            sx={{ marginBottom: 2, color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' } }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
          <StyledTextField
            fullWidth
            name="quantity"
            label="Quantity"
            type="number"
            value={product.quantity}
            onChange={handleNumberChange}
          />
          <StyledTextField
            fullWidth
            name="expiryDate"
            label="Expiry Date"
            type="date"
            value={product.expiryDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            sx={{ 
              mt: 2, 
              backgroundColor: 'white', 
              color: '#2196F3',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              },
            }}
          >
            Add Product
          </Button>
        </Box>
      </StyledPaper>
    </Fade>
  );
}
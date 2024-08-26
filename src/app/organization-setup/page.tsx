'use client';
import React, { useState } from 'react';
import { firestore } from '../../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { TextField, Button, Chip } from '@mui/material';

export default function OrganizationSetup() {
  const [orgName, setOrgName] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const addCategory = () => {
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
      setCategory('');
    }
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(firestore, 'organizations'), {
        name: orgName,
        categories: categories,
        // Add more fields as needed
      });
      // Handle successful submission
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };

  return (
    <div>
      <TextField
        label="Organization Name"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
      />
      <TextField
        label="Add Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <Button onClick={addCategory}>Add</Button>
      <div>
        {categories.map((cat) => (
          <Chip key={cat} label={cat} />
        ))}
      </div>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
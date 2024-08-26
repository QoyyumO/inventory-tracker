'use client';

import React, { useState } from 'react';
import { auth, firestore } from '../firebase/config'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 
import { TextField, Button, Box, Tabs, Tab, MenuItem, Select } from '@mui/material';

const passwordValidation = (password: string) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  return regex.test(password);
};

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');  // New state for role
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // Clear any previous error messages

    if (isSignUp && !passwordValidation(password)) {
        setErrorMessage('Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.');
        return;
    }

    try {
        if (isSignUp) {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            // Store user role in Firestore with user ID
            await setDoc(doc(firestore, 'users', user.uid), { role });
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (error) {
        console.error("Authentication error:", error);

        // Check if the error has a 'code' property
        if (typeof error === 'object' && error !== null && 'code' in error) {
            const errorCode = (error as { code?: string }).code; // Type assertion to get the code

            if (errorCode === 'auth/user-not-found') {
                setIsSignUp(true); // Switch to Sign Up tab
                setErrorMessage('User not found. Please sign up.');
            } else {
                // Safely access the message property
                const errorMessage = (error as any).message || 'An error occurred.'; // Use 'any' for simplicity
                setErrorMessage(errorMessage); // Show the error message to the user
            }
        } else {
            setErrorMessage('An unknown error occurred.'); // Fallback for unknown error types
        }
    }
};




  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Tabs value={isSignUp ? 1 : 0} onChange={(_, newValue) => setIsSignUp(!!newValue)} centered>
        <Tab label="Sign In" />
        <Tab label="Sign Up" />
      </Tabs>
      {errorMessage && <Box color="error.main" sx={{ mt: 2 }}>{errorMessage}</Box>} {/* Error message display */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />
        {isSignUp && (
          <Select
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value)}
            displayEmpty
            required
            margin="dense"
          >
            <MenuItem value="" disabled>Select Role</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="finance manager">Finance Manager</MenuItem>
            <MenuItem value="finance staff">Finance Staff</MenuItem>
          </Select>
        )}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>
      </Box>
    </Box>
  );
}

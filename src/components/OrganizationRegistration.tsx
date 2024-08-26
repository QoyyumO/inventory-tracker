'use client';

import React, { useState } from 'react';
import { firestore } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { TextField, Button, Typography, Box, Stepper, Step, StepLabel, Chip } from '@mui/material';

interface OrganizationRegistrationProps {
  userId: string;
  onRegistrationComplete: () => void;
}

interface OrganizationData {
  name: string;
  businessType: string;
  industry: string;
  address: string;
  phoneNumber: string;
  email: string;
  website: string;
  adminName: string;
  adminEmail: string;
  adminPhoneNumber: string;
  userRoles: string[];
}

const initialOrgData: OrganizationData = {
  name: '',
  businessType: '',
  industry: '',
  address: '',
  phoneNumber: '',
  email: '',
  website: '',
  adminName: '',
  adminEmail: '',
  adminPhoneNumber: '',
  userRoles: ['admin', 'manager', 'staff', 'finance manager', 'finance staff']
};

const steps = ['Basic Information', 'Contact Information', 'Administrative Information'];

export default function OrganizationRegistration({ userId, onRegistrationComplete }: OrganizationRegistrationProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [orgData, setOrgData] = useState<OrganizationData>(initialOrgData);
  const [newRole, setNewRole] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setOrgData({ ...orgData, [name as string]: value });
  };

  const addRole = () => {
    if (newRole && !orgData.userRoles.includes(newRole)) {
      setOrgData({ ...orgData, userRoles: [...orgData.userRoles, newRole] });
      setNewRole('');
    }
  };

  const removeRole = (roleToRemove: string) => {
    setOrgData({ ...orgData, userRoles: orgData.userRoles.filter(role => role !== roleToRemove) });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(firestore, 'organizations', userId), orgData);
      onRegistrationComplete();
    } catch (error) {
      console.error("Error registering organization:", error);
      // Handle error (show message to user)
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField fullWidth required name="name" label="Organization Name" value={orgData.name} onChange={handleChange} margin="normal" />
            <TextField fullWidth required name="businessType" label="Business Type" value={orgData.businessType} onChange={handleChange} margin="normal" />
            <TextField fullWidth required name="industry" label="Industry" value={orgData.industry} onChange={handleChange} margin="normal" />
          </>
        );
      case 1:
        return (
          <>
            <TextField fullWidth required name="address" label="Address" value={orgData.address} onChange={handleChange} margin="normal" />
            <TextField fullWidth required name="phoneNumber" label="Phone Number" value={orgData.phoneNumber} onChange={handleChange} margin="normal" />
            <TextField fullWidth required name="email" label="Email Address" type="email" value={orgData.email} onChange={handleChange} margin="normal" />
            <TextField fullWidth name="website" label="Website" value={orgData.website} onChange={handleChange} margin="normal" />
          </>
        );
      case 2:
        return (
          <>
            <TextField fullWidth required name="adminName" label="Admin Name" value={orgData.adminName} onChange={handleChange} margin="normal" />
            <TextField fullWidth required name="adminEmail" label="Admin Email" type="email" value={orgData.adminEmail} onChange={handleChange} margin="normal" />
            <TextField fullWidth required name="adminPhoneNumber" label="Admin Phone Number" value={orgData.adminPhoneNumber} onChange={handleChange} margin="normal" />
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="subtitle1">User Roles</Typography>
              {orgData.userRoles.map((role) => (
                <Chip key={role} label={role} onDelete={() => removeRole(role)} sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                label="Add New Role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button onClick={addRole} variant="outlined">Add</Button>
            </Box>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Register Your Organization</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <form onSubmit={handleSubmit}>
        {renderStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button type="submit" variant="contained">
              Register
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
}

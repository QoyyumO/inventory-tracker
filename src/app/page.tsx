// src/app/page.tsx (or wherever your Home component is located)
'use client';

import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { 
  CircularProgress, 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  Container,
  Box,
  Typography,
  Fade
} from '@mui/material';
import { styled } from '@mui/system';
import Auth from '@/components/Auth';
import OrganizationRegistration from '@/components/OrganizationRegistration';
import InventoryDashboard from '@/components/InventoryDashboard';
import Navbar from '@/components/Navbar';

interface Organization {
  name: string;
  categories: string[];
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const ContentWrapper = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (user) {
        try {
          setOrgLoading(true);
          const docRef = doc(firestore, 'organizations', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setOrganization(docSnap.data() as Organization);
          }
        } catch (error) {
          console.error("Error fetching organization:", error);
        } finally {
          setOrgLoading(false);
        }
      } else {
        setOrgLoading(false);
      }
    };
    fetchOrganization();
  }, [user]);

  const handleLogout = () => {
    auth.signOut();
  };

  const renderContent = () => {
    if (loading || orgLoading) {
      return <CircularProgress />;
    }

    if (error) {
      return <Typography color="error">Error: {error.message}</Typography>;
    }

    if (!user) {
      return <Auth />;
    }

    if (!organization) {
      return (
        <OrganizationRegistration 
          userId={user.uid} 
          onRegistrationComplete={() => setOrgLoading(true)} 
        />
      );
    }

    return (
      <Fade in={true} timeout={1000}>
        <Box sx={{ width: '100%' }}>
          <InventoryDashboard organizationId={user.uid} />
        </Box>
      </Fade>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar user={user} onLogout={handleLogout} />
      <ContentWrapper>
        <Container maxWidth="lg">
          {renderContent()}
        </Container>
      </ContentWrapper>
    </ThemeProvider>
  );
}
'use client';

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';
import { Box } from '@mui/material';
import ThemeRegistry from './ThemeRegistry';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <ThemeRegistry>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar 
          isLoggedIn={isAuthenticated} 
          userRole={user?.role} 
          onLogout={logout} 
        />
        <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </ThemeRegistry>
  );
};

export default ClientLayout;
'use client';

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        isLoggedIn={isAuthenticated} 
        userRole={user?.role} 
        onLogout={logout} 
      />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout; 
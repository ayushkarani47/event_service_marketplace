'use client';

import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  // In a real app, this would be managed with a global state management solution
  // like Context API, Redux, Zustand, etc.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'customer' | 'service_provider' | 'admin' | undefined>(undefined);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(undefined);
    // In a real app, this would include API calls, clearing tokens, etc.
  };

  // For demonstration only - in a real app, this would be handled by actual authentication
  const setLoggedInState = (role: 'customer' | 'service_provider' | 'admin') => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLoggedIn={isLoggedIn} userRole={userRole} onLogout={handleLogout} />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout; 
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface AuthStatus {
  authenticated: boolean;
  cookieToken: {
    valid: boolean;
    data: any;
  } | null;
  headerToken: {
    valid: boolean;
    data: any;
  } | null;
}

const AuthTest: React.FC = () => {
  const { user, isAuthenticated, refreshToken } = useAuth();
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [localToken, setLocalToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setLocalToken(storedToken);
    }
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      // First try to refresh the token
      await refreshToken();
      
      // Get the latest token from localStorage
      const token = localStorage.getItem('token');
      
      // Create headers with Authorization token
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Call the auth check endpoint
      const response = await fetch('/api/auth/check', {
        headers,
        credentials: 'include', // Include cookies in the request
      });
      
      if (!response.ok) {
        throw new Error('Failed to check auth status');
      }
      
      const data = await response.json();
      setAuthStatus(data);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const fixAuth = async () => {
    setLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token found in localStorage');
        return;
      }
      
      // Set token in cookie manually
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
      
      // Refresh auth status
      await checkAuth();
      
      alert('Auth cookie has been set manually');
    } catch (error) {
      console.error('Error fixing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Authentication Test</h2>
      
      <div className="mb-4">
        <p><strong>Auth Context State:</strong></p>
        <p>isAuthenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user ? user.firstName + ' ' + user.lastName : 'Not logged in'}</p>
        <p>Token in localStorage: {localToken ? 'Present' : 'Not found'}</p>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          onClick={checkAuth}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Auth Status'}
        </button>
        
        <button
          onClick={fixAuth}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Fixing...' : 'Fix Auth Cookie'}
        </button>
      </div>
      
      {authStatus && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Auth Check Results:</h3>
          <p>Authenticated: {authStatus.authenticated ? 'Yes' : 'No'}</p>
          
          <div className="mt-2">
            <p><strong>Cookie Token:</strong></p>
            {authStatus.cookieToken ? (
              <>
                <p>Valid: {authStatus.cookieToken.valid ? 'Yes' : 'No'}</p>
                {authStatus.cookieToken.valid && (
                  <pre className="bg-gray-200 p-2 mt-1 text-xs overflow-auto max-h-40">
                    {JSON.stringify(authStatus.cookieToken.data, null, 2)}
                  </pre>
                )}
              </>
            ) : (
              <p>No cookie token found</p>
            )}
          </div>
          
          <div className="mt-2">
            <p><strong>Header Token:</strong></p>
            {authStatus.headerToken ? (
              <>
                <p>Valid: {authStatus.headerToken.valid ? 'Yes' : 'No'}</p>
                {authStatus.headerToken.valid && (
                  <pre className="bg-gray-200 p-2 mt-1 text-xs overflow-auto max-h-40">
                    {JSON.stringify(authStatus.headerToken.data, null, 2)}
                  </pre>
                )}
              </>
            ) : (
              <p>No header token found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthTest;

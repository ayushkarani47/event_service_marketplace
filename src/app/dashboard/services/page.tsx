'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getServicesByProvider, deleteService } from '@/lib/serviceClient';
import { IService } from '@/models/Service';
import Image from 'next/image';

export default function ManageServicesPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && isAuthenticated && user?.role !== 'service_provider') {
      router.push('/');
    } else if (!isLoading && isAuthenticated && user?.role === 'service_provider') {
      fetchServices();
    }
  }, [isLoading, isAuthenticated, user, router, token]);

  const fetchServices = async () => {
    if (!user || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedServices = await getServicesByProvider(user._id, token);
      setServices(fetchedServices);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!token) return;
    
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleteLoading(serviceId);
      await deleteService(serviceId, token);
      setServices(prev => prev.filter(service => service._id !== serviceId));
    } catch (err: any) {
      console.error('Error deleting service:', err);
      alert(err.message || 'Failed to delete service. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  // If not authenticated or not a service provider, don't render the page
  if (!isAuthenticated || user?.role !== 'service_provider') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Your Services</h1>
        <Link 
          href="/dashboard/services/create" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add New Service
        </Link>
      </div>

      <Link 
        href="/dashboard" 
        className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
      >
        ← Back to Dashboard
      </Link>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {services.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500 mb-4">You haven't added any services yet.</p>
          <Link 
            href="/dashboard/services/create" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Your First Service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(service => (
            <div 
              key={service._id} 
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="relative h-48 bg-gray-200">
                {service.images && service.images.length > 0 ? (
                  <Image 
                    src={service.images[0]} 
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-500">{service.category}</span>
                  <span className="font-semibold">${service.price}</span>
                </div>
                <div className="flex space-x-2">
                  <Link 
                    href={`/services/${service._id}`}
                    className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200"
                  >
                    View
                  </Link>
                  <Link 
                    href={`/dashboard/services/edit/${service._id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    disabled={deleteLoading === service._id}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading === service._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
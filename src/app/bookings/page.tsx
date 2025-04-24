'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getBookings, Booking } from '@/lib/bookingClient';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Button, 
  Chip, 
  Grid, 
  Divider, 
  Alert, 
  CircularProgress,
  Paper
} from '@mui/material';

export default function BookingsPage() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<string>('all');

  useEffect(() => {
    // Redirect if not authenticated
    if (isAuthenticated === false) {
      router.push('/login?returnUrl=/bookings');
      return;
    }
    
    const fetchUserBookings = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedBookings = await getBookings(token);
        setBookings(fetchedBookings);
        setFilteredBookings(fetchedBookings);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserBookings();
    }
  }, [token, isAuthenticated, router]);

  useEffect(() => {
    if (tabValue === 'all') {
      setFilteredBookings(bookings);
    } else if (tabValue === 'cancelled/rejected') {
      setFilteredBookings(bookings.filter(booking => 
        booking.status === 'cancelled' || booking.status === 'rejected'
      ));
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === tabValue));
    }
  }, [tabValue, bookings]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading bookings...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="All" value="all" />
          <Tab label="Pending" value="pending" />
          <Tab label="Confirmed" value="confirmed" />
          <Tab label="Completed" value="completed" />
          <Tab label="Cancelled/Rejected" value="cancelled/rejected" />
        </Tabs>
      </Box>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" paragraph>
            No bookings found
          </Typography>
          {tabValue !== 'all' && (
            <Button 
              onClick={() => setTabValue('all')}
              color="primary"
              sx={{ mb: 2 }}
            >
              View all bookings
            </Button>
          )}
          <Box mt={2}>
            <Button
              component={Link}
              href="/services"
              variant="contained"
              color="primary"
            >
              Browse Services
            </Button>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => (
            <Grid item xs={12} key={booking._id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-start' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                      <Box 
                        sx={{ 
                          position: 'relative', 
                          width: 100, 
                          height: 100, 
                          borderRadius: 1, 
                          overflow: 'hidden',
                          bgcolor: 'grey.200',
                          flexShrink: 0
                        }}
                      >
                        {booking.service?.images && booking.service?.images.length > 0 ? (
                          <Image
                            src={booking.service?.images[0]}
                            alt={booking.service?.title || 'Service image'}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                            <Typography variant="caption">No image</Typography>
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Typography variant="h6" component="h2">
                          {booking.service?.title || 'Service unavailable'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Booked for: {formatDate(booking.startDate)}
                        </Typography>
                        {booking.endDate && booking.startDate !== booking.endDate && (
                          <Typography variant="body2" color="text.secondary">
                            To: {formatDate(booking.endDate)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: { xs: 'flex-start', sm: 'flex-end' },
                      mt: { xs: 2, sm: 0 },
                      minWidth: { sm: 120 }
                    }}>
                      <Chip 
                        label={getStatusText(booking.status)} 
                        color={getStatusColor(booking.status) as "success" | "info" | "warning" | "error" | "default"}
                        size="small"
                      />
                      <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'medium' }}>
                        ${booking.totalPrice}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    component={Link}
                    href={`/bookings/${booking._id}`}
                    variant="outlined"
                    size="small"
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
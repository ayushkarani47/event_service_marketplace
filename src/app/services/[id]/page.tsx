'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import BookingForm from '@/components/bookings/BookingForm';
import Link from 'next/link';
import { getServiceById } from '@/lib/serviceClient';
import { useAuth } from '@/context/AuthContext';
import ReviewList from '@/components/ReviewList';
import RatingDisplay from '@/components/RatingDisplay';
import ChatButton from '@/components/chat/ChatButton';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Button, 
  Chip, 
  Divider, 
  Card, 
  CardContent, 
  Avatar, 
  Breadcrumbs, 
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  LocationOn as LocationIcon, 
  CheckCircle as CheckCircleIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';

interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'starting_at';
  images: string[];
  location: string;
  rating: number;
  reviewCount: number;
  features?: string[];
  availability?: {
    startDate: string;
    endDate: string;
  };
  provider: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    bio?: string;
    location?: string;
  };
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
  customer: {
    _id: string;
    name: string;
    profileImage?: string;
  };
}

const ServiceDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user, isAuthenticated } = useAuth();
  
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          throw new Error('Service ID is missing');
        }
        
        const fetchedService = await getServiceById(id.toString());
        setService(fetchedService);
        if (fetchedService.images && fetchedService.images.length > 0) {
          setSelectedImage(fetchedService.images[0]);
        }
      } catch (err: any) {
        console.error('Error fetching service:', err);
        setError(err.message || 'Failed to load service details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      // Redirect to login page with a return URL
      router.push(`/login?returnUrl=/services/${id}`);
      return;
    }
    
    // Show the booking form
    setShowBookingForm(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 200px)',
          textAlign: 'center',
          py: 8
        }}>
          <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 'medium' }}>Loading service details...</Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we fetch the latest information
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !service) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 2, 
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
            maxWidth: 600,
            mx: 'auto',
            my: 8
          }}
        >
          <Typography variant="h4" color="error" gutterBottom fontWeight="bold">
            Oops! Something went wrong
          </Typography>
          
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              mt: 2,
              '& .MuiAlert-message': {
                fontSize: '1rem'
              }
            }}
          >
            {error || 'Service not found. The requested service may have been removed or is temporarily unavailable.'}
          </Alert>
          
          <Button 
            component={Link} 
            href="/services" 
            color="primary"
            variant="contained"
            size="large"
            sx={{ 
              mt: 2,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold'
            }}
          >
            Browse All Services
          </Button>
        </Paper>
      </Container>
    );
  }

  const getPriceText = () => {
    switch (service.priceType) {
      case 'hourly':
        return `₹${service.price}/hr`;
      case 'starting_at':
        return `Starting at ₹${service.price}`;
      default:
        return `₹${service.price}`;
    }
  };

  const getProviderName = () => {
    if (!service.provider) return 'Provider';
    if (service.provider.firstName && service.provider.lastName) {
      return `${service.provider.firstName} ${service.provider.lastName}`;
    }
    if (service.provider.firstName) return service.provider.firstName;
    if (service.provider.lastName) return service.provider.lastName;
    return 'Provider';
  };

  const getProviderInitial = () => {
    if (!service.provider) return '?';
    if (service.provider.firstName) return service.provider.firstName.charAt(0);
    if (service.provider.lastName) return service.provider.lastName.charAt(0);
    return '?';
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Enhanced Breadcrumbs */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4, 
          p: 2, 
          borderRadius: 2, 
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Breadcrumbs 
          separator="›" 
          aria-label="breadcrumb"
          sx={{ 
            '& .MuiBreadcrumbs-separator': {
              mx: 1.5,
              color: 'primary.main',
              fontWeight: 'bold'
            }
          }}
        >
          <Link 
            href="/" 
            style={{ 
              color: 'text.secondary', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: 'action.hover'
              }}
            >
              <Typography variant="caption" fontWeight="bold">H</Typography>
            </Box>
            Home
          </Link>
          <Link 
            href="/services" 
            style={{ 
              color: 'text.secondary', 
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            Services
          </Link>
          <Typography color="primary.main" fontWeight="bold">
            {service.title}
          </Typography>
        </Breadcrumbs>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 5 } }}>
        {/* Left column - Images and Details */}
        <Box sx={{ flex: '1 1 auto', width: { xs: '100%', md: '66%' } }}>
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
            {/* Main image with improved layout - responsive for mobile */}
            <Box sx={{ 
              position: 'relative', 
              height: { xs: 300, sm: 400, md: 500 }, 
              bgcolor: 'grey.100', 
              borderRadius: '8px 8px 0 0', 
              overflow: 'hidden',
              width: '100%'
            }}>
              {selectedImage ? (
                <>
                  <Image
                    src={selectedImage}
                    alt={service.title}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 960px) 75vw, 1200px"
                    style={{ objectFit: 'contain', objectPosition: 'center' }}
                    priority
                  />
                  {service.images && service.images.length > 1 && (
                    <Box sx={{ 
                      position: 'absolute', 
                      bottom: 16, 
                      right: 16, 
                      bgcolor: 'rgba(0,0,0,0.6)', 
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 4,
                      fontSize: '0.875rem',
                      fontWeight: 'medium'
                    }}>
                      {service.images.indexOf(selectedImage) + 1}/{service.images.length}
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <Typography color="text.secondary">No image available</Typography>
                </Box>
              )}
            </Box>

            {/* Improved thumbnail gallery - responsive for mobile */}
            {service.images && service.images.length > 1 && (
              <Box sx={{ 
                p: { xs: 1, sm: 2 }, 
                display: 'flex', 
                gap: { xs: 1, sm: 1.5 }, 
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '6px',
                },
                pb: { xs: 2, sm: 3 }
              }}>
                {service.images.map((image: string, index: number) => (
                  <Box
                    key={index}
                    component="button"
                    onClick={() => setSelectedImage(image)}
                    sx={{
                      position: 'relative',
                      width: { xs: 70, sm: 90, md: 100 },
                      height: { xs: 50, sm: 65, md: 75 },
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                      outline: selectedImage === image ? '3px solid' : '1px solid',
                      outlineColor: selectedImage === image ? 'primary.main' : 'grey.300',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${service.title} - image ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          {/* Service details with improved layout */}
          <Paper elevation={3} sx={{ borderRadius: 2, p: { xs: 2, sm: 4 }, boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 3 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight="bold" 
                sx={{ 
                  mr: 2, 
                  mb: { xs: 1, sm: 0 },
                  fontSize: { xs: '1.75rem', md: '2.25rem' },
                  lineHeight: 1.2
                }}
              >
                {service.title}
              </Typography>
              <RatingDisplay rating={service.rating} reviewCount={service.reviewCount} size="lg" />
            </Box>

            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              mb: 4, 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 2,
              alignItems: 'center'
            }}>
              <Chip 
                label={service.category} 
                color="primary" 
                sx={{ 
                  mr: 1, 
                  textTransform: 'capitalize',
                  fontWeight: 'medium',
                  px: 1
                }} 
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                <Typography variant="body2" fontWeight="medium">
                  {service.location}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 5 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  position: 'relative',
                  pl: 2,
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    bgcolor: 'primary.main',
                    borderRadius: '4px'
                  }
                }}
              >
                Description
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-line',
                  lineHeight: 1.7,
                  color: 'text.primary',
                  fontSize: '1rem'
                }}
              >
                {service.description}
              </Typography>
            </Box>

            {service.features && service.features.length > 0 && (
              <Box sx={{ mb: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    position: 'relative',
                    pl: 2,
                    mb: 3,
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      bgcolor: 'primary.main',
                      borderRadius: '4px'
                    }
                  }}
                >
                  Features
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                  {service.features.map((feature: string, index: number) => (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1.5 }} />
                      <Typography variant="body2" fontWeight="medium">{feature}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {service.availability && (
              <Box sx={{ 
                mb: 5, 
                p: 3, 
                bgcolor: 'primary.light', 
                borderRadius: 2,
                color: 'primary.contrastText',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2
              }}>
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Availability
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon fontSize="small" sx={{ mr: 1.5 }} />
                    <Typography variant="body1" fontWeight="medium">
                      {typeof service.availability === 'object' && service.availability.startDate && service.availability.endDate ? 
                        `Available from ${new Date(service.availability.startDate).toLocaleDateString()} to ${new Date(service.availability.endDate).toLocaleDateString()}` : 
                        String(service.availability)
                      }
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={handleBookNow}
                  sx={{ 
                    fontWeight: 'bold',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    whiteSpace: 'nowrap',
                    boxShadow: 3
                  }}
                >
                  Check Availability
                </Button>
              </Box>
            )}
            
            {/* Reviews Section */}
            <Box sx={{ mt: 4 }}>
              <ReviewList serviceId={service._id} />
            </Box>
          </Paper>
        </Box>

        {/* Right column - Booking and Provider Info */}
        <Box sx={{ width: { xs: '100%', md: '34%' }, position: 'relative' }}>
            {/* Booking Section */}
            {showBookingForm ? (
              <BookingForm 
                serviceId={service._id}
                serviceName={service.title}
                price={service.price}
                priceType={service.priceType}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  mb: 4
                }}
              >
                <Card 
                  elevation={4} 
                  sx={{ 
                    mb: 4, 
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                  }}
              >
                <Box sx={{ bgcolor: 'primary.main', py: 2, px: 3, color: 'white' }}>
                  <Typography variant="h5" fontWeight="bold">Booking Details</Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="h6">Price</Typography>
                    <Typography 
                      variant="h4" 
                      color="primary" 
                      fontWeight="bold"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 0.5
                      }}
                    >
                      {getPriceText()}
                      {service.priceType !== 'fixed' && (
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ fontWeight: 'normal', fontSize: '0.875rem' }}>
                          {service.priceType === 'hourly' ? '/hour' : ''}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    bgcolor: 'background.paper', 
                    p: 2, 
                    borderRadius: 2, 
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="body2" fontWeight="medium">
                      {service.priceType === 'hourly' 
                        ? 'Hourly rate - you only pay for the time you need' 
                        : service.priceType === 'starting_at' 
                          ? 'Starting price - final cost depends on your specific requirements' 
                          : 'Fixed price - all inclusive package'}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    onClick={handleBookNow}
                    sx={{ 
                      mb: 2, 
                      py: 1.5,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      borderRadius: 2,
                      boxShadow: 2
                    }}
                  >
                    Book Now
                  </Button>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    align="center" 
                    display="block"
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      mt: 2
                    }}
                  >
                    <CheckCircleIcon fontSize="small" color="success" />
                    No payment required until service is confirmed
                  </Typography>
                </CardContent>
                </Card>
              </Box>
            )}

          {/* Provider Info Card - Improved layout */}
          {service.provider && (
            <Card 
              elevation={4} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                mt: 4
              }}
            >
              <Box sx={{ bgcolor: 'grey.100', p: 3, position: 'relative' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 'bold',
                    position: 'relative',
                    pl: 2,
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      bgcolor: 'secondary.main',
                      borderRadius: '4px'
                    }
                  }}
                >
                  About the Provider
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center', 
                  gap: 2,
                  mb: 3,
                  textAlign: { xs: 'center', sm: 'left' }
                }}>
                  <Avatar 
                    src={service.provider.profilePicture} 
                    alt={getProviderName()}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      border: '3px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    {getProviderInitial()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {getProviderName()}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        display: 'inline-block',
                        bgcolor: 'primary.main', 
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 10,
                        fontWeight: 'medium'
                      }}
                    >
                      Service Provider
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <CardContent sx={{ p: 3 }}>
                {service.provider.bio && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 3,
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      fontStyle: 'italic',
                      lineHeight: 1.6
                    }}
                  >
                    "{service.provider.bio}"
                  </Typography>
                )}
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  gap: 2,
                  mt: 2
                }}>
                  <Button
                    component={Link}
                    href={`/providers/${service.provider._id}`}
                    color="primary"
                    variant="outlined"
                    fullWidth
                    sx={{ 
                      py: 1.2,
                      borderRadius: 2,
                      fontWeight: 'medium'
                    }}
                  >
                    View Profile
                  </Button>
                  <ChatButton 
                    receiverId={service.provider._id}
                    receiverName={getProviderName()}
                    receiverImage={service.provider.profilePicture}
                    serviceId={service._id}
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ServiceDetailsPage;
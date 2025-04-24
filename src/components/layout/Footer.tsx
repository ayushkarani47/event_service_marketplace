'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  useTheme
} from '@mui/material';
import { 
  Twitter as TwitterIcon, 
  Facebook as FacebookIcon, 
  Instagram as InstagramIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white', pt: 6, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
              EventHub
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'grey.400', mb: 3 }}>
              Your one-stop marketplace for event services. Find and book professionals for your next event.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton
                component="a"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
                aria-label="Twitter"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
                aria-label="Facebook"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
                aria-label="Instagram"
              >
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
              Quick Links
            </Typography>
            <List disablePadding>
              <ListItem component={Link} href="/" sx={{ color: 'grey.400', '&:hover': { color: 'white' }, py: 0.5, textDecoration: 'none' }}>
                <ListItemText primary="Home" />
              </ListItem>
              <ListItem component={Link} href="/services" sx={{ color: 'grey.400', '&:hover': { color: 'white' }, py: 0.5, textDecoration: 'none' }}>
                <ListItemText primary="Services" />
              </ListItem>
              <ListItem component={Link} href="/about" sx={{ color: 'grey.400', '&:hover': { color: 'white' }, py: 0.5, textDecoration: 'none' }}>
                <ListItemText primary="About Us" />
              </ListItem>
              <ListItem component={Link} href="/contact" sx={{ color: 'grey.400', '&:hover': { color: 'white' }, py: 0.5, textDecoration: 'none' }}>
                <ListItemText primary="Contact" />
              </ListItem>
            </List>
          </Grid>

          {/* Service Categories */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
              Categories
            </Typography>
            <List disablePadding>
              <ListItem component={Link} href="/services?category=photography" sx={{ color: 'grey.400', '&:hover': { color: 'white' }, py: 0.5, textDecoration: 'none' }}>
                <ListItemText primary="Photography" />
              </ListItem>
              <ListItem component={Link} href="/services?category=catering" sx={{ color: 'grey.400', '&:hover': { color: 'white' }, py: 0.5, textDecoration: 'none' }}>
                <ListItemText primary="Catering" />
              </ListItem>
              <ListItem component={Link} href="/services?category=venue" sx={{ color: 'grey.400', '&:hover': { color: 'white' }, py: 0.5, textDecoration: 'none' }}>
                <ListItemText primary="Venue" />
              </ListItem>
              <ListItem component={Link} href="/services?category=entertainment" sx={{ color: 'grey.400', '&:hover': { color: 'white' }, py: 0.5, textDecoration: 'none' }}>
                <ListItemText primary="Entertainment" />
              </ListItem>
              <ListItem component={Link} href="/services?category=decor" sx={{ color: 'grey.400', '&:hover': { color: 'white' }, py: 0.5, textDecoration: 'none' }}>
                <ListItemText primary="Decoration" />
              </ListItem>
            </List>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
              Contact Us
            </Typography>
            <List disablePadding>
              <ListItem sx={{ color: 'grey.400', py: 0.5 }}>
                <LocationIcon sx={{ mr: 1 }} fontSize="small" />
                <Typography variant="body2">123 Event Street, City, Country</Typography>
              </ListItem>
              <ListItem sx={{ color: 'grey.400', py: 0.5 }}>
                <EmailIcon sx={{ mr: 1 }} fontSize="small" />
                <Typography variant="body2">contact@eventhub.com</Typography>
              </ListItem>
              <ListItem sx={{ color: 'grey.400', py: 0.5 }}>
                <PhoneIcon sx={{ mr: 1 }} fontSize="small" />
                <Typography variant="body2">+1 (555) 123-4567</Typography>
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'grey.800', my: 4 }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', md: 'center' } }}>
          <Typography variant="body2" color="text.secondary" sx={{ color: 'grey.400' }}>
            {currentYear} EventHub. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: { xs: 2, md: 0 } }}>
            <Typography 
              component={Link} 
              href="/terms" 
              variant="body2" 
              sx={{ color: 'grey.400', '&:hover': { color: 'white' }, textDecoration: 'none' }}
            >
              Terms of Service
            </Typography>
            <Typography 
              component={Link} 
              href="/privacy" 
              variant="body2" 
              sx={{ color: 'grey.400', '&:hover': { color: 'white' }, textDecoration: 'none' }}
            >
              Privacy Policy
            </Typography>
            <Typography 
              component={Link} 
              href="/faq" 
              variant="body2" 
              sx={{ color: 'grey.400', '&:hover': { color: 'white' }, textDecoration: 'none' }}
            >
              FAQ
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
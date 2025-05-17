import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItemButton,
  ListItemText,
  Box, 
  Container, 
  Menu, 
  MenuItem, 
  Avatar, 
  Divider, 
  useScrollTrigger, 
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Close as CloseIcon, 
  AccountCircle, 
  Chat as ChatIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import SearchBar from '../search/SearchBar';

interface NavbarProps {
  isLoggedIn: boolean;
  userRole?: 'customer' | 'service_provider' | 'admin';
  onLogout: () => void;
}

function HideOnScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, userRole, onLogout }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <>
      <HideOnScroll>
        <AppBar 
          position="fixed" 
          color="default" 
          elevation={1} 
          sx={{ 
            backgroundColor: 'white',
            height: { xs: 'auto', md: '70px' } 
          }}
        >
          <Container maxWidth="lg">
            <Toolbar 
              disableGutters 
              sx={{ 
                height: { xs: 'auto', md: '70px' },
                py: { xs: 1, md: 1.5 } 
              }}
            >
             
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: { xs: 1, md: 0 } }}>
                {/* Logo */}
                <Typography
                  variant="h6"
                  component={Link}
                  href="/"
                  sx={{
                    display: 'flex',
                    fontWeight: 700,
                    color: 'primary.main',
                    textDecoration: 'none',
                    mr: { xs: 1, md: 3 }
                  }}
                >
                  Utsav
                </Typography>
                
                {/* Search bar - visible on all devices */}
                <Box 
                  sx={{ 
                    display: 'flex',
                    width: { xs: '200px', sm: '200px', md: '300px' }
                  }}  
                >
                  <SearchBar />
                </Box>
              </Box>
             

            
{/* Desktop Navigation */}
<Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 2 }}>
  <Button component={Link} href="/" color="inherit" sx={{ mx: 0.5 }}>
    Home
  </Button>
  <Button component={Link} href="/services" color="inherit" sx={{ mx: 0.5 }}>
    Services
  </Button>
  {isLoggedIn && userRole === 'service_provider' && (
    <Button component={Link} href="/dashboard" color="inherit" sx={{ mx: 0.5 }}>
      Dashboard
    </Button>
  )}
  <Button component={Link} href="/about" color="inherit" sx={{ mx: 0.5 }}>
    About
  </Button>
  <Button component={Link} href="/contact" color="inherit" sx={{ mx: 0.5 }}>
    Contact
  </Button>
  {isLoggedIn && (
    <Button 
      component={Link} 
      href="/chats" 
      color="inherit" 
      sx={{ mx: 0.5 }}
      startIcon={<ChatIcon />}
    >
      Chats
    </Button>
  )}
</Box>

{/* Spacer to push auth to the right */}
<Box sx={{ flexGrow: 1 }} />

{/* User Authentication */}
<Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
  {isLoggedIn ? (
    <>
      <IconButton
        onClick={handleMenu}
        size="large"
        edge="end"
        color="inherit"
        aria-label="account"
        aria-controls="menu-appbar"
        aria-haspopup="true"
      >
        <AccountCircle />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={handleClose}
      >
        <MenuItem component={Link} href="/profile" onClick={handleClose}>
          Profile
        </MenuItem>
        <MenuItem component={Link} href="/bookings" onClick={handleClose}>
          My Bookings
        </MenuItem>
        {userRole === 'service_provider' && (
          <MenuItem component={Link} href="/services/manage" onClick={handleClose}>
            Manage Services
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  ) : (
    <Box sx={{ display: 'flex' }}>
      <Button component={Link} href="/login" color="inherit" sx={{ mr: 1 }}>
        Login
      </Button>
      <Button
        component={Link}
        href="/register"
        variant="contained"
        color="primary"
      >
        Register
      </Button>
    </Box>
  )}
</Box>

{/* Mobile menu button */}
<IconButton
  color="inherit"
  aria-label="open drawer"
  edge="end"
  onClick={handleDrawerToggle}
  sx={{ display: { md: 'none' } }}
>
  {drawerOpen ? <CloseIcon /> : <MenuIcon />}
</IconButton>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>
      <Toolbar sx={{ height: { xs: 'auto', md: '70px' } }} /> {/* Empty toolbar to push content below the fixed AppBar */}

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
          {/* Mobile Search removed as it's now always visible in the header */}
          
          <List>
            <ListItemButton component={Link} href="/" onClick={handleDrawerToggle}>
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton component={Link} href="/services" onClick={handleDrawerToggle}>
              <ListItemText primary="Services" />
            </ListItemButton>
            {isLoggedIn && userRole === 'service_provider' && (
              <ListItemButton component={Link} href="/dashboard" onClick={handleDrawerToggle}>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            )}
            <ListItemButton component={Link} href="/about" onClick={handleDrawerToggle}>
              <ListItemText primary="About" />
            </ListItemButton>
            <ListItemButton component={Link} href="/contact" onClick={handleDrawerToggle}>
              <ListItemText primary="Contact" />
            </ListItemButton>
            {isLoggedIn && (
              <ListItemButton component={Link} href="/chats" onClick={handleDrawerToggle}>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ChatIcon fontSize="small" sx={{ mr: 1 }} />
                      Chats
                    </Box>
                  } 
                />
              </ListItemButton>
            )}
          </List>
          <Divider sx={{ my: 2 }} />
          {isLoggedIn ? (
            <List>
              <ListItemButton component={Link} href="/profile" onClick={handleDrawerToggle}>
                <ListItemText primary="Profile" />
              </ListItemButton>
              <ListItemButton component={Link} href="/bookings" onClick={handleDrawerToggle}>
                <ListItemText primary="My Bookings" />
              </ListItemButton>
              {userRole === 'service_provider' && (
                <ListItemButton component={Link} href="/services/manage" onClick={handleDrawerToggle}>
                  <ListItemText primary="Manage Services" />
                </ListItemButton>
              )}
              <ListItemButton onClick={() => { handleDrawerToggle(); onLogout(); }}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </List>
          ) : (
            <Box sx={{ mt: 'auto', p: 2 }}>
              <Button
                component={Link}
                href="/login"
                fullWidth
                variant="outlined"
                color="primary"
                sx={{ mb: 1 }}
                onClick={handleDrawerToggle}
              >
                Login
              </Button>
              <Button
                component={Link}
                href="/register"
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleDrawerToggle}
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
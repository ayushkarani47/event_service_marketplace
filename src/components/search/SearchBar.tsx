import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemText, 
  ListItemIcon, 
  Paper, 
  Typography,
  Divider,
  CircularProgress,
  ClickAwayListener
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Category as CategoryIcon,
  LocalOffer as ServiceIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

interface Suggestion {
  id: string;
  text: string;
  type: 'service' | 'category';
  category?: string;
  location?: string;
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);
  
  const handleSearch = (searchQuery: string) => {
    
    if (searchQuery.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };
  
  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'category') {
      router.push(`/services?category=${encodeURIComponent(suggestion.category || '')}`);
    } else {
      router.push(`/services/${suggestion.id}`);
    }
    setShowSuggestions(false);
  };
  
  const handleClickAway = () => {
    setShowSuggestions(false);
  };
  
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box 
        ref={searchRef}
        sx={{ 
          position: 'relative',
          width: '100%',
          maxWidth: { xs: '100%', sm: 500 },
          mx: 'auto'
        }}
      >
        <TextField
          inputRef={inputRef}
          fullWidth
          placeholder="Search for services, categories..."
          variant="outlined"
          size="medium"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              bgcolor: 'background.paper',
              '&:hover': {
                boxShadow: '0 1px 6px rgba(32,33,36,0.28)'
              },
              '&.Mui-focused': {
                boxShadow: '0 1px 6px rgba(32,33,36,0.28)'
              }
            }
          }}
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              width: '100%',
              mt: 0.5,
              zIndex: 1300,
              maxHeight: 400,
              overflow: 'auto',
              borderRadius: 2
            }}
          >
            <List disablePadding>
              {suggestions.map((suggestion, index) => (
                <React.Fragment key={`${suggestion.type}-${suggestion.id}`}>
                  <ListItemButton 
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      py: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {suggestion.type === 'category' ? (
                        <CategoryIcon color="primary" />
                      ) : (
                        <ServiceIcon color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={suggestion.text}
                      secondary={
                        suggestion.type === 'service' ? 
                          `${suggestion.category}${suggestion.location ? ` • ${suggestion.location}` : ''}` : 
                          undefined
                      }
                      secondaryTypographyProps={{
                        component: 'span',
                        variant: 'caption'
                      }}
                    />
                    {suggestion.type === 'service' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: -4, mr: 1 }}>
                        <CategoryIcon color="action" sx={{ fontSize: 14, mr: 0.5, opacity: 0.7 }} />
                      </Box>
                    )}
                  </ListItemButton>
                  {index < suggestions.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;

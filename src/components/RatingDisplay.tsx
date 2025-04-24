'use client';

import React from 'react';
import { Box, Typography, Rating } from '@mui/material';

interface RatingDisplayProps {
  rating: number;
  reviewCount: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export default function RatingDisplay({ 
  rating, 
  reviewCount, 
  size = 'md',
  showCount = true 
}: RatingDisplayProps) {
  // Determine star size based on the size prop
  const starSize = {
    sm: 'small',
    md: 'medium',
    lg: 'large'
  }[size] as 'small' | 'medium' | 'large';
  
  // Determine text size based on the size prop
  const textSize = {
    sm: 12,
    md: 14,
    lg: 16
  }[size];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Rating 
        value={rating} 
        precision={0.5} 
        readOnly 
        size={starSize}
      />
      
      {showCount && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ ml: 1, fontSize: textSize }}
        >
          {rating > 0 ? `${rating.toFixed(1)} (${reviewCount})` : 'No ratings'}
        </Typography>
      )}
    </Box>
  );
}

'use client';

import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

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
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }[size];
  
  // Determine text size based on the size prop
  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  // Round the rating to the nearest 0.5
  const roundedRating = Math.round(rating * 2) / 2;
  
  return (
    <div className="flex items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          // For half stars
          if (star === Math.ceil(roundedRating) && roundedRating % 1 !== 0) {
            return (
              <div key={star} className="relative">
                <StarIconOutline className={`${starSize} text-gray-300`} />
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <StarIcon className={`${starSize} text-yellow-400`} />
                </div>
              </div>
            );
          }
          
          return (
            <StarIcon
              key={star}
              className={`${starSize} ${
                star <= roundedRating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            />
          );
        })}
      </div>
      
      {showCount && (
        <span className={`ml-1 ${textSize} text-gray-600`}>
          {rating > 0 ? `${rating.toFixed(1)} (${reviewCount})` : 'No ratings'}
        </span>
      )}
    </div>
  );
}

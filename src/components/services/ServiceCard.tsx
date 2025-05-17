import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/20/solid';

interface ServiceCardProps {
  id: string;
  title: string;
  category: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'starting_at';
  location: string;
  rating: number;
  reviewCount: number;
  providerName: string;
  providerImage?: string;
  image?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  category,
  price,
  priceType,
  location,
  rating,
  reviewCount,
  providerName,
  providerImage,
  image
}) => {
  const getPriceText = () => {
    switch (priceType) {
      case 'hourly':
        return `₹${price}/hr`;
      case 'starting_at':
        return `Starting at ₹${price}`;
      default:
        return `₹${price}`;
    }
  };

  const categoryDisplayName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 w-full">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="bg-gray-200 h-full w-full flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          {categoryDisplayName}
        </div>
      </div>
      
      <div className="p-4">
        <Link href={`/services/${id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate">{title}</h3>
        </Link>
        
        <p className="text-gray-500 text-sm mt-1">{location}</p>
        
        <div className="flex items-center mt-2">
          <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((star) => (
              <StarIcon
                key={star}
                className={`h-4 w-4 ${
                  star < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 ml-1">({reviewCount})</p>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center">
            <div className="relative h-8 w-8 rounded-full overflow-hidden">
              {providerImage ? (
                <Image
                  src={providerImage}
                  alt={providerName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="bg-gray-300 h-full w-full flex items-center justify-center text-xs">
                  {providerName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-700 ml-2">{providerName}</span>
          </div>
          
          <div className="text-blue-600 font-bold">
            {getPriceText()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard; 
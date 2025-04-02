'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const services = [
  {
    id: 'photography',
    name: 'Photography',
    description: 'Capture your special moments with professional photographers',
    icon: '/icons/camera.svg',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1Y6UI3bLgJVstrm7JHp0SLKXpLEw4SqQXcA&s'
  },
  {
    id: 'venue',
    name: 'Venues',
    description: 'Discover perfect locations for your events',
    icon: '/icons/venue.svg',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed'
  },
  {
    id: 'dj',
    name: 'DJs & Music',
    description: 'Set the mood with professional DJs and musicians',
    icon: '/icons/music.svg',
    image: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae'
  },
  {
    id: 'catering',
    name: 'Catering',
    description: 'Delight your guests with exceptional food and drinks',
    icon: '/icons/food.svg',
    image: 'https://images.unsplash.com/photo-1530062845289-9109b2c9c868'
  },
  {
    id: 'decoration',
    name: 'Decoration',
    description: 'Transform your space with stunning decorations',
    icon: '/icons/decoration.svg',
    image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329'
  },
  {
    id: 'makeup',
    name: 'Makeup & Styling',
    description: 'Look your best with professional makeup artists',
    icon: '/icons/makeup.svg',
    image: 'https://media.istockphoto.com/id/687244776/photo/makeup-artist-applying-eyeshadow-on-a-girl.jpg?s=612x612&w=0&k=20&c=QkFL3oe-poYi4p1ZaboIOVie_ycRz0fTJG9Ex5LpNoQ='
  }
];

const testimonials = [
  {
    id: 1,
    quote: "EventHub made finding and booking a photographer for our wedding so easy! We got exactly what we wanted without the stress.",
    author: "Sarah & Michael",
    role: "Newlyweds",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 2,
    quote: "As a DJ, this platform has connected me with so many new clients. The booking process is seamless for everyone involved.",
    author: "James Wilson",
    role: "Professional DJ",
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 3,
    quote: "I organized a corporate event and found all the vendors I needed in one place. Saved me hours of research and phone calls!",
    author: "Emma Thompson",
    role: "Event Manager",
    image: "https://randomuser.me/api/portraits/women/67.jpg"
  }
];

export default function HomePage() {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchTerm = formData.get('searchTerm');
    
    router.push(`/services?search=${searchTerm}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section className="relative bg-blue-700 py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 opacity-90"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center md:text-left md:w-2/3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Find the Perfect Professionals for Your Event
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Connect with trusted service providers to make your next event extraordinary
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                href="/services" 
                className="px-8 py-4 bg-white text-blue-700 rounded-md font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Explore Services
              </Link>
              <Link 
                href="/register" 
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-md font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Popular Service Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Link 
                key={index} 
                href={`/services?category=${service.id}`}
                className="bg-white rounded-lg shadow-md transition-transform hover:scale-105 overflow-hidden"
              >
                <div className="h-48 bg-blue-100 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600">{service.description}</span>
                  <ArrowRightIcon className="h-5 w-5 text-blue-600" />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link 
              href="/services" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            >
              View All Categories
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">How EventHub Works</h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            We've simplified the process of finding and booking event professionals
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Services</h2>
            <Link href="/services" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
              View All
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-blue-200"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <div className="flex items-center bg-blue-100 px-2 py-1 rounded text-blue-800 text-sm">
                      <span className="mr-1">★</span>
                      {service.description}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">${service.description}</span>
                    <Link 
                      href={`/services/${service.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-blue-800 p-6 rounded-lg">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="italic mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-200 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-blue-300 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-2xl overflow-hidden">
            <div className="px-6 py-12 md:p-12 md:flex md:items-center md:justify-between">
              <div className="md:w-2/3 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold text-white mb-2">Ready to create your memorable event?</h2>
                <p className="text-gray-300 text-lg">
                  Find and book top-rated professionals for your next event today.
                </p>
              </div>
              <div>
                <Link 
                  href="/services" 
                  className="inline-block px-8 py-4 bg-blue-600 text-white rounded-md font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

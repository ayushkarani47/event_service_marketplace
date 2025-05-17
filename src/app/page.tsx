'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const categories = [
  {
    name: 'Photography',
    slug: 'photography',
    icon: '/icons/camera.svg',
    image: 'data:image/jpeg;base64,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',
    description: 'Capture memories that last a lifetime'
  },
  {
    name: 'Catering',
    slug: 'catering',
    icon: '/icons/food.svg',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600',
    description: 'Delicious food for any occasion'
  },
  {
    name: 'Venues',
    slug: 'venue',
    icon: '/icons/venue.svg',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600',
    description: 'Find the perfect space for your event'
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    icon: '/icons/music.svg',
    image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600',
    description: 'Make your event memorable with great entertainment'
  },
  {
    name: 'Decoration',
    slug: 'decor',
    icon: '/icons/decoration.svg',
    image: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600',
    description: 'Transform any space into something special'
  },
  {
    name: 'Planning',
    slug: 'planning',
    icon: '/icons/planning.svg',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
    description: 'Expert coordination for flawless events'
  },
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get('search') as string;
    
    if (searchTerm.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <main className="-mt-20"> {/* Negative margin to offset the padding added in ClientLayout */}
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-20">
          <Image 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920" 
            alt="Event background" 
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Hero content */}
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="block">Create Unforgettable</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Events</span>
                <span className="block">with Top Professionals</span>
              </h1>
              
              <p className="text-xl mb-8 text-indigo-100 max-w-xl">
                Discover and book the perfect services to make your special occasions truly memorable.
              </p>
              
              {/* Search form with enhanced styling */}
              <form onSubmit={handleSearch} className="max-w-md mx-auto md:mx-0 flex flex-col sm:flex-row gap-3 sm:gap-0">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="search"
                    placeholder="What service are you looking for?"
                    className="w-full pl-12 pr-4 py-4 rounded-lg sm:rounded-r-none text-gray-800 bg-white/95 border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg sm:rounded-l-none font-medium transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Search
                </button>
              </form>
              
              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex items-center">
                  <div className="bg-white/10 p-2 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Verified Providers</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/10 p-2 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/10 p-2 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Secure Payments</span>
                </div>
              </div>
            </div>
            
            {/* Hero image */}
            <div className="md:w-1/2 relative">
              <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.02] duration-300">
                <Image 
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800" 
                  alt="Beautiful event setup" 
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm mb-1">Featured Event</p>
                      <h3 className="text-white text-xl font-bold">Luxury Wedding Venue</h3>
                    </div>
                    <Link 
                      href="/services?category=venue" 
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-sm px-4 py-2 rounded-full transition-colors"
                    >
                      Explore
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-600 rounded-full blur-md opacity-50"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-600 rounded-full blur-md opacity-50"></div>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Modern Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-3">Discover Services</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Browse Our <span className="text-indigo-600">Premium Categories</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl">
                From elegant venues to professional photographers, find everything you need for your perfect event
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 group"
            >
              <span>View All Services</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link 
                key={category.slug}
                href={`/services?category=${category.slug}`}
                className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-60 transition-opacity"></div>
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white text-sm font-medium">{category.name}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{category.name}</h3>
                  <p className="text-gray-600 mb-4 flex-grow">{category.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-medium text-indigo-600">View Services</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Modern How It Works Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-50 rounded-full opacity-70"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-50 rounded-full opacity-70"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-3">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              How <span className="text-indigo-600">EventHub</span> Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to find and book the perfect services for your special event
            </p>
          </div>
          
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {/* Step 1 */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-md">
                  <span className="text-white text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-center text-gray-900">Browse Services</h3>
                <p className="text-gray-600 text-center">
                  Explore our curated collection of professional event services across multiple categories
                </p>
                <div className="mt-6 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-md">
                  <span className="text-white text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-center text-gray-900">Compare & Choose</h3>
                <p className="text-gray-600 text-center">
                  Read verified reviews, compare prices, and select the perfect service provider for your needs
                </p>
                <div className="mt-6 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-md">
                  <span className="text-white text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-center text-gray-900">Book & Enjoy</h3>
                <p className="text-gray-600 text-center">
                  Securely book and pay online, then sit back and enjoy your perfectly planned event
                </p>
                <div className="mt-6 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <Link
              href="/services"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span>Start Exploring</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
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
            {categories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-blue-200"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <div className="flex items-center bg-blue-100 px-2 py-1 rounded text-blue-800 text-sm">
                      <span className="mr-1">★</span>
                      {category.description}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">${category.description}</span>
                    <Link 
                      href={`/services?category=${category.slug}`}
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

      {/* Join as Provider Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Are You a Service Provider?</h2>
              <p className="text-xl mb-8 text-indigo-100">
                Join our marketplace to reach more clients and grow your business
              </p>
              <Link
                href="/register?role=provider"
                className="inline-block px-8 py-3 bg-white text-indigo-600 font-medium rounded-md hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
              >
                Join as a Provider
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800" 
                  alt="Service provider"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

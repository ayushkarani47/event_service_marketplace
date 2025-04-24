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
    image: 'https://images.unsplash.com/photo-1552334828-21f48d325b16?w=600',
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
    <main>
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

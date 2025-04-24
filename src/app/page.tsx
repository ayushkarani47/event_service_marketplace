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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-20">
          <Image 
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920" 
            alt="Event background" 
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Find the Perfect Services for Your Special Event</h1>
            <p className="text-xl mb-8 text-blue-100">
              Connect with trusted professionals to make your event memorable
            </p>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex">
              <input
                type="text"
                name="search"
                placeholder="What service are you looking for?"
                className="flex-grow px-5 py-3 rounded-l-md text-gray-400 bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-r-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Browse Categories</h2>
            <p className="mt-4 text-xl text-gray-600">Find the right service for any event</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link 
                key={category.slug}
                href={`/services?category=${category.slug}`}
                className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-xl font-bold">{category.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600">Simple steps to find and book services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="rounded-full bg-blue-100 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Services</h3>
              <p className="text-gray-600">
                Explore our wide range of professional event services
              </p>
            </div>
            
            <div className="text-center">
              <div className="rounded-full bg-blue-100 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compare & Choose</h3>
              <p className="text-gray-600">
                Read reviews, compare prices, and select the perfect match
              </p>
            </div>
            
            <div className="text-center">
              <div className="rounded-full bg-blue-100 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book & Enjoy</h3>
              <p className="text-gray-600">
                Securely book online and get ready for an amazing event
              </p>
            </div>
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

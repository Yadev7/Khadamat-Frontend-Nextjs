import React from 'react';
import { Search, MapPin, ChevronDown, Star, Wrench, MessageCircle } from 'lucide-react';
import Image from 'next/image';
const ServiceCard = ({ image, title, skills, price, isPro = false }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <div className="relative">
        {/* <img src={image} alt={title} className="w-full h-48 object-cover" /> */}
        <Image src={image} alt={title} className="w-full h-48 object-cover" width={400} height={300} />

        {isPro && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            PRO
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-orange-500 font-semibold text-lg">{price}</span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
        </div>
        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          View Details
        </button>
      </div>
    </div>
  );
};

const Services = () => {
  const services = [
    {
      image: 'https://via.placeholder.com/400x300/A7F3D0/10B981?text=Cleaning',
      title: 'Sparkle Ease Cleaning Solutions',
      skills: ['Cleaning', 'Housekeeping', 'Deep Cleaning'],
      price: '$75 - $100/hr',
      isPro: true,
    },
    {
      image: 'https://via.placeholder.com/400x300/BFDBFE/3B82F6?text=Handyman',
      title: 'All-Around Handyman Services',
      skills: ['Handyman', 'Repairs', 'Assembly'],
      price: '$60 - $90/hr',
      isPro: false,
    },
    {
      image: 'https://via.placeholder.com/400x300/FECACA/EF4444?text=Plumbing',
      title: 'Rapid Response Plumbing',
      skills: ['Plumbing', 'Leak Repair', 'Installations'],
      price: '$80 - $120/hr',
      isPro: true,
    },
    {
      image: 'https://via.placeholder.com/400x300/D1FAE5/059669?text=Gardening',
      title: 'Green Thumb Gardening',
      skills: ['Gardening', 'Landscaping', 'Lawn Care'],
      price: '$50 - $75/hr',
      isPro: false,
    },
    {
      image: 'https://via.placeholder.com/400x300/DBEAFE/60A5FA?text=Painting',
      title: 'Pro Painters Co.',
      skills: ['Painting', 'Interior', 'Exterior'],
      price: '$70 - $110/hr',
      isPro: true,
    },
    {
      image: 'https://via.placeholder.com/400x300/FEE2E2/EF4444?text=Electrician',
      title: 'Volt Master Electricians',
      skills: ['Electrical', 'Wiring', 'Repairs'],
      price: '$90 - $150/hr',
      isPro: true,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-500 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">All Services</h1>
          <p className="text-lg mb-8">Find the perfect service for your needs.</p>
          <div className="flex justify-center items-center space-x-4">
            <a href="/" className="text-blue-200 hover:text-white transition-colors">Home</a>
            <span className="text-blue-200">/</span>
            <span>All Services</span>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3">
                <MapPin className="w-5 h-5 text-gray-500 mr-3" />
                <input type="text" placeholder="Select Location" className="flex-1 outline-none text-gray-700" />
                <ChevronDown className="w-5 h-5 text-gray-500 ml-3" />
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3">
                <Wrench className="w-5 h-5 text-gray-500 mr-3" />
                <input type="text" placeholder="Select Service" className="flex-1 outline-none text-gray-700" />
                <ChevronDown className="w-5 h-5 text-gray-500 ml-3" />
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                <Search className="w-5 h-5 mr-2" />
                Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Filter by</h3>
              <div className="mb-6">
                <label htmlFor="keyword" className="block text-gray-700 font-semibold mb-3">Keyword</label>
                <input type="text" id="keyword" placeholder="What are you looking for?" className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500" />
              </div>
              <div className="mb-6">
                <label htmlFor="location" className="block text-gray-700 font-semibold mb-3">Location</label>
                <input type="text" id="location" placeholder="Enter Location" className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500" />
              </div>
              <div className="mb-6">
                <label htmlFor="category" className="block text-gray-700 font-semibold mb-3">Category</label>
                <select id="category" className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 bg-white">
                  <option>All Categories</option>
                  <option>Handyman</option>
                  <option>Cleaning</option>
                  <option>Plumbing</option>
                  <option>Gardening</option>
                  <option>Painting</option>
                  <option>Electrical</option>
                </select>
              </div>
              <div className="mb-6">
                <label htmlFor="priceRange" className="block text-gray-700 font-semibold mb-3">Price Range</label>
                <input type="range" id="priceRange" min="0" max="200" className="w-full" />
                <div className="flex justify-between text-gray-600 text-sm mt-2">
                  <span>$0</span>
                  <span>$200+</span>
                </div>
              </div>
              <button className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Apply Filters
              </button>
            </div>

            {/* Service Listings */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;


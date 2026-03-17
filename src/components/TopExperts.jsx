import React from 'react';
import { ArrowRight, MessageCircle, Shield, Wrench } from 'lucide-react';

const ExpertCard = ({ name, location, priceRange, isPro = false, isAvailable = true }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      {/* Expert Image */}
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600">{name.charAt(0)}</span>
          </div>
        </div>
        
        {/* Pro Badge */}
        {isPro && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            PRO
          </div>
        )}

        {/* Verification Badge */}
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Expert Info */}
      <div className="p-6">
        {/* Name and Location */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
          <p className="text-gray-600">{location}</p>
        </div>

        {/* Price and Status */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-orange-500 font-semibold">{priceRange}</span>
          <span className="text-green-600 font-semibold text-sm">TOP INDEPENDENT</span>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isAvailable 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isAvailable ? 'AVAILABLE' : 'BUSY'}
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
            <Wrench className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm text-gray-700">Handyman</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
            <span className="text-sm text-gray-700">Plumber</span>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center group-hover:scale-105">
          <MessageCircle className="w-5 h-5 mr-2" />
          Get in touch
        </button>
      </div>
    </div>
  );
};

const TopExperts = () => {
  const experts = [
    {
      name: 'Juan Mullins',
      location: 'Brooklyn, NY, USA',
      priceRange: '$75 - $100/hr',
      isPro: true,
      isAvailable: true
    },
    {
      name: 'Ronald Higgins',
      location: 'Brooklyn, NY, USA',
      priceRange: '$75 - $100/hr',
      isPro: true,
      isAvailable: true
    },
    {
      name: 'Leroy Curtis',
      location: 'Brooklyn, NY, USA',
      priceRange: '$75 - $100/hr',
      isPro: true,
      isAvailable: true
    },
    {
      name: 'Kenneth Sims',
      location: 'Brooklyn, NY, USA',
      priceRange: '$75 - $100/hr',
      isPro: true,
      isAvailable: true
    },
    {
      name: 'Sarah Bryan',
      location: 'Brooklyn, NY, USA',
      priceRange: '$75 - $100/hr',
      isPro: true,
      isAvailable: true
    },
    {
      name: 'Todd Meyer',
      location: 'Brooklyn, NY, USA',
      priceRange: '$75 - $100/hr',
      isPro: true,
      isAvailable: true
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Top <span className="text-blue-600">Experts</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Our skilled and reliable experts, your most trusted partners.
            </p>
          </div>
          
          <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center group">
            All Experts
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experts.map((expert, index) => (
            <ExpertCard key={index} {...expert} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopExperts;


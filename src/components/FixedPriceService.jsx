import React from 'react';

const FixedPriceService = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <span className="text-blue-200 font-semibold text-lg mb-4 block">Fixed Price Service</span>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Looking to book a <span className="text-yellow-400">fixed price</span> service?
          </h2>

          <p className="text-blue-100 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
            Interested in scheduling a service at a set rate? Browse our selection of fixed-price offerings and book with confidence today
          </p>

          <p className="text-blue-200 text-xl mb-8 font-medium">
            Plumbing, Handyman, House Cleaning, and more...
          </p>

          <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-yellow-500 hover:to-orange-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
            Contact Now
          </button>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full animate-pulse"></div>
      </div>
    </section>
  );
};

export default FixedPriceService;


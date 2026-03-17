import React from 'react';
import { ArrowRight, Check, TrendingUp } from 'lucide-react';

const BecomeABoss = () => {
  const benefits = [
    'Free access to thousands of job opportunities',
    'Grow your business and client base',
    'Earn extra income on a flexible schedule',
    'No subscription or credit fees'
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="text-orange-500 font-semibold text-lg mb-4 block">Fixed Price Service</span>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Be your own <span className="text-blue-600">boss</span>
            </h2>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Whether you&apos;re a genius spreadsheet guru or a diligent carpenter, find your next job on Airtasker.
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg">{benefit}</span>
                </div>
              ))}
            </div>

            <a href="/earn-money" className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-yellow-500 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl group">
              Earn money all
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>

          {/* Right Content - Dashboard Mockup */}
          <div className="relative">
            {/* Main Dashboard Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">👩‍💼</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sarah Johnson</h3>
                    <p className="text-gray-500 text-sm">Professional Cleaner</p>
                  </div>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                  🔔 New job alert!
                </div>
              </div>

              {/* Notification */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Payment received!</p>
                    <p className="text-gray-600 text-sm">Cleaning services</p>
                    <p className="text-gray-500 text-xs">2h Ago</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600">$145</div>
                </div>
              </div>

              {/* Earnings Chart */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Total earnings</h4>
                <div className="relative">
                  {/* Simple Chart Representation */}
                  <div className="h-32 bg-gradient-to-t from-blue-100 to-transparent rounded-lg relative overflow-hidden">
                    <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                      <path
                        d="M0,80 Q75,60 150,70 T300,50"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">$14,500</div>
                      <div className="flex items-center text-green-600 text-sm">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        20% vs last month
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeABoss;


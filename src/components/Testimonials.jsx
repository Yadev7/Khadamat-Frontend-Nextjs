import React from 'react';
import { Star } from 'lucide-react';

const TestimonialCard = ({ name, username, content }) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
          <span className="text-white font-bold text-lg">{name.charAt(0)}</span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-blue-600 text-sm">{username}</p>
        </div>
      </div>
      
      <p className="text-gray-700 leading-relaxed mb-6">{content}</p>
      
      {/* Rating Stars */}
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
    </div>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Leslie Alexander',
      username: '@iamsedaoi',
      content: 'I was amazed at the efficiency of the platform. The handyman arrived promptly and completed the task with skill. I\'m a satisfied customer and will definitely use this service again.'
    },
    {
      name: 'Esther Howard',
      username: '@estherHowerd',
      content: 'I was amazed at the efficiency of the platform. The handyman arrived promptly and completed the task with skill. I\'m a satisfied customer and will definitely use this service again.'
    },
    {
      name: 'Cameron Williamson',
      username: '@cameronwill',
      content: 'Outstanding service quality! The professional was knowledgeable, courteous, and completed the work beyond my expectations. Highly recommend this platform to anyone looking for reliable help.'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-orange-500 font-semibold text-lg mb-4 block">Customer Reviews</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            What Our <span className="text-blue-600">Customers</span> Say
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what our satisfied customers have to say about their experience with our platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg inline-block">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Experience Excellence?</h3>
            <p className="text-gray-600 mb-6">Join thousands of satisfied customers who trust our platform for their service needs.</p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;


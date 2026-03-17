import React from 'react';
import { Search, CalendarCheck, MessageSquare, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Find Your Expert',
      description: 'Browse through top-rated professionals in Morocco. Filter by price, skills, and real user reviews.',
      icon: <Search className="w-8 h-8 text-blue-600" />,
      color: "bg-blue-100"
    },
    {
      number: '02',
      title: 'Book & Schedule',
      description: 'Pick a time that fits your schedule. Instant booking with local experts available as early as today.',
      icon: <CalendarCheck className="w-8 h-8 text-indigo-600" />,
      color: "bg-indigo-100"
    },
    {
      number: '03',
      title: 'Manage Everything',
      description: 'Chat securely, track progress, pay, and leave a review—all through our simplified dashboard.',
      icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
      color: "bg-purple-100"
    }
  ];

  return (
    <section className="py-6 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 gap-2">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full">
            The Process
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
            How it <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Works</span>
          </h2>
          <p className="text-lg text-slate-600">
            Getting your tasks done in Morocco has never been easier. Follow these three simple steps to start.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative">
          
          {/* Connector Line (Desktop Only) */}
          <div className="hidden md:block absolute top-[25%] left-0 w-full h-0.5 border-t-2 border-dashed border-slate-200 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 cursor-pointer">
            {steps.map((step, index) => (
              <div key={index} className="group flex flex-col items-center">
                
                {/* Icon Hub */}
                <div className="relative mb-8">
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center z-20">
                    <span className="text-sm font-bold text-slate-900">{step.number}</span>
                  </div>

                  {/* Main Icon Circle */}
                  <div className={`w-20 h-20 md:w-24 md:h-24 ${step.color} rounded-3xl flex items-center justify-center transform group-hover:rotate-6 transition-all duration-300 shadow-xl group-hover:shadow-2xl`}>
                    {step.icon}
                  </div>
                </div>

                {/* Content Card */}
                <div className="text-center bg-white p-8 rounded-[2rem] shadow-sm group-hover:shadow-xl transition-all duration-500 border border-slate-100 group-hover:-translate-y-2">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    {step.description}
                  </p>
                  
                  {/* Subtle "Learn More" link for mobile accessibility */}
                  <div className="mt-6 flex items-center justify-center gap-2 text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Details</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
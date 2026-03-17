'use client';
import ScrollToTop from '@/components/ScrollToTop';
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
// import BecomeABoss from '../components/BecomeABoss'
// import TopExperts from '../components/TopExperts'
// import Testimonials from '../components/Testimonials'
import Footer from '@/components/Footer';
import ServicesSection from '@/components/ServicesSection';


export default function HomePage() {
  return (
    <main className="hide-scrollbar">
      <Hero />  
      <HowItWorks />
      <ServicesSection />
      {/* <TopExperts /> */}
      {/* <BecomeABoss /> */}
      {/* <Testimonials /> */}
      <Footer />
      <ScrollToTop />
    </main>
  )
}
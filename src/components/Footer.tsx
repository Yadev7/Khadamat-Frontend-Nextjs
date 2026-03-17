'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Facebook, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const [startCounting, setStartCounting] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) setStartCounting(true);
  }, [inView]);

  return (
    <footer className="bg-gray-950 text-white border-t border-gray-800">
      {/* Stats Section */}
      <div ref={ref} className="bg-gradient-to-b from-gray-900 to-gray-950 py-16 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center">
            <div className="space-y-2">
              <div className="text-5xl lg:text-7xl font-extrabold text-blue-500 tracking-tight">
                {startCounting && <CountUp end={24} duration={2.5} suffix="k" />}
              </div>
              <p className="text-gray-400 text-lg font-medium">{t('footer.stats.customers')}</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl lg:text-7xl font-extrabold text-emerald-500 tracking-tight">
                {startCounting && <CountUp end={7} duration={2.5} suffix="k+" />}
              </div>
              <p className="text-gray-400 text-lg font-medium">{t('footer.stats.projects')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1: Brand & Bio */}
          <div className="col-span-1 lg:col-span-1 space-y-6">
            <div className="flex items-center group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <span className="text-white font-black text-xl">S</span>
              </div>
              {/* Used ms-3 instead of ml-3 for RTL compatibility */}
              <span className="ms-3 text-2xl font-bold tracking-tight">{t('footer.brand.name')}</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {t('footer.brand.description')}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <SocialIcon icon={<Facebook size={20} />} />
              <SocialIcon icon={<Twitter size={20} />} />
              <SocialIcon icon={<Instagram size={20} />} />
              <SocialIcon icon={<Linkedin size={20} />} />
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">{t('footer.columns.company')}</h4>
            <ul className="space-y-4">
              <FooterLink href="/about">{t('footer.links.about')}</FooterLink>
              <FooterLink href="/careers">{t('footer.links.careers')}</FooterLink>
              <FooterLink href="/blog">{t('footer.links.blog')}</FooterLink>
              <FooterLink href="/press">{t('footer.links.press')}</FooterLink>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">{t('footer.columns.support')}</h4>
            <ul className="space-y-4">
              <FooterLink href="/faq">{t('footer.links.faq')}</FooterLink>
              <FooterLink href="/safety">{t('footer.links.safety')}</FooterLink>
              <FooterLink href="/terms">{t('footer.links.terms')}</FooterLink>
              <FooterLink href="/privacy">{t('footer.links.privacy')}</FooterLink>
            </ul>
          </div>

          {/* Column 4: Contact/CTA */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">{t('footer.columns.getInTouch')}</h4>
            <p className="text-gray-400 mb-4">{t('footer.contact.text')}</p>
            <Link
              href="/contact"
              className="inline-block w-full py-3 px-6 text-center rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
            >
              {t('footer.contact.button')}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-black/50 py-8 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} {t('footer.brand.name')} {t('footer.bottom.rights')}
            <Link href="https://newdevmaroc.com/" className="text-white text-bold">
              New Dev Maroc
            </Link>
          </p>
          <div className="flex items-center space-x-6 text-gray-500 text-sm rtl:space-x-reverse">
            <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
              <Globe size={14} /> {t('footer.bottom.language')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper Components
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link href={href} className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
      {children}
    </Link>
  </li>
);

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
  <button className="p-2 bg-gray-900 rounded-lg text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
    {icon}
  </button>
);

export default Footer;
import React, { useState } from 'react';
import { 
  Home, 
  Twitter, 
  Facebook, 
  Instagram, 
  Github, 
  Mail, 
  Send, 
  MapPin, 
  Phone,
  ChevronRight,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Backendurl } from '../App';

// Mobile Collapsible Footer Section
const MobileFooterSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-3 lg:border-none lg:py-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left lg:hidden"
      >
        <h3 className="text-sm font-bold tracking-wider text-gray-700 uppercase">
          {title}
        </h3>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </button>
      
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-3 lg:mt-0 lg:h-auto lg:opacity-100"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Footer Column Component
const FooterColumn = ({ title, children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {title && (
        <h3 className="hidden lg:block text-sm font-bold tracking-wider text-gray-700 uppercase mb-4">
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
};

// Footer Link Component
const FooterLink = ({ href, children }) => {
  return (
    <a 
      href={href} 
      className="flex items-center text-base text-gray-600 transition-all duration-200 hover:text-blue-600 hover:translate-x-1 py-1.5 lg:py-0"
    >
      <ChevronRight className="w-3.5 h-3.5 mr-1 text-blue-500 opacity-0 transition-all duration-200 group-hover:opacity-100" />
      {children}
    </a>
  );
};

// Social Links Component
const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter', color: 'bg-[#1DA1F2]', hoverColor: 'hover:bg-[#1DA1F2]/90' },
  { icon: Facebook, href: '#', label: 'Facebook', color: 'bg-[#1877F2]', hoverColor: 'hover:bg-[#1877F2]/90' },
  { icon: Instagram, href: '#', label: 'Instagram', color: 'bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB]', hoverColor: 'hover:opacity-90' },
  { icon: Github, href: 'https://github.com/Build-Estate-Website', label: 'GitHub', color: 'bg-[#333]', hoverColor: 'hover:bg-gray-800' },
];

const SocialLinks = () => {
  return (
    <div className="flex items-center gap-3 mt-6">
      {socialLinks.map(({ icon: Icon, href, label, color, hoverColor }) => (
        <motion.a
          key={label}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          href={href}
          title={label}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center text-white ${color} ${hoverColor} rounded-full w-9 h-9 shadow-sm transition-all duration-200`}
        >
          <Icon className="w-4 h-4" />
        </motion.a>
      ))}
    </div>
  );
};

// Newsletter Component
const Newsletter = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('footer.enter_email'));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${Backendurl || 'http://localhost:4000'}/news/newsdata`, { email });
      if (response.status === 200) {
        toast.success(t('footer.subscribe_success'));
        setEmail('');
      } else {
        toast.error(t('footer.subscribe_error'));
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error(t('footer.subscribe_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-bold tracking-wider text-gray-700 uppercase mb-4">{t('footer.stay_updated')}</h3>
      
      <p className="text-gray-600 mb-4 text-sm">
        {t('footer.newsletter_description')}
      </p>
      
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="email"
              name="email"
              id="email"
              placeholder={t('footer.email_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 pr-4 py-3 w-full text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-200 disabled:opacity-70 sm:w-auto w-full"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                <span>{t('footer.subscribe')}</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      <p className="mt-3 text-xs text-gray-500">
        {t('footer.privacy_agreement')} <a href="#" className="underline hover:text-blue-600">{t('footer.privacy_policy')}</a>.
      </p>
    </div>
  );
};

// Main Footer Component
const contactInfo = [
  { 
    icon: MapPin, 
    text: '123 Property Plaza, Silicon Valley, CA 94088',
    href: 'https://maps.google.com/?q=123+Property+Plaza,Silicon+Valley,CA+94088' 
  },
  { 
    icon: Phone, 
    text: '+216 96 082 400',
    href: 'tel:+21696082400'
  },
  { 
    icon: Mail, 
    text: 'company@gmail.com',
    href: 'mailto:oussemabenayed7@gmail.com' 
  },
];

const Footer = () => {
  const { t } = useTranslation();
  
  const companyLinks = [
    { name: t('navbar.home'), href: '/' },
    { name: t('navbar.properties'), href: '/properties' },
    { name: t('navbar.contact'), href: '/contact' },
  ];


  
  return (
    <footer>
      {/* Main Footer */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 pt-12 lg:pt-16 pb-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand section - Always visible above other sections on mobile */}
          <div className="mb-10">
            <div className="flex items-center justify-center lg:justify-start">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                OurHome
              </span>
            </div>
            
            <p className="text-gray-600 mt-4 text-center lg:text-left lg:mt-6 max-w-md mx-auto lg:mx-0 leading-relaxed">
              {t('footer.company_description')}
            </p>
            
            <div className="flex justify-center lg:justify-start">
              <SocialLinks />
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:grid grid-cols-12 gap-8">
            {/* Quick Links Column */}
            <FooterColumn title={t('footer.quick_links')} className="col-span-3" delay={0.2}>
              <ul className="space-y-3">
                {companyLinks.map(link => (
                  <li key={link.name} className="group">
                    <FooterLink href={link.href}>{link.name}</FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            {/* Contact Info */}
            <FooterColumn title={t('footer.contact_us')} className="col-span-3" delay={0.3}>
              <ul className="space-y-4">
                {contactInfo.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className="flex items-start text-gray-600 hover:text-blue-600 transition-colors duration-200"
                      target={item.icon === MapPin ? "_blank" : undefined}
                      rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                    >
                      <item.icon className="w-4 h-4 mt-1 mr-3 flex-shrink-0 text-blue-500" />
                      <span className="text-sm">{item.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </FooterColumn>
            
            {/* Newsletter */}
            <div className="col-span-6">
              <Newsletter />
            </div>
          </div>

          {/* Mobile Accordions */}
          <div className="lg:hidden space-y-4">
            <MobileFooterSection title={t('footer.quick_links')}>
              <ul className="space-y-2 py-2">
                {companyLinks.map(link => (
                  <li key={link.name} className="group">
                    <FooterLink href={link.href}>{link.name}</FooterLink>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <MobileFooterSection title={t('footer.contact_us')}>
              <ul className="space-y-3 py-2">
                {contactInfo.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className="flex items-start text-gray-600 hover:text-blue-600 transition-colors duration-200"
                      target={item.icon === MapPin ? "_blank" : undefined}
                      rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                    >
                      <item.icon className="w-4 h-4 mt-1 mr-3 flex-shrink-0 text-blue-500" />
                      <span className="text-sm">{item.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <div className="pt-6 pb-4">
              <Newsletter />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 mb-4 md:mb-0 text-center md:text-left">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          
          <motion.a
            href="/properties"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {t('footer.browse_properties')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </motion.a>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </footer>
  );
};

export default Footer;
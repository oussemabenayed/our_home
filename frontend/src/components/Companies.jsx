// import { logos } from '../assets/logo';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Star, Users, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.6
    }
  }
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 25
    }
  }
};

const floatingAnimation = {
  y: [-2, 2, -2],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const Companies = () => {
  const { t } = useTranslation();
  
  const stats = [
    { icon: Users, value: "200+", label: t('companies.trusted_partners') },
    { icon: Star, value: "4.9", label: t('companies.average_rating') },
    { icon: Award, value: "50M+", label: t('companies.properties_listed') },
    { icon: TrendingUp, value: "98%", label: t('companies.success_rate') }
  ];

  // const companyLogos = [
  //   { src: logos.Googlelogo, alt: "Google", name: "Google" },
  //   { src: logos.Bookinglogo, alt: "Booking.com", name: "Booking.com" },
  //   { src: logos.Airbnblogo, alt: "Airbnb", name: "Airbnb" },
  //   { src: logos.Microsoftlogo, alt: "Microsoft", name: "Microsoft" },
  //   { src: logos.Amazonlogo, alt: "Amazon", name: "Amazon" }
  // ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Advanced Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6"
          >
            <Star className="w-4 h-4" />
            {t('companies.advanced_features')}
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            {t('companies.everything_you_need')}{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {t('companies.dream_home')}
            </span>
          </motion.h2>
          

        </motion.div>



        {/* Advanced Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            {
              icon: "🏢",
              title: t('companies.neighborhood_analysis'),
              description: t('companies.neighborhood_analysis_desc')
            },
            {
              icon: "🗺️",
              title: t('companies.interactive_map'),
              description: t('companies.interactive_map_desc')
            },
            {
              icon: "🔍",
              title: t('companies.advanced_search'),
              description: t('companies.advanced_search_desc')
            },
            {
              icon: "📱",
              title: t('companies.user_dashboard'),
              description: t('companies.user_dashboard_desc')
            },
            {
              icon: "📅",
              title: t('companies.appointment_management'),
              description: t('companies.appointment_management_desc')
            },
            {
              icon: "📷",
              title: t('companies.property_listing'),
              description: t('companies.property_listing_desc')
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Technology Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('companies.why_choose')}</h3>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">{t('companies.free_to_use')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-medium">{t('companies.updated_daily')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="font-medium">{t('companies.verified_listings')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="font-medium">{t('companies.expert_support')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Companies;
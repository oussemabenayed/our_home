import React from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Building2, Home, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CountUp from './Contup';



export default function Milestones() {
  const { t } = useTranslation();
  
  const milestones = [
    {
      icon: Home,
      title: t('about_milestone.properties_listed_title'),
      value: 5000,
      description: t('about_milestone.properties_listed_description'),
    },
    {
      icon: Target,
      title: t('about_milestone.happy_clients_title'),
      value: 10000,
      description: t('about_milestone.happy_clients_description'),
    },
  ];
  
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('about_milestone.title')}</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('about_milestone.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon;
            return (
              <motion.div
                key={milestone.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-5xl font-bold text-blue-600 mb-4">
                  <CountUp from={0} to={milestone.value} duration={2} separator="," />
                </h3>
                <p className="text-2xl font-semibold mb-3">{milestone.title}</p>
                <p className="text-gray-600 text-lg">{milestone.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
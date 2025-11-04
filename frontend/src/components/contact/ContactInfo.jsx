import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ContactInfoItem from './InfoItem';



export default function ContactInfo() {
  const { t } = useTranslation();
  
  const contactInfo = [
    {
      icon: Phone,
      title: t('contact_info.phone'),
      content: '+216 96 082 400',
      link: 'tel:+21696082400',
    },
    {
      icon: Mail,
      title: t('contact_info.email'),
      content: 'company@gmail.com',
      link: 'mailto:oussemabenayed7@gmail.com',
    },
    {
      icon: MapPin,
      title: t('contact_info.address'),
      content: t('contact_info.address_content'),
      link: '#map',
    },
    {
      icon: Clock,
      title: t('contact_info.working_hours'),
      content: t('contact_info.working_hours_content'),
    },
  ];
  
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="bg-white p-8 rounded-2xl shadow-sm"
    >
      <h2 className="text-2xl font-bold mb-8">{t('contact_info.our_office')}</h2>
      <div className="space-y-6">
        {contactInfo.map((info, index) => (
          <ContactInfoItem key={index} {...info} />
        ))}
      </div>
    </motion.div>
  );
}
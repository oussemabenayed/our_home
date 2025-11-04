import React from 'react';
import { Linkedin, Twitter, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { teamMembers } from '../../assets/data/teammemberdata';

const TeamMember = ({ nameKey, positionKey, bioKey, image, social }) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-all w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center">
        <img
          src={image}
          alt={t(nameKey)}
          className="w-24 h-24 md:w-32 md:h-32 rounded-full mb-3 md:mb-4 object-cover"
        />
        <h3 className="text-lg md:text-xl font-semibold text-center mb-1">{t(nameKey)}</h3>
        <p className="text-blue-600 text-xs md:text-sm text-center mb-2 md:mb-3">{t(positionKey)}</p>
        <p className="text-gray-600 text-sm md:text-base text-center mb-3 md:mb-4">{t(bioKey)}</p>
        <div className="flex justify-center space-x-4">
          {social.linkedin && (
            <a href={social.linkedin} className="text-gray-400 hover:text-blue-600 transition-colors">
              <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          )}
          {social.twitter && (
            <a href={social.twitter} className="text-gray-400 hover:text-blue-600 transition-colors">
              <Twitter className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          )}
          {social.instagram && (
            <a href={social.instagram} className="text-gray-400 hover:text-blue-600 transition-colors">
              <Instagram className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMember;
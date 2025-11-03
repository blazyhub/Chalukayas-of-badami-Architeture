
import React from 'react';
import { Site, Language } from '../types';

interface SiteCardProps {
  site: Site;
  onSelectSite: (site: Site) => void;
  language: Language;
}

const SiteCard: React.FC<SiteCardProps> = ({ site, onSelectSite, language }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-2 transition-transform duration-300 group"
      onClick={() => onSelectSite(site)}
    >
      <div className="relative h-56">
        <img src={site.image} alt={site.name[language]} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <h3 className={`absolute bottom-0 left-0 p-4 text-xl font-bold text-white ${language === Language.KN ? 'font-kannada' : ''}`}>
          {site.name[language]}
        </h3>
      </div>
    </div>
  );
};

export default SiteCard;

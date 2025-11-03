
import React from 'react';
import { Site, Language } from '../types';
import SiteCard from './SiteCard';
import { TRANSLATIONS } from '../constants/translations';
import { Icon } from './Icon';

interface WelcomeScreenProps {
  sites: Site[];
  onSelectSite: (site: Site) => void;
  language: Language;
  onShowImageAnalyzer: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ sites, onSelectSite, language, onShowImageAnalyzer }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className={`mt-2 text-lg text-stone-600 ${language === Language.KN ? 'font-kannada' : ''}`}>
          {TRANSLATIONS.welcomeMessage[language]}
        </p>
      </div>
      
      <div className="text-center">
        <button 
          onClick={onShowImageAnalyzer}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors font-semibold shadow-md"
        >
          <Icon name="camera" />
          <span className={`${language === Language.KN ? 'font-kannada' : ''}`}>
            {TRANSLATIONS.analyzeArtifact[language]}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sites.map(site => (
          <SiteCard key={site.id} site={site} onSelectSite={onSelectSite} language={language} />
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;

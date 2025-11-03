
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { Icon } from './Icon';

interface HeaderProps {
  language: Language;
  toggleLanguage: () => void;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ language, toggleLanguage, onBack }) => {
  return (
    <header className="container mx-auto flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-full hover:bg-stone-200 transition-colors">
            <Icon name="arrow-left" />
            <span className="sr-only">{TRANSLATIONS.backButton[language]}</span>
          </button>
        )}
        <h1 className={`text-xl md:text-2xl font-bold text-stone-700 ${language === Language.KN ? 'font-kannada' : ''}`}>
          {TRANSLATIONS.title[language]}
        </h1>
      </div>
      <button
        onClick={toggleLanguage}
        className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors font-semibold"
      >
        {TRANSLATIONS.languageToggleButton[language]}
      </button>
    </header>
  );
};

export default Header;

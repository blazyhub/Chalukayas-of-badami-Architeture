
import React, { useState, useCallback } from 'react';
import { Language, Site } from './types';
import { SITES } from './constants/sites';
import WelcomeScreen from './components/WelcomeScreen';
import DetailsScreen from './components/DetailsScreen';
import Header from './components/Header';
import ImageAnalyzer from './components/ImageAnalyzer';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showImageAnalyzer, setShowImageAnalyzer] = useState<boolean>(false);

  const handleSelectSite = useCallback((site: Site) => {
    setSelectedSite(site);
    setShowImageAnalyzer(false);
  }, []);

  const handleGoBack = useCallback(() => {
    setSelectedSite(null);
    setShowImageAnalyzer(false);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === Language.EN ? Language.KN : Language.EN);
  }, []);
  
  const handleShowImageAnalyzer = useCallback(() => {
    setShowImageAnalyzer(true);
    setSelectedSite(null);
  }, []);

  return (
    <div className="bg-stone-100 min-h-screen text-stone-800">
      <div className="w-full bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
          <Header language={language} toggleLanguage={toggleLanguage} onBack={selectedSite || showImageAnalyzer ? handleGoBack : undefined} />
      </div>
      <main className="container mx-auto p-4 md:p-8">
        {selectedSite ? (
          <DetailsScreen site={selectedSite} language={language} />
        ) : showImageAnalyzer ? (
          <ImageAnalyzer language={language} />
        ) : (
          <WelcomeScreen sites={SITES} onSelectSite={handleSelectSite} language={language} onShowImageAnalyzer={handleShowImageAnalyzer}/>
        )}
      </main>
       <footer className="text-center p-4 text-stone-500 text-sm">
        <p>Crafted with passion for history and technology.</p>
      </footer>
    </div>
  );
};

export default App;

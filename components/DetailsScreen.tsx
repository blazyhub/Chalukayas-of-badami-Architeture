import React from 'react';
import { Site, Language } from '../types';
import Chatbot from './Chatbot';
import { textToSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import { Icon } from './Icon';

const DetailsScreen: React.FC<{ site: Site; language: Language }> = ({ site, language }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const audioData = await textToSpeech(site.description[language]);
      // FIX: Add `(window as any)` to support `webkitAudioContext` in TypeScript
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedData = decode(audioData);
      const audioBuffer = await decodeAudioData(decodedData, audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      source.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className={`text-3xl font-bold text-amber-900 mb-4 flex items-center gap-4 ${language === Language.KN ? 'font-kannada' : ''}`}>
          {site.name[language]}
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className="p-2 rounded-full hover:bg-stone-200 disabled:opacity-50 transition-colors"
            aria-label="Listen to description"
          >
            {isPlaying ? <Icon name="spinner" className="animate-spin" /> : <Icon name="volume" />}
          </button>
        </h2>
        <p className={`text-stone-700 leading-relaxed ${language === Language.KN ? 'font-kannada' : ''}`}>
          {site.description[language]}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Chatbot site={site} language={language} />
      </div>
    </div>
  );
};

export default DetailsScreen;
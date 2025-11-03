
import React, { useState, useCallback } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { analyzeImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/image';
import { Icon } from './Icon';

interface ImageAnalyzerProps {
  language: Language;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ language }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysis('');
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setAnalysis('');
    setError('');

    try {
      const base64Image = await fileToBase64(selectedFile);
      const result = await analyzeImage(base64Image, selectedFile.type, language);
      setAnalysis(result);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(language === Language.EN ? 'Failed to analyze the image. Please try again.' : 'ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, language]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg animate-fade-in">
      <h2 className={`text-3xl font-bold text-amber-900 mb-4 text-center ${language === Language.KN ? 'font-kannada' : ''}`}>
        {TRANSLATIONS.analyzeArtifact[language]}
      </h2>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center">
            <input type="file" id="imageUpload" accept="image/*" onChange={handleFileChange} className="hidden" />
            <label htmlFor="imageUpload" className="cursor-pointer inline-flex flex-col items-center gap-2 text-stone-600">
              <Icon name="upload" size={8} />
              <span className={language === Language.KN ? 'font-kannada' : ''}>{TRANSLATIONS.uploadImage[language]}</span>
            </label>
          </div>
          {preview && (
            <div className="mt-4">
              <img src={preview} alt="Selected artifact" className="max-w-full mx-auto rounded-lg shadow-md" />
            </div>
          )}
          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || isLoading}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 disabled:bg-stone-400 transition-colors font-semibold shadow-md"
          >
            {isLoading ? <Icon name="spinner" className="animate-spin" /> : <Icon name="search" />}
            <span className={language === Language.KN ? 'font-kannada' : ''}>
              {isLoading ? (language === Language.EN ? 'Analyzing...' : 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...') : TRANSLATIONS.analyze[language]}
            </span>
          </button>
        </div>
        <div className="space-y-4">
          <h3 className={`text-2xl font-semibold text-stone-800 ${language === Language.KN ? 'font-kannada' : ''}`}>
            {TRANSLATIONS.analysisResult[language]}
          </h3>
          <div className="bg-stone-50 p-4 rounded-lg min-h-[200px] prose">
            {error && <p className="text-red-500">{error}</p>}
            {analysis && <p className={language === Language.KN ? 'font-kannada' : ''}>{analysis}</p>}
            {!analysis && !isLoading && !error && <p className="text-stone-500">{language === Language.EN ? 'Upload an image and click Analyze to see the results.' : 'ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಲು ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ವಿಶ್ಲೇಷಿಸಿ ಕ್ಲಿಕ್ ಮಾಡಿ.'}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;

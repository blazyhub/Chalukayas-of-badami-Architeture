import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Site, Language, ChatMessage, MessageSender } from '../types';
import { sendMessageToChat, generateImage, textToSpeech } from '../services/geminiService';
import { TRANSLATIONS } from '../constants/translations';
import { Icon } from './Icon';
import { decode, decodeAudioData } from '../utils/audio';
import { useLiveChat } from '../hooks/useLiveChat';

interface ChatbotProps {
  site: Site;
  language: Language;
}

const ChatBubble: React.FC<{ message: ChatMessage; onPlayAudio: (text: string) => void; isPlaying: boolean; language: Language}> = ({ message, onPlayAudio, isPlaying, language }) => {
    const isUser = message.sender === MessageSender.USER;
    return (
        <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${isUser ? 'bg-amber-800 text-white rounded-br-none' : 'bg-stone-200 text-stone-800 rounded-bl-none'}`}>
                {message.isLoading ? (
                    <div className="flex items-center gap-2">
                        <Spinner />
                        <span className="text-sm">Thinking...</span>
                    </div>
                ) : message.imageUrl ? (
                    <img src={message.imageUrl} alt="Generated" className="rounded-lg" />
                ) : (
                    <p className={`${language === Language.KN ? 'font-kannada' : ''}`}>{message.text}</p>
                )}
            </div>
            {!isUser && message.text && (
                 <button onClick={() => onPlayAudio(message.text || '')} disabled={isPlaying} className="p-2 rounded-full hover:bg-stone-300 disabled:opacity-50">
                    <Icon name="volume" size={4} />
                 </button>
            )}
        </div>
    );
};

const Spinner: React.FC = () => <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>;

const Chatbot: React.FC<ChatbotProps> = ({ site, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { isLive, isConnecting, userTranscript, botTranscript, startLiveChat, stopLiveChat } = useLiveChat(site, language);

  useEffect(() => {
    const welcomeText = language === Language.EN
      ? `Hello! I am your guide for ${site.name[language]}. How can I help you explore this magnificent site?`
      : `ನಮಸ್ಕಾರ! ನಾನು ${site.name[language]} ಕುರಿತು ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶಕ. ಈ ಭವ್ಯವಾದ ತಾಣವನ್ನು ಅನ್ವೇಷಿಸಲು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`;
    
    setMessages([{ sender: MessageSender.BOT, text: welcomeText }]);
  }, [site, language]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages, botTranscript]);
  
  const handlePlayAudio = useCallback(async (text: string) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
        const audioData = await textToSpeech(text);
        // FIX: Add `(window as any)` to support `webkitAudioContext` in TypeScript
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedData = decode(audioData);
        const audioBuffer = await decodeAudioData(decodedData, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
        source.onended = () => setIsPlayingAudio(false);
    } catch (error) {
        console.error("Error playing audio:", error);
        setIsPlayingAudio(false);
    }
  }, [isPlayingAudio]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLive) return;

    const userMessage: ChatMessage = { sender: MessageSender.USER, text: input };
    setMessages(prev => [...prev, userMessage, { sender: MessageSender.BOT, isLoading: true }]);
    setInput('');
    
    try {
        let response: ChatMessage;
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('generate image') || lowerInput.includes('create a picture') || lowerInput.includes('artistic impression')) {
            const imageUrl = await generateImage(input);
            response = { sender: MessageSender.BOT, imageUrl };
        } else {
            const textResponse = await sendMessageToChat(input, site, language);
            response = { sender: MessageSender.BOT, text: textResponse };
        }
        setMessages(prev => [...prev.slice(0, -1), response]);
    } catch (error) {
        console.error("Error fetching response:", error);
        const errorText = language === Language.EN ? 'Sorry, I encountered an error. Please try again.' : 'ಕ್ಷಮಿಸಿ, ದೋಷವೊಂದು ಎದುರಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';
        setMessages(prev => [...prev.slice(0, -1), { sender: MessageSender.BOT, text: errorText }]);
    }
  };
  
  const handleVoiceButtonClick = () => {
      if (isLive) {
          stopLiveChat();
      } else {
          startLiveChat();
      }
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto bg-stone-50">
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} onPlayAudio={handlePlayAudio} isPlaying={isPlayingAudio} language={language}/>
        ))}
        {botTranscript && (
            <ChatBubble message={{sender: MessageSender.BOT, text: botTranscript}} onPlayAudio={() => {}} isPlaying={false} language={language} />
        )}
      </div>
      {isLive && userTranscript && (
        <div className="p-2 text-center text-stone-500 italic">
            {userTranscript}
        </div>
      )}
      <div className="p-4 border-t border-stone-200 bg-white">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={isLive ? (isConnecting ? TRANSLATIONS.connecting[language] : (userTranscript || TRANSLATIONS.listening[language])) : input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={TRANSLATIONS.chatPlaceholder[language]}
            className={`flex-1 p-3 border rounded-full focus:ring-2 focus:ring-amber-500 focus:outline-none transition ${isLive ? 'bg-stone-200 italic' : ''}`}
            disabled={isLive || isConnecting}
          />
          <button
            type="button"
            onClick={handleVoiceButtonClick}
            className={`p-3 rounded-full transition-colors ${isLive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-amber-800 hover:bg-amber-900 text-white'}`}
          >
            {isConnecting ? <Icon name="spinner" className="animate-spin" /> : <Icon name="mic" />}
          </button>
          <button
            type="submit"
            disabled={isLive || isConnecting || !input.trim()}
            className="p-3 bg-amber-800 text-white rounded-full hover:bg-amber-900 disabled:bg-stone-300 transition-colors"
          >
            <Icon name="send" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
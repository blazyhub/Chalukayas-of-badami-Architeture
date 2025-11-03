
import { GoogleGenAI, Chat, Modality } from "@google/genai";
import { Language, Site } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const chatInstances: { [key: string]: Chat } = {};

const getChatInstance = (site: Site, language: Language): Chat => {
  const instanceKey = `${site.id}-${language}`;
  if (!chatInstances[instanceKey]) {
    const languageName = language === Language.EN ? 'English' : 'Kannada';
    const systemInstruction = `You are a friendly and knowledgeable tour guide specializing in the Chalukya dynasty's architecture. Your current focus is ${site.name[language]}. Please answer all questions in ${languageName}. Keep your answers concise and informative, suitable for students.`;
    
    chatInstances[instanceKey] = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
    });
  }
  return chatInstances[instanceKey];
};

export const sendMessageToChat = async (message: string, site: Site, language: Language) => {
  const chat = getChatInstance(site, language);
  const result = await chat.sendMessage({ message });
  return result.text;
};

export const analyzeImage = async (base64Image: string, mimeType: string, language: Language): Promise<string> => {
  const prompt = language === Language.EN
    ? 'Analyze this image. Does it appear to be in the Chalukyan style of architecture or sculpture? Describe its key features, materials, and possible origins. Respond in English.'
    : 'ಈ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ. ಇದು ಚಾಲುಕ್ಯರ ಶೈಲಿಯ ವಾಸ್ತುಶಿಲ್ಪ ಅಥವಾ ಶಿಲ್ಪಕಲೆಯಂತೆ ಕಾಣುತ್ತದೆಯೇ? ಅದರ ಪ್ರಮುಖ ಲಕ್ಷಣಗಳು, ಬಳಸಿದ ವಸ್ತುಗಳು ಮತ್ತು ಸಂಭವನೀಯ ಮೂಲಗಳನ್ನು ವಿವರಿಸಿ. ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ.';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt },
      ],
    },
  });
  return response.text;
};

export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `An artistic, photorealistic impression of: ${prompt}`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};


export const textToSpeech = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' }, // A pleasant voice
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from API.");
    }
    return base64Audio;
};

// Expose the GoogleGenAI instance for Live API
export const getAiInstance = () => ai;

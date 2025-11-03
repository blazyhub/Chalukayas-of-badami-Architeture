
export enum Language {
  EN = 'en',
  KN = 'kn',
}

export interface Site {
  id: string;
  name: {
    [Language.EN]: string;
    [Language.KN]: string;
  };
  description: {
    [Language.EN]: string;
    [Language.KN]: string;
  };
  image: string;
}

export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  sender: MessageSender;
  text?: string;
  imageUrl?: string;
  isLoading?: boolean;
  audioData?: string; // base64 encoded
}

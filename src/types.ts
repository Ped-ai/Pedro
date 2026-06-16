export interface Sticker {
  emoji: string;
  label: string;
  x: number; // relative horizontal position %
  y: number; // relative vertical position %
  size?: string; // size utility (e.g. text-5xl, etc)
}

export interface PosterData {
  dateString: string;
  celebrationTitle: string;
  subtitle: string;
  description: string;
  slogan: string;
  primaryColor: string; // Hex color e.g., "#4f46e5"
  accentColor: string;  // Hex color e.g., "#f59e0b"
  textColor: 'light' | 'dark' | string;
  bgPreset: 'gradient-indigo' | 'gradient-rose' | 'gradient-amber' | 'gradient-emerald' | 'gradient-sky' | 'gradient-dark' | 'solid-cream' | 'gradient-sunset' | 'gradient-forest' | string;
  iconName: string;
  stickers: Sticker[];
  historicalFacts: string[];
  celebrationIdeas: string[];
  imagePrompt: string; // Prompt for the generator
  aiGeneratedImageUrl?: string; // Loaded dynamically if generated
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

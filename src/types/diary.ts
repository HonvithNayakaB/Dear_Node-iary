export type MoodType =
  | 'happy'
  | 'peaceful'
  | 'productive'
  | 'tired'
  | 'sad'
  | 'excited'
  | 'loved'
  | 'grateful';

export type WeatherType =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'snowy'
  | 'windy'
  | 'night';

export type ThemeType =
  | 'sakura' // Pastel pink & floral cream
  | 'matcha' // Gentle sage green & warm ivory
  | 'cocoa'  // Cozy espresso, warm sepia & beige
  | 'lavender' // Soft lilac & dreamy violet
  | 'starlight'; // Cozy dark starlight

export type PaperStyle = 'lined' | 'dotted' | 'blank';

export type FontStyle = 'caveat' | 'patrick' | 'quicksand';

export interface DiaryPhoto {
  id: string;
  dataUrl: string; // Base64 data URL
  caption?: string;
  rotation?: number; // Slight tilt in degrees (-6 to +6) for polaroid effect
  timestamp: number;
}

export interface DiarySticker {
  id: string;
  emoji: string;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  rotation: number;
}

export interface DiaryEntry {
  id: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // '10:15 AM'
  createdAt: number; // Unix epoch ms
  updatedAt: number;
  title: string;
  content: string;
  mood: MoodType;
  weather: WeatherType;
  photos: DiaryPhoto[];
  stickers: DiarySticker[];
  tags: string[];
  isFavorite?: boolean;
  paperStyle?: PaperStyle;
}

export interface UserPreferences {
  theme: ThemeType;
  paperStyle: PaperStyle;
  fontStyle: FontStyle;
  soundEnabled: boolean;
  ambientSound: boolean;
}

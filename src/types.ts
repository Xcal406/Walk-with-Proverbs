export interface JournalEntry {
  id: string;
  dayIndex: number; // 1 to 365
  reference: string; // e.g., "Proverbs 1:1-7"
  date: string; // ISO String
  content: string; // Journal body written by user
  keyTheme: string; // e.g., "Seeking Wisdom", "Words of Grace"
  promptQuestion?: string; // The prompt they answered
  aiReflection?: string; // Optional spiritual feedback from Gemini
}

export interface ReadingPortion {
  dayIndex: number; // 1 to 365
  chapter: number;
  startVerse: number;
  endVerse: number;
  reference: string;
  theme: string;
  title: string;
  focusMessage: string;
  defaultPrompt: string;
}

export interface UserProgress {
  completedDays: number[]; // Array of completed dayIndices (1 to 365)
  currentDayIndex: number; // The user's active day, defaults to 1
  favoriteVerses: string[]; // List of reference keys favorited
  streak: number;
  lastReadDate?: string; // e.g. "2026-05-27"
}

export interface BibleVerse {
  chapter: number;
  verse: number;
  text: string;
}

export interface ScriptureResponse {
  reference: string;
  text: string;
  verses: BibleVerse[];
}

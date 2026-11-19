import Dexie, { type Table } from 'dexie';
import { DiaryEntry, UserPreferences } from '../types/diary';

export class DearNodeIaryDatabase extends Dexie {
  entries!: Table<DiaryEntry, string>;
  preferences!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super('DearNodeIaryDB');
    this.version(1).stores({
      entries: 'id, date, createdAt, mood, weather, isFavorite',
      preferences: 'key',
    });
  }
}

export const db = new DearNodeIaryDatabase();

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'sakura',
  paperStyle: 'lined',
  fontStyle: 'caveat',
  soundEnabled: true,
  ambientSound: false,
};

// Initial welcome sample entries so the book is full of life on first launch
export const INITIAL_ENTRIES: DiaryEntry[] = [
  {
    id: 'entry-memory-1',
    date: '2026-11-15',
    time: '10:30 AM',
    createdAt: new Date('2026-11-15T10:30:00').getTime(),
    updatedAt: new Date('2026-11-15T10:30:00').getTime(),
    title: 'Warm Matcha & Morning Sunlight 🍵',
    content: `Today felt like a gentle watercolor painting. The morning light filtered through the lace curtains, painting little floral patterns across my wooden desk.

I brewed a cup of oat-milk matcha latte with a sprinkle of cinnamon, sat by the window, and watched the neighborhood wake up. There's something magical about quiet mornings before the rush begins. 

"Every moment is a fresh beginning." 🌿✨`,
    mood: 'peaceful',
    weather: 'sunny',
    photos: [
      {
        id: 'photo-1',
        dataUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
        caption: 'Morning matcha warm vibes 🍵',
        rotation: -2,
        timestamp: new Date('2026-11-15T10:32:00').getTime(),
      },
    ],
    stickers: [
      { id: 'stk-1', emoji: '🌿', x: 85, y: 15, rotation: 12 },
      { id: 'stk-2', emoji: '✨', x: 20, y: 88, rotation: -8 },
    ],
    tags: ['morning', 'matcha', 'peace'],
    isFavorite: true,
    paperStyle: 'lined',
  },
  {
    id: 'entry-memory-2',
    date: '2026-11-17',
    time: '04:15 PM',
    createdAt: new Date('2026-11-17T16:15:00').getTime(),
    updatedAt: new Date('2026-11-17T16:15:00').getTime(),
    title: 'The Poetry of Circular Doubly Linked Lists 🌸',
    content: `I was thinking about how memories work today. In life, we never really encounter a dead end. Every memory points backwards to where we came from, and forwards to the hope of tomorrow.

And when you reach the very newest day of your life, it seamlessly connects back to your oldest roots — like a beautiful circular ribbon looping endlessly!

No null pointers. Just infinite gratitude and reflections. 📖💖`,
    mood: 'excited',
    weather: 'cloudy',
    photos: [
      {
        id: 'photo-2',
        dataUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        caption: 'Journaling by the window 📖',
        rotation: 3,
        timestamp: new Date('2026-11-17T16:18:00').getTime(),
      },
    ],
    stickers: [
      { id: 'stk-3', emoji: '🌸', x: 10, y: 12, rotation: -15 },
      { id: 'stk-4', emoji: '💖', x: 88, y: 85, rotation: 10 },
    ],
    tags: ['dsa', 'thoughts', 'linkedlist'],
    isFavorite: false,
    paperStyle: 'dotted',
  },
  {
    id: 'entry-memory-3',
    date: '2026-11-19',
    time: '07:00 PM',
    createdAt: new Date('2026-11-19T19:00:00').getTime(),
    updatedAt: new Date('2026-11-19T19:00:00').getTime(),
    title: 'Welcome to Dear Node-iary! 💌',
    content: `Today is the day Dear Node-iary came to life! A cozy corner where thoughts breathe, polaroids capture fleeting smiles, and Computer Science turns into poetry.

Here are a few things to try:
• Click the ➕ button to add today's entry (inserted at the tail in O(1)!)
• Choose a past date to watch it slide into sorted chronological position
• Turn pages to see the circular memory loop in action
• Open the bottom Node Ribbon to inspect the linked list pointers!

With love, your personal Node-iary. 🌸🎀`,
    mood: 'happy',
    weather: 'night',
    photos: [
      {
        id: 'photo-3',
        dataUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
        caption: 'My sweet cozy sanctuary ✨',
        rotation: -3,
        timestamp: new Date('2026-11-19T19:02:00').getTime(),
      },
    ],
    stickers: [
      { id: 'stk-5', emoji: '🎀', x: 82, y: 18, rotation: 8 },
      { id: 'stk-6', emoji: '⭐', x: 15, y: 82, rotation: -12 },
    ],
    tags: ['first-entry', 'celebration', 'cozy'],
    isFavorite: true,
    paperStyle: 'lined',
  },
];

/**
 * Initializes database with default entries if empty.
 */
export async function initDatabase(): Promise<DiaryEntry[]> {
  const count = await db.entries.count();
  if (count === 0) {
    await db.entries.bulkAdd(INITIAL_ENTRIES);
    return INITIAL_ENTRIES;
  }
  return await db.entries.toArray();
}

export async function saveEntryToDb(entry: DiaryEntry): Promise<void> {
  await db.entries.put(entry);
}

export async function deleteEntryFromDb(id: string): Promise<void> {
  await db.entries.delete(id);
}

export async function getPreferencesFromDb(): Promise<UserPreferences> {
  const row = await db.preferences.get('user_prefs');
  if (row && row.value) {
    return { ...DEFAULT_PREFERENCES, ...(row.value as Partial<UserPreferences>) };
  }
  return DEFAULT_PREFERENCES;
}

export async function savePreferencesToDb(prefs: UserPreferences): Promise<void> {
  await db.preferences.put({ key: 'user_prefs', value: prefs });
}

export async function exportDiaryJson(): Promise<string> {
  const allEntries = await db.entries.toArray();
  const prefs = await getPreferencesFromDb();
  return JSON.stringify(
    {
      app: 'Dear_Node_iary',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      entries: allEntries,
      preferences: prefs,
    },
    null,
    2
  );
}

export async function importDiaryJson(jsonStr: string): Promise<DiaryEntry[]> {
  const data = JSON.parse(jsonStr);
  if (!data || !Array.isArray(data.entries)) {
    throw new Error('Invalid diary backup format.');
  }

  await db.entries.clear();
  await db.entries.bulkAdd(data.entries);

  if (data.preferences) {
    await savePreferencesToDb(data.preferences);
  }

  return await db.entries.toArray();
}

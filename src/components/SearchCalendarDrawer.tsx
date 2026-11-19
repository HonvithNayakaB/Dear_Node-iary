import React, { useState } from 'react';
import {
  Search,
  Calendar,
  X,
  Shuffle,
  Tag,
  Smile,
  ArrowRight,
} from 'lucide-react';
import { DiaryEntry, MoodType } from '../types/diary';
import { soundEffects } from '../utils/soundEffects';

interface SearchCalendarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: DiaryEntry[];
  onSelectEntry: (id: string) => void;
  onShuffle: () => void;
}

const MOOD_FILTERS: { type: MoodType; label: string; icon: string }[] = [
  { type: 'happy', label: 'Happy', icon: '😊' },
  { type: 'peaceful', label: 'Peaceful', icon: '🌿' },
  { type: 'excited', label: 'Excited', icon: '✨' },
  { type: 'loved', label: 'Loved', icon: '💖' },
  { type: 'productive', label: 'Productive', icon: '☕' },
  { type: 'grateful', label: 'Grateful', icon: '🌸' },
  { type: 'tired', label: 'Tired', icon: '😴' },
  { type: 'sad', label: 'Gloomy', icon: '🌧️' },
];

export const SearchCalendarDrawer: React.FC<SearchCalendarDrawerProps> = ({
  isOpen,
  onClose,
  entries,
  onSelectEntry,
  onShuffle,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [dateQuery, setDateQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchTerm === '' ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMood = !selectedMood || entry.mood === selectedMood;

    const matchesDate = !dateQuery || entry.date === dateQuery;

    return matchesSearch && matchesMood && matchesDate;
  });

  const handleSelect = (id: string) => {
    soundEffects.playPageFlip();
    onSelectEntry(id);
    onClose();
  };

  const handleRandomShuffle = () => {
    soundEffects.playPageFlip();
    onShuffle();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl h-full shadow-2xl flex flex-col border-l-2 border-accent-100 p-6 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-accent-100">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-accent-100 text-accent-700 rounded-full transition-colors duration-300">
              <Search size={18} />
            </span>
            <h3 className="font-patrick text-2xl text-gray-800">Search & Calendar Jump</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Memory Shuffle Button */}
        <div className="mt-4">
          <button
            onClick={handleRandomShuffle}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-accent-100 via-accent-200 to-accent-100 hover:from-accent-200 hover:to-accent-300 rounded-2xl border border-accent-200 text-accent-700 font-quicksand font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 duration-300"
          >
            <Shuffle size={16} className="text-accent-600" />
            <span>Spin Memory Wheel (Time Machine Shuffle) 🎲</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search memories, thoughts, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-accent-50/50 rounded-xl border border-accent-200 text-xs text-gray-700 font-quicksand focus:outline-none focus:ring-2 focus:ring-accent-300"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Date Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar size={12} className="text-accent-500" />
              Filter by Date
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateQuery}
                onChange={(e) => setDateQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-accent-50/40 rounded-xl border border-accent-200 text-xs text-gray-700 font-quicksand focus:outline-none focus:ring-1 focus:ring-accent-300"
              />
              {dateQuery && (
                <button
                  onClick={() => setDateQuery('')}
                  className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs hover:bg-gray-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Mood Filters */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Smile size={12} className="text-accent-500" />
              Filter by Mood
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOOD_FILTERS.map((m) => (
                <button
                  key={m.type}
                  onClick={() => {
                    soundEffects.playBubblePop();
                    setSelectedMood(selectedMood === m.type ? null : m.type);
                  }}
                  className={`px-2 py-1 rounded-full text-[11px] font-quicksand flex items-center gap-1 transition-all ${
                    selectedMood === m.type
                      ? 'bg-accent-500 text-white shadow-sm font-semibold'
                      : 'bg-gray-100 text-gray-600 hover:bg-accent-50'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="mt-5 flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Matching Memories ({filteredEntries.length})
          </div>

          {filteredEntries.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs font-quicksand italic">
              No memories found matching your search.
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleSelect(entry.id)}
                className="w-full p-3 rounded-2xl bg-white hover:bg-accent-50/50 border border-accent-100 text-left transition-all hover:border-accent-300 shadow-sm flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-quicksand">
                    <span>{entry.date}</span>
                    <span>•</span>
                    <span>{entry.time || '12:00 PM'}</span>
                    {entry.isFavorite && <span className="text-rose-500">💖</span>}
                  </div>
                  <div className="font-patrick text-base font-semibold text-gray-800 truncate mt-0.5">
                    {entry.title || 'Untitled Memory'}
                  </div>
                  <div className="text-xs text-gray-400 font-quicksand truncate mt-0.5">
                    {entry.content}
                  </div>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {entry.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-accent-100 text-accent-700 px-1.5 py-0.2 rounded-md font-quicksand"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-accent-400 group-hover:text-accent-600 group-hover:translate-x-1 transition-all">
                  <ArrowRight size={16} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

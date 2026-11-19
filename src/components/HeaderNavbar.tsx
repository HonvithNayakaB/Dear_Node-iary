import React from 'react';
import {
  Plus,
  Search,
  Shuffle,
  GitCommit,
  Palette,
  Volume2,
  VolumeX,
  BookOpen,
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface HeaderNavbarProps {
  totalMemories: number;
  soundEnabled: boolean;
  onOpenNewEntry: () => void;
  onOpenSearch: () => void;
  onShuffle: () => void;
  onToggleVisualizer: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  totalMemories,
  soundEnabled,
  onOpenNewEntry,
  onOpenSearch,
  onShuffle,
  onToggleVisualizer,
  onOpenSettings,
  onToggleSound,
}) => {
  return (
    <header className="w-full bg-white/75 backdrop-blur-md border-b border-accent-200/70 sticky top-0 z-30 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent-400 to-accent-600 flex items-center justify-center text-white shadow-md shadow-accent-200 transition-all duration-300">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-patrick text-2xl sm:text-3xl font-bold text-gray-800 tracking-wide">
                Dear Node-iary 🌸
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 bg-accent-100 text-accent-700 rounded-full font-quicksand font-bold text-[11px] transition-colors duration-300">
                {totalMemories} {totalMemories === 1 ? 'Memory' : 'Memories'} in Loop
              </span>
            </div>
            <p className="font-quicksand text-[11px] text-gray-400 -mt-1 hidden sm:block">
              A cute, cozy journal powered by a Circular Doubly Linked List
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Sound Mute Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className="p-2 text-gray-500 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-colors"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Search & Calendar */}
          <button
            onClick={() => {
              soundEffects.playBubblePop();
              onOpenSearch();
            }}
            title="Search & Calendar Jump"
            className="p-2 text-gray-500 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-colors"
          >
            <Search size={18} />
          </button>

          {/* Random Memory Shuffle */}
          <button
            onClick={() => {
              soundEffects.playBubblePop();
              onShuffle();
            }}
            title="Memory Time Machine Shuffle (Random Jump)"
            className="p-2 text-gray-500 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-colors hidden sm:block"
          >
            <Shuffle size={18} />
          </button>

          {/* CDLL Inspector Toggle */}
          <button
            onClick={() => {
              soundEffects.playBubblePop();
              onToggleVisualizer();
            }}
            title="Inspect Circular Linked List"
            className="p-2 text-gray-500 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-colors"
          >
            <GitCommit size={18} />
          </button>

          {/* Theme & Settings */}
          <button
            onClick={() => {
              soundEffects.playBubblePop();
              onOpenSettings();
            }}
            title="Themes & Paper Settings"
            className="p-2 text-gray-500 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-colors"
          >
            <Palette size={18} />
          </button>

          {/* Write New Memory Button */}
          <button
            onClick={() => {
              soundEffects.playBubblePop();
              onOpenNewEntry();
            }}
            className="px-4 py-2 bg-gradient-to-r from-accent-400 to-accent-600 hover:from-accent-500 hover:to-accent-700 text-white rounded-full font-quicksand font-bold text-xs shadow-md shadow-accent-200 flex items-center gap-1.5 active:scale-95 transition-all duration-300"
          >
            <Plus size={16} />
            <span>Write Memory</span>
          </button>
        </div>
      </div>
    </header>
  );
};

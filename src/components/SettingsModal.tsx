import React, { useRef } from 'react';
import {
  X,
  Palette,
  Volume2,
  VolumeX,
  Download,
  Upload,
  FileText,
  Type,
  RotateCcw,
} from 'lucide-react';
import { ThemeType, PaperStyle, FontStyle, UserPreferences } from '../types/diary';
import { soundEffects } from '../utils/soundEffects';
import { exportDiaryJson, importDiaryJson, INITIAL_ENTRIES, db } from '../db/diaryDb';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onReloadEntries: () => void;
}

const THEMES: { type: ThemeType; name: string; icon: string; preview: string }[] = [
  {
    type: 'sakura',
    name: 'Sakura Petal',
    icon: '🌸',
    preview: 'bg-gradient-to-r from-pink-300 to-rose-400 border-pink-400',
  },
  {
    type: 'matcha',
    name: 'Matcha Latte',
    icon: '🍵',
    preview: 'bg-gradient-to-r from-emerald-300 to-green-600 border-green-600',
  },
  {
    type: 'cocoa',
    name: 'Cozy Cocoa Cafe',
    icon: '☕',
    preview: 'bg-gradient-to-r from-amber-300 to-amber-700 border-amber-800',
  },
  {
    type: 'lavender',
    name: 'Lavender Haze',
    icon: '💜',
    preview: 'bg-gradient-to-r from-violet-300 to-purple-600 border-purple-500',
  },
  {
    type: 'starlight',
    name: 'Starlight Night',
    icon: '🌌',
    preview: 'bg-gradient-to-r from-slate-700 to-indigo-950 border-indigo-400',
  },
];

const FONTS: { type: FontStyle; name: string; sample: string; className: string }[] = [
  { type: 'caveat', name: 'Caveat (Fluid Script)', sample: 'Dear Node-iary, Today was magical...', className: 'font-caveat text-xl' },
  { type: 'patrick', name: 'Patrick Hand (Cute Marker)', sample: 'Dear Node-iary, Today was magical...', className: 'font-patrick text-lg' },
  { type: 'quicksand', name: 'Quicksand (Clean Modern)', sample: 'Dear Node-iary, Today was magical...', className: 'font-quicksand text-base' },
];

const PAPERS: { type: PaperStyle; name: string; desc: string }[] = [
  { type: 'lined', name: 'Ruled Notebook', desc: 'Classic horizontal lines with margin' },
  { type: 'dotted', name: 'Bullet Journal Grid', desc: 'Minimalist aesthetic dot pattern' },
  { type: 'blank', name: 'Parchment Linen', desc: 'Clean, warm linen paper without lines' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onReloadEntries,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleThemeChange = (theme: ThemeType) => {
    soundEffects.playBubblePop();
    onUpdatePreferences({ ...preferences, theme });
  };

  const handleFontChange = (fontStyle: FontStyle) => {
    soundEffects.playBubblePop();
    onUpdatePreferences({ ...preferences, fontStyle });
  };

  const handlePaperChange = (paperStyle: PaperStyle) => {
    soundEffects.playBubblePop();
    onUpdatePreferences({ ...preferences, paperStyle });
  };

  const handleSoundToggle = () => {
    const nextSoundState = !preferences.soundEnabled;
    soundEffects.setMuted(!nextSoundState);
    if (nextSoundState) {
      soundEffects.playBubblePop();
    }
    onUpdatePreferences({ ...preferences, soundEnabled: nextSoundState });
  };

  const handleExport = async () => {
    try {
      const jsonStr = await exportDiaryJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dear_Node_iary_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      soundEffects.playSaveChime();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const content = evt.target?.result as string;
        if (content) {
          await importDiaryJson(content);
          soundEffects.playSaveChime();
          onReloadEntries();
          onClose();
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Import failed:', err);
      alert('Failed to import backup file. Please verify file format.');
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset diary to default sample memories? Current entries will be replaced.')) {
      await db.entries.clear();
      await db.entries.bulkAdd(INITIAL_ENTRIES);
      soundEffects.playPageFlip();
      onReloadEntries();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-accent-200 p-6 my-8 max-h-[90vh] overflow-y-auto transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-accent-100">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-accent-100 text-accent-700 rounded-full transition-colors duration-300">
              <Palette size={20} />
            </span>
            <h3 className="font-patrick text-2xl text-gray-800">Diary Aesthetics & Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Aesthetic Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Palette size={14} className="text-accent-500" />
              Pastel Color Palettes
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {THEMES.map((th) => (
                <button
                  key={th.type}
                  onClick={() => handleThemeChange(th.type)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                    preferences.theme === th.type
                      ? 'border-accent-500 ring-2 ring-accent-300 bg-accent-50/60 shadow-sm'
                      : 'border-gray-200 hover:border-accent-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{th.icon}</span>
                    <span className={`w-4 h-4 rounded-full border ${th.preview}`} />
                  </div>
                  <span className="font-quicksand text-xs font-semibold text-gray-700">
                    {th.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Handwriting Font Style */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Type size={14} className="text-accent-500" />
              Journal Handwriting Font
            </label>
            <div className="space-y-2">
              {FONTS.map((font) => (
                <button
                  key={font.type}
                  onClick={() => handleFontChange(font.type)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    preferences.fontStyle === font.type
                      ? 'border-accent-500 ring-2 ring-accent-300 bg-accent-50/60 shadow-sm'
                      : 'border-gray-200 hover:border-accent-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="font-quicksand text-xs font-semibold text-gray-700">
                      {font.name}
                    </div>
                    <div className={`text-gray-500 mt-0.5 ${font.className}`}>{font.sample}</div>
                  </div>
                  {preferences.fontStyle === font.type && (
                    <span className="text-accent-600 font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Paper Texture Style */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileText size={14} className="text-accent-500" />
              Book Paper Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PAPERS.map((paper) => (
                <button
                  key={paper.type}
                  onClick={() => handlePaperChange(paper.type)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    preferences.paperStyle === paper.type
                      ? 'border-accent-500 ring-2 ring-accent-300 bg-accent-50/60 shadow-sm'
                      : 'border-gray-200 hover:border-accent-200 bg-white'
                  }`}
                >
                  <div className="font-quicksand text-xs font-semibold text-gray-700">
                    {paper.name}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5 font-quicksand">
                    {paper.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="bg-accent-50/40 p-4 rounded-2xl border border-accent-100 flex items-center justify-between transition-colors duration-300">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-accent-100 text-accent-700 rounded-xl transition-colors duration-300">
                {preferences.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </span>
              <div>
                <div className="font-quicksand text-sm font-semibold text-gray-800">
                  Aesthetic Sound Effects
                </div>
                <div className="text-xs text-gray-500 font-quicksand">
                  Paper page-turn, camera shutter click, pencil scribbles
                </div>
              </div>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                preferences.soundEnabled ? 'bg-accent-500 justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Data Backup & Restore */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
              Data Safety & Backup (100% Offline & Private)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="p-3 bg-white hover:bg-accent-50/50 border border-accent-200 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 transition-colors shadow-sm"
              >
                <Download size={16} className="text-accent-500" />
                Export Backup (.json)
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white hover:bg-accent-50/50 border border-accent-200 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 transition-colors shadow-sm"
              >
                <Upload size={16} className="text-accent-500" />
                Restore from Backup
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>

            <div className="mt-3 text-center">
              <button
                onClick={handleResetDefaults}
                className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-1 mx-auto transition-colors"
              >
                <RotateCcw size={12} /> Reset to starter sample entries
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-accent-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-accent-400 to-accent-600 hover:from-accent-500 hover:to-accent-700 text-white rounded-full text-sm font-semibold shadow-md shadow-accent-200 transition-all active:scale-95 duration-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

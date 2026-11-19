import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Smile,
  CloudSun,
  Sparkles,
  Save,
  Tag,
  Calendar,
  Clock,
  Trash2,
} from 'lucide-react';
import { DiaryEntry, DiaryPhoto, MoodType, WeatherType } from '../types/diary';
import { CameraCaptureModal } from './CameraCaptureModal';
import { soundEffects } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

interface EntryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: DiaryEntry) => void;
  initialEntry?: DiaryEntry | null;
}

const MOODS: { type: MoodType; label: string; icon: string; color: string }[] = [
  { type: 'happy', label: 'Happy', icon: '😊', color: 'bg-amber-100 text-amber-800' },
  { type: 'peaceful', label: 'Peaceful', icon: '🌿', color: 'bg-emerald-100 text-emerald-800' },
  { type: 'excited', label: 'Excited', icon: '✨', color: 'bg-pink-100 text-pink-800' },
  { type: 'loved', label: 'Loved', icon: '💖', color: 'bg-rose-100 text-rose-800' },
  { type: 'productive', label: 'Productive', icon: '☕', color: 'bg-orange-100 text-orange-800' },
  { type: 'grateful', label: 'Grateful', icon: '🌸', color: 'bg-purple-100 text-purple-800' },
  { type: 'tired', label: 'Tired', icon: '😴', color: 'bg-blue-100 text-blue-800' },
  { type: 'sad', label: 'Gloomy', icon: '🌧️', color: 'bg-slate-100 text-slate-800' },
];

const WEATHERS: { type: WeatherType; label: string; icon: string }[] = [
  { type: 'sunny', label: 'Sunny', icon: '☀️' },
  { type: 'cloudy', label: 'Cloudy', icon: '⛅' },
  { type: 'rainy', label: 'Rainy', icon: '🌧️' },
  { type: 'snowy', label: 'Snowy', icon: '❄️' },
  { type: 'windy', label: 'Windy', icon: '🍃' },
  { type: 'night', label: 'Clear Night', icon: '🌙' },
];

const STICKER_PALETTE = ['🌸', '✨', '🌿', '💖', '☕', '🎀', '⭐', '🐾', '🍰', '🍓', '🧸', '🌈'];

export const EntryEditorModal: React.FC<EntryEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry,
}) => {
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [mood, setMood] = useState<MoodType>('happy');
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [photos, setPhotos] = useState<DiaryPhoto[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (initialEntry) {
        setDate(initialEntry.date);
        setTime(initialEntry.time || '12:00 PM');
        setTitle(initialEntry.title);
        setContent(initialEntry.content);
        setMood(initialEntry.mood);
        setWeather(initialEntry.weather);
        setPhotos(initialEntry.photos || []);
        setTags(initialEntry.tags || []);
      } else {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);

        const formattedTime = today.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        setTime(formattedTime);

        setTitle('');
        setContent('');
        setMood('happy');
        setWeather('sunny');
        setPhotos([]);
        setTags([]);
      }
    }
  }, [isOpen, initialEntry]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    soundEffects.playBubblePop();

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const newPhoto: DiaryPhoto = {
            id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            dataUrl,
            caption: '',
            rotation: (Math.random() - 0.5) * 8, // slight tilt between -4 and +4
            timestamp: Date.now(),
          };
          setPhotos((prev) => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCameraCapture = (dataUrl: string) => {
    const newPhoto: DiaryPhoto = {
      id: 'photo-cam-' + Date.now(),
      dataUrl,
      caption: 'Captured with Polaroid Studio 📸',
      rotation: (Math.random() - 0.5) * 8,
      timestamp: Date.now(),
    };
    setPhotos((prev) => [...prev, newPhoto]);
  };

  const removePhoto = (id: string) => {
    soundEffects.playBubblePop();
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePhotoCaption = (id: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
      soundEffects.playBubblePop();
    }
  };

  const removeTag = (tagToRemove: string) => {
    soundEffects.playBubblePop();
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    soundEffects.playSaveChime();

    // Trigger celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#fda4b8', '#f43f6e', '#a6bea6', '#c6bfe4', '#f5efe6'],
    });

    const now = Date.now();
    const entryDate = date || new Date().toISOString().slice(0, 10);
    const entryTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    // Build timestamp from date and time
    const dateTimeParsed = new Date(`${entryDate} ${entryTime}`);
    const createdAt = initialEntry?.createdAt || (!isNaN(dateTimeParsed.getTime()) ? dateTimeParsed.getTime() : now);

    const savedEntry: DiaryEntry = {
      id: initialEntry?.id || 'entry-' + now + '-' + Math.random().toString(36).substr(2, 5),
      date: entryDate,
      time: entryTime,
      createdAt,
      updatedAt: now,
      title: title.trim() || 'Untitled Reflection 🌸',
      content: content.trim(),
      mood,
      weather,
      photos,
      stickers: initialEntry?.stickers || [],
      tags,
      isFavorite: initialEntry?.isFavorite || false,
      paperStyle: initialEntry?.paperStyle || 'lined',
    };

    onSave(savedEntry);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-sakura-50/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-white p-6 my-8 max-h-[90vh] overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌸</span>
              <h2 className="font-patrick text-3xl text-gray-800">
                {initialEntry ? 'Edit Memory' : 'Dear Node-iary, Today...'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/80 transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5 flex-1">
            {/* Date & Time Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/70 p-4 rounded-2xl border border-pink-100 shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar size={14} className="text-pink-500" />
                  Memory Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-pink-50/50 rounded-xl border border-pink-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 font-quicksand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock size={14} className="text-pink-500" />
                  Time / Part
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:30 AM or Morning"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-pink-50/50 rounded-xl border border-pink-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 font-quicksand"
                />
              </div>
            </div>

            {/* Mood & Weather Pills */}
            <div className="space-y-3 bg-white/70 p-4 rounded-2xl border border-pink-100 shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Smile size={14} className="text-pink-500" />
                  Today's Mood
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.type}
                      type="button"
                      onClick={() => {
                        soundEffects.playBubblePop();
                        setMood(m.type);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                        mood === m.type
                          ? 'ring-2 ring-pink-500 scale-105 shadow-sm font-semibold ' + m.color
                          : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-pink-50">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CloudSun size={14} className="text-pink-500" />
                  Weather
                </label>
                <div className="flex flex-wrap gap-2">
                  {WEATHERS.map((w) => (
                    <button
                      key={w.type}
                      type="button"
                      onClick={() => {
                        soundEffects.playBubblePop();
                        setWeather(w.type);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                        weather === w.type
                          ? 'bg-pink-100 text-pink-700 ring-2 ring-pink-400 font-semibold'
                          : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      <span>{w.icon}</span>
                      <span>{w.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title & Content */}
            <div className="space-y-2 bg-white/90 p-4 rounded-2xl border border-pink-100 shadow-sm">
              <input
                type="text"
                placeholder="Give this memory a cute title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 font-patrick text-2xl text-gray-800 placeholder-gray-400 bg-transparent border-b border-pink-100 focus:outline-none focus:border-pink-400"
              />

              <textarea
                placeholder="Write whatever is on your heart today... (Memories loop forever in our linked list 🌸)"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 font-caveat text-xl text-gray-700 placeholder-gray-400 bg-amber-50/20 rounded-xl border border-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none leading-relaxed"
              />
            </div>

            {/* Photos & Camera Studio */}
            <div className="bg-white/70 p-4 rounded-2xl border border-pink-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-pink-500" />
                  Polaroid Scrapbook Photos ({photos.length})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Camera size={14} /> Snap Polaroid
                  </button>
                  <label className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors">
                    <ImageIcon size={14} /> From Gallery
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative bg-white p-2 rounded-xl shadow-md border border-gray-100 group"
                    >
                      <img
                        src={photo.dataUrl}
                        alt="memory"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Add caption..."
                        value={photo.caption || ''}
                        onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                        className="mt-1 w-full text-[11px] font-caveat text-gray-600 bg-transparent border-b border-gray-200 focus:outline-none focus:border-pink-400 px-1"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600 opacity-90 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-quicksand italic py-2 text-center">
                  No photos added yet. Snap a live photo or upload from your device!
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white/70 p-4 rounded-2xl border border-pink-100 shadow-sm space-y-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={14} className="text-pink-500" />
                Tags
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. coffee, sunshine (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-pink-50/50 rounded-xl border border-pink-200 text-xs font-quicksand focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-medium"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-quicksand flex items-center gap-1"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="hover:text-pink-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit / Cancel Footer */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 font-quicksand text-sm hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-7 py-2.5 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white rounded-full font-quicksand font-semibold text-sm shadow-md shadow-pink-200 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Save size={16} />
                Save Memory to CDLL 🌸
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Live Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
};

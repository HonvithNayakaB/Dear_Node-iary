import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Printer,
  Camera,
  Tag,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { DiaryNode } from '../dsa/CircularDoublyLinkedList';
import { DiaryEntry, UserPreferences } from '../types/diary';
import { soundEffects } from '../utils/soundEffects';

interface BookSpreadProps {
  currentNode: DiaryNode<DiaryEntry> | null;
  currentIndex: number;
  totalCount: number;
  preferences: UserPreferences;
  onPrev: () => void;
  onNext: () => void;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenAddModal: () => void;
}

const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊 Happy',
  peaceful: '🌿 Peaceful',
  excited: '✨ Excited',
  loved: '💖 Loved',
  productive: '☕ Productive',
  grateful: '🌸 Grateful',
  tired: '😴 Tired',
  sad: '🌧️ Gloomy',
};

const WEATHER_EMOJIS: Record<string, string> = {
  sunny: '☀️ Sunny',
  cloudy: '⛅ Cloudy',
  rainy: '🌧️ Rainy',
  snowy: '❄️ Snowy',
  windy: '🍃 Windy',
  night: '🌙 Clear Night',
};

export const BookSpread: React.FC<BookSpreadProps> = ({
  currentNode,
  currentIndex,
  totalCount,
  preferences,
  onPrev,
  onNext,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenAddModal,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  if (!currentNode) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center p-10 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border-4 border-accent-200 max-w-md">
          <div className="text-6xl mb-4">📖🌸</div>
          <h2 className="font-patrick text-3xl text-gray-800 mb-2">Your Diary is Waiting...</h2>
          <p className="font-quicksand text-sm text-gray-500 mb-6">
            There are no entries in the circular linked list yet. Write your very first memory today!
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-6 py-3 bg-gradient-to-r from-accent-400 to-accent-600 hover:from-accent-500 hover:to-accent-700 text-white font-quicksand font-bold text-sm rounded-full shadow-lg shadow-accent-200 transition-transform active:scale-95"
          >
            Write First Memory 🌸
          </button>
        </div>
      </div>
    );
  }

  const entry = currentNode.data;
  const photos = entry.photos || [];
  const currentPhoto = photos[activePhotoIndex] || photos[0];

  const paperClass =
    preferences.paperStyle === 'dotted'
      ? 'paper-dotted'
      : preferences.paperStyle === 'blank'
      ? 'paper-blank'
      : 'paper-lined';

  const fontClass =
    preferences.fontStyle === 'patrick'
      ? 'font-patrick'
      : preferences.fontStyle === 'quicksand'
      ? 'font-quicksand'
      : 'font-caveat';

  const handlePrint = () => {
    soundEffects.playBubblePop();
    window.print();
  };

  const handleDeleteEntry = () => {
    if (window.confirm('Are you sure you want to delete this memory from the linked list?')) {
      soundEffects.playCrumple();
      onDelete(entry.id);
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto flex items-center justify-center py-4 px-2 sm:px-6">
      {/* Outer Left Navigation Bookmark Ribbon */}
      <button
        onClick={onPrev}
        title="Previous Memory (node.prev)"
        className="absolute -left-3 sm:-left-6 z-20 group p-3 bg-white/90 hover:bg-accent-50 text-accent-600 rounded-full shadow-xl border-2 border-accent-200 transition-all hover:scale-110 active:scale-95 duration-200"
      >
        <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Outer Right Navigation Bookmark Ribbon */}
      <button
        onClick={onNext}
        title="Next Memory (node.next)"
        className="absolute -right-3 sm:-right-6 z-20 group p-3 bg-white/90 hover:bg-accent-50 text-accent-600 rounded-full shadow-xl border-2 border-accent-200 transition-all hover:scale-110 active:scale-95 duration-200"
      >
        <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* The Open 2-Page Book Container with Theme Cover & Stitching */}
      <div className="w-full bg-book-cover p-3 sm:p-5 rounded-[36px] shadow-book border-8 border-book-border relative overflow-hidden transition-colors duration-500">
        {/* Book Cover Edge Stitching Visuals */}
        <div className="absolute inset-2 border-2 border-dashed border-book-stitch rounded-[28px] pointer-events-none opacity-70 transition-colors duration-500" />

        {/* 2 Pages Spread */}
        <div className="grid grid-cols-1 md:grid-cols-2 rounded-[24px] overflow-hidden shadow-2xl bg-book-page text-book-text min-h-[580px] sm:min-h-[640px] relative transition-colors duration-500">
          
          {/* ================= LEFT PAGE: Scrapbook, Polaroids & Mood ================= */}
          <div className="book-left-spine p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-accent-200/40 relative">
            
            {/* Top Date Header & Favorite */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-accent-100">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-accent-100 text-accent-700 rounded-xl transition-colors duration-300">
                    <Calendar size={16} />
                  </span>
                  <div>
                    <div className="font-patrick text-xl font-bold">
                      {entry.date}
                    </div>
                    <div className="text-[11px] font-quicksand opacity-60 flex items-center gap-1">
                      <Clock size={11} /> {entry.time || '12:00 PM'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEffects.playBubblePop();
                      onToggleFavorite(entry.id);
                    }}
                    title={entry.isFavorite ? 'Favorited Memory' : 'Add to Favorites'}
                    className={`p-2 rounded-full transition-transform active:scale-90 ${
                      entry.isFavorite
                        ? 'text-rose-500 bg-rose-50 shadow-sm'
                        : 'opacity-40 hover:opacity-100 hover:text-rose-400 hover:bg-accent-50'
                    }`}
                  >
                    <Heart size={20} fill={entry.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Mood & Weather Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="px-3 py-1 bg-accent-50 border border-accent-200 text-accent-700 rounded-full text-xs font-quicksand font-semibold shadow-xs transition-colors duration-300">
                  {MOOD_EMOJIS[entry.mood] || '😊 Happy'}
                </span>
                <span className="px-3 py-1 bg-accent-50/60 border border-accent-200/80 text-accent-700 rounded-full text-xs font-quicksand font-semibold shadow-xs transition-colors duration-300">
                  {WEATHER_EMOJIS[entry.weather] || '☀️ Sunny'}
                </span>
              </div>
            </div>

            {/* Central Polaroid Photo Display */}
            <div className="my-6 flex-1 flex flex-col items-center justify-center">
              {currentPhoto ? (
                <div className="relative group w-full max-w-[280px]">
                  {/* Decorative Washi Tape (Styled dynamically by theme in CSS) */}
                  <div className="washi-tape" />

                  {/* Polaroid Card */}
                  <div
                    style={{
                      transform: `rotate(${currentPhoto.rotation || 0}deg)`,
                      transition: 'transform 0.3s ease',
                    }}
                    className="bg-white p-3 pb-5 rounded-2xl shadow-polaroid border border-gray-100 flex flex-col items-center"
                  >
                    <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                      <img
                        src={currentPhoto.dataUrl}
                        alt="memory snapshot"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                    {currentPhoto.caption && (
                      <p className="mt-2.5 font-caveat text-lg text-gray-700 text-center font-medium line-clamp-2 px-1">
                        {currentPhoto.caption}
                      </p>
                    )}
                  </div>

                  {/* Photo Switcher Dots if multiple photos */}
                  {photos.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-4">
                      {photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            soundEffects.playBubblePop();
                            setActivePhotoIndex(idx);
                          }}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            activePhotoIndex === idx
                              ? 'bg-accent-500 scale-125 ring-2 ring-accent-200'
                              : 'bg-gray-300 hover:bg-accent-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Empty Photo Placeholder with scrapbook look */
                <div
                  onClick={() => onEdit(entry)}
                  className="w-full max-w-[280px] p-6 rounded-2xl border-2 border-dashed border-accent-200 bg-accent-50/40 hover:bg-accent-50/80 text-center cursor-pointer transition-colors flex flex-col items-center justify-center group duration-300"
                >
                  <span className="p-3 bg-accent-100 text-accent-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Camera size={22} />
                  </span>
                  <span className="font-patrick text-lg">Add a Polaroid Snapshot</span>
                  <span className="font-quicksand text-xs opacity-60 mt-1">
                    Click to attach photos or snap a photo with your webcam!
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Scrapbook Stickers & Page Number Footer */}
            <div className="pt-3 border-t border-accent-100/60 flex items-center justify-between text-xs font-quicksand opacity-70">
              <div className="flex items-center gap-1.5">
                {entry.stickers && entry.stickers.length > 0 ? (
                  entry.stickers.map((stk) => (
                    <span key={stk.id} className="text-xl" title="Scrapbook sticker">
                      {stk.emoji}
                    </span>
                  ))
                ) : (
                  <span className="text-lg">🌸 🎀</span>
                )}
              </div>

              <div className="text-[11px] font-semibold">
                Page {currentIndex * 2 + 1}
              </div>
            </div>
          </div>

          {/* ================= CENTER REALISTIC BOOK CREASE ================= */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[24px] -translate-x-1/2 pointer-events-none book-spine-shadow z-10" />

          {/* ================= RIGHT PAGE: Written Journal & Actions ================= */}
          <div
            className={`book-right-spine p-6 sm:p-8 flex flex-col justify-between ${paperClass} relative`}
          >
            {/* Top Memory Ribbon & Loop Info */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-accent-100/50 text-xs font-quicksand">
                <div className="flex items-center gap-1.5 text-accent-600 font-semibold">
                  <Sparkles size={14} />
                  <span>
                    Memory {currentIndex + 1} of {totalCount}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] opacity-60">
                  <LinkIcon size={12} className="text-accent-500" />
                  <span>Loops to next memory</span>
                </div>
              </div>

              {/* Journal Entry Title */}
              <h1 className="mt-4 font-patrick text-3xl sm:text-4xl tracking-wide leading-tight">
                {entry.title || 'Untitled Reflection'}
              </h1>

              {/* Journal Body Content */}
              <div
                className={`mt-4 ${fontClass} text-xl sm:text-2xl whitespace-pre-wrap leading-relaxed max-h-[340px] overflow-y-auto pr-2 opacity-90`}
              >
                {entry.content}
              </div>
            </div>

            {/* Bottom Tags, Action Buttons & Page Number */}
            <div className="mt-6 pt-4 border-t border-accent-100/80">
              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-0.5 bg-accent-100/80 text-accent-700 rounded-full font-quicksand flex items-center gap-1 transition-colors duration-300"
                    >
                      <Tag size={10} />
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(entry)}
                    title="Edit Memory (Update & Chronologically Reorder)"
                    className="p-2 rounded-xl text-gray-500 hover:text-accent-700 hover:bg-accent-100/70 transition-colors flex items-center gap-1 text-xs font-quicksand font-semibold"
                  >
                    <Edit3 size={15} /> Edit
                  </button>

                  <button
                    onClick={handleDeleteEntry}
                    title="Delete Memory from CDLL"
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-quicksand"
                  >
                    <Trash2 size={15} /> Delete
                  </button>

                  <button
                    onClick={handlePrint}
                    title="Print or Save Page as PDF"
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Printer size={15} />
                  </button>
                </div>

                <div className="text-[11px] font-semibold font-quicksand opacity-60">
                  Page {currentIndex * 2 + 2}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

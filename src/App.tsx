import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CircularDoublyLinkedList, DiaryNode } from './dsa/CircularDoublyLinkedList';
import { DiaryEntry, UserPreferences } from './types/diary';
import {
  initDatabase,
  saveEntryToDb,
  deleteEntryFromDb,
  getPreferencesFromDb,
  savePreferencesToDb,
} from './db/diaryDb';
import { soundEffects } from './utils/soundEffects';
import { HeaderNavbar } from './components/HeaderNavbar';
import { BookSpread } from './components/BookSpread';
import { CdllVisualizer } from './components/CdllVisualizer';
import { EntryEditorModal } from './components/EntryEditorModal';
import { SettingsModal } from './components/SettingsModal';
import { SearchCalendarDrawer } from './components/SearchCalendarDrawer';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const cdll = useMemo(() => new CircularDoublyLinkedList<DiaryEntry>(), []);

  const [currentNode, setCurrentNode] = useState<DiaryNode<DiaryEntry> | null>(null);
  const [entriesVersion, setEntriesVersion] = useState<number>(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'sakura',
    paperStyle: 'lined',
    fontStyle: 'caveat',
    soundEnabled: true,
    ambientSound: false,
  });

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState<boolean>(true);

  // Circular loop notification toast
  const [loopToast, setLoopToast] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const prefs = await getPreferencesFromDb();
      setPreferences(prefs);
      soundEffects.setMuted(!prefs.soundEnabled);

      const loadedEntries = await initDatabase();
      cdll.fromArray(loadedEntries);
      setEntriesVersion((v) => v + 1);

      if (cdll.tail) {
        setCurrentNode(cdll.tail);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    }
  }, [cdll]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize theme on document body
  useEffect(() => {
    document.body.setAttribute('data-theme', preferences.theme);
  }, [preferences.theme]);

  const handleNext = useCallback(() => {
    if (!currentNode || cdll.isEmpty) return;

    soundEffects.playPageFlip();

    if (currentNode === cdll.tail && cdll.size > 1) {
      triggerLoopToast('🌸 Looping from your newest memory back to your very first day!');
    }

    setCurrentNode(currentNode.next);
  }, [currentNode, cdll]);

  const handlePrev = useCallback(() => {
    if (!currentNode || cdll.isEmpty) return;

    soundEffects.playPageFlip();

    if (currentNode === cdll.head && cdll.size > 1) {
      triggerLoopToast('✨ Looping from your first memory around to your latest reflection!');
    }

    setCurrentNode(currentNode.prev);
  }, [currentNode, cdll]);

  const triggerLoopToast = (msg: string) => {
    setLoopToast(msg);
    setTimeout(() => {
      setLoopToast((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const handleSaveEntry = async (entry: DiaryEntry) => {
    const isNew = !cdll.findById(entry.id);

    let node: DiaryNode<DiaryEntry> | null;
    if (isNew) {
      node = cdll.insertChronological(entry);
    } else {
      node = cdll.updateEntry(entry.id, entry);
    }

    await saveEntryToDb(entry);

    setEntriesVersion((v) => v + 1);
    if (node) {
      setCurrentNode(node);
    }
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (id: string) => {
    const targetNode = cdll.findById(id);
    if (!targetNode) return;

    const nextToFocus = targetNode.next !== targetNode ? targetNode.next : null;

    cdll.deleteById(id);
    await deleteEntryFromDb(id);

    setEntriesVersion((v) => v + 1);
    setCurrentNode(nextToFocus);
  };

  const handleToggleFavorite = async (id: string) => {
    const node = cdll.findById(id);
    if (!node) return;

    const newFavorite = !node.data.isFavorite;
    const updated = { ...node.data, isFavorite: newFavorite };
    node.data = updated;

    await saveEntryToDb(updated);
    setEntriesVersion((v) => v + 1);
  };

  const handleShuffle = () => {
    if (cdll.isEmpty || !cdll.head) return;
    const all = cdll.toArray();
    const randomIndex = Math.floor(Math.random() * all.length);
    const chosen = all[randomIndex];
    const node = cdll.findById(chosen.id);
    if (node) {
      soundEffects.playPageFlip();
      setCurrentNode(node);
      triggerLoopToast(`🎲 Time Machine landed on ${node.data.date}!`);
    }
  };

  const handleToggleSound = async () => {
    const nextState = !preferences.soundEnabled;
    const updatedPrefs = { ...preferences, soundEnabled: nextState };
    soundEffects.setMuted(!nextState);
    if (nextState) {
      soundEffects.playBubblePop();
    }
    setPreferences(updatedPrefs);
    await savePreferencesToDb(updatedPrefs);
  };

  const currentIndex = useMemo(() => {
    if (!currentNode || cdll.isEmpty) return 0;
    const arr = cdll.toArray();
    const idx = arr.findIndex((item) => item.id === currentNode.data.id);
    return idx >= 0 ? idx : 0;
  }, [currentNode, cdll, entriesVersion]);

  return (
    <div className="min-h-screen flex flex-col font-quicksand pb-24 sm:pb-32 transition-colors duration-500">
      {/* Top Navigation Bar */}
      <HeaderNavbar
        totalMemories={cdll.size}
        soundEnabled={preferences.soundEnabled}
        onOpenNewEntry={() => {
          setEditingEntry(null);
          setIsEditorOpen(true);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onShuffle={handleShuffle}
        onToggleVisualizer={() => setIsVisualizerOpen((prev) => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSound={handleToggleSound}
      />

      {/* Circular Wrap Toast Banner */}
      {loopToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-5 py-2.5 rounded-full shadow-xl shadow-accent-200/80 font-quicksand font-bold text-xs sm:text-sm flex items-center gap-2 animate-bounce">
          <Sparkles size={16} />
          <span>{loopToast}</span>
        </div>
      )}

      {/* Main Open 2-Page Book Experience */}
      <main className="flex-1 flex flex-col items-center justify-center py-6 px-3">
        <BookSpread
          currentNode={currentNode}
          currentIndex={currentIndex}
          totalCount={cdll.size}
          preferences={preferences}
          onPrev={handlePrev}
          onNext={handleNext}
          onEdit={(entry) => {
            soundEffects.playBubblePop();
            setEditingEntry(entry);
            setIsEditorOpen(true);
          }}
          onDelete={handleDeleteEntry}
          onToggleFavorite={handleToggleFavorite}
          onOpenAddModal={() => {
            setEditingEntry(null);
            setIsEditorOpen(true);
          }}
        />
      </main>

      {/* Bottom Circular Doubly Linked List Inspector Drawer */}
      <CdllVisualizer
        head={cdll.head}
        tail={cdll.tail}
        currentNode={currentNode}
        size={cdll.size}
        isOpen={isVisualizerOpen}
        onToggle={() => setIsVisualizerOpen((prev) => !prev)}
        onSelectNode={(node) => {
          soundEffects.playPageFlip();
          setCurrentNode(node);
        }}
      />

      {/* Entry Editor Modal (Create or Edit) */}
      <EntryEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        initialEntry={editingEntry}
      />

      {/* Settings & Theme Customizer Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={async (prefs) => {
          setPreferences(prefs);
          await savePreferencesToDb(prefs);
        }}
        onReloadEntries={loadData}
      />

      {/* Search & Calendar Navigation Drawer */}
      <SearchCalendarDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        entries={cdll.toArray()}
        onSelectEntry={(id) => {
          const node = cdll.findById(id);
          if (node) {
            setCurrentNode(node);
          }
        }}
        onShuffle={handleShuffle}
      />
    </div>
  );
};

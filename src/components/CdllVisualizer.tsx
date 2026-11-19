import React from 'react';
import {
  GitCommit,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Link,
  Info,
} from 'lucide-react';
import { DiaryNode } from '../dsa/CircularDoublyLinkedList';
import { DiaryEntry } from '../types/diary';
import { soundEffects } from '../utils/soundEffects';

interface CdllVisualizerProps {
  head: DiaryNode<DiaryEntry> | null;
  tail: DiaryNode<DiaryEntry> | null;
  currentNode: DiaryNode<DiaryEntry> | null;
  size: number;
  isOpen: boolean;
  onToggle: () => void;
  onSelectNode: (node: DiaryNode<DiaryEntry>) => void;
}

export const CdllVisualizer: React.FC<CdllVisualizerProps> = ({
  head,
  tail,
  currentNode,
  size,
  isOpen,
  onToggle,
  onSelectNode,
}) => {
  // Collect all nodes in array form for visual rendering
  const nodes: DiaryNode<DiaryEntry>[] = [];
  if (head && size > 0) {
    let curr = head;
    for (let i = 0; i < size; i++) {
      nodes.push(curr);
      curr = curr.next;
    }
  }

  const handleNodeClick = (node: DiaryNode<DiaryEntry>) => {
    soundEffects.playBubblePop();
    onSelectNode(node);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-42px)]'
      }`}
    >
      {/* Toggle Pill Bar */}
      <div className="flex justify-center">
        <button
          onClick={onToggle}
          className="px-6 py-2 bg-white/95 backdrop-blur-md rounded-t-2xl shadow-lg border-t-2 border-x-2 border-pink-200 text-pink-600 font-quicksand font-bold text-xs flex items-center gap-2 hover:bg-pink-50 transition-colors"
        >
          <GitCommit size={16} className="text-pink-500 animate-spin-slow" />
          <span>Under The Hood: Circular Doubly Linked List Inspector</span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Main Drawer Body */}
      <div className="bg-white/95 backdrop-blur-xl border-t-2 border-pink-200 shadow-2xl p-4 sm:p-5 text-gray-800">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Header Stats & Algorithm Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-quicksand">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full font-semibold">
                Size: {size} {size === 1 ? 'Node' : 'Nodes'}
              </span>
              {head && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                  Head (Oldest): <strong>{head.data.date}</strong>
                </span>
              )}
              {tail && (
                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full">
                  Tail (Newest): <strong>{tail.data.date}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-gray-500 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
                Active Node
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                Head
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
                Tail
              </span>
              <span className="flex items-center gap-1">
                <Link size={12} className="text-pink-400" />
                Circular Pointer Loop
              </span>
            </div>
          </div>

          {/* Ribbon Nodes Reel */}
          <div className="relative py-4 px-2 overflow-x-auto">
            {nodes.length === 0 ? (
              <div className="text-center py-6 text-gray-400 italic font-quicksand text-xs">
                The linked list is currently empty. Write your first memory!
              </div>
            ) : (
              <div className="flex items-center justify-start sm:justify-center min-w-max gap-3 py-2">
                {nodes.map((node, index) => {
                  const isActive = currentNode === node;
                  const isHead = node === head;
                  const isTail = node === tail;

                  return (
                    <React.Fragment key={node.data.id}>
                      {/* Node Card / Charm */}
                      <button
                        onClick={() => handleNodeClick(node)}
                        className={`relative group px-4 py-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center ${
                          isActive
                            ? 'bg-gradient-to-b from-pink-50 to-rose-100 border-pink-500 shadow-lg shadow-pink-200 scale-105 ring-2 ring-pink-400'
                            : 'bg-white border-gray-200 hover:border-pink-300 hover:bg-pink-50/40 shadow-sm'
                        }`}
                      >
                        {/* Status Badges */}
                        <div className="flex items-center gap-1 mb-1">
                          {isHead && (
                            <span className="text-[10px] uppercase font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-md">
                              HEAD
                            </span>
                          )}
                          {isTail && (
                            <span className="text-[10px] uppercase font-bold bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded-md">
                              TAIL
                            </span>
                          )}
                        </div>

                        {/* Title & Date */}
                        <span className="font-patrick text-base font-semibold text-gray-800 truncate max-w-[120px]">
                          {node.data.title || 'Untitled'}
                        </span>
                        <span className="font-quicksand text-xs text-gray-500 font-medium">
                          {node.data.date}
                        </span>
                        <span className="font-quicksand text-[10px] text-gray-400">
                          {node.data.time || '12:00 PM'}
                        </span>

                        {/* Active Reading Marker */}
                        {isActive && (
                          <div className="absolute -top-3 bg-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                            <Sparkles size={10} /> Reading
                          </div>
                        )}
                      </button>

                      {/* Bidirectional Pointer Arrows between nodes */}
                      {index < nodes.length - 1 && (
                        <div className="flex flex-col items-center justify-center text-pink-400 px-1">
                          <div className="flex items-center text-[10px] font-mono text-gray-400 gap-0.5">
                            <ArrowRight size={14} className="text-pink-400" />
                          </div>
                          <div className="w-8 h-[2px] bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300 my-0.5" />
                          <div className="flex items-center text-[10px] font-mono text-gray-400 gap-0.5">
                            <ArrowLeft size={14} className="text-pink-400" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Circular Wrap Ribbon linking Tail back to Head */}
                {nodes.length > 1 && (
                  <div className="flex flex-col items-center justify-center px-3 py-1 bg-pink-100/60 rounded-xl border border-dashed border-pink-300 text-pink-700 text-[11px] font-quicksand">
                    <div className="flex items-center gap-1 font-semibold">
                      <Link size={12} />
                      <span>Circular Loop</span>
                    </div>
                    <span className="text-[10px] text-pink-600">
                      tail.next → head
                    </span>
                    <span className="text-[10px] text-pink-600">
                      head.prev ← tail
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Node Pointer Inspector Details */}
          {currentNode && (
            <div className="bg-pink-50/50 rounded-2xl p-3 border border-pink-100 flex flex-wrap items-center justify-between gap-3 text-xs font-quicksand">
              <div className="flex items-center gap-2 text-gray-600">
                <Info size={14} className="text-pink-500" />
                <span>
                  <strong>Active Node Pointers:</strong> prev points to{' '}
                  <span className="text-pink-600 font-semibold underline decoration-pink-300">
                    [{currentNode.prev.data.date} {currentNode.prev.data.time}]
                  </span>
                  , next points to{' '}
                  <span className="text-pink-600 font-semibold underline decoration-pink-300">
                    [{currentNode.next.data.date} {currentNode.next.data.time}]
                  </span>
                </span>
              </div>

              <div className="text-[11px] text-gray-400 italic">
                Chronological order maintained ($O(1)$ append / $O(N)$ middle insert)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

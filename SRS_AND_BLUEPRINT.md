# Software Requirements Specification (SRS) & Architecture Blueprint
# Project: "Dear Node-iary" 🌸📖
*A cute, aesthetic, customizable diary web application powered by a Circular Doubly Linked List.*

---

## 1. Executive Summary & Vision

**"Dear Node-iary"** is a whimsical, aesthetic personal journaling web application that marries intimate, cozy daily writing with fundamental Computer Science data structures. 

At its heart, every diary entry represents a **Node** within an active **Circular Doubly Linked List (CDLL)**. Whether navigating backward and forward through cherished memories without hitting a dead end, seamlessly backfilling a forgotten journal entry from three months ago, or watching memory pointers reconnect in real time, the application provides both emotional comfort and technical elegance.

---

## 2. System Architecture & Tech Stack Evaluation

### 2.1 Recommended Tech Stack

| Layer | Recommended Technology | Why It Fits Best |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18+ with TypeScript** + **Vite** | Blazing-fast development, strict type safety for pointer manipulation (`Node<DiaryEntry>`), component-driven modularity. |
| **Styling & Design System** | **Tailwind CSS + CSS Modules** | Rapid styling, simple dynamic theming (custom CSS variables for pastel palettes), responsive layout. |
| **Animation Engine** | **Framer Motion** | Silky-smooth page-flip animations, polaroid popups, sticker drag-and-drop, and circular carousel transitions. |
| **Local Storage / Persistence** | **Dexie.js (IndexedDB)** *(with optional LocalStorage fallback)* | Diaries are deeply personal. Storing entries and captured images directly in browser IndexedDB ensures zero server costs, total privacy, offline capability, and high storage capacity (hundreds of MBs for photos). |
| **Optional Backend (If Sync/Auth Needed)** | **Node.js (Express / Fastify) + SQLite (Prisma ORM)** | Lightweight, file-based database, ideal for single-user or multi-user accounts if cloud sync is preferred over local-first. |
| **Media & Camera Access** | **HTML5 MediaDevices API (`getUserMedia`) & File API** | Direct webcam snapshot capture with countdown/flash effects + local photo gallery file picker with compression. |
| **Icons & Assets** | **Lucide React + Custom SVG Doodles** | Clean, minimalist, and themeable icon set. |

---

## 3. Core Data Structure: Circular Doubly Linked List (CDLL)

### 3.1 Concept & Memory Topology
In a standard list or array, navigating past the oldest or newest entry leads to null/index errors. In **Dear Node-iary**, memories are conceptually infinite and cyclical:
- Navigating `next` from the **Newest Entry** smoothly cycles back to the **Oldest Entry** (the beginning of your journey).
- Navigating `prev` from the **Oldest Entry** takes you straight to your **Most Recent Reflection**.

```
       ┌────────────────────────────────────────────────────────┐
       │                                                        │
       ▼                                                        │
┌──────────────┐      ┌──────────────┐      ┌──────────────┐    │
│  Entry #1    │ ───► │  Entry #2    │ ───► │  Entry #N    │ ───┘
│  (2026-01-01)│ ◄─── │  (2026-01-02)│ ◄─── │  (2026-01-15)│
└──────────────┘      └──────────────┘      └──────────────┘
       ▲                                            │
       └────────────────────────────────────────────┘
```

### 3.2 Node & List Specifications

#### The `DiaryNode` Interface
```typescript
export interface DiaryPhoto {
  id: string;
  dataUrl: string; // Base64 or Blob URL
  caption?: string;
  rotation?: number; // Aesthetic random tilt for polaroid look
  timestamp: number;
}

export interface DiaryEntryData {
  id: string;
  date: string; // ISO 8601 string: 'YYYY-MM-DD'
  title: string;
  content: string; // Rich text or Markdown
  mood?: 'happy' | 'peaceful' | 'productive' | 'tired' | 'sad' | 'excited';
  weather?: 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'windy';
  photos: DiaryPhoto[];
  tags: string[];
  themeAccent?: string;
  createdAt: number;
  updatedAt: number;
}

export class DiaryNode {
  data: DiaryEntryData;
  prev: DiaryNode | null = null;
  next: DiaryNode | null = null;

  constructor(data: DiaryEntryData) {
    this.data = data;
    this.prev = this;
    this.next = this;
  }
}
```

### 3.3 Core Algorithmic Operations

#### 1. Chronological Insertion (`insertChronological`)
- **Rule**: All nodes must remain strictly sorted by `date` ascending ($Oldest \rightarrow Newest$).
- **Scenario A (Today's Entry / Newest)**:
  - If list is empty: `head = newNode; newNode.next = newNode; newNode.prev = newNode`.
  - If `newNode.date >= tail.date`:
    - Insert directly after `tail` in $O(1)$ time:
      ```typescript
      newNode.prev = tail;
      newNode.next = head;
      tail.next = newNode;
      head.prev = newNode;
      tail = newNode;
      ```
- **Scenario B (Backdated / Random Date Entry)**:
  - If `newNode.date < head.date`: Node becomes new `head`, $O(1)$ pointer swap with `tail`.
  - Otherwise, traverse from `head` forward (or from `tail` backward based on date proximity) until finding the position where `curr.date <= newNode.date < curr.next.date`.
  - Splice in between `curr` and `curr.next` in $O(N)$ traversal, $O(1)$ splice.

#### 2. Date Modification & Re-sorting (`updateNodeDate`)
- If the user changes an entry's date:
  1. Detach node from its current position:
     ```typescript
     node.prev.next = node.next;
     node.next.prev = node.prev;
     ```
  2. Re-insert the detached node using `insertChronological()`.

#### 3. Bidirectional Traversal (`next()` / `prev()`)
- Moving forward: `currentNode = currentNode.next`.
- Moving backward: `currentNode = currentNode.prev`.
- Loop-around feedback: When `currentNode.next === head`, the UI can subtly notify: *"🌸 Looping back to your very first memory!"*

#### 4. Circular Persistence & Serialization
- Stored in IndexedDB as an array of entries with an ordered index, or with explicit `prevId` / `nextId` fields.
- On app launch, the `DiaryLinkedList` class hydrates the raw records into an active in-memory CDLL instance.

---

## 4. Functional Requirements

### 4.1 Entry Management
- **Daily Quick Entry**: Defaults to today's date, auto-appends to the tail of the list.
- **Custom / Past Date Picker**: Lets users write a journal for yesterday or a trip from last year; automatically slides into its exact chronological position.
- **Rich Diary Content**: Text editing with basic formatting (bold, italic, lists, quotes, emoji picker).
- **Mood & Weather Stamps**: Cute stamp icons to indicate the emotional vibe of the day.
- **Entry Search & Jump**: Fast filter by keywords or calendar view that points directly to the selected node.

### 4.2 Photo Capture & Media Handling
- **Take Photo (Webcam / Mobile Camera)**:
  - In-app camera preview modal with shutter sound option and countdown timer.
  - Live capture using `navigator.mediaDevices.getUserMedia`.
- **Upload from Gallery**:
  - Drag-and-drop or file selector supporting multiple images (`.png`, `.jpg`, `.jpeg`, `.webp`).
  - Client-side image compression to preserve IndexedDB storage.
- **Polaroid / Scrapbook Display**:
  - Photos display as polaroid snapshots with slight randomized tilts, washi tape graphics, and optional handwritten captions.

### 4.3 Interactive CDLL Visualizer (Unique Feature!)
- A togglable **"Under The Hood" / "Node Inspector"** drawer.
- Displays a cute visual representation of the linked list:
  - Little journal charms or pearls connected by silky ribbon arrows (`prev` and `next`).
  - Highlights the current active node in real time as the user flips through entries.
  - Demonstrates node insertion and pointer rewiring with animated transitions.

### 4.4 Aesthetics & Customization Engine
- **Themes**:
  1. **Sakura Petals** (Pastel pink, white, soft rose gold).
  2. **Matcha Milk** (Sage green, cream, warm bamboo).
  3. **Lavender Haze** (Soft purple, lilac, periwinkle).
  4. **Cozy Cocoa / Cafe** (Warm sepia, beige, espresso brown).
  5. **Midnight Starlight** (Dark mode with pastel starlight accents).
- **Paper Styles**:
  - Ruled / Lined notebook paper.
  - Dotted bullet-journal grid.
  - Clean vintage parchment / linen texture.
- **Handwriting Fonts**:
  - Choice between *Caveat*, *Indie Flower*, *Patrick Hand*, or a clean modern sans-serif (*Quicksand* / *Nunito*).

---

## 5. Non-Functional Requirements

- **Privacy & Security**: All diary entries and pictures remain 100% on the user's device unless they explicitly export or sync.
- **Data Export / Backup**: Single-click "Export Diary Backup" (JSON file containing entries, dates, and base64 photos) and "Import Diary".
- **Performance**: Instantaneous node traversal ($O(1)$) and fluid 60fps animations.
- **Responsiveness**: Fully responsive across mobile phones, tablets, and desktops.

---

## 6. Implementation Milestones & Roadmap

- **Phase 1: Blueprint & Foundation** *(Current Step)*
  - Finalize SRS, tech stack, and user preferences.
  - Set up Vite + React + TypeScript + Tailwind project scaffold.
- **Phase 2: Core Data Structure Engine**
  - Implement and unit-test `CircularDoublyLinkedList` and `DiaryNode` classes.
  - Test chronological insertion, date updates, and circular loops.
- **Phase 3: Cute Journal UI & Reader**
  - Implement scrapbook layout, theme engine (CSS variables), font toggle, and paper backgrounds.
  - Implement page flipping / circular carousel navigation.
- **Phase 4: Editor & Media Integration**
  - Implement diary write/edit modal with date picker.
  - Camera capture modal via WebRTC / MediaDevices.
  - File upload with polaroid framing and stickers.
- **Phase 5: Persistence & CDLL Visualizer**
  - Integrate IndexedDB (Dexie) for local persistence.
  - Build the interactive circular node visualizer bar.
- **Phase 6: Polish & Delight**
  - Add cute sound effects (page flip, camera shutter, pencil scribbles).
  - Add export/import backup feature.

---

## 7. Clarifications & Open Design Decisions

To make sure this matches your exact vision before we write the code, please share your thoughts on the following:

1. **Storage Mode**:
   - Would you prefer **100% Local-First in the browser (IndexedDB)** — completely free, private, works offline, no login required?
   - Or would you prefer a **Full-Stack setup with a Node.js / Express backend** and a database?
2. **Reading Experience**:
   - Do you picture reading like a **Physical 2-page Open Book / Notebook** that flips pages?
   - Or a **Single Card / Polaroid Scrapbook Carousel** with previous/next arrows?
3. **Sound Effects**:
   - Would you like soft aesthetic sound effects (like a gentle page-turn sound, pencil writing, and camera shutter click)?

---
*Created with care for Dear Node-iary.* 🌸

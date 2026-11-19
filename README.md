# Dear Node-iary 🌸📖
> *A cute, aesthetic, customizable diary web application powered by an in-memory Circular Doubly Linked List (CDLL).*

---

## ✨ Features

- 📖 **Open 2-Page Book Layout**:
  - **Left Page**: Polaroid photo album with washi-tape headers, mood badge, weather stamp, and date header.
  - **Right Page**: Written journal with handwriting typography (*Caveat*, *Patrick Hand*), lined/dotted/blank paper textures, tags, and action buttons.
- 🔄 **Circular Doubly Linked List Engine (`src/dsa/CircularDoublyLinkedList.ts`)**:
  - **$O(1)$ Tail Insertion**: Adding today's entry appends to the tail and connects back to the head.
  - **$O(N)$ Chronological Insertion**: Selecting a past or future date automatically slides the node into sorted ascending order.
  - **Same-Date Tie-Breaker**: Multiple memories written on the same day are sub-sorted chronologically by their exact creation timestamp (`createdAt`).
  - **Seamless Loop Traversal**: Moving `next` past the newest memory smoothly loops back to your very first memory, and moving `prev` past the oldest loops to your latest reflection!
- 📸 **Polaroid Camera Studio**:
  - Live webcam photo capture with a 3-2-1 countdown, shutter flash, and shutter sound!
  - Gallery upload with client-side image compression.
  - Realistic randomized polaroid tilts and captions.
- 🔗 **Interactive "Node Ribbon" (CDLL Visualizer Drawer)**:
  - Collapsible bottom drawer showing all memory nodes as pastel charms connected by bidirectional ribbons (`← prev | next →`).
  - Circular wrap ribbon displaying `tail.next → head` and `head.prev ← tail`.
  - Real-time active pointer inspector!
- 🎨 **Pastel Themes & Customization**:
  - 5 Aesthetic Palettes: Sakura Petals 🌸, Matcha Latte 🍵, Cozy Cocoa Cafe ☕, Lavender Haze 💜, and Starlight Night 🌌.
  - 3 Paper Styles: Ruled Lined Notebook, Bullet Journal Dotted Grid, and Blank Linen Parchment.
  - 3 Fonts: Fluid Script (*Caveat*), Cute Marker (*Patrick Hand*), and Modern Sans (*Quicksand*).
- 🔊 **Web Audio Sound Effects**:
  - Gentle paper page-turn rustle, camera shutter click, pencil save chime, and paper crumple trash sound (with mute toggle).
- 💾 **100% Local-First & Private**:
  - Powered by browser **IndexedDB (Dexie.js)**. Entries and high-res photos stay permanently on your machine and work completely offline.
  - Single-click **Backup Export (`.json`)** and **Restore**.

---

## 🚀 How to Run the App

1. Open your terminal in this directory:
   ```bash
   cd d:\Dear_Node-iary
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser at:
   ```
   http://localhost:5173
   ```

---

## ⌨️ Keyboard Shortcuts

- `→` (Right Arrow) or `PageDown`: Next memory (`currentNode.next`)
- `←` (Left Arrow) or `PageUp`: Previous memory (`currentNode.prev`)

---

*Crafted with love for Dear Node-iary.* 🌸✨

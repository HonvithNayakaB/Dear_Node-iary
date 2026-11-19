import { DiaryEntry } from '../types/diary';

/**
 * A Node in the Circular Doubly Linked List.
 * References both the preceding node (prev) and succeeding node (next).
 */
export class DiaryNode<T extends DiaryEntry = DiaryEntry> {
  data: T;
  prev: DiaryNode<T>;
  next: DiaryNode<T>;

  constructor(data: T) {
    this.data = data;
    // In circular list, a single isolated node points to itself initially
    this.prev = this;
    this.next = this;
  }
}

/**
 * Circular Doubly Linked List (CDLL) for Dear Node-iary.
 * 
 * Invariant:
 * 1. Entries are kept strictly in ascending chronological order:
 *    Primary sort: `date` (YYYY-MM-DD)
 *    Secondary sort: `createdAt` (epoch ms timestamp)
 * 2. Head points to the oldest entry.
 * 3. Tail points to the newest entry.
 * 4. Tail.next points back to Head, and Head.prev points back to Tail, forming a seamless ring.
 */
export class CircularDoublyLinkedList<T extends DiaryEntry = DiaryEntry> {
  private _head: DiaryNode<T> | null = null;
  private _tail: DiaryNode<T> | null = null;
  private _size: number = 0;

  get head(): DiaryNode<T> | null {
    return this._head;
  }

  get tail(): DiaryNode<T> | null {
    return this._tail;
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  /**
   * Compares two diary entries chronologically.
   * Returns:
   *  < 0 if a should come BEFORE b
   *  > 0 if a should come AFTER b
   *  = 0 if identical
   */
  public static compareEntries<E extends DiaryEntry>(a: E, b: E): number {
    // Primary key: Calendar Date (YYYY-MM-DD)
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    // Secondary tie-breaker key: Exact creation time
    return (a.createdAt || 0) - (b.createdAt || 0);
  }

  /**
   * Inserts an entry into the CDLL maintaining chronological sorted order.
   * 
   * Optimizations:
   * - O(1) for appending today's / newest entry (greater than or equal to tail)
   * - O(1) for prepending entry older than head
   * - O(N) linear scan for middle insertions
   */
  public insertChronological(entry: T): DiaryNode<T> {
    const newNode = new DiaryNode<T>(entry);

    // Case 1: Empty list
    if (!this._head || !this._tail || this._size === 0) {
      newNode.next = newNode;
      newNode.prev = newNode;
      this._head = newNode;
      this._tail = newNode;
      this._size = 1;
      return newNode;
    }

    // Case 2: Greater than or equal to current tail -> O(1) Tail Append
    if (CircularDoublyLinkedList.compareEntries(entry, this._tail.data) >= 0) {
      newNode.prev = this._tail;
      newNode.next = this._head;
      this._tail.next = newNode;
      this._head.prev = newNode;
      this._tail = newNode;
      this._size++;
      return newNode;
    }

    // Case 3: Smaller than current head -> O(1) Head Prepend
    if (CircularDoublyLinkedList.compareEntries(entry, this._head.data) < 0) {
      newNode.next = this._head;
      newNode.prev = this._tail;
      this._tail.next = newNode;
      this._head.prev = newNode;
      this._head = newNode;
      this._size++;
      return newNode;
    }

    // Case 4: Middle insertion -> Traverse to find insertion point
    let curr: DiaryNode<T> = this._head;
    while (
      curr !== this._tail &&
      CircularDoublyLinkedList.compareEntries(curr.next.data, entry) <= 0
    ) {
      curr = curr.next;
    }

    // Insert newNode between curr and curr.next
    newNode.next = curr.next;
    newNode.prev = curr;
    curr.next.prev = newNode;
    curr.next = newNode;
    this._size++;

    return newNode;
  }

  /**
   * Find a node by entry ID.
   */
  public findById(id: string): DiaryNode<T> | null {
    if (!this._head || this._size === 0) return null;

    let curr = this._head;
    for (let i = 0; i < this._size; i++) {
      if (curr.data.id === id) {
        return curr;
      }
      curr = curr.next;
    }
    return null;
  }

  /**
   * Find a node by calendar date, or the closest prior date.
   */
  public findByDate(targetDate: string): DiaryNode<T> | null {
    if (!this._head || this._size === 0) return null;

    let curr = this._head;
    let closestPrior: DiaryNode<T> | null = null;

    for (let i = 0; i < this._size; i++) {
      if (curr.data.date === targetDate) {
        return curr; // Exact match found
      }
      if (curr.data.date < targetDate) {
        closestPrior = curr;
      }
      curr = curr.next;
    }

    return closestPrior || this._head;
  }

  /**
   * Delete a node by ID.
   * Rewires prev and next pointers in O(1) once node is located.
   */
  public deleteById(id: string): boolean {
    const target = this.findById(id);
    if (!target) return false;

    // Only one node in list
    if (this._size === 1) {
      this._head = null;
      this._tail = null;
      this._size = 0;
      return true;
    }

    // If removing head
    if (target === this._head) {
      this._head = this._head.next;
      this._tail!.next = this._head;
      this._head.prev = this._tail!;
    }
    // If removing tail
    else if (target === this._tail) {
      this._tail = this._tail.prev;
      this._tail.next = this._head!;
      this._head!.prev = this._tail;
    }
    // In middle
    else {
      target.prev.next = target.next;
      target.next.prev = target.prev;
    }

    this._size--;
    return true;
  }

  /**
   * Updates an entry. If the date or createdAt changed,
   * detaches the node and re-inserts it chronologically.
   */
  public updateEntry(id: string, updatedFields: Partial<T>): DiaryNode<T> | null {
    const existingNode = this.findById(id);
    if (!existingNode) return null;

    const mergedData: T = {
      ...existingNode.data,
      ...updatedFields,
      updatedAt: Date.now(),
    };

    const dateChanged =
      updatedFields.date !== undefined && updatedFields.date !== existingNode.data.date;
    const timeChanged =
      updatedFields.createdAt !== undefined &&
      updatedFields.createdAt !== existingNode.data.createdAt;

    if (!dateChanged && !timeChanged) {
      // No re-ordering needed, just update payload
      existingNode.data = mergedData;
      return existingNode;
    }

    // Date/time changed: Detach and re-insert in proper sorted position
    this.deleteById(id);
    return this.insertChronological(mergedData);
  }

  /**
   * Export all entries as an ordered Array (Oldest -> Newest).
   */
  public toArray(): T[] {
    const result: T[] = [];
    if (!this._head || this._size === 0) return result;

    let curr = this._head;
    for (let i = 0; i < this._size; i++) {
      result.push(curr.data);
      curr = curr.next;
    }
    return result;
  }

  /**
   * Clears and repopulates the list from an array.
   */
  public fromArray(entries: T[]): void {
    this.clear();
    for (const entry of entries) {
      this.insertChronological(entry);
    }
  }

  /**
   * Clear list
   */
  public clear(): void {
    this._head = null;
    this._tail = null;
    this._size = 0;
  }
}

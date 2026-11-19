// Standalone CDLL Verification Test
import assert from 'node:assert';

class DiaryNode {
  constructor(data) {
    this.data = data;
    this.prev = this;
    this.next = this;
  }
}

class CircularDoublyLinkedList {
  constructor() {
    this._head = null;
    this._tail = null;
    this._size = 0;
  }

  get head() { return this._head; }
  get tail() { return this._tail; }
  get size() { return this._size; }

  static compareEntries(a, b) {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return (a.createdAt || 0) - (b.createdAt || 0);
  }

  insertChronological(entry) {
    const newNode = new DiaryNode(entry);

    if (!this._head || !this._tail || this._size === 0) {
      newNode.next = newNode;
      newNode.prev = newNode;
      this._head = newNode;
      this._tail = newNode;
      this._size = 1;
      return newNode;
    }

    if (CircularDoublyLinkedList.compareEntries(entry, this._tail.data) >= 0) {
      newNode.prev = this._tail;
      newNode.next = this._head;
      this._tail.next = newNode;
      this._head.prev = newNode;
      this._tail = newNode;
      this._size++;
      return newNode;
    }

    if (CircularDoublyLinkedList.compareEntries(entry, this._head.data) < 0) {
      newNode.next = this._head;
      newNode.prev = this._tail;
      this._tail.next = newNode;
      this._head.prev = newNode;
      this._head = newNode;
      this._size++;
      return newNode;
    }

    let curr = this._head;
    while (
      curr !== this._tail &&
      CircularDoublyLinkedList.compareEntries(curr.next.data, entry) <= 0
    ) {
      curr = curr.next;
    }

    newNode.next = curr.next;
    newNode.prev = curr;
    curr.next.prev = newNode;
    curr.next = newNode;
    this._size++;

    return newNode;
  }

  findById(id) {
    if (!this._head || this._size === 0) return null;
    let curr = this._head;
    for (let i = 0; i < this._size; i++) {
      if (curr.data.id === id) return curr;
      curr = curr.next;
    }
    return null;
  }

  deleteById(id) {
    const target = this.findById(id);
    if (!target) return false;

    if (this._size === 1) {
      this._head = null;
      this._tail = null;
      this._size = 0;
      return true;
    }

    if (target === this._head) {
      this._head = this._head.next;
      this._tail.next = this._head;
      this._head.prev = this._tail;
    } else if (target === this._tail) {
      this._tail = this._tail.prev;
      this._tail.next = this._head;
      this._head.prev = this._tail;
    } else {
      target.prev.next = target.next;
      target.next.prev = target.prev;
    }

    this._size--;
    return true;
  }

  updateEntry(id, updatedFields) {
    const existing = this.findById(id);
    if (!existing) return null;
    const merged = { ...existing.data, ...updatedFields };
    this.deleteById(id);
    return this.insertChronological(merged);
  }

  toArray() {
    const result = [];
    if (!this._head || this._size === 0) return result;
    let curr = this._head;
    for (let i = 0; i < this._size; i++) {
      result.push(curr.data);
      curr = curr.next;
    }
    return result;
  }
}

// ================= RUN TESTS =================
console.log('🌸 Starting CDLL Verification Suite for Dear Node-iary...\n');

const list = new CircularDoublyLinkedList();

// Test 1: Insert chronologically
const e1 = { id: '1', date: '2026-11-15', createdAt: 1000, title: 'Day 1' };
const e3 = { id: '3', date: '2026-11-19', createdAt: 3000, title: 'Day 3' };
list.insertChronological(e1);
list.insertChronological(e3);

assert.strictEqual(list.size, 2);
assert.strictEqual(list.head.data.id, '1');
assert.strictEqual(list.tail.data.id, '3');
// Circular checks
assert.strictEqual(list.tail.next, list.head);
assert.strictEqual(list.head.prev, list.tail);
console.log('✓ Test 1 Passed: Basic insertion and circularity');

// Test 2: Middle chronological insertion (Day 2)
const e2 = { id: '2', date: '2026-11-17', createdAt: 2000, title: 'Day 2' };
list.insertChronological(e2);
assert.strictEqual(list.size, 3);
const dates = list.toArray().map((x) => x.date);
assert.deepStrictEqual(dates, ['2026-11-15', '2026-11-17', '2026-11-19']);
assert.strictEqual(list.head.next.data.id, '2');
assert.strictEqual(list.head.next.next.data.id, '3');
assert.strictEqual(list.tail.next, list.head);
assert.strictEqual(list.head.prev, list.tail);
console.log('✓ Test 2 Passed: Middle chronological insertion');

// Test 3: Same Date Tie-Breaker (Nov 19 Morning vs Nov 19 Evening)
const e3Morning = { id: '3-am', date: '2026-11-19', createdAt: 2500, title: 'Nov 19 Morning' };
list.insertChronological(e3Morning);
assert.strictEqual(list.size, 4);
const order = list.toArray().map((x) => x.id);
assert.deepStrictEqual(order, ['1', '2', '3-am', '3']);
console.log('✓ Test 3 Passed: Same-date tie-breaker sorts by timestamp correctly');

// Test 4: Head Prepend (Backdated entry)
const e0 = { id: '0', date: '2026-11-01', createdAt: 500, title: 'Oldest Day 0' };
list.insertChronological(e0);
assert.strictEqual(list.head.data.id, '0');
assert.strictEqual(list.head.prev, list.tail);
assert.strictEqual(list.tail.next, list.head);
console.log('✓ Test 4 Passed: Prepend older date updates head & maintains circular loop');

// Test 5: Date Editing / Re-sorting
list.updateEntry('2', { date: '2026-11-25', createdAt: 9000 });
assert.strictEqual(list.tail.data.id, '2');
assert.strictEqual(list.tail.next, list.head);
console.log('✓ Test 5 Passed: Date update detaches node and re-splices to new tail position');

// Test 6: Deletion
list.deleteById('0');
assert.strictEqual(list.head.data.id, '1');
assert.strictEqual(list.head.prev, list.tail);
assert.strictEqual(list.tail.next, list.head);
console.log('✓ Test 6 Passed: Deletion correctly updates pointers and circular links');

console.log('\n🎉 ALL CIRCULAR DOUBLY LINKED LIST TESTS PASSED PERFECTLY!\n');

'use strict';
class _Node {
  constructor(value, next) {
    this.value=value;
    this.next=next;
  }
}
class LinkedList {
  constructor() {
    this.head = null;
  }
  insertFirst(item) {
    this.head = new _Node(item, this.head);
  }
  insertLast(item) {
    if (this.head === null) {
      this.insertFirst(item);
    } else {
      let tempNode = this.head;
      while (tempNode.next !== null) {
        tempNode =tempNode.next; 
      }
      tempNode.next = new _Node(item, null);
    }
  }
  find(item) {
    // start at the head
    let currNode = this.head;
    // if the list is empty
    if (!this.head) {
      return null;
    }
    // check for the item
    while(currNode.value !== item) {
      // return null if end of the list
      // and the item is not on the list
      if (currNode.next === null) {
        return null;
      }
      else {
        // otherwise keep looking
        currNode = currNode.next;
      }
    }
    // found it
    return currNode;
  }
  remove(item) {
    // if the list is empty
    if (!this.head) {
      return null;
    }
    // if the node to be removed is head, make the next node head
    if (this.head.value === item) {
      this.head = this.head.next;
      return;
    }
    // start at the head
    let currNode = this.head;
    // keep track of previous
    let previousNode = this.head;

    while ((currNode !== null) && (currNode.value !== item)) {
      // save the previous node
      previousNode = currNode;
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log('Item not found');
      return;
    }
    previousNode.next = currNode.next;
  }
  insertBefore(item, key) {
    // start at the beginning of list
    if (this.head === null || this.head.value === key) {
      this.insertFirst(item);
    } else {
      let tempNode = this.head;
      let prevNode = this.head;
      // check for the item
      while(tempNode.next !== null) {
        // otherwise keep looking
        if (tempNode.value === key) {
          return prevNode.next = new _Node(item, tempNode);
        } 
        prevNode = tempNode;
        tempNode = tempNode.next;
      }  
      return tempNode.next = new _Node(item, null);
    }
  }
  insertAfter(item, key) {
    // start at the beginning of list
    if (this.head === null) {
      this.insertFirst(item);
    } else {
      let tempNode = this.head;
      // check for the item
      while(tempNode.next !== null) {
        // otherwise keep looking
        if (tempNode.value === key) {
          return tempNode.next = new _Node(item, tempNode.next);
        } 
        tempNode = tempNode.next;
      }  
      return tempNode.next = new _Node(item, null);
    }
  }
  insertAt(item, position) {
    if (this.head === null || position === 0) {
      return this.insertFirst(item);
    } else {
      let prevNode = this.head;
      let tempNode = this.head;
      let counter = 0;
      while(tempNode.next !== null) {
        if (counter < position) {
          counter++;
          prevNode = tempNode;
          tempNode = tempNode.next;
        } 
        else if (counter === position) {
          return prevNode.next = new _Node(item, tempNode);
          
        }
      }
      return tempNode.next = new _Node(item, null);
    } 
  }
}

module.exports = LinkedList;
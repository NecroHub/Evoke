/**
 * HistoryStack.js
 * Generic undo/redo command stack for the Studio. Every mutating action
 * (add part, delete part, transform, property edit) pushes a Command with
 * do()/undo() functions rather than mutating state directly, so the whole
 * edit history can be replayed backward and forward.
 */

export class HistoryStack {
  constructor(maxSize = 100) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxSize = maxSize;
  }

  /**
   * Executes a command and pushes it onto the undo stack. Clears the redo
   * stack, since branching history isn't supported.
   * @param {{do: Function, undo: Function, label?: string}} command
   */
  execute(command) {
    command.do();
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxSize) this.undoStack.shift();
    this.redoStack = [];
  }

  /** Reverts the most recent command, if any. */
  undo() {
    const command = this.undoStack.pop();
    if (!command) return false;
    command.undo();
    this.redoStack.push(command);
    return true;
  }

  /** Re-applies the most recently undone command, if any. */
  redo() {
    const command = this.redoStack.pop();
    if (!command) return false;
    command.do();
    this.undoStack.push(command);
    return true;
  }

  get canUndo() {
    return this.undoStack.length > 0;
  }

  get canRedo() {
    return this.redoStack.length > 0;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}

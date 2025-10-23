import type { CursorSelection, TextInsertionResult } from './types';

export class CursorManager {
  private constructor() {
    throw Error('CursorManager is a static class and cannot be instantiated');
  }

  /**
   * Gets the current selection state from a textarea.
   * Returns start/end positions, selected text, and selection status.
   *
   * @param textarea - The textarea element to query
   * @returns Selection information including positions and text
   * @throws {Error} If textarea is null or undefined
   *
   * @example
   * ```typescript
   * const selection = CursorManager.getSelection(textarea);
   * console.log(selection.start);        // 5
   * console.log(selection.end);          // 10
   * console.log(selection.text);         // "hello"
   * console.log(selection.hasSelection); // true
   * ```
   */
  public static getSelection(textarea: HTMLTextAreaElement): CursorSelection {
    if (!textarea) {
      throw new Error('CursorManager.getSelection: textarea is required');
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const text = textarea.value.substring(start, end);

    const hasSelection = start !== end;

    return { start, end, hasSelection, text };
  }

  public static getSelectedText(textarea: HTMLTextAreaElement): string {
    return this.getSelection(textarea).text;
  }

  public static setSelection(textarea: HTMLTextAreaElement, start: number, end?: number, focus = true): void {
    if (!textarea) {
      throw new Error('CursorManager.setSelection: textarea is required');
    }

    if (typeof start !== 'number' || start < 0) {
      throw new Error('CursorManager.setSelection: start must be a non-negative number');
    }
    if (start > textarea.value.length) {
      throw new Error('CursorManager.setSelection: start position exceeds textarea length');
    }

    const endPos = end !== undefined ? end : start;

    if (typeof endPos !== 'number' || endPos < 0) {
      throw new Error('CursorManager.setSelection: end must be a non-negative number');
    }
    if (endPos < start) {
      throw new Error('CursorManager.setSelection: end must be greater than or equal to start');
    }
    if (endPos > textarea.value.length) {
      throw new Error('CursorManager.setSelection: end position exceeds textarea length');
    }

    textarea.setSelectionRange(start, endPos);

    if (focus) {
      textarea.focus();
    }
  }

  public static insertText(textarea: HTMLTextAreaElement, text: string, selectInserted = false): TextInsertionResult {
    if (!textarea) {
      throw new Error('CursorManager.insertText: textarea is required');
    }
    if (text === undefined || text === null) {
      throw new Error('CursorManager.insertText: text is required');
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const { value } = textarea;

    const before = value.substring(0, start);
    const after = value.substring(end);
    const newValue = before + text + after;

    textarea.value = newValue;

    let newStart: number;
    let newEnd: number;

    if (selectInserted) {
      newStart = start;
      newEnd = start + text.length;
    } else {
      newStart = start + text.length;
      newEnd = start + text.length;
    }

    this.setSelection(textarea, newStart, newEnd);

    return {
      newStart,
      newEnd,
      modified: true,
    };
  }

  public static replaceSelection(textarea: HTMLTextAreaElement, replacement: string): TextInsertionResult {
    return this.insertText(textarea, replacement, false);
  }

  public static wrapSelection(
    textarea: HTMLTextAreaElement,
    prefix: string,
    suffix: string,
    selectWrapped = false
  ): TextInsertionResult {
    if (!textarea) {
      throw new Error('CursorManager.wrapSelection: textarea is required');
    }
    if (prefix === undefined || prefix === null) {
      throw new Error('CursorManager.wrapSelection: prefix is required');
    }
    if (suffix === undefined || suffix === null) {
      throw new Error('CursorManager.wrapSelection: suffix is required');
    }

    const selection = this.getSelection(textarea);
    const originalStart = selection.start;

    const wrappedText = prefix + selection.text + suffix;

    const before = textarea.value.substring(0, originalStart);
    const after = textarea.value.substring(selection.end);
    textarea.value = before + wrappedText + after;

    let newStart: number;
    let newEnd: number;

    if (!selection.hasSelection) {
      newStart = originalStart + prefix.length;
      newEnd = originalStart + prefix.length;
    } else if (selectWrapped) {
      newStart = originalStart + prefix.length;
      newEnd = originalStart + prefix.length + selection.text.length;
    } else {
      newStart = originalStart + wrappedText.length;
      newEnd = originalStart + wrappedText.length;
    }

    this.setSelection(textarea, newStart, newEnd);

    return {
      newStart,
      newEnd,
      modified: true,
    };
  }

  // public static wrapSelection(
  //   textarea: HTMLTextAreaElement,
  //   prefix: string,
  //   suffix: string,
  //   selectWrapped = false
  // ): TextInsertionResult {
  //   // Validation...
  //
  //   const selection = this.getSelection(textarea);
  //   const wrappedText = prefix + selection.text + suffix;
  //
  //   // Insert wrapped text
  //   this.insertText(textarea, wrappedText, false);
  //
  //   // Then manually adjust selection based on scenarios
  //   // ... (rest of logic)
  // }
}

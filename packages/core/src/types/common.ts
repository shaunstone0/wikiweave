/**
 * Common utility types used throughout the WikiWeave editor.
 *
 * These types represent return values from utility functions and helpers
 * that manipulate text, cursor positions, and editor state.
 *
 * Primary consumers:
 * - Toolbar plugins (for text manipulation results)
 * - CursorManager (for position calculations)
 * - Internal editor operations
 *
 * @packageDocumentation
 */

import type { CursorPixelPosition } from './data-structures';

/**
 * Result of wrapping selected text with markdown syntax.
 *
 * Used by toolbar plugins that wrap text (bold, italic, code, etc.).
 * The wrapSelection() utility function returns this type.
 *
 * Example operation:
 * - Original: "Hello World" with "World" selected (start: 6, end: 11)
 * - Wrap with: ** (bold)
 * - Result: "Hello **World**" with "World" selected (start: 8, end: 13)
 *
 * @example
 * // Bold plugin wraps "World"
 * {
 *   newContent: "Hello **World**",
 *   newCursorStart: 8,
 *   newCursorEnd: 13
 * }
 *
 * @example
 * // No selection - cursor positioned in middle of wrapper
 * // Original: "Hello |" (cursor at end)
 * // After wrap with **: "Hello **|**"
 * {
 *   newContent: "Hello ****",
 *   newCursorStart: 8,
 *   newCursorEnd: 8
 * }
 */
export interface TextWrapResult {
  /**
   * The complete textarea content after wrapping.
   * Includes the entire document with the wrapper syntax added.
   *
   * @example "Hello **World**" after wrapping "World" with **
   */
  newContent: string;

  /**
   * New cursor/selection start position after wrapping.
   * Accounts for the additional characters added by the wrapper.
   *
   * When text was selected: Points to start of the wrapped text (inside wrapper)
   * When no selection: Points to the middle of the empty wrapper for typing
   *
   * @example 8 for "Hello **|World**" (cursor after opening **)
   * @example 8 for "Hello **|**" (cursor between empty wrappers)
   */
  newCursorStart: number;

  /**
   * New cursor/selection end position after wrapping.
   *
   * When text was selected: Points to end of the wrapped text (inside wrapper)
   * When no selection: Equals newCursorStart (cursor, not selection)
   *
   * @example 13 for "Hello **World|**" (cursor before closing **)
   * @example 8 for "Hello **|**" (same as start - no selection)
   */
  newCursorEnd: number;
}

/**
 * Result of inserting text at the cursor position.
 *
 * Used by toolbar plugins that insert templates or snippets.
 * The insertAtCursor() utility function returns this type.
 *
 * Common use cases:
 * - Link plugin: Insert [](url) template
 * - Date plugin: Insert current date
 * - Custom plugins: Insert any text/template
 *
 * @example
 * // Link plugin inserts template at cursor
 * // Original: "Check this |" (cursor at end)
 * // Insert: "[](url)"
 * // Place cursor: After [ for typing link text
 * {
 *   newContent: "Check this [](url)",
 *   newCursorPosition: 12  // After "Check this ["
 * }
 *
 * @example
 * // Insert with cursor at end
 * // Original: "Hello |"
 * // Insert: "World"
 * {
 *   newContent: "Hello World",
 *   newCursorPosition: 11  // After "Hello World"
 * }
 */
export interface TextInsertResult {
  /**
   * The complete textarea content after insertion.
   * Includes the entire document with the new text inserted at the cursor position.
   *
   * @example "Check this [](url)" after inserting link template
   * @example "Hello World" after inserting "World"
   */
  newContent: string;

  /**
   * New cursor position after insertion.
   * Can be positioned anywhere in the inserted text (not just at the end).
   *
   * Common patterns:
   * - End of insertion: User continues typing after inserted text
   * - Middle of insertion: User needs to fill in a template (e.g., inside [])
   * - Before insertion: Rare, but possible for special cases
   *
   * Offset calculation:
   * - Positive offset from start: newCursorPosition = insertPosition + offset
   * - Negative offset from end: newCursorPosition = insertPosition + insertedText.length + offset
   *
   * @example 12 for cursor after "[" in "[](url)"
   * @example 11 for cursor at end of "Hello World"
   */
  newCursorPosition: number;
}

/**
 * Detailed cursor position measurement including both pixel and logical coordinates.
 *
 * Combines pixel position (for UI positioning) with logical position (line/column).
 * Returned by advanced cursor calculation functions.
 *
 * Use cases:
 * - Positioning autocomplete dropdown (needs pixelPosition)
 * - Displaying cursor location in UI (needs line/column)
 * - Debugging cursor-related issues
 * - Advanced text manipulation based on line structure
 *
 * @example
 * // Cursor at "He|llo\nWorld" (after "He")
 * {
 *   pixelPosition: { top: 0, left: 24, height: 20 },
 *   lineNumber: 1,
 *   columnNumber: 2
 * }
 *
 * @example
 * // Cursor at "Hello\nWo|rld" (after "Wo" on second line)
 * {
 *   pixelPosition: { top: 20, left: 24, height: 20 },
 *   lineNumber: 2,
 *   columnNumber: 2
 * }
 */
export interface CursorMeasurement {
  /**
   * Pixel coordinates of the cursor for UI positioning.
   * All measurements relative to textarea's top-left corner.
   *
   * This is the same CursorPixelPosition type from data-structures.ts,
   * included here as part of the complete measurement.
   *
   * Used primarily for positioning the autocomplete dropdown.
   */
  pixelPosition: CursorPixelPosition;

  /**
   * One-indexed line number where the cursor is located.
   * First line is 1, not 0.
   *
   * Determined by counting newline characters before cursor position.
   *
   * @example 1 for first line
   * @example 5 for fifth line
   */
  lineNumber: number;

  /**
   * One-indexed column number (character position within the line).
   * First character in a line is column 1, not 0.
   *
   * Determined by distance from start of current line to cursor.
   * Accounts for tabs (typically counted as 1 character).
   *
   * @example 1 for start of line
   * @example 10 for 9 characters into the line
   */
  columnNumber: number;
}

/**
 * Result of a line modification operation.
 *
 * Used by toolbar plugins that modify entire lines rather than selections.
 * Examples: Heading plugin, list plugins, quote plugin.
 *
 * These plugins prepend or modify syntax at the start of lines:
 * - Heading: Add/remove # symbols
 * - List: Add/remove - or 1. prefixes
 * - Quote: Add/remove > prefix
 *
 * Can operate on single line (cursor) or multiple lines (selection).
 *
 * @example
 * // Heading plugin on single line
 * // Original: "Introduction|" (cursor at end)
 * // Transform: Add "## "
 * {
 *   newContent: "## Introduction",
 *   affectedLines: [1],
 *   newCursorStart: 15,
 *   newCursorEnd: 15
 * }
 *
 * @example
 * // List plugin on multiple selected lines
 * // Original: "Line 1\nLine 2\nLine 3" (all selected)
 * // Transform: Add "- " to each
 * {
 *   newContent: "- Line 1\n- Line 2\n- Line 3",
 *   affectedLines: [1, 2, 3],
 *   newCursorStart: 0,
 *   newCursorEnd: 27
 * }
 */
export interface LineModificationResult {
  /**
   * The complete textarea content after line modification.
   * All affected lines have been transformed according to the operation.
   *
   * @example "## Introduction" after adding heading syntax
   * @example "- Line 1\n- Line 2" after adding list syntax
   */
  newContent: string;

  /**
   * Array of one-indexed line numbers that were modified.
   * Useful for visual feedback or undo/redo tracking.
   *
   * Single line operation: Array with one element
   * Multi-line operation: Array with all affected line numbers
   *
   * @example [1] for single line modification
   * @example [1, 2, 3] for three-line modification
   * @example [5] for modifying the fifth line only
   */
  affectedLines: number[];

  /**
   * New cursor/selection start position after modification.
   * Accounts for added or removed characters from line prefixes.
   *
   * Typically:
   * - Maintains relative position within the line content
   * - Adjusts for prefix changes (## adds 3 chars, moves cursor by 3)
   *
   * @example 15 for cursor after "## Introduction"
   * @example 0 for start of first line in multi-line selection
   */
  newCursorStart: number;

  /**
   * New cursor/selection end position after modification.
   *
   * Single line with cursor: Equals newCursorStart
   * Multi-line selection: End of all modified content
   *
   * @example 15 for cursor (same as start)
   * @example 27 for end of "- Line 1\n- Line 2\n- Line 3"
   */
  newCursorEnd: number;
}

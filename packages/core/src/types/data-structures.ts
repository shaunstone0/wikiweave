/**
 * Core data structures used throughout the WikiWeave editor.
 *
 * These types represent the fundamental data that flows through the system:
 * - WikiLinkData: Parsed wiki link information
 * - AutocompleteItem: Suggestions shown in the autocomplete dropdown
 * - CursorSelection: Text selection or cursor position
 * - CursorPixelPosition: Pixel coordinates for UI positioning
 * - ImageUploadResult: Result of image upload operations
 *
 * All interfaces in this file are pure data structures with no dependencies
 * on other type files. They form the foundation for the rest of the type system.
 *
 * @packageDocumentation
 */

/**
 * Represents a parsed wiki-style link from Markdown content.
 *
 * Wiki links use the syntax: [[target|display#section]]
 * - target: The page/entity being linked to
 * - display: Optional custom text to show (defaults to target)
 * - section: Optional anchor/subsection within the target
 *
 * @example
 * // Simple link
 * [[CharacterName]] → { target: "CharacterName", display: "CharacterName", section: null, raw: "[[CharacterName]]" }
 *
 * @example
 * // With custom display
 * [[CharacterName|Hero]] → { target: "CharacterName", display: "Hero", section: null, raw: "[[CharacterName|Hero]]" }
 *
 * @example
 * // With section
 * [[CharacterName#appearance]] → { target: "CharacterName", display: "CharacterName", section: "appearance", ... }
 *
 * @example
 * // Full syntax
 * [[CharacterName|Hero#appearance]] → { target: "CharacterName", display: "Hero", section: "appearance", ... }
 */
export interface WikiLinkData {
  /**
   * The target page or entity being linked to.
   * This is everything before the pipe (|) or hash (#), or the entire content if neither exists.
   * Does not include the section - that's stored separately.
   *
   * @example "CharacterName" from [[CharacterName|Hero#appearance]]
   */
  target: string;

  /**
   * The display text shown for this link.
   * If a pipe (|) is present, this is the text after it.
   * If no pipe is present, this defaults to the target value.
   * If the display text is empty ([[Target|]]), falls back to target.
   *
   * @example "Hero" from [[CharacterName|Hero]]
   * @example "CharacterName" from [[CharacterName]] (defaults to target)
   */
  display: string;

  /**
   * Optional section/anchor within the target page.
   * Everything after the hash (#) symbol, or null if no hash is present.
   * Multiple hashes are treated as part of the section name.
   *
   * @example "appearance" from [[CharacterName#appearance]]
   * @example "section#subsection" from [[Page#section#subsection]]
   * @example null from [[CharacterName]]
   */
  section: string | null;

  /**
   * The original, unparsed wiki links syntax exactly as it appeared in the Markdown.
   * Includes the opening [[ and closing ]] brackets.
   * Useful for debugging, error messages, and reparsing with different rules.
   *
   * @example "[[CharacterName|Hero#appearance]]"
   */
  raw: string;
}

/**
 * Represents a single suggestion item in the autocomplete dropdown.
 *
 * Used when the user types [[ to trigger wiki link autocomplete.
 * The getSuggestions callback returns an array of these items.
 *
 * @example
 * {
 *   id: "char-123",
 *   label: "Aragorn",
 *   value: "Aragorn",
 *   description: "Ranger, King of Gondor",
 *   group: "Characters",
 *   icon: "🧙"
 * }
 */
export interface AutocompleteItem {
  /**
   * Unique identifier for this item.
   * Used for React/framework rendering keys and selection tracking.
   * Can be a database ID, slug, UUID, or any unique string.
   *
   * @example "char-123"
   * @example "aragorn"
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  id: string;

  /**
   * The text displayed in the autocomplete dropdown.
   * This is what the user sees when browsing suggestions.
   * Should be human-readable and descriptive.
   * Plain text only (no HTML) - highlighting is handled by the autocomplete component.
   *
   * @example "Aragorn"
   * @example "The Shire"
   * @example "Battle of Helm's Deep"
   */
  label: string;

  /**
   * The text inserted into the editor when this item is selected.
   * Often the same as a label but can differ when the label includes extra context.
   * This is what appears between [[ and ]] in the final wiki link.
   *
   * @example
   * // When label and value are the same
   * label: "Aragorn", value: "Aragorn" → [[Aragorn]]
   *
   * @example
   * // When a label has an extra context
   * label: "Aragorn (King)", value: "Aragorn" → [[Aragorn]]
   */
  value: string;

  /**
   * Optional subtitle or additional context shown below the label.
   * Displayed in smaller or muted text in the dropdown.
   * Useful for disambiguation or providing extra information.
   *
   * @example "Ranger, King of Gondor"
   * @example "Forest in northern Rhovanion"
   * @example "Created by J.R.R. Tolkien"
   */
  description?: string;

  /**
   * Optional category for grouping related items in the dropdown.
   * Not used in v1 (flat list) but reserved for future grouped display.
   * Free-form string - consumers define their own categories.
   *
   * When implemented, the dropdown would show:
   * Characters
   *   - Aragorn
   *   - Frodo
   * Locations
   *   - The Shire
   *   - Rivendell
   *
   * @example "Characters"
   * @example "Locations"
   * @example "Events"
   */
  group?: string;

  /**
   * Optional icon displayed before the label.
   * Currently, supports emoji characters.
   * Future versions may support icon classes or image URLs.
   *
   * @example "🧙" for characters
   * @example "🏰" for locations
   * @example "⚔️" for battles/events
   */
  icon?: string;
}

/**
 * Represents a text selection range or cursor position in the textarea.
 *
 * When start === end, this represents a cursor position (no selection).
 * When start < end, this represents the selected text.
 * Both values are zero-indexed character positions.
 *
 * Invariant: end >= start (always true)
 *
 * @example
 * // Cursor at the beginning of a document
 * { start: 0, end: 0 }
 *
 * @example
 * // Cursor after "Hello"
 * { start: 5, end: 5 }
 *
 * @example
 * // "World" selected in "Hello World"
 * { start: 6, end: 11 }
 */
export interface CursorSelection {
  /**
   * Zero-indexed character position where the selection starts.
   * If no text is selected, this is the cursor position.
   * Always >= 0 and <= end.
   *
   * @example 0 for the beginning of document
   * @example 5 after typing "Hello"
   */
  start: number;

  /**
   * Zero-indexed character position where the selection ends.
   * If no text is selected, this equals start (cursor position).
   * Always >= start.
   *
   * @example 0 for cursor at beginning (start: 0, end: 0)
   * @example 11 when "World" is selected starting at position 6
   */
  end: number;

  /**
   * The selected text content.
   * Empty string if no text is selected (start === end).
   */
  text: string;

  /**
   * Whether any text is selected.
   * True if start !== end, false otherwise.
   */
  hasSelection: boolean;
}

/**
 * Pixel coordinates of the cursor position in the textarea.
 *
 * Used primarily for positioning the autocomplete dropdown.
 * All measurements are in CSS pixels and relative to the textarea's top-left corner.
 * Accounts for font size, line height, character widths, and textarea scroll position.
 *
 * Calculating this is complex - requires creating a hidden measurement element
 * with matching styles to determine character positions.
 *
 * @example
 * // Cursor on line 5, each line is 20px tall, 60px from the left edge
 * { top: 100, left: 60, height: 20 }
 */
export interface CursorPixelPosition {
  /**
   * Pixels from the top of the textarea to the top of the cursor's line.
   * Accounts for line wrapping, textarea scroll position, and padding.
   * Relative to textarea's coordinate system, not viewport.
   *
   * @example 0 for first line
   * @example 100 for line 6 with 20px line height (5 * 20)
   */
  top: number;

  /**
   * Pixels from the left edge of the textarea to the cursor position.
   * Accounts for character widths (varies with font-family and font-size).
   * Relative to textarea's coordinate system, not viewport.
   *
   * @example 0 for start of line
   * @example 60 for cursor after "Hello " in most fonts
   */
  left: number;

  /**
   * Height of the line where the cursor is located.
   * Equals the line-height CSS property of the textarea.
   * Used to position the autocomplete dropdown below the cursor line.
   *
   * Example: Position dropdown at (top + height) to appear below cursor
   *
   * @example 20 for typical line-height
   * @example 24 for 1.5 line-height with 16px font
   */
  height: number;
}

/**
 * Result of a text insertion or wrapping operation.
 * Includes the new cursor position after the operation.
 */
export interface TextInsertionResult {
  /**
   * New selection start position after insertion.
   */
  newStart: number;

  /**
   * New selection end position after insertion.
   */
  newEnd: number;

  /**
   * Whether the operation modified the textarea content.
   */
  modified: boolean;
}

/**
 * Result returned from the user's image upload callback.
 *
 * When a user pastes or drops an image, the editor calls onImageUpload/onImagePaste.
 * The callback uploads the file to the user's server and returns this result.
 *
 * The editor then inserts markdown: ![alt](url "title")
 *
 * Contract:
 * - If error is present: Upload failed, url is ignored
 * - If error is absent: Upload succeeded, url is required
 *
 * @example
 * // Successful upload
 * {
 *   url: "https://cdn.example.com/uploads/image123.png",
 *   alt: "Screenshot of editor",
 *   title: "Editor with toolbar visible"
 * }
 *
 * @example
 * // Failed upload
 * {
 *   url: "",  // Ignored when error present
 *   error: "File too large (max 5MB)"
 * }
 */
export interface ImageUploadResult {
  /**
   * The URL where the uploaded image is accessible.
   * Can be absolute, relative, or a data URL.
   * Required for successful uploads (when the error is not present).
   *
   * The editor validates this is non-empty before inserting Markdown.
   *
   * @example "https://cdn.example.com/uploads/image123.png"
   * @example "/uploads/image123.png"
   * @example "data:image/png;base64,iVBORw0KGgoAAAANS..."
   */
  url: string;

  /**
   * Optional alt text for accessibility.
   * Inserted as: ![alt text here](url)
   *
   * If not provided, editor inserts empty alt: ![]()
   *
   * User can add alt text manually in the markdown.
   *
   * Should be descriptive for screen readers.
   *
   * @example "Screenshot of the markdown editor toolbar"
   * @example "Diagram showing system architecture"
   */
  alt?: string;

  /**
   * Optional title attribute (shown on image hover).
   * Inserted as: ![alt](url "title here")
   *
   * Rarely used - provides additional context beyond alt text.
   * Can be omitted in most cases.
   *
   * @example "Editor interface - January 2024"
   * @example "Original sketch by the author"
   */
  title?: string;

  /**
   * Error message if upload failed.
   * When present, indicates failure - url field is ignored.
   * Should be human-readable for display to the user.
   *
   * Common error types:
   * - File too large
   * - Invalid file type
   * - Network error
   * - Authentication failed
   *
   * @example "File too large (max 5MB)"
   * @example "Invalid file type. Only PNG and JPEG allowed."
   * @example "Network error. Please try again."
   */
  error?: string;
}

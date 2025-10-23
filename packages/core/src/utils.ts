/**
 * Utility functions for WikiWeave editor
 * Pure functions with no dependencies on other WikiWeave modules
 */

import DOMPurify from 'dompurify';

// ============================================================================
// debounce
// ============================================================================

/**
 * Creates a debounced version of a function that delays execution until after
 * a specified wait time has elapsed since the last call. Useful for rate-limiting
 * expensive operations like API calls, DOM updates, or parsing.
 *
 * Each call to the debounced function resets the timer. The original function
 * only executes after the wait period passes with no new calls.
 *
 * @template T - The type of the function to debounce
 * @param fn - The function to debounce
 * @param wait - The number of milliseconds to delay execution
 * @returns A debounced version of the original function
 *
 * @example
 * ```typescript
 * function updatePreview(text: string) {
 *   console.log('Updating preview:', text);
 * }
 *
 * const debouncedUpdate = debounce(updatePreview, 200);
 *
 * // User types rapidly
 * debouncedUpdate('H');      // Timer starts
 * debouncedUpdate('He');     // Timer resets
 * debouncedUpdate('Hello');  // Timer resets
 * // ... 200ms passes ...
 * // Console: "Updating preview: Hello" (called once)
 * ```
 *
 * @example
 * ```typescript
 * // Debouncing textarea input for preview updates
 * textarea.addEventListener('input', debounce((event) => {
 *   const markdown = textarea.value;
 *   updatePreview(markdown);
 * }, 200));
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(fn: T, wait: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout((): void => {
      fn(...args);
    }, wait);
  };
}

// ============================================================================
// sanitizeHtml
// ============================================================================

/**
 * Sanitizes HTML string to prevent XSS (Cross-Site Scripting) attacks by
 * removing dangerous elements and attributes. Uses DOMPurify internally.
 *
 * Safe HTML elements like <p>, <strong>, <a> are preserved while dangerous
 * elements like <script>, <iframe>, and event handlers are stripped.
 * Data attributes (data-*) are preserved for custom functionality.
 *
 * @param html - The raw HTML string to sanitize
 * @returns A sanitized HTML string safe for insertion into the DOM
 *
 * @example
 * ```typescript
 * const userInput = '<p>Hello <script>alert("XSS")</script></p>';
 * const safe = sanitizeHtml(userInput);
 * // Result: '<p>Hello </p>' (script tag removed)
 * ```
 *
 * @example
 * ```typescript
 * // Sanitizing parsed markdown before displaying in preview
 * const markdown = '# Hello **World**';
 * const html = markdownParser.parse(markdown);
 * const safeHtml = sanitizeHtml(html);
 * previewElement.innerHTML = safeHtml;
 * ```
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

// ============================================================================
// escapeRegex
// ============================================================================

/**
 * Escapes special regular expression characters in a string, making it safe
 * to use as a literal string in a RegExp constructor or pattern.
 *
 * Escapes the following characters: . * + ? ^ $ { } ( ) | [ ] \ /
 *
 * @param str - The string containing characters to escape
 * @returns A string with all regex special characters escaped
 *
 * @example
 * ```typescript
 * const userInput = 'user.name';
 * const escaped = escapeRegex(userInput);
 * // Result: 'user\\.name'
 *
 * const regex = new RegExp(escaped);
 * regex.test('user.name'); // true (matches literal dot)
 * regex.test('username');  // false (doesn't match without dot)
 * ```
 *
 * @example
 * ```typescript
 * // Building a regex pattern to find exact wiki link text
 * const linkText = '$100 (USD)';
 * const pattern = `\\[\\[${escapeRegex(linkText)}\\]\\]`;
 * const regex = new RegExp(pattern);
 * regex.test('[[$100 (USD)]]'); // true
 * ```
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// generateId
// ============================================================================

/**
 * Generates a unique identifier string suitable for DOM element IDs.
 * Combines a prefix, timestamp, and random string to ensure uniqueness.
 *
 * The generated ID format is: `{prefix}-{timestamp}-{random}`
 * - prefix: Custom or default 'wikiweave'
 * - timestamp: Milliseconds since epoch (Date.now())
 * - random: 7-character base-36 string
 *
 * IDs are practically guaranteed to be unique across multiple editor instances
 * and rapid sequential calls.
 *
 * @param prefix - Optional prefix for the ID (default: 'wikiweave')
 * @returns A unique ID string
 *
 * @example
 * ```typescript
 * const id1 = generateId();
 * // Result: 'wikiweave-1728328476123-f2k9m3p'
 *
 * const id2 = generateId();
 * // Result: 'wikiweave-1728328476124-k3n2p4q' (different)
 * ```
 *
 * @example
 * ```typescript
 * // Creating editor elements with unique IDs
 * const editorId = generateId('editor');
 * const toolbarId = generateId('toolbar');
 *
 * const editor = document.createElement('div');
 * editor.id = editorId; // 'editor-1728328476123-abc123'
 * ```
 *
 * @example
 * ```typescript
 * // Multiple editors on same page
 * const editor1 = new MarkdownEditor(container1);
 * const editor2 = new MarkdownEditor(container2);
 * // Each gets unique IDs for all internal elements
 * ```
 */
export function generateId(prefix = 'wikiweave'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

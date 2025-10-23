// packages/core/src/types/dom.ts

/**
 * DOM element creation and manipulation types for WikiWeave editor.
 * Used primarily by DomBuilder class and related UI components.
 */

/**
 * Base options for customizing DOM elements.
 * Provides common customization for IDs and CSS classes.
 */
export interface DomElementOptions {
  /**
   * Custom ID for the element.
   * If not provided, a unique ID will be generated automatically.
   */
  id?: string;

  /**
   * Additional CSS class names to add to the element.
   * These are added alongside the default WikiWeave classes.
   *
   * @example
   * ```typescript
   * // Single class
   * { className: 'dark-theme' }
   *
   * // Multiple classes (space-separated)
   * { className: 'dark-theme custom-editor' }
   * ```
   */
  className?: string;
}

/**
 * Options for creating textarea elements.
 * Extends base options with textarea-specific configuration.
 */
export interface TextareaOptions extends DomElementOptions {
  /**
   * Number of visible text rows in the textarea.
   * If not specified, height is controlled by CSS.
   *
   * @default undefined (CSS-controlled height)
   */
  rows?: number;

  /**
   * Enable or disable browser spellcheck for the textarea.
   *
   * @default true
   */
  spellcheck?: boolean;
}

/**
 * Options for creating toolbar buttons.
 * All fields except `id` are required to ensure proper button functionality.
 */
export interface ToolbarButtonOptions {
  /**
   * Optional custom ID for the button.
   * If not provided, a unique ID will be generated.
   */
  id?: string;

  /**
   * Button title shown on hover (tooltip).
   * Should include keyboard shortcut if applicable.
   *
   * @example 'Bold (Ctrl+B)'
   * @example 'Insert Link (Ctrl+K)'
   */
  title: string;

  /**
   * Icon content for the button.
   * Can be text, emoji, HTML, or inline SVG.
   *
   * @example '<strong>B</strong>' // Bold text
   * @example '🔗' // Emoji
   * @example '<svg>...</svg>' // Inline SVG
   */
  icon: string;

  /**
   * Accessible label for screen readers.
   * Should describe the action clearly.
   *
   * @example 'Make text bold'
   * @example 'Insert hyperlink'
   */
  ariaLabel: string;
}

/**
 * Complete DOM structure for the WikiWeave editor.
 * Returned by DomBuilder.createEditorStructure() convenience method.
 * Contains references to all major editor components for easy access.
 */
export interface EditorStructure {
  /**
   * Root container element that holds all editor components.
   * This is the element that should be appended to the DOM.
   */
  container: HTMLDivElement;

  /**
   * Toolbar container that holds formatting buttons and controls.
   * Buttons are added by the Toolbar class.
   */
  toolbar: HTMLDivElement;

  /**
   * Editor body container that holds the textarea and preview pane.
   * Uses two-column layout for side-by-side editing.
   */
  editorBody: HTMLDivElement;

  /**
   * Textarea element where users type markdown content.
   * Primary input area for the editor.
   */
  textarea: HTMLTextAreaElement;

  /**
   * Preview pane that displays rendered HTML output.
   * Updates in real-time (debounced) as user types.
   */
  preview: HTMLElement;

  /**
   * Autocomplete dropdown container for wiki link suggestions.
   * Initially hidden, shown when user types [[.
   */
  autocomplete: HTMLUListElement;
}

/**
 * Options for configuring the editor structure creation.
 * Passed to DomBuilder.createEditorStructure().
 */
export interface EditorStructureOptions {
  /**
   * Placeholder text for the textarea.
   * @example 'Start writing your markdown...'
   */
  placeholder?: string;

  /**
   * Custom ID for the root container element.
   * If not provided, a unique ID will be generated.
   */
  containerId?: string;

  /**
   * Additional configuration for the textarea element.
   */
  textareaOptions?: TextareaOptions;
}

/**
 * DOM element factory for WikiWeave editor components.
 * All methods are static - no instantiation required.
 *
 * Creates the editor's DOM structure with proper classes, attributes,
 * and accessibility features. Each method creates a single element type
 * with sensible defaults that can be customized via options.
 */

import type {
  DomElementOptions,
  EditorStructure,
  EditorStructureOptions,
  TextareaOptions,
  ToolbarButtonOptions,
} from './types';
import { generateId } from './utils';

/**
 * Static utility class for creating WikiWeave editor DOM elements.
 * Provides factory methods for all editor UI components.
 */
export class DomBuilder {
  private constructor() {
    throw new Error('DomBuilder is a static class and cannot be instantiated');
  }

  /**
   * Creates the root container element for the WikiWeave editor.
   * This is the top-level wrapper that contains all editor components
   * (toolbar, editor body, and autocomplete dropdown).
   *
   * Structure created:
   * ```html
   * <div class="wikiweave-editor" id="optional-custom-id">
   *   <!-- Toolbar, editor body, and autocomplete are inserted here -->
   * </div>
   * ```
   *
   * The container uses flexbox layout to organize child components vertically.
   *
   * @param options - Optional customization options
   * @returns The root editor container element
   *
   * @example
   * ```typescript
   * // Basic usage with defaults
   * const container = DomBuilder.createEditorContainer();
   * // Result: <div class="wikiweave-editor" id="wikiweave-...">
   * ```
   *
   * @example
   * ```typescript
   * // Custom ID and additional class
   * const container = DomBuilder.createEditorContainer({
   *   id: 'my-editor',
   *   className: 'custom-theme'
   * });
   * // Result: <div class="wikiweave-editor custom-theme" id="my-editor">
   * ```
   */
  public static createEditorContainer(options?: DomElementOptions): HTMLDivElement {
    this.validateDomOptions(options, 'createEditorContainer');
    const container = document.createElement('div');

    container.className = 'wikiweave-editor';

    if (options?.className) {
      const customClasses = options.className.trim();

      if (customClasses) {
        container.className += ` ${customClasses}`;
      }
    }

    container.id = options?.id || generateId('editor');

    return container;
  }

  /**
   * Creates the toolbar container that holds formatting buttons and controls.
   * The toolbar is initially empty - buttons are added by the Toolbar class
   * using the createToolbarButton method.
   *
   * Structure created:
   * ```html
   * <div class="wikiweave-toolbar" id="optional-custom-id" role="toolbar">
   *   <!-- Buttons inserted by Toolbar class -->
   * </div>
   * ```
   *
   * Includes ARIA role for accessibility.
   *
   * @param options - Optional customization options
   * @returns The toolbar container element
   *
   * @example
   * ```typescript
   * const toolbar = DomBuilder.createToolbar();
   * // Result: <div class="wikiweave-toolbar" role="toolbar">
   * ```
   *
   * @example
   * ```typescript
   * // Custom ID for multiple editors on same page
   * const toolbar = DomBuilder.createToolbar({ id: 'editor-1-toolbar' });
   * ```
   */
  public static createToolbar(options?: DomElementOptions): HTMLDivElement {
    this.validateDomOptions(options, 'createToolbar');

    const toolbar = document.createElement('div');
    toolbar.setAttribute('role', 'toolbar');

    toolbar.className = 'wikiweave-toolbar';

    if (options?.className) {
      const customClasses = options.className.trim();

      if (customClasses) {
        toolbar.className += ` ${customClasses}`;
      }
    }
    toolbar.id = options?.id || generateId('toolbar');

    return toolbar;
  }

  /**
   * Creates the main editor body container that holds the textarea and preview pane.
   * This container uses a two-column layout (typically 50/50 split) to display
   * the markdown input and rendered preview side-by-side.
   *
   * Structure created:
   * ```html
   * <div class="wikiweave-editor-body" id="optional-custom-id">
   *   <!-- Textarea and preview inserted here -->
   * </div>
   * ```
   *
   * The body uses CSS Grid or Flexbox for responsive two-pane layout.
   *
   * @param options - Optional customization options
   * @returns The editor body container element
   *
   * @example
   * ```typescript
   * const body = DomBuilder.createEditorBody();
   * const textarea = DomBuilder.createTextarea();
   * const preview = DomBuilder.createPreview();
   *
   * body.appendChild(textarea);
   * body.appendChild(preview);
   * ```
   */
  public static createEditorBody(options?: DomElementOptions): HTMLDivElement {
    this.validateDomOptions(options, 'createEditorBody');

    const editorBody = document.createElement('div');
    editorBody.className = 'wikiweave-editor-body';

    if (options?.className) {
      const customClasses = options.className.trim();

      if (customClasses) {
        editorBody.className += ` ${customClasses}`;
      }
    }
    editorBody.id = options?.id || generateId('editor-body');
    return editorBody;
  }

  /**
   * Creates the textarea element where users type markdown content.
   * This is the primary input area for the editor.
   *
   * Structure created:
   * ```html
   * <textarea
   *   class="wikiweave-textarea"
   *   id="optional-custom-id"
   *   placeholder="optional-placeholder"
   *   rows="optional-rows"
   *   spellcheck="true|false"
   * ></textarea>
   * ```
   *
   * Default configuration:
   * - No rows specified (CSS controls height)
   * - Spellcheck enabled by default
   * - No resize handle (CSS: resize: none)
   * - Monospace font for markdown editing
   *
   * @param placeholder - Optional placeholder text shown when empty
   * @param options - Optional customization options for rows, spellcheck, id
   * @returns The textarea element
   *
   * @example
   * ```typescript
   * // Basic textarea with placeholder
   * const textarea = DomBuilder.createTextarea('Start writing...');
   * ```
   *
   * @example
   * ```typescript
   * // Customized textarea
   * const textarea = DomBuilder.createTextarea('Write markdown here', {
   *   rows: 20,
   *   spellcheck: false,
   *   id: 'custom-textarea'
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Minimal - all defaults
   * const textarea = DomBuilder.createTextarea();
   * ```
   */
  public static createTextarea(placeholder?: string, options?: TextareaOptions): HTMLTextAreaElement {
    if (options?.rows) {
      if (typeof options.rows !== 'number' || options.rows < 1) {
        throw new Error('DomBuilder.createTextarea: options.rows must be a positive number');
      }
    }

    if (options?.spellcheck !== undefined && typeof options?.spellcheck !== 'boolean') {
      throw new Error('DomBuilder.createTextarea: options.spellcheck must be a boolean');
    }

    const textarea = document.createElement('textarea');
    textarea.className = 'wikiweave-textarea';
    textarea.id = options?.id || generateId('textarea');

    if (placeholder) {
      textarea.placeholder = placeholder;
    }

    if (options?.rows) {
      textarea.rows = options.rows;
    }

    textarea.spellcheck = options?.spellcheck ?? true;

    if (options?.className) {
      textarea.className += ` ${options.className.trim()}`;
    }

    return textarea;
  }

  /**
   * Creates the preview pane that displays the rendered HTML output
   * of the markdown content. Updates in real-time as user types (debounced).
   *
   * Structure created:
   * ```html
   * <div class="wikiweave-preview" id="optional-custom-id">
   *   <!-- Rendered markdown HTML inserted here -->
   * </div>
   * ```
   *
   * Content is inserted via innerHTML after sanitization with DOMPurify.
   * Styled to match common markdown rendering (GitHub-like styling).
   *
   * @param options - Optional customization options
   * @returns The preview container element
   *
   * @example
   * ```typescript
   * const preview = DomBuilder.createPreview();
   * // Later: preview.innerHTML = sanitizeHtml(parsedMarkdown);
   * ```
   *
   * @example
   * ```typescript
   * // Multiple editors - unique IDs
   * const preview1 = DomBuilder.createPreview({ id: 'preview-1' });
   * const preview2 = DomBuilder.createPreview({ id: 'preview-2' });
   * ```
   */
  public static createPreview(options?: DomElementOptions): HTMLElement {
    this.validateDomOptions(options, 'createPreview');

    const preview = document.createElement('article');
    preview.setAttribute('role', 'region');
    preview.setAttribute('aria-label', 'Markdown preview');

    preview.className = 'wikiweave-preview';

    if (options?.className) {
      const customClasses = options.className.trim();

      if (customClasses) {
        preview.className += ` ${customClasses}`;
      }
    }

    preview.id = options?.id || generateId('preview');
    return preview;
  }

  /**
   * Creates the autocomplete dropdown container for wiki link suggestions.
   * Initially hidden (display: none) and positioned absolutely. Shows when
   * user types [[ and hides when selection is made or cancelled.
   *
   * Structure created:
   * ```html
   * <div
   *   class="wikiweave-autocomplete"
   *   id="optional-custom-id"
   *   style="display: none;"
   *   role="listbox"
   * >
   *   <!-- Suggestion items inserted by Autocomplete class -->
   * </div>
   * ```
   *
   * Positioned via JavaScript based on cursor position.
   * Includes ARIA role for accessibility.
   *
   * @param options - Optional customization options
   * @returns The autocomplete dropdown container element
   *
   * @example
   * ```typescript
   * const autocomplete = DomBuilder.createAutocomplete();
   * editorContainer.appendChild(autocomplete);
   *
   * // Later: shown/hidden by Autocomplete class
   * // autocomplete.style.display = 'block';
   * // autocomplete.style.top = '100px';
   * // autocomplete.style.left = '50px';
   * ```
   */
  public static createAutocomplete(options?: DomElementOptions): HTMLUListElement {
    this.validateDomOptions(options, 'createAutocomplete');
    const autocomplete = document.createElement('ul');
    autocomplete.setAttribute('role', 'listbox');
    autocomplete.style.display = 'none';

    autocomplete.className = 'wikiweave-autocomplete';

    if (options?.className) {
      const customClasses = options.className.trim();

      if (customClasses) {
        autocomplete.className += ` ${customClasses}`;
      }
    }

    autocomplete.id = options?.id || generateId('autocomplete');

    return autocomplete;
  }

  /**
   * Creates a single toolbar button for formatting actions (bold, italic, etc.).
   * Buttons are created by the Toolbar class and inserted into the toolbar container.
   *
   * Structure created:
   * ```html
   * <button
   *   type="button"
   *   class="wikiweave-toolbar-button"
   *   id="optional-custom-id"
   *   title="tooltip-text"
   *   aria-label="accessible-label"
   * >
   *   <!-- Icon content (SVG, emoji, or text) -->
   * </button>
   * ```
   *
   * Button behavior:
   * - type="button" prevents form submission
   * - title attribute for hover tooltip
   * - aria-label for screen readers
   * - Icon can be text, emoji, or inline SVG
   *
   * @param options - Button configuration with title, icon, and aria-label
   * @returns The toolbar button element
   *
   * @example
   * ```typescript
   * // Text-based button
   * const boldButton = DomBuilder.createToolbarButton({
   *   title: 'Bold (Ctrl+B)',
   *   icon: '<strong>B</strong>',
   *   ariaLabel: 'Make text bold'
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Emoji-based button
   * const linkButton = DomBuilder.createToolbarButton({
   *   id: 'link-btn',
   *   title: 'Insert Link',
   *   icon: '🔗',
   *   ariaLabel: 'Insert hyperlink'
   * });
   * ```
   *
   * @example
   * ```typescript
   * // SVG icon button
   * const italicButton = DomBuilder.createToolbarButton({
   *   title: 'Italic (Ctrl+I)',
   *   icon: '<svg>...</svg>',
   *   ariaLabel: 'Italicize text'
   * });
   * ```
   */
  public static createToolbarButton(options: ToolbarButtonOptions): HTMLButtonElement {
    if (!options) {
      throw new Error('DomBuilder.createToolbarButton: options is required');
    }

    if (!options.title || options.title.trim() === '') {
      throw new Error('DomBuilder.createToolbarButton: options.title is required');
    }

    if (!options.icon || options.icon.trim() === '') {
      throw new Error('DomBuilder.createToolbarButton: options.icon is required');
    }

    if (!options.ariaLabel || options.ariaLabel.trim() === '') {
      throw new Error('DomBuilder.createToolbarButton: options.ariaLabel is required');
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wikiweave-toolbar-button';
    button.title = options.title;
    button.setAttribute('aria-label', options.ariaLabel);
    button.innerHTML = options.icon;

    button.id = options?.id || generateId('toolbar-button');

    return button;
  }

  /**
   * Creates a single item in the autocomplete dropdown list.
   * Items are created by the Autocomplete class based on filtered suggestions.
   *
   * Structure created:
   * ```html
   * <div
   *   class="wikiweave-autocomplete-item"
   *   data-value="item-value"
   *   role="option"
   *   tabindex="-1"
   * >
   *   Display text
   * </div>
   * ```
   *
   * Behavior:
   * - data-value stores the actual wiki link target
   * - Display text can differ from value (e.g., "HomePage (Home)" vs "HomePage")
   * - role="option" for ARIA accessibility
   * - tabindex="-1" allows focus for keyboard navigation
   * - Highlighted on hover or keyboard selection
   *
   * @param value - The actual value to insert (wiki link target)
   * @param displayText - Text shown to user (defaults to value if not provided)
   * @returns The autocomplete item element
   *
   * @example
   * ```typescript
   * // Simple item - display matches value
   * const item = DomBuilder.createAutocompleteItem('HomePage');
   * // Result: <div data-value="HomePage">HomePage</div>
   * ```
   *
   * @example
   * ```typescript
   * // Custom display text
   * const item = DomBuilder.createAutocompleteItem(
   *   'CharacterName',
   *   'Character: John Doe'
   * );
   * // Result: <div data-value="CharacterName">Character: John Doe</div>
   * ```
   *
   * @example
   * ```typescript
   * // Usage in autocomplete dropdown
   * const dropdown = DomBuilder.createAutocomplete();
   * const suggestions = ['HomePage', 'AboutPage', 'ContactPage'];
   *
   * suggestions.forEach(suggestion => {
   *   const item = DomBuilder.createAutocompleteItem(suggestion);
   *   dropdown.appendChild(item);
   * });
   * ```
   */
  public static createAutocompleteItem(value: string, displayText?: string): HTMLLIElement {
    const autocompleteItem = document.createElement('li');
    autocompleteItem.className = 'wikiweave-autocomplete-item';
    autocompleteItem.setAttribute('role', 'option');
    autocompleteItem.setAttribute('tabindex', '-1');
    autocompleteItem.setAttribute('data-value', value);
    autocompleteItem.textContent = displayText || value;
    return autocompleteItem;
  }

  /**
   * Creates the complete DOM structure for the WikiWeave editor in one call.
   * This is a convenience method that assembles all editor components and
   * returns references to each element for event binding and manipulation.
   *
   * Equivalent to calling:
   * - createEditorContainer()
   * - createToolbar()
   * - createEditorBody()
   * - createTextarea()
   * - createPreview()
   * - createAutocomplete()
   *
   * And assembling them into the proper hierarchy.
   *
   * Structure created:
   * ```html
   * <div class="wikiweave-editor">
   *   <div class="wikiweave-toolbar"></div>
   *   <div class="wikiweave-editor-body">
   *     <textarea class="wikiweave-textarea"></textarea>
   *     <div class="wikiweave-preview"></div>
   *   </div>
   *   <div class="wikiweave-autocomplete"></div>
   * </div>
   * ```
   *
   * @param options - Optional configuration for the structure
   * @returns Object containing references to all created elements
   *
   * @example
   * ```typescript
   * // Create entire structure at once
   * const elements = DomBuilder.createEditorStructure({
   *   placeholder: 'Start writing...',
   *   containerId: 'my-editor'
   * });
   *
   * // Attach to DOM
   * document.body.appendChild(elements.container);
   *
   * // Access individual elements
   * elements.textarea.addEventListener('input', handleInput);
   * elements.preview.innerHTML = '<p>Preview content</p>';
   * ```
   *
   * @example
   * ```typescript
   * // For testing - create isolated structure
   * const { textarea, preview } = DomBuilder.createEditorStructure();
   * ```
   */
  public static createEditorStructure(options?: EditorStructureOptions): EditorStructure {
    const container = DomBuilder.createEditorContainer(options?.containerId ? { id: options.containerId } : undefined);
    const toolbar = DomBuilder.createToolbar();
    const editorBody = DomBuilder.createEditorBody();
    const textarea = DomBuilder.createTextarea(options?.placeholder, options?.textareaOptions);
    const preview = DomBuilder.createPreview();
    const autocomplete = DomBuilder.createAutocomplete();

    // Assemble structure correctly
    editorBody.appendChild(textarea);
    editorBody.appendChild(preview);

    container.appendChild(toolbar);
    container.appendChild(editorBody);
    container.appendChild(autocomplete);

    return {
      container,
      toolbar,
      editorBody,
      textarea,
      preview,
      autocomplete,
    };
  }

  /**
   * Validates common DOM element options (id and className).
   *
   * @param options - Options object to validate
   * @param methodName - Name of calling method for error messages
   * @throws {Error} If options contain invalid values
   */
  private static validateDomOptions(options: DomElementOptions | undefined, methodName: string): void {
    if (!options) return;

    // Validate ID
    if (options.id !== undefined) {
      if (typeof options.id !== 'string') {
        throw new Error(`DomBuilder.${methodName}: options.id must be a string`);
      }
      if (options.id.trim() === '') {
        throw new Error(`DomBuilder.${methodName}: options.id cannot be empty`);
      }
    }

    // Validate className
    if (options.className !== undefined && typeof options.className !== 'string') {
      throw new Error(`DomBuilder.${methodName}: options.className must be a string`);
    }
  }
}

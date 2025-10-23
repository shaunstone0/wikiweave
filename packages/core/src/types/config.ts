/**
 * Configuration types for the WikiWeave markdown editor.
 *
 * The MarkdownEditorOptions interface is the primary configuration object
 * passed to the editor constructor. It controls all aspects of editor behavior:
 * - Initial content and placeholder text
 * - Feature toggles (toolbar, autocomplete, images)
 * - Behavior settings (debounce delays, themes)
 * - Event callbacks for interactivity
 *
 * All configuration is optional with sensible defaults:
 * - Empty content
 * - Toolbar enabled with default plugins
 * - Autocomplete disabled (requires getSuggestions callback)
 * - Image upload disabled (requires onImageUpload callback)
 *
 * Configuration is nested by feature for clarity and organization.
 *
 * @packageDocumentation
 */

import type {
  OnChangeCallback,
  OnWikiLinkClickCallback,
  OnImageUploadCallback,
  OnImagePasteCallback,
  AutocompleteSuggestionsCallback,
} from './events';
import type { ToolbarPluginConfig } from './plugin';

/**
 * Top-level configuration object for the MarkdownEditor.
 *
 * Passed to the constructor:
 * new MarkdownEditor(containerElement, options)
 *
 * All fields are optional. The editor uses defaults for any omitted options.
 *
 * Organization:
 * - content: Initial content and placeholder
 * - toolbar: Toolbar visibility and plugins
 * - autocomplete: Wiki link autocomplete feature
 * - images: Image upload and paste handling
 * - callbacks: Event handlers for interactivity
 * - debounce: Preview update delay
 * - className: Custom CSS class for styling
 *
 * @example
 * // Minimal configuration - all defaults
 * const editor = new MarkdownEditor(container, {})
 *
 * @example
 * // Basic configuration with content
 * const editor = new MarkdownEditor(container, {
 *   content: {
 *     initial: '# My Document\n\nStart writing...',
 *     placeholder: 'Type your markdown here'
 *   }
 * })
 *
 * @example
 * // Full configuration with all features
 * const editor = new MarkdownEditor(container, {
 *   content: {
 *     initial: '# Welcome',
 *     placeholder: 'Start typing...'
 *   },
 *   toolbar: {
 *     enabled: true,
 *     plugins: ['bold', 'italic', 'link']
 *   },
 *   autocomplete: {
 *     enabled: true,
 *     getSuggestions: async (query) => fetchSuggestions(query),
 *     minQueryLength: 1,
 *     maxResults: 10
 *   },
 *   images: {
 *     upload: true,
 *     onUpload: async (file) => uploadToServer(file),
 *     maxFileSize: 5 * 1024 * 1024
 *   },
 *   callbacks: {
 *     onChange: (content) => console.log('Changed:', content),
 *     onWikiLinkClick: (link) => navigate(link.target)
 *   },
 *   debounce: 200,
 *   className: 'my-custom-editor'
 * })
 */

/**
 * Configuration for initial content and placeholder text.
 *
 * Controls what the editor shows on load and when empty.
 * Both fields are optional - editor starts empty by default.
 */
export interface ContentOptions {
  /**
   * Initial markdown content to display in the editor.
   *
   * Loaded when the editor is first created.
   * Can be empty string for blank editor.
   *
   * Common sources:
   * - Loaded from database/API
   * - Loaded from localStorage (draft recovery)
   * - Template content for new documents
   * - User's last saved content
   *
   * @default ''
   *
   * @example
   * initial: '# My Document\n\nStart writing here...'
   *
   * @example
   * // Load from localStorage
   * initial: localStorage.getItem('draft') || ''
   */
  initial?: string;

  /**
   * Placeholder text shown when editor is empty.
   *
   * Displayed in muted text when textarea is empty.
   * Uses native textarea placeholder attribute.
   *
   * Best practices:
   * - Keep short and clear
   * - Indicate what should be typed
   * - Don't include instructions (use help text separately)
   *
   * @default undefined (no placeholder)
   *
   * @example
   * placeholder: 'Start typing...'
   *
   * @example
   * placeholder: 'Write your story here'
   *
   * @example
   * placeholder: 'Enter markdown content'
   */
  placeholder?: string;
}

/**
 * Configuration for the formatting toolbar.
 *
 * Controls toolbar visibility, plugin selection, and positioning.
 * All fields are optional with sensible defaults.
 */
export interface ToolbarOptions {
  /**
   * Whether to show the toolbar.
   *
   * Set to false to hide the toolbar entirely.
   * Useful for read-only mode or minimal editors.
   *
   * When disabled:
   * - No toolbar buttons rendered
   * - Keyboard shortcuts still work (if plugins loaded internally)
   * - Editor is just textarea + preview
   *
   * @default true
   *
   * @example
   * enabled: false  // Hide toolbar
   */
  enabled?: boolean;

  /**
   * Plugin configuration - which buttons to show and in what order.
   *
   * Supports three formats:
   * 1. 'default' - All built-in plugins in standard order
   * 2. Array of built-in names - Subset of built-ins
   * 3. Array mixing built-ins and custom plugins
   *
   * Plugin order in array determines button order in toolbar.
   * Visual separators appear between different plugin groups.
   *
   * @default 'default'
   *
   * @example
   * // All built-in plugins (default)
   * plugins: 'default'
   *
   * @example
   * // Subset of built-ins
   * plugins: ['bold', 'italic', 'link']
   *
   * @example
   * // Mix built-ins and custom
   * plugins: ['bold', 'italic', myCustomPlugin, 'link']
   *
   * @example
   * // Only custom plugins
   * plugins: [myPlugin1, myPlugin2, myPlugin3]
   */
  plugins?: ToolbarPluginConfig;

  /**
   * Toolbar position relative to the editor.
   *
   * Controls whether toolbar appears above or below the editing area.
   *
   * 'top': Standard position, toolbar above textarea
   * 'bottom': Toolbar below textarea (less common but useful for mobile)
   *
   * @default 'top'
   *
   * @example
   * position: 'top'  // Above editor
   *
   * @example
   * position: 'bottom'  // Below editor
   */
  position?: 'top' | 'bottom';
}

/**
 * Configuration for wiki link autocomplete feature.
 *
 * Enables the [[ autocomplete dropdown that suggests pages as user types.
 * Requires getSuggestions callback - feature is disabled without it.
 */
export interface AutocompleteOptions {
  /**
   * Whether autocomplete is enabled.
   *
   * Even when true, getSuggestions callback is required for functionality.
   * Set to false to completely disable autocomplete (saves resources).
   *
   * When disabled:
   * - [[ is typed literally, no dropdown
   * - No event listeners for autocomplete
   * - No API calls to getSuggestions
   *
   * @default false (unless getSuggestions provided)
   *
   * @example
   * enabled: true
   */
  enabled?: boolean;

  /**
   * Callback to fetch autocomplete suggestions.
   *
   * Called when user types [[ and continues typing to filter.
   * Must return Promise resolving to array of AutocompleteItem.
   *
   * Required if enabled is true.
   *
   * Performance:
   * - Automatically debounced by editor (see debounce option)
   * - Should limit results (10-20 items recommended)
   * - Can be async (API calls) or sync (local data)
   *
   * See AutocompleteSuggestionsCallback type for detailed docs.
   *
   * @example
   * getSuggestions: async (query) => {
   *   const results = await searchAPI(query)
   *   return results.slice(0, 10)
   * }
   */
  getSuggestions: AutocompleteSuggestionsCallback;

  /**
   * Minimum query length before showing suggestions.
   *
   * Controls when autocomplete dropdown appears:
   * - 0: Show immediately after [[ (default)
   * - 1: Wait for at least 1 character after [[
   * - 2+: Wait for more characters (reduces noise)
   *
   * Use cases:
   * - 0: Small dataset, show all/recent items immediately
   * - 1+: Large dataset, require filtering to reduce results
   *
   * @default 0
   *
   * @example
   * minQueryLength: 1  // Require [[A before showing dropdown
   */
  minQueryLength?: number;

  /**
   * Maximum number of suggestions to display in dropdown.
   *
   * Limits the getSuggestions results shown to user.
   * Editor takes first N items from returned array.
   *
   * Balances:
   * - Too few: User may not find what they want
   * - Too many: Dropdown becomes overwhelming, scroll required
   *
   * Recommended: 10-15 for good UX
   *
   * @default 10
   *
   * @example
   * maxResults: 15
   */
  maxResults?: number;

  /**
   * Debounce delay in milliseconds for getSuggestions calls.
   *
   * How long to wait after user stops typing before fetching suggestions.
   * Prevents excessive API calls while typing quickly.
   *
   * Separate from main editor debounce - this is autocomplete-specific.
   *
   * Common values:
   * - 0-100: Very responsive, more API calls
   * - 150-200: Balanced (recommended)
   * - 300-500: Slower, fewer API calls
   *
   * @default 150
   *
   * @example
   * debounce: 200  // Wait 200ms after typing stops
   */
  debounce?: number;
}

/**
 * Configuration for image upload and paste features.
 *
 * Enables drag-drop and clipboard paste for images.
 * Requires onUpload callback - features are disabled without it.
 */
export interface ImageOptions {
  /**
   * Whether image upload features are enabled.
   *
   * When true, enables:
   * - Drag and drop images onto editor
   * - Paste images from clipboard
   * - Image toolbar button (if implemented)
   *
   * Even when true, onUpload callback is required for functionality.
   * Set to false to completely disable image features.
   *
   * @default false (unless onUpload provided)
   *
   * @example
   * upload: true
   */
  upload?: boolean;

  /**
   * Callback to handle image uploads.
   *
   * Called when user drags/drops or selects an image file.
   * Must upload file to server/storage and return public URL.
   *
   * Required if upload is true.
   *
   * Responsibility:
   * - Upload file to your backend/storage
   * - Return URL where image is accessible
   * - Handle errors and return error message
   *
   * See OnImageUploadCallback type for detailed docs and examples.
   *
   * @example
   * onUpload: async (file) => {
   *   const formData = new FormData()
   *   formData.append('image', file)
   *   const response = await fetch('/api/upload', {
   *     method: 'POST',
   *     body: formData
   *   })
   *   const data = await response.json()
   *   return { url: data.url }
   * }
   */
  onUpload?: OnImageUploadCallback;

  /**
   * Optional callback specifically for pasted images.
   *
   * Called when user pastes image from clipboard (Ctrl+V).
   * If not provided, falls back to onUpload.
   *
   * Why separate?
   * - Different size limits for paste vs upload
   * - Different storage locations (temp vs permanent)
   * - Different auto-generated alt text
   *
   * Most applications use the same handler for both:
   * onPaste: onUpload
   *
   * See OnImagePasteCallback type for detailed docs.
   *
   * @example
   * onPaste: onUpload  // Reuse upload handler
   *
   * @example
   * onPaste: async (file) => {
   *   // Custom logic for pastes
   *   return uploadWithDifferentSettings(file)
   * }
   */
  onPaste?: OnImagePasteCallback;

  /**
   * Maximum allowed file size in bytes.
   *
   * Files larger than this are rejected before calling onUpload.
   * User sees error message instead of attempting upload.
   *
   * Client-side validation only - always validate server-side too.
   *
   * Common limits:
   * - 1MB: 1024 * 1024
   * - 5MB: 5 * 1024 * 1024 (reasonable default)
   * - 10MB: 10 * 1024 * 1024
   *
   * @default undefined (no limit)
   *
   * @example
   * maxFileSize: 5 * 1024 * 1024  // 5MB limit
   */
  maxFileSize?: number;

  /**
   * Allowed MIME types for image uploads.
   *
   * Only files matching these types are accepted.
   * Others are rejected before calling onUpload.
   *
   * Client-side validation only - always validate server-side too.
   *
   * Common image MIME types:
   * - 'image/png'
   * - 'image/jpeg'
   * - 'image/gif'
   * - 'image/webp'
   * - 'image/svg+xml'
   *
   * @default undefined (all image types allowed)
   *
   * @example
   * acceptedTypes: ['image/png', 'image/jpeg']
   *
   * @example
   * acceptedTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
   */
  acceptedTypes?: string[];
}

/**
 * Event callbacks for editor interactivity.
 *
 * Optional handlers that allow the editor to communicate with your application.
 * All callbacks are optional - editor functions without them (with reduced features).
 *
 * Most callbacks receive the editor instance as last parameter for accessing editor API.
 */
export interface CallbackOptions {
  /**
   * Called when markdown content changes.
   *
   * Triggers on typing, paste, toolbar actions, programmatic changes.
   * Debounced by default (see debounce option).
   *
   * Use for:
   * - Auto-saving to server/localStorage
   * - Updating external state
   * - Character/word counting
   * - Validation
   *
   * See OnChangeCallback type for detailed docs and examples.
   *
   * @example
   * onChange: (content) => {
   *   localStorage.setItem('draft', content)
   * }
   */
  onChange?: OnChangeCallback;

  /**
   * Called when user clicks a wiki link in the preview.
   *
   * Receives parsed link data and original mouse event.
   *
   * Use for:
   * - Navigation to linked page
   * - Opening in modal/sidebar
   * - Creating page if doesn't exist
   *
   * If not provided, wiki links are rendered but do nothing when clicked.
   *
   * See OnWikiLinkClickCallback type for detailed docs and examples.
   *
   * @example
   * onWikiLinkClick: (link) => {
   *   router.push(`/wiki/${link.target}`)
   * }
   */
  onWikiLinkClick?: OnWikiLinkClickCallback;
}

export interface MarkdownEditorOptions {
  /**
   * Content-related configuration (initial value, placeholder).
   *
   * Controls the starting state and empty state appearance of the editor.
   * Both fields are optional.
   *
   * @example
   * content: {
   *   initial: '# My Document\n\nContent here',
   *   placeholder: 'Start typing...'
   * }
   */
  content?: ContentOptions;

  /**
   * Toolbar configuration (visibility, plugins, position).
   *
   * Controls the formatting toolbar that appears above/below the editor.
   * If omitted, toolbar is enabled with default plugins.
   * Set to { enabled: false } to hide toolbar entirely.
   *
   * @example
   * toolbar: {
   *   enabled: true,
   *   plugins: 'default'  // All built-in plugins
   * }
   *
   * @example
   * toolbar: {
   *   enabled: true,
   *   plugins: ['bold', 'italic', 'link']  // Subset of plugins
   * }
   */
  toolbar?: ToolbarOptions;

  /**
   * Autocomplete configuration for wiki link suggestions.
   *
   * Enables the [[ autocomplete dropdown feature.
   * Requires getSuggestions callback to function.
   * If omitted, autocomplete is disabled.
   *
   * @example
   * autocomplete: {
   *   enabled: true,
   *   getSuggestions: async (query) => searchPages(query),
   *   minQueryLength: 0,
   *   maxResults: 10
   * }
   */
  autocomplete?: AutocompleteOptions;

  /**
   * Image upload and paste configuration.
   *
   * Enables drag-drop and paste image features.
   * Requires onUpload callback to function.
   * If omitted, image features are disabled.
   *
   * @example
   * images: {
   *   upload: true,
   *   onUpload: async (file) => uploadImage(file),
   *   maxFileSize: 5 * 1024 * 1024,  // 5MB
   *   acceptedTypes: ['image/png', 'image/jpeg']
   * }
   */
  images?: ImageOptions;

  /**
   * Event callbacks for editor interactivity.
   *
   * Optional handlers for content changes, link clicks, etc.
   * All callbacks are optional - editor functions without them.
   *
   * @example
   * callbacks: {
   *   onChange: (content) => saveToServer(content),
   *   onWikiLinkClick: (link) => navigate(link.target)
   * }
   */
  callbacks?: CallbackOptions;

  /**
   * Debounce delay in milliseconds for preview updates.
   *
   * Controls how long to wait after user stops typing before
   * updating the preview pane. Prevents excessive re-renders.
   *
   * Default: 200ms (responsive but not excessive)
   *
   * Common values:
   * - 0: Immediate updates (can impact performance)
   * - 150-200: Fast, responsive (recommended)
   * - 300-500: Slower, more conservative
   *
   * Also affects onChange callback frequency.
   *
   * @default 200
   *
   * @example
   * debounce: 300  // 300ms delay
   */
  debounce?: number;

  /**
   * Custom CSS class name added to the editor root element.
   *
   * Allows custom styling via your own CSS.
   * The editor has default styles, but you can override them
   * by targeting this class.
   *
   * Multiple classes: Separate with spaces.
   *
   * @example
   * className: 'my-editor'
   *
   * @example
   * className: 'my-editor dark-theme'
   */
  className?: string;
  parser?: ParserOptions;
}

/**
 * Configuration for the markdown parser.
 *
 * Controls how markdown is rendered and handles custom wiki link syntax.
 * These options are passed to markdown-it and custom plugins.
 */
export interface ParserOptions {
  /**
   * Allow raw HTML in markdown content.
   *
   * Security consideration: Enabling this allows users to inject HTML.
   * DOMPurify sanitization still runs, but be cautious in untrusted environments.
   *
   * @default false
   */
  html?: boolean;

  /**
   * Automatically convert URLs to clickable links.
   *
   * When true: http://example.com becomes <a href="...">
   * When false: URLs remain as plain text
   *
   * @default true
   */
  linkify?: boolean;

  /**
   * Enable typographic replacements.
   *
   * Converts:
   * - (c) → ©
   * - (tm) → ™
   * - ... → …
   * - -- → –
   * - --- → —
   * - "quotes" → "smart quotes"
   *
   * @default true
   */
  typographer?: boolean;

  /**
   * Convert newlines to <br> tags.
   *
   * When true: Single newlines become line breaks (GitHub-style)
   * When false: Need double newline for paragraph break
   *
   * @default false
   */
  breaks?: boolean;

  /**
   * Custom wiki link rendering options.
   *
   * Controls CSS classes and href generation for [[wiki links]].
   */
  wikiLinks?: {
    /**
     * CSS class added to wiki link <a> elements.
     *
     * @default 'wiki-link'
     */
    className?: string;

    /**
     * Optional function to generate href attributes.
     *
     * If provided: Links have real hrefs like href="/wiki/PageName"
     * If omitted: Links have href="#" and rely on click handlers
     *
     * @example
     * generateHref: (target) => `/wiki/${target}`
     */
    generateHref?: (target: string) => string;
  };
}

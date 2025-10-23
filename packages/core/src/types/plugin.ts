/**
 * Plugin system types for the WikiWeave toolbar.
 *
 * The toolbar uses a plugin-based architecture where each button is a plugin
 * that implements the ToolbarPlugin interface. This allows for:
 * - Built-in plugins (bold, italic, heading, etc.)
 * - User-defined custom plugins
 * - Third-party plugin packages
 *
 * Plugin lifecycle:
 * 1. Registration: Plugins are registered via toolbar configuration
 * 2. Validation: Shortcuts are validated for conflicts
 * 3. Rendering: Plugin icons/tooltips rendered as toolbar buttons
 * 4. Execution: Plugin execute() called on button click or keyboard shortcut
 * 5. Cleanup: Plugin destroy() called when editor is destroyed
 *
 * @packageDocumentation
 */

import type { CursorManager } from '../cursor-manager';
import type { MarkdownEditor } from '../markdown-editor';

/**
 * Core plugin interface that all toolbar plugins must implement.
 *
 * Plugins are Plain Old JavaScript Objects (POJOs) that conform to this interface.
 * They define a toolbar button's appearance and behavior.
 *
 * Plugin types:
 * - Wrap plugins: Bold, italic, code - wrap selection with syntax
 * - Insert plugins: Link, date - insert template at cursor
 * - Block plugins: Heading, lists - modify entire lines
 * - Custom plugins: Any user-defined behavior
 *
 * @example
 * // Simple wrap plugin
 * const BoldPlugin: ToolbarPlugin = {
 *   name: 'bold',
 *   icon: '**B**',
 *   tooltip: 'Bold (Ctrl+B)',
 *   group: 'formatting',
 *   shortcut: 'Ctrl+B',
 *   execute: (context) => {
 *     wrapSelection(context, '**', '**')
 *   }
 * }
 *
 * @example
 * // Async plugin with custom logic
 * const CustomPlugin: ToolbarPlugin = {
 *   name: 'my-plugin',
 *   icon: '✨',
 *   execute: async (context) => {
 *     const data = await fetchSomeData()
 *     insertAtCursor(context, data, 0)
 *   }
 * }
 */
export interface ToolbarPlugin {
  /**
   * Unique identifier for this plugin.
   * Used for plugin registration, shortcut mapping, and debugging.
   *
   * Must be unique across all plugins (built-in and custom).
   * Convention: lowercase, hyphen-separated for multi-word names.
   *
   * @example "bold"
   * @example "italic"
   * @example "my-custom-plugin"
   * @example "insert-date"
   */
  name: string;

  /**
   * Icon displayed on the toolbar button.
   *
   * Supported formats:
   * - Plain text: "B", "I", "H"
   * - Formatted text: "**B**", "*I*" (rendered as-is in HTML)
   * - Emoji: "📝", "🔗", "📷"
   * - Unicode symbols: "•", "₁", "⚙"
   *
   * The icon should be short (1-3 characters) for proper button sizing.
   * Longer text may overflow or look cramped.
   *
   * @example "**B**" for bold
   * @example "🔗" for link
   * @example "H▼" for heading dropdown
   */
  icon: string;

  /**
   * Optional tooltip text shown on button hover.
   * Should describe the action and include keyboard shortcut if available.
   *
   * Best practices:
   * - Start with action verb: "Bold", "Insert link", "Toggle heading"
   * - Include shortcut in parentheses: "(Ctrl+B)"
   * - Keep concise (under 40 characters)
   *
   * If omitted, no tooltip is shown.
   *
   * @example "Bold (Ctrl+B)"
   * @example "Insert link (Ctrl+K)"
   * @example "Toggle heading level (Ctrl+H)"
   */
  tooltip?: string;

  /**
   * Optional group for visual organization in toolbar.
   * Plugins with the same group are displayed adjacent to each other.
   * Different groups are separated by visual dividers (e.g., vertical line).
   *
   * Standard groups:
   * - 'formatting': Text styling (bold, italic, code)
   * - 'block': Block-level formatting (heading, lists)
   * - 'insert': Content insertion (link, image)
   * - 'custom': User-defined plugins
   *
   * If omitted, plugin appears in default group.
   *
   * @example "formatting"
   * @example "block"
   * @example "insert"
   * @example "custom"
   */
  group?: 'formatting' | 'block' | 'insert' | 'custom';

  /**
   * Optional keyboard shortcut that triggers this plugin.
   *
   * Format: "Modifier+Key" where:
   * - Modifier: Ctrl, Shift, Alt, Meta (can combine: Ctrl+Shift+Key)
   * - Key: Single character or key name (case-insensitive)
   *
   * Platform handling:
   * - "Ctrl" automatically maps to Command on macOS
   * - Use "Meta" to explicitly require Command key
   *
   * Shortcut validation:
   * - Built-in plugins have priority
   * - Custom plugins with conflicting shortcuts are warned and disabled
   * - Set overrideShortcut: true to explicitly override built-in shortcuts
   *
   * @example "Ctrl+B" for bold
   * @example "Ctrl+Shift+L" for list
   * @example "Ctrl+K" for link
   * @example "Alt+D" for custom date insertion
   */
  shortcut?: string;

  /**
   * Allow this plugin's shortcut to override a built-in plugin's shortcut.
   * Only relevant when shortcut conflicts with a built-in plugin.
   *
   * Default: false (built-in plugins have priority)
   * Set to true: This plugin's shortcut overrides the built-in
   *
   * Use cases:
   * - User prefers different shortcuts than defaults
   * - Custom plugin replaces built-in behavior
   * - Regional keyboard layouts require different shortcuts
   *
   * Warning: Overriding built-in shortcuts may confuse users expecting
   * standard behavior. Document clearly when using this option.
   *
   * @example
   * // Override built-in bold (Ctrl+B) with custom action
   * {
   *   shortcut: 'Ctrl+B',
   *   overrideShortcut: true
   * }
   */
  overrideShortcut?: boolean;

  /**
   * Execute the plugin's action.
   * Called when user clicks the toolbar button or presses the keyboard shortcut.
   *
   * Can be synchronous or asynchronous (return Promise).
   * Async is useful for:
   * - Fetching data from server
   * - Showing modals/dialogs and awaiting user input
   * - Complex operations that take time
   *
   * Context provides access to:
   * - The textarea element
   * - CursorManager utility for text manipulation
   * - The MarkdownEditor instance for advanced operations
   *
   * Common patterns:
   * - Wrap selection: wrapSelection(context, before, after)
   * - Insert at cursor: insertAtCursor(context, text, offset)
   * - Modify lines: Get current line, transform, replace
   *
   * @param context - Plugin execution context with editor access
   * @returns void or Promise<void>
   *
   * @example
   * // Synchronous execution
   * execute: (context) => {
   *   wrapSelection(context, '**', '**')
   * }
   *
   * @example
   * // Asynchronous execution
   * execute: async (context) => {
   *   const url = await showLinkDialog()
   *   if (url) {
   *     wrapSelection(context, '[', `](${url})`)
   *   }
   * }
   */
  execute(context: ToolbarPluginContext): void | Promise<void>;

  /**
   * Optional check if plugin can execute in current context.
   * Called before showing/enabling the button.
   *
   * Use cases:
   * - Disable heading plugin when already at max heading level
   * - Disable link plugin when URL is invalid
   * - Disable image plugin when no upload handler configured
   * - Enable toggle plugins only in specific states
   *
   * If omitted, plugin is always enabled.
   *
   * Performance: Should be fast - called frequently during editing.
   * Avoid expensive operations or async calls.
   *
   * @param context - Plugin execution context
   * @returns true if plugin can execute, false to disable button
   *
   * @example
   * // Disable when no text selected
   * canExecute: (context) => {
   *   const selection = context.cursorManager.getSelection(context.textarea)
   *   return selection.start !== selection.end
   * }
   */
  canExecute?(context: ToolbarPluginContext): boolean;

  /**
   * Optional check if plugin is in "active" state.
   * Used to highlight the button (e.g., bold button pressed when in bold text).
   *
   * Use cases:
   * - Bold button highlighted when cursor in bold text
   * - List button highlighted when on a list line
   * - Heading button shows current level
   *
   * If omitted, button is never highlighted.
   *
   * Implementation note: Detecting "in bold text" is complex - requires
   * parsing markdown around cursor. May be v2 feature for many plugins.
   *
   * Performance: Should be fast - called frequently during editing.
   *
   * @param context - Plugin execution context
   * @returns true to highlight button, false for normal appearance
   *
   * @example
   * // Highlight when current line is a heading
   * isActive: (context) => {
   *   const line = getCurrentLine(context.textarea)
   *   return line.startsWith('#')f
   * }
   */
  isActive?(context: ToolbarPluginContext): boolean;

  /**
   * Optional cleanup when plugin is destroyed.
   * Called when the editor is destroyed or plugin is unregistered.
   *
   * Use cases:
   * - Remove event listeners added by plugin
   * - Clear timers/intervals
   * - Clean up DOM elements created by plugin
   * - Close open connections
   * - Release resources
   *
   * Most plugins don't need this - only those with persistent state
   * or external resources (modals, event listeners, etc.).
   *
   * @example
   * // Plugin with modal dialog
   * let modal: HTMLElement | null = null
   *
   * execute: () => {
   *   modal = createModal()
   *   document.body.appendChild(modal)
   * },
   *
   * destroy: () => {
   *   if (modal) {
   *     modal.remove()
   *     modal = null
   *   }
   * }
   */
  destroy?(): void;
}

/**
 * Context object passed to plugin execute(), canExecute(), and isActive() methods.
 *
 * Provides plugins with everything they need to interact with the editor:
 * - Direct textarea access for reading/writing content
 * - CursorManager for cursor and selection operations
 * - Full MarkdownEditor instance for advanced scenarios
 *
 * The context gives plugins full power while keeping the plugin interface simple.
 * Plugins can be as simple or complex as needed.
 *
 * @example
 * // Simple plugin using just textarea
 * execute: (context) => {
 *   context.textarea.value += '\nNew line'
 * }
 *
 * @example
 * // Plugin using CursorManager utilities
 * execute: (context) => {
 *   const { start, end } = context.cursorManager.getSelection(context.textarea)
 *   const text = context.textarea.value.substring(start, end)
 *   console.log('Selected:', text)
 * }
 *
 * @example
 * // Plugin accessing full editor API
 * execute: (context) => {
 *   const content = context.editor.getContent()
 *   const processed = someComplexOperation(content)
 *   context.editor.setContent(processed)
 * }
 */
export interface ToolbarPluginContext {
  /**
   * The textarea DOM element where markdown content is edited.
   *
   * Direct access allows plugins to:
   * - Read content: textarea.value
   * - Write content: textarea.value = newContent
   * - Get selection: textarea.selectionStart, textarea.selectionEnd
   * - Set selection: textarea.setSelectionRange(start, end)
   * - Focus: textarea.focus()
   *
   * For common operations, prefer using cursorManager utilities instead
   * of direct textarea manipulation (cleaner and less error-prone).
   *
   * @example
   * const content = context.textarea.value
   * const cursorPos = context.textarea.selectionStart
   */
  textarea: HTMLTextAreaElement;

  /**
   * Utility class for cursor and selection operations.
   *
   * Provides helper methods that handle edge cases and browser quirks:
   * - getSelection(): Get current selection range
   * - setSelection(): Set cursor or selection
   * - insertText(): Insert at cursor with proper positioning
   * - wrapSelection(): Wrap selected text with syntax
   * - getPixelPosition(): Calculate pixel coordinates (for dropdowns)
   *
   * Using these utilities is recommended over direct textarea manipulation.
   * They handle cross-browser issues and maintain focus correctly.
   *
   * See cursor-manager.ts for full API.
   */
  cursorManager: CursorManager;

  /**
   * The full MarkdownEditor instance.
   *
   * Provides access to editor-level operations:
   * - getContent(): Get current markdown content
   * - setContent(): Replace all content
   * - insertText(): Insert at cursor (higher-level than cursorManager)
   * - Parser: Access markdown parser
   * - Autocomplete: Trigger autocomplete programmatically
   * - Events: Emit custom events
   *
   * Most plugins won't need this - textarea and cursorManager are sufficient.
   * Use for advanced scenarios like:
   * - Plugins that need to parse markdown
   * - Plugins that trigger other features
   * - Plugins that need editor configuration
   *
   * Avoid circular dependencies: Don't call plugin methods from plugins.
   */
  editor: MarkdownEditor;
}

/**
 * String union of built-in plugin names.
 *
 * These are the plugins shipped with WikiWeave out of the box.
 * Users can reference them by string in configuration:
 *
 * plugins: ['bold', 'italic', 'link']
 *
 * Built-in plugins can be:
 * - Used as-is (most common)
 * - Omitted (don't want that button)
 * - Overridden (custom plugin with same name)
 *
 * This type ensures TypeScript autocomplete and validation for built-in names.
 *
 * @example
 * // Valid built-in references
 * const plugins: BuiltinPluginName[] = ['bold', 'italic', 'heading']
 *
 * @example
 * // TypeScript error - 'strike' is not a built-in
 * const plugins: BuiltinPluginName[] = ['bold', 'strike']
 */
export type BuiltinPluginName = 'bold' | 'italic' | 'code' | 'heading' | 'unorderedList' | 'orderedList' | 'link';

/**
 * A plugin reference can be either a built-in name or a custom plugin instance.
 *
 * This enables flexible configuration:
 * - String: Reference built-in plugin by name
 * - Object: Provide custom plugin implementation
 *
 * The Toolbar resolves strings to built-in plugins at runtime.
 *
 * @example
 * // Mix of built-in references and custom plugins
 * const plugins: ToolbarPluginReference[] = [
 *   'bold',                    // Built-in by name
 *   'italic',                  // Built-in by name
 *   myCustomPlugin,            // Custom plugin object
 *   anotherCustomPlugin        // Another custom plugin
 * ]
 */
export type ToolbarPluginReference = BuiltinPluginName | ToolbarPlugin;

/**
 * Configuration for toolbar plugins.
 *
 * Supports three formats:
 *
 * 1. 'default' - All built-in plugins in standard order
 * 2. Array of references - Custom selection/order of plugins
 * 3. undefined - No plugins (toolbar disabled or empty)
 *
 * @example
 * // Use all built-in plugins
 * toolbar: { plugins: 'default' }
 *
 * @example
 * // Custom subset of built-ins
 * toolbar: { plugins: ['bold', 'italic', 'link'] }
 *
 * @example
 * // Mix built-ins and custom
 * toolbar: {
 *   plugins: [
 *     'bold',
 *     'italic',
 *     myDatePlugin,
 *     'link'
 *   ]
 * }
 *
 * @example
 * // Only custom plugins
 * toolbar: {
 *   plugins: [myPlugin1, myPlugin2]
 * }
 */
export type ToolbarPluginConfig = 'default' | ToolbarPluginReference[];

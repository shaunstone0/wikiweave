/**
 * Event callback types for the WikiWeave editor.
 *
 * These type signatures define the contract for event handlers that consumers
 * provide when configuring the editor. Callbacks allow the editor to communicate
 * with the host application for:
 * - Content changes (onChange)
 * - User interactions (onWikiLinkClick)
 * - File operations (onImageUpload, onImagePaste)
 * - Autocomplete data (getSuggestions)
 *
 * All callbacks receive the editor instance as a parameter, allowing handlers
 * to access the full editor API if needed for advanced scenarios.
 *
 * Callbacks are optional unless otherwise specified in the configuration.
 * The editor continues to function without callbacks, but interactive features
 * (like wiki link navigation or image uploads) require corresponding handlers.
 *
 * @packageDocumentation
 */

import type { MarkdownEditor } from '../markdown-editor';
import type { WikiLinkData, AutocompleteItem, ImageUploadResult } from './data-structures';

/**
 * Called whenever the markdown content changes.
 *
 * Triggers on:
 * - User typing in textarea
 * - Programmatic content changes via editor.setContent()
 * - Toolbar plugin actions that modify text
 * - Paste operations
 * - Any other modification to textarea.value
 *
 * Debouncing:
 * - By default, onChange is debounced (200ms) to avoid excessive calls
 * - Configure debounce delay via editor options: { debounce: 300 }
 * - Set to 0 for immediate calls (not recommended - performance impact)
 *
 * Use cases:
 * - Auto-saving content to server
 * - Updating character/word count
 * - Syncing to external state management
 * - Triggering validation
 * - Recording edit history for undo/redo
 *
 * Performance note:
 * Avoid heavy operations in this callback - it's called frequently.
 * For expensive operations (API calls, complex parsing), add additional
 * debouncing or throttling in your handler.
 *
 * @param content - The current markdown content (complete textarea value)
 * @param editor - The MarkdownEditor instance for accessing editor API
 *
 * @example
 * // Auto-save to local storage
 * onChange: (content, editor) => {
 *   localStorage.setItem('draft', content)
 * }
 *
 * @example
 * // Update React state
 * onChange: (content) => {
 *   setMarkdownContent(content)
 * }
 *
 * @example
 * // Sync to server with additional debouncing
 * const debouncedSave = debounce((content) => {
 *   fetch('/api/save', {
 *     method: 'POST',
 *     body: JSON.stringify({ content })
 *   })
 * }, 1000)
 *
 * onChange: (content) => {
 *   debouncedSave(content)
 * }
 */
export type OnChangeCallback = (content: string, editor: MarkdownEditor) => void;

/**
 * Called when a user clicks a wiki link in the preview pane.
 *
 * Wiki links in the preview are rendered as clickable elements.
 * When clicked, the default browser navigation is prevented, and this
 * callback is invoked with the parsed link data.
 *
 * The callback receives:
 * - Parsed link information (target, display, section)
 * - Original mouse event (for preventDefault, accessing modifiers, etc.)
 * - Editor instance (for advanced operations)
 *
 * Use cases:
 * - Navigate to linked page/entity in your application
 * - Open linked content in a modal/sidebar
 * - Create new page if target doesn't exist
 * - Show link preview/tooltip
 * - Log analytics on link clicks
 *
 * Common patterns:
 * - Check if target exists in your data
 * - Navigate to target if exists, prompt to create if not
 * - Handle section anchors by scrolling to section
 * - Respect modifier keys (Ctrl+click = new tab, Shift+click = new window)
 *
 * If this callback is not provided:
 * - Wiki links are still rendered but do nothing when clicked
 * - Consider providing this callback to make links functional
 *
 * @param link - Parsed wiki link data (target, display, section, raw)
 * @param event - The original MouseEvent from the click
 * @param editor - The MarkdownEditor instance
 *
 * @example
 * // Simple navigation
 * onWikiLinkClick: (link) => {
 *   router.push(`/wiki/${link.target}`)
 * }
 *
 * @example
 * // With section support
 * onWikiLinkClick: (link) => {
 *   const url = `/wiki/${link.target}`
 *   const hash = link.section ? `#${link.section}` : ''
 *   router.push(url + hash)
 * }
 *
 * @example
 * // Create if doesn't exist
 * onWikiLinkClick: async (link) => {
 *   const exists = await checkPageExists(link.target)
 *   if (exists) {
 *     navigateToPage(link.target)
 *   } else {
 *     const create = confirm(`"${link.target}" doesn't exist. Create it?`)
 *     if (create) {
 *       await createPage(link.target)
 *       navigateToPage(link.target)
 *     }
 *   }
 * }
 *
 * @example
 * // Respect modifier keys
 * onWikiLinkClick: (link, event) => {
 *   const url = `/wiki/${link.target}`
 *
 *   if (event.ctrlKey || event.metaKey) {
 *     // Ctrl/Cmd+click: Open in new tab
 *     window.open(url, '_blank')
 *   } else if (event.shiftKey) {
 *     // Shift+click: Open in new window
 *     window.open(url, '_blank', 'noopener,noreferrer')
 *   } else {
 *     // Normal click: Navigate in current view
 *     router.push(url)
 *   }
 * }
 */
export type OnWikiLinkClickCallback = (link: WikiLinkData, event: MouseEvent, editor: MarkdownEditor) => void;

/**
 * Called when a user uploads an image via drag-and-drop or file selection.
 *
 * This callback is invoked when:
 * - User drags an image file and drops it on the editor
 * - User clicks the image toolbar button and selects a file (if implemented)
 * - Image paste falls back to this if onImagePaste is not provided
 *
 * Responsibility:
 * The callback must:
 * 1. Upload the file to your server/storage
 * 2. Return the public URL where the image is accessible
 * 3. Optionally provide alt text and title
 * 4. Handle errors and return error message if upload fails
 *
 * The editor will then:
 * - Insert markdown: ![alt](url "title")
 * - Show loading state during upload
 * - Display error message if upload fails
 *
 * Required if images.upload is enabled in configuration.
 * If not provided, image upload features are disabled.
 *
 * File validation:
 * - Editor handles maxFileSize validation (if configured)
 * - Editor handles acceptedTypes validation (if configured)
 * - Callback should perform server-side validation as well
 *
 * Security considerations:
 * - Validate file types server-side (don't trust client)
 * - Scan for malware if applicable
 * - Enforce size limits server-side
 * - Use signed URLs or authentication
 * - Sanitize filenames
 *
 * @param file - The File object from the drag-drop or selection event
 * @param editor - The MarkdownEditor instance
 * @returns Promise resolving to upload result with URL or error
 *
 * @example
 * // Simple upload to server
 * onImageUpload: async (file) => {
 *   const formData = new FormData()
 *   formData.append('image', file)
 *
 *   try {
 *     const response = await fetch('/api/upload', {
 *       method: 'POST',
 *       body: formData
 *     })
 *
 *     const data = await response.json()
 *
 *     return {
 *       url: data.url,
 *       alt: file.name.replace(/\.[^/.]+$/, '') // Filename without extension
 *     }
 *   } catch (error) {
 *     return {
 *       url: '',
 *       error: 'Upload failed: ' + error.message
 *     }
 *   }
 * }
 *
 * @example
 * // Upload to S3 with presigned URL
 * onImageUpload: async (file) => {
 *   try {
 *     // Get presigned URL from your backend
 *     const { uploadUrl, publicUrl } = await getPresignedUrl(file.name)
 *
 *     // Upload directly to S3
 *     await fetch(uploadUrl, {
 *       method: 'PUT',
 *       body: file,
 *       headers: {
 *         'Content-Type': file.type
 *       }
 *     })
 *
 *     return { url: publicUrl }
 *   } catch (error) {
 *     return { url: '', error: 'S3 upload failed' }
 *   }
 * }
 *
 * @example
 * // Client-side only: Convert to data URL (not recommended for large images)
 * onImageUpload: async (file) => {
 *   return new Promise((resolve) => {
 *     const reader = new FileReader()
 *
 *     reader.onload = () => {
 *       resolve({
 *         url: reader.result as string,
 *         alt: file.name
 *       })
 *     }
 *
 *     reader.onerror = () => {
 *       resolve({
 *         url: '',
 *         error: 'Failed to read file'
 *       })
 *     }
 *
 *     reader.readAsDataURL(file)
 *   })
 * }
 */
export type OnImageUploadCallback = (file: File, editor: MarkdownEditor) => Promise<ImageUploadResult>;

/**
 * Called when a user pastes an image from the clipboard.
 *
 * This callback is invoked when:
 * - User copies an image (Ctrl+C) and pastes it (Ctrl+V) in the editor
 * - User takes a screenshot and pastes it directly
 * - User copies an image from a browser and pastes it
 *
 * Difference from onImageUpload:
 * - onImagePaste: Specifically for clipboard paste events
 * - onImageUpload: For drag-drop and file selection
 *
 * Fallback behavior:
 * If onImagePaste is not provided, paste events fall back to onImageUpload.
 * This allows using the same upload logic for both scenarios.
 *
 * Why separate callback?
 * Some applications may want different behavior:
 * - Pasted images: Quick inline upload, smaller size limits
 * - Uploaded images: Full quality, larger size limits
 * - Pasted images: Auto-generate alt text differently
 *
 * Use cases:
 * - Same as onImageUpload (usually identical implementation)
 * - Different size limits for pasted vs uploaded images
 * - Different storage locations (temp vs permanent)
 * - Analytics tracking (paste vs upload behavior)
 *
 * @param file - The File object extracted from clipboard
 * @param editor - The MarkdownEditor instance
 * @returns Promise resolving to upload result with URL or error
 *
 * @example
 * // Same as upload (most common)
 * onImagePaste: onImageUpload  // Reuse same function
 *
 * @example
 * // Different size limit for pastes
 * onImagePaste: async (file, editor) => {
 *   const MAX_PASTE_SIZE = 2 * 1024 * 1024 // 2MB for pastes
 *
 *   if (file.size > MAX_PASTE_SIZE) {
 *     return {
 *       url: '',
 *       error: 'Pasted image too large (max 2MB)'
 *     }
 *   }
 *
 *   // Continue with normal upload
 *   return uploadImage(file)
 * }
 *
 * @example
 * // Auto-generated alt for screenshots
 * onImagePaste: async (file, editor) => {
 *   const result = await uploadImage(file)
 *
 *   return {
 *     ...result,
 *     alt: `Screenshot from ${new Date().toLocaleString()}`
 *   }
 * }
 */
export type OnImagePasteCallback = (file: File, editor: MarkdownEditor) => Promise<ImageUploadResult>;

/**
 * Called to fetch autocomplete suggestions when user types [[.
 *
 * This callback is invoked when:
 * - User types [[ to start a wiki link
 * - User continues typing inside [[ to filter suggestions
 * - Debounced by default (150ms) to avoid excessive calls
 *
 * The callback should:
 * 1. Search for matching pages/entities based on query
 * 2. Return array of AutocompleteItem objects
 * 3. Limit results (10-20 items recommended for UI performance)
 * 4. Sort by relevance (most relevant first)
 *
 * Query parameter:
 * - Empty string "" when user first types [[ (show recent/popular)
 * - Partial text as user continues typing: "Ara" → filter to "Aragorn"
 *
 * Async support:
 * - Must return Promise (even if data is synchronous)
 * - Can make API calls to search server
 * - Can search local data structures
 * - Should handle errors gracefully (return empty array on error)
 *
 * Performance considerations:
 * - Editor debounces calls by default (150ms configurable)
 * - Implement server-side debouncing/rate limiting if needed
 * - Consider caching frequently accessed results
 * - Limit result set size (pagination not supported in v1)
 *
 * Required if autocomplete.enabled is true in configuration.
 * If not provided, autocomplete feature is disabled.
 *
 * @param query - The search query string (can be empty)
 * @param editor - The MarkdownEditor instance
 * @returns Promise resolving to array of suggestion items
 *
 * @example
 * // Client-side search in static data
 * const allPages = [
 *   { id: '1', label: 'Aragorn', value: 'Aragorn', group: 'Characters' },
 *   { id: '2', label: 'Arwen', value: 'Arwen', group: 'Characters' },
 *   { id: '3', label: 'The Shire', value: 'TheShire', group: 'Locations' }
 * ]
 *
 * getSuggestions: async (query) => {
 *   const lowerQuery = query.toLowerCase()
 *
 *   return allPages
 *     .filter(page => page.label.toLowerCase().includes(lowerQuery))
 *     .slice(0, 10) // Limit to 10 results
 * }
 *
 * @example
 * // Server-side search with API
 * getSuggestions: async (query) => {
 *   try {
 *     const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
 *     const data = await response.json()
 *
 *     return data.results.map(item => ({
 *       id: item.id,
 *       label: item.title,
 *       value: item.slug,
 *       description: item.summary,
 *       group: item.type
 *     }))
 *   } catch (error) {
 *     console.error('Autocomplete search failed:', error)
 *     return [] // Return empty array on error
 *   }
 * }
 *
 * @example
 * // Show recent items when query is empty
 * getSuggestions: async (query) => {
 *   if (query === '') {
 *     // No query - show recently edited pages
 *     return getRecentPages().slice(0, 10)
 *   }
 *
 *   // Query provided - search
 *   return searchPages(query)
 * }
 *
 * @example
 * // With caching for performance
 * const cache = new Map<string, AutocompleteItem[]>()
 *
 * getSuggestions: async (query) => {
 *   // Check cache first
 *   if (cache.has(query)) {
 *     return cache.get(query)!
 *   }
 *
 *   // Fetch from API
 *   const results = await fetchSuggestions(query)
 *
 *   // Cache for future
 *   cache.set(query, results)
 *
 *   return results
 * }
 */
export type AutocompleteSuggestionsCallback = (query: string, editor: MarkdownEditor) => Promise<AutocompleteItem[]>;

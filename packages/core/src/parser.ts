import MarkdownIt from 'markdown-it';
import type { ParserOptions } from './types';
import { sanitizeHtml } from './utils';

/**
 * Wraps markdown-it parser with custom wiki link support.
 *
 * Responsibilities:
 * - Convert markdown to HTML using markdown-it
 * - Add custom [[wiki link]] syntax support
 * - Sanitize output with DOMPurify for XSS protection
 *
 * Usage:
 * ```typescript
 * const parser = new Parser({ html: false, linkify: true });
 * const html = parser.parse('# Hello **World**');
 * ```
 */
export class Parser {
  private md: MarkdownIt;

  private options: ParserOptions;

  /**
   * Create a new Parser instance.
   *
   * @param options - Parser configuration options
   */
  constructor(options: ParserOptions = {}) {
    this.options = options;
    this.initializeMarkdownIt();
    // TODO: Register wiki link plugin (Phase 2)
  }

  /**
   * Parse markdown string to sanitized HTML.
   *
   * @param markdown - Raw markdown content
   * @returns Sanitized HTML string
   *
   * @example
   * parser.parse('# Hello') // '<h1>Hello</h1>'
   * parser.parse('**bold**') // '<p><strong>bold</strong></p>'
   */
  public render(markdown: string): string {
    // Validate input

    if (markdown === null || markdown === undefined) {
      throw new Error('Parser.parse(): markdown parameter is required');
    }

    if (typeof markdown !== 'string') {
      throw new Error(`Parser.parse(): Expected string, got ${typeof markdown}`);
    }

    if (!this.md) {
      throw new Error('Parser.parse(): markdown-it not initialized.');
    }

    try {
      const html = this.md.render(markdown);

      const sanitized = sanitizeHtml(html);

      return sanitized;
    } catch (error) {
      throw new Error(
        `Parser.parse(): Failed to parse markdown. ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Initialize markdown-it instance with configuration.
   *
   * Sets up:
   * - html, linkify, typographer, breaks options
   * - Default rendering rules
   * - Prepares for plugin registration
   */
  private initializeMarkdownIt(): void {
    try {
      this.md = new MarkdownIt('default', {
        html: this.options.html ?? false,
        linkify: this.options.linkify ?? true,
        typographer: this.options.typographer ?? true,
        breaks: this.options.breaks ?? false,
      });
    } catch (error) {
      throw new Error(
        `Parser: Failed to initialize markdown-it. ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // this.options.wikiLinks
  }

  /**
   * Register the wiki link plugin (Phase 2).
   *
   * Adds custom inline rule to markdown-it that:
   * - Matches [[target|display#section]] syntax
   * - Parses into WikiLinkData structure
   * - Renders as <a> with data attributes
   */
  // private registerWikiLinkPlugin(): void {
  //   // TODO: Create markdown-it plugin
  //   // TODO: Add inline rule for [[...]] matching
  //   // TODO: Add renderer for wiki_link tokens
  // }
}

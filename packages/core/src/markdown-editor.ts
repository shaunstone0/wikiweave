import MarkdownIt from 'markdown-it';
import { DomBuilder } from './dom-builder';
import { sanitizeHtml, debounce } from './utils';
import type { MarkdownEditorOptions } from './types';

export class MarkdownEditor {
  private container: HTMLElement;

  private textarea: HTMLTextAreaElement;

  private preview: HTMLElement;

  private parser: MarkdownIt;

  public constructor(container: HTMLElement, options?: MarkdownEditorOptions) {
    if (!container) {
      throw new Error('MarkdownEditor: container element is required');
    }

    this.container = container;

    // Create DOM structure
    const structure = DomBuilder.createEditorStructure({
      placeholder: options?.content?.placeholder,
    });

    // Store references
    this.textarea = structure.textarea;
    this.preview = structure.preview;

    // Initialize markdown parser
    this.parser = new MarkdownIt();

    // Attach to DOM
    this.container.appendChild(structure.container);

    // Set initial content
    if (options?.content?.initial) {
      this.textarea.value = options.content.initial;
      this.updatePreview();
    }

    // Listen for changes
    this.setupEventListeners(options);
  }

  private setupEventListeners(options?: MarkdownEditorOptions): void {
    const debounceMs = options?.debounce ?? 200;

    // Debounced preview update
    const debouncedUpdate = debounce(() => {
      this.updatePreview();

      // Call user's onChange if provided
      if (options?.callbacks?.onChange) {
        options.callbacks.onChange(this.textarea.value, this);
      }
    }, debounceMs);

    this.textarea.addEventListener('input', debouncedUpdate);
  }

  private updatePreview(): void {
    const markdown = this.textarea.value;
    const html = this.parser.render(markdown);
    const safeHtml = sanitizeHtml(html);
    this.preview.innerHTML = safeHtml;
  }

  // Public API
  public getContent(): string {
    return this.textarea.value;
  }

  public setContent(content: string): void {
    this.textarea.value = content;
    this.updatePreview();
  }
}

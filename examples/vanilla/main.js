// Import from your built core package

import { MarkdownEditor } from '../../packages/core/dist/index.js';

// Create the editor when DOM is ready
const container = document.getElementById('editor-container');

const editor = new MarkdownEditor(container, {
  content: {
    initial:
      '# Welcome to WikiWeave\n\nStart typing to see the preview update in real-time!\n\n## Features\n\n- **Bold** and *italic* text\n- Code blocks\n- Lists\n- And more...',
    placeholder: 'Start writing your markdown here...',
  },
});

// For debugging - expose editor to console
window.editor = editor;

console.log('WikiWeave editor initialized!', editor);

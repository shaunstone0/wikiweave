/**
 * Public API types for the WikiWeave markdown editor.
 *
 * This file re-exports all public types from the individual type modules.
 * Consumers import from this file for clean, organized imports:
 *
 * import type { MarkdownEditorOptions, WikiLinkData } from '@wikiweave/core'
 *
 * Type organization:
 * - config.ts: Configuration interfaces
 * - events.ts: Callback function signatures
 * - plugin.ts: Plugin system interfaces
 * - data-structures.ts: Data types that flow through the system
 * - common.ts: Utility return types
 *
 * @packageDocumentation
 */

// Configuration types
export type {
  MarkdownEditorOptions,
  ContentOptions,
  ToolbarOptions,
  AutocompleteOptions,
  ImageOptions,
  CallbackOptions,
} from './config';

// Event callback types
export type {
  OnChangeCallback,
  OnWikiLinkClickCallback,
  OnImageUploadCallback,
  OnImagePasteCallback,
  AutocompleteSuggestionsCallback,
} from './events';

// Plugin system types
export type {
  ToolbarPlugin,
  ToolbarPluginContext,
  BuiltinPluginName,
  ToolbarPluginReference,
  ToolbarPluginConfig,
} from './plugin';

// Data structure types
export type {
  WikiLinkData,
  AutocompleteItem,
  CursorSelection,
  CursorPixelPosition,
  ImageUploadResult,
  TextInsertionResult,
} from './data-structures';

// Common utility types
export type { TextWrapResult, TextInsertResult, CursorMeasurement, LineModificationResult } from './common';

export type {
  DomElementOptions,
  TextareaOptions,
  ToolbarButtonOptions,
  EditorStructure,
  EditorStructureOptions,
} from './dom';

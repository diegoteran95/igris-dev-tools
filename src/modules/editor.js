// Re-export for backward compatibility
// Actual implementation is in /src/components/ui/CodeEditor.js
import { CodeEditor } from '../components/ui/CodeEditor.js';

/**
 * SimpleEditor - Backward compatibility wrapper
 * Uses CodeEditor with JSON language mode
 */
export class SimpleEditor {
  constructor(containerId, placeholder = '') {
    this.editor = new CodeEditor({
      containerId,
      placeholder,
      language: 'json',
      autoFormat: true
    });
  }

  setValue(text) {
    this.editor.setValue(text);
  }

  getValue() {
    return this.editor.getValue();
  }

  // Expose textarea for backward compatibility
  get textarea() {
    return this.editor.textarea;
  }

  // Expose value getter/setter
  get value() {
    return this.editor.getValue();
  }

  set value(text) {
    this.editor.setValue(text);
  }
}

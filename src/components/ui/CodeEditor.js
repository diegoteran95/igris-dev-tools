import { Formatter } from '../../modules/formatter.js';

/**
 * Code Editor Component
 * Enhanced editor with syntax highlighting overlay
 */
export class CodeEditor {
  constructor(options = {}) {
    this.options = {
      containerId: null,
      placeholder: '',
      language: 'json',           // 'json', 'text', 'plain'
      readOnly: false,
      autoFormat: true,           // Auto-format on blur (JSON only)
      onChange: null,             // Callback(value)
      onSelectionChange: null,    // Callback(selection)
      ...options
    };

    this.container = document.getElementById(this.options.containerId);
    if (!this.container) {
      throw new Error(`CodeEditor: Container "${this.options.containerId}" not found`);
    }

    this.value = '';
    this.selection = { start: 0, end: 0, text: '' };
    this.textarea = null;
    this.pre = null;

    this.render();
    this.bindEvents();
  }

  /**
   * Render editor HTML
   */
  render() {
    this.container.innerHTML = `
      <div class="editor-wrapper">
        <pre class="editor-highlight code-view" aria-hidden="true"></pre>
        <textarea
          class="editor-input"
          placeholder="${this.escapeHtml(this.options.placeholder)}"
          spellcheck="false"
          ${this.options.readOnly ? 'readonly' : ''}
        ></textarea>
      </div>
    `;

    this.textarea = this.container.querySelector('.editor-input');
    this.pre = this.container.querySelector('.editor-highlight');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Input change
    this.textarea.addEventListener('input', () => {
      this.update();
      if (this.options.onChange) {
        this.options.onChange(this.value);
      }
    });

    // Scroll synchronization
    this.textarea.addEventListener('scroll', () => this.syncScroll());

    // Selection tracking
    const trackSelection = () => this.updateSelection();
    this.textarea.addEventListener('select', trackSelection);
    this.textarea.addEventListener('click', trackSelection);
    this.textarea.addEventListener('keyup', trackSelection);
    this.textarea.addEventListener('mouseup', trackSelection);

    // Auto-format on blur (JSON only)
    if (this.options.autoFormat && this.options.language === 'json') {
      this.textarea.addEventListener('blur', () => this.autoFormat());
    }
  }

  /**
   * Update editor content and highlighting
   */
  update() {
    this.value = this.textarea.value;
    const highlighted = this.highlight(this.value);

    // Add trailing space if ends with newline (for scroll sync)
    this.pre.innerHTML = highlighted + (this.value.endsWith('\n') ? '<br>&nbsp;' : '');
  }

  /**
   * Sync scroll position
   */
  syncScroll() {
    this.pre.scrollTop = this.textarea.scrollTop;
    this.pre.scrollLeft = this.textarea.scrollLeft;
  }

  /**
   * Update selection info
   */
  updateSelection() {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const text = this.value.substring(start, end);

    this.selection = { start, end, text };

    if (this.options.onSelectionChange) {
      this.options.onSelectionChange(this.selection);
    }
  }

  /**
   * Auto-format JSON
   */
  autoFormat() {
    const val = this.textarea.value.trim();
    if (!val) return;

    const { data, error } = Formatter.parse(val);
    if (!error) {
      this.setValue(Formatter.format(data));
    }
  }

  /**
   * Highlight code based on language
   * @param {string} text
   * @returns {string}
   */
  highlight(text) {
    switch (this.options.language) {
      case 'json':
        return Formatter.highlight(text);
      case 'text':
      case 'plain':
      default:
        return this.escapeHtml(text);
    }
  }

  /**
   * Set editor value
   * @param {string} text
   */
  setValue(text) {
    this.textarea.value = text;
    this.update();
  }

  /**
   * Get editor value
   * @returns {string}
   */
  getValue() {
    return this.textarea.value;
  }

  /**
   * Get selection info
   * @returns {Object}
   */
  getSelection() {
    return this.selection;
  }

  /**
   * Focus editor
   */
  focus() {
    this.textarea.focus();
  }

  /**
   * Clear editor
   */
  clear() {
    this.setValue('');
  }

  /**
   * Set placeholder
   * @param {string} placeholder
   */
  setPlaceholder(placeholder) {
    this.options.placeholder = placeholder;
    this.textarea.placeholder = placeholder;
  }

  /**
   * Escape HTML
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Destroy editor
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

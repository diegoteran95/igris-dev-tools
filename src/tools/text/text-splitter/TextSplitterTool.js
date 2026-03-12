import { BaseTool } from '../../../components/base/BaseTool.js';
import { CodeEditor } from '../../../components/ui/CodeEditor.js';
import { CopyButton } from '../../../components/ui/CopyButton.js';

/**
 * Text Splitter Tool
 * Split text by separator with options
 */
export class TextSplitterTool extends BaseTool {
  constructor(containerId) {
    super(containerId);
    this.inputEditor = null;
    this.copyBtn = null;
    this.parts = [];
  }

  render() {
    this.container.innerHTML = `
      <div class="text-splitter-tool">
        <div class="toolbar">
          <div class="form-inline">
            <label>
              Separator:
              <input type="text" id="separator" value="," placeholder="e.g., comma, newline, |">
            </label>

            <label>
              <input type="checkbox" id="trim-parts" checked>
              Trim whitespace
            </label>

            <label>
              <input type="checkbox" id="remove-empty" checked>
              Remove empty parts
            </label>

            <button id="btn-split" class="btn primary">Split</button>
            <span class="toolbar-sep"></span>
            <button id="btn-clear-splitter" class="btn ghost">Clear</button>
          </div>
        </div>

        <div class="workspace">
          <div class="pane">
            <div class="pane-label-static">Input Text</div>
            <div class="editor-container" id="splitter-input-container"></div>
          </div>

          <div class="pane">
            <div class="pane-label-static">
              <span>Split Results</span>
              <span id="part-count" style="margin-left: 8px; color: var(--text-secondary);"></span>
            </div>
            <div class="editor-container" style="position: relative;">
              <div id="btn-copy-all"></div>
              <div id="split-output" class="code-view"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize input editor
    this.inputEditor = new CodeEditor({
      containerId: 'splitter-input-container',
      placeholder: 'Enter text to split...',
      language: 'text',
      autoFormat: false
    });

    // Initialize copy button
    this.copyBtn = new CopyButton({
      getText: () => this.parts.join('\n'),
      position: 'floating'
    });
    const copyBtnEl = this.copyBtn.render();
    this.query('#btn-copy-all').replaceWith(copyBtnEl);

    // Set common separators in placeholder
    const separatorInput = this.query('#separator');
    separatorInput.setAttribute('list', 'separator-list');
  }

  bindEvents() {
    // Split button
    this.getElementById('btn-split').addEventListener('click', () => this.handleSplit());

    // Clear button
    this.getElementById('btn-clear-splitter').addEventListener('click', () => this.handleClear());

    // Enter key in separator input triggers split
    this.query('#separator').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSplit();
      }
    });
  }

  /**
   * Handle split action
   */
  handleSplit() {
    const text = this.inputEditor.getValue();
    const separator = this.query('#separator').value;
    const trimParts = this.query('#trim-parts').checked;
    const removeEmpty = this.query('#remove-empty').checked;

    if (!text.trim()) {
      this.showError('Please enter text to split');
      return;
    }

    if (!separator) {
      this.showError('Please enter a separator');
      return;
    }

    // Parse separator (handle special cases)
    let actualSeparator = separator;

    // Handle common escape sequences
    const escapeMap = {
      '\\n': '\n',
      '\\t': '\t',
      '\\r': '\r',
      'newline': '\n',
      'tab': '\t',
      'comma': ',',
      'space': ' ',
      'pipe': '|'
    };

    if (escapeMap[separator.toLowerCase()]) {
      actualSeparator = escapeMap[separator.toLowerCase()];
    }

    // Split text
    let parts = text.split(actualSeparator);

    // Trim whitespace
    if (trimParts) {
      parts = parts.map(part => part.trim());
    }

    // Remove empty parts
    if (removeEmpty) {
      parts = parts.filter(part => part.length > 0);
    }

    this.parts = parts;

    // Render results
    this.renderResults();
    this.showSuccess(`Split into ${parts.length} part${parts.length !== 1 ? 's' : ''}`);
  }

  /**
   * Render split results
   */
  renderResults() {
    const output = this.query('#split-output');
    const partCount = this.query('#part-count');

    if (this.parts.length === 0) {
      output.innerHTML = '<div style="padding: 20px; color: var(--text-secondary);">No results</div>';
      partCount.textContent = '';
      return;
    }

    partCount.textContent = `(${this.parts.length} part${this.parts.length !== 1 ? 's' : ''})`;

    // Render each part with index and copy button
    const html = this.parts.map((part, index) => {
      const escapedPart = this.escapeHtml(part);
      return `
        <div class="split-part">
          <div class="split-part-header">
            <span class="split-part-index">${index + 1}</span>
            <button class="btn-copy-part" data-index="${index}" title="Copy this part">📋</button>
          </div>
          <div class="split-part-content">${escapedPart}</div>
        </div>
      `;
    }).join('');

    output.innerHTML = html;

    // Bind copy buttons
    this.queryAll('.btn-copy-part').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'), 10);
        this.copyPart(index);
      });
    });
  }

  /**
   * Copy a single part
   * @param {number} index
   */
  async copyPart(index) {
    const part = this.parts[index];
    if (!part) return;

    const success = await this.copyToClipboard(part);
    if (success) {
      this.showSuccess(`Copied part ${index + 1}`);
    }
  }

  /**
   * Handle clear action
   */
  handleClear() {
    this.inputEditor.clear();
    this.query('#split-output').textContent = '';
    this.query('#part-count').textContent = '';
    this.parts = [];
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
   * Cleanup on unmount
   */
  onUnmount() {
    if (this.inputEditor) {
      this.inputEditor.destroy();
    }
    if (this.copyBtn) {
      this.copyBtn.destroy();
    }
  }
}

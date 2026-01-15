import { BaseTool } from '../../../components/base/BaseTool.js';
import { CodeEditor } from '../../../components/ui/CodeEditor.js';

/**
 * Character Counter Tool
 * Count characters, words, lines, and selection
 */
export class CharacterCounterTool extends BaseTool {
  constructor(containerId) {
    super(containerId);
    this.editor = null;
    this.stats = {
      chars: 0,
      charsNoSpaces: 0,
      words: 0,
      lines: 0,
      selectionChars: 0
    };
  }

  render() {
    this.container.innerHTML = `
      <div class="character-counter-tool">
        <div class="workspace vertical">
          <div class="pane" style="flex: 2;">
            <div class="pane-label-static">Text Input</div>
            <div class="editor-container" id="counter-input-container"></div>
          </div>

          <div class="pane" style="flex: 1;">
            <div class="pane-label-static">Statistics</div>
            <div class="stats-pane">
              <div class="stat-card">
                <span class="stat-value" id="char-count">0</span>
                <span class="stat-label">Characters</span>
              </div>

              <div class="stat-card">
                <span class="stat-value" id="char-no-spaces">0</span>
                <span class="stat-label">Characters (no spaces)</span>
              </div>

              <div class="stat-card">
                <span class="stat-value" id="word-count">0</span>
                <span class="stat-label">Words</span>
              </div>

              <div class="stat-card">
                <span class="stat-value" id="line-count">0</span>
                <span class="stat-label">Lines</span>
              </div>

              <div class="stat-card highlight" id="selection-card" style="display: none;">
                <span class="stat-value" id="selection-count">0</span>
                <span class="stat-label">Selected Characters</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize editor
    this.editor = new CodeEditor({
      containerId: 'counter-input-container',
      placeholder: 'Enter or paste text to analyze...',
      language: 'text',
      autoFormat: false,
      onChange: () => this.updateStats(),
      onSelectionChange: (selection) => this.updateSelectionStats(selection)
    });
  }

  bindEvents() {
    // Events are handled through CodeEditor callbacks
  }

  /**
   * Update text statistics
   */
  updateStats() {
    const text = this.editor.getValue();

    // Character count
    this.stats.chars = text.length;

    // Characters without spaces
    this.stats.charsNoSpaces = text.replace(/\s/g, '').length;

    // Word count
    this.stats.words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

    // Line count
    this.stats.lines = text === '' ? 0 : text.split('\n').length;

    // Update DOM
    this.query('#char-count').textContent = this.formatNumber(this.stats.chars);
    this.query('#char-no-spaces').textContent = this.formatNumber(this.stats.charsNoSpaces);
    this.query('#word-count').textContent = this.formatNumber(this.stats.words);
    this.query('#line-count').textContent = this.formatNumber(this.stats.lines);
  }

  /**
   * Update selection statistics
   * @param {Object} selection - { start, end, text }
   */
  updateSelectionStats(selection) {
    const selectionCard = this.query('#selection-card');
    const selectionCount = this.query('#selection-count');

    if (selection.text.length > 0) {
      this.stats.selectionChars = selection.text.length;
      selectionCount.textContent = this.formatNumber(this.stats.selectionChars);
      selectionCard.style.display = 'block';
    } else {
      selectionCard.style.display = 'none';
    }
  }

  /**
   * Format number with commas
   * @param {number} num
   * @returns {string}
   */
  formatNumber(num) {
    return num.toLocaleString();
  }

  /**
   * Cleanup on unmount
   */
  onUnmount() {
    if (this.editor) {
      this.editor.destroy();
    }
  }
}

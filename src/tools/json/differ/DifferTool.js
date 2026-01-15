import { BaseTool } from '../../../components/base/BaseTool.js';
import { CodeEditor } from '../../../components/ui/CodeEditor.js';
import { CopyButton } from '../../../components/ui/CopyButton.js';
import { FileDropZone } from '../../../components/ui/FileDropZone.js';
import { Differ } from './differ.js';
import { Formatter } from '../formatter/formatter.js';

/**
 * JSON Diff & Merge Tool
 * Compare and merge JSON documents
 */
export class DifferTool extends BaseTool {
  constructor(containerId) {
    super(containerId);
    this.leftEditor = null;
    this.rightEditor = null;
    this.copyBtn = null;
    this.dropZoneLeft = null;
    this.dropZoneRight = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="differ-tool">
        <div class="toolbar">
          <button id="btn-compare" class="btn primary">Compare</button>
          <button id="btn-clear-diff" class="btn">Clear</button>
        </div>

        <p class="note">Tip: You can edit the titles and drag & drop JSON files</p>

        <div class="workspace">
          <div class="pane">
            <input type="text" id="label-left" class="pane-label" placeholder="Original JSON" value="Original JSON">
            <div class="editor-container">
              <div id="btn-copy-left"></div>
              <div id="diff-input-left-container"></div>
            </div>
          </div>

          <div class="pane">
            <input type="text" id="label-right" class="pane-label" placeholder="Modified JSON" value="Modified JSON">
            <div class="editor-container">
              <div id="diff-input-right-container"></div>
            </div>
          </div>

          <div class="pane">
            <div class="pane-label-static">Comparison Result</div>
            <div class="editor-container">
              <div id="diff-output" class="code-view"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize editors
    this.leftEditor = new CodeEditor({
      containerId: 'diff-input-left-container',
      placeholder: 'Original JSON...',
      language: 'json',
      autoFormat: true,
      onChange: () => this.syncEditorHeights()
    });

    this.rightEditor = new CodeEditor({
      containerId: 'diff-input-right-container',
      placeholder: 'Modified JSON...',
      language: 'json',
      autoFormat: true,
      onChange: () => this.syncEditorHeights()
    });

    // Initialize copy button for left editor (merged result)
    this.copyBtn = new CopyButton({
      getText: () => this.leftEditor.getValue(),
      position: 'floating'
    });
    const copyBtnEl = this.copyBtn.render();
    this.query('#btn-copy-left').replaceWith(copyBtnEl);

    // Initialize file drop zones
    this.dropZoneLeft = new FileDropZone({
      targetElement: this.query('#diff-input-left-container'),
      accept: ['application/json', '.json'],
      onFile: (content, fileName) => {
        this.leftEditor.setValue(content);
        setTimeout(() => this.syncEditorHeights(), 50);
        this.showSuccess(`Loaded ${fileName} into left pane`);
      },
      onError: (error) => this.showError(error)
    });

    this.dropZoneRight = new FileDropZone({
      targetElement: this.query('#diff-input-right-container'),
      accept: ['application/json', '.json'],
      onFile: (content, fileName) => {
        this.rightEditor.setValue(content);
        setTimeout(() => this.syncEditorHeights(), 50);
        this.showSuccess(`Loaded ${fileName} into right pane`);
      },
      onError: (error) => this.showError(error)
    });
  }

  bindEvents() {
    // Compare button
    this.getElementById('btn-compare').addEventListener('click', () => this.handleCompare());

    // Clear button
    this.getElementById('btn-clear-diff').addEventListener('click', () => this.handleClear());

    // Click delegation for merge buttons
    this.query('#diff-output').addEventListener('click', (e) => {
      const btn = e.target.closest('.merge-btn');
      if (btn) {
        const index = parseInt(btn.getAttribute('data-index'), 10);
        const action = btn.getAttribute('data-action');
        this.mergeChange(index, action);
      }
    });
  }

  onMount() {
    // Initial sync after mount
    setTimeout(() => this.syncEditorHeights(), 100);
  }

  /**
   * Handle compare action
   */
  handleCompare() {
    const leftStr = this.leftEditor.getValue();
    const rightStr = this.rightEditor.getValue();

    if (!leftStr.trim() || !rightStr.trim()) {
      this.showError('Please enter JSON in both inputs');
      return;
    }

    const res1 = Formatter.parse(leftStr);
    const res2 = Formatter.parse(rightStr);

    if (res1.error || res2.error) {
      this.showError('Invalid JSON in one of the inputs');
      return;
    }

    // Sort keys and format editors
    const sorted1 = Differ.sortKeys(res1.data);
    const sorted2 = Differ.sortKeys(res2.data);

    const formatted1 = Formatter.format(sorted1);
    const formatted2 = Formatter.format(sorted2);

    this.leftEditor.setValue(formatted1);
    this.rightEditor.setValue(formatted2);

    // Sync heights after setting values
    setTimeout(() => this.syncEditorHeights(), 50);

    // Perform comparison
    const { hasDifferences, html } = Differ.compare(sorted1, sorted2, formatted1, formatted2);
    this.query('#diff-output').innerHTML = html;

    if (!hasDifferences) {
      this.showSuccess('✓ No differences found - JSONs are identical!');
    } else {
      this.showInfo('Differences found. Click merge buttons to apply changes.');
    }
  }

  /**
   * Handle clear action
   */
  handleClear() {
    this.leftEditor.clear();
    this.rightEditor.clear();
    this.query('#diff-output').textContent = '';
  }

  /**
   * Merge a change from diff
   * @param {number} index
   * @param {string} action
   */
  mergeChange(index, action) {
    const diff = Differ.lastDiff;
    if (!diff || !diff[index]) return;

    const change = diff[index];
    const leftValue = this.leftEditor.getValue();

    // Normalize newlines
    let lines = leftValue.replace(/\r\n/g, '\n').split('\n');

    // Safety check
    if (action === 'remove' || action === 'replace') {
      const targetLine = lines[change.lineLeft];
      const expectedContent = change.content;

      if (targetLine === undefined || targetLine.trim() !== expectedContent.trim()) {
        this.showError(`Sync Error: Editor content changed. Please re-compare.`);
        return;
      }
    }

    // Helper functions
    const getIndent = (line) => {
      const match = line.match(/^(\s*)/);
      return match ? match[1] : '';
    };

    const normalizeIndent = (content, targetIndent) => {
      const trimmed = content.trimStart();
      return targetIndent + trimmed;
    };

    // Apply change
    if (action === 'add') {
      let insertionPoint = change.lineLeft;

      if (insertionPoint >= lines.length) {
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].trim().match(/^[}\]]/)) {
            insertionPoint = i;
            break;
          }
        }
      }

      let targetIndent = '  ';
      if (insertionPoint > 0) {
        const prevLine = lines[insertionPoint - 1];
        if (prevLine && prevLine.trim() && !prevLine.trim().match(/^[{\[]/)) {
          targetIndent = getIndent(prevLine);
        }
      }

      if (insertionPoint < lines.length) {
        const nextLine = lines[insertionPoint];
        if (nextLine && nextLine.trim() && !nextLine.trim().match(/^[}\]]/)) {
          targetIndent = getIndent(nextLine);
        }
      }

      const normalizedContent = normalizeIndent(change.content, targetIndent);
      lines.splice(insertionPoint, 0, normalizedContent);
      change.lineLeft = insertionPoint;

    } else if (action === 'remove') {
      lines.splice(change.lineLeft, 1);

    } else if (action === 'replace') {
      const nextChange = diff[index + 1];
      if (nextChange && nextChange.type === 'added') {
        const targetIndent = getIndent(lines[change.lineLeft]);
        const normalizedContent = normalizeIndent(nextChange.content, targetIndent);
        lines.splice(change.lineLeft, 1, normalizedContent);
      }
    }

    // Fix commas
    if (action === 'add' || action === 'replace') {
      const insertedIndex = change.lineLeft;
      const insertedLine = lines[insertedIndex];
      const nextLine = lines[insertedIndex + 1];
      const prevLine = lines[insertedIndex - 1];

      if (nextLine && nextLine.trim().match(/^[}\]]/)) {
        if (insertedLine.trim().endsWith(',')) {
          lines[insertedIndex] = insertedLine.replace(/,$/, '');
        }
        if (prevLine && !prevLine.trim().match(/^[{\[]/) && !prevLine.trim().endsWith(',')) {
          lines[insertedIndex - 1] = prevLine + ',';
        }
      } else if (nextLine) {
        if (!insertedLine.trim().endsWith(',')) {
          lines[insertedIndex] = insertedLine + ',';
        }
        if (prevLine && !prevLine.trim().match(/^[{\[]/) && !prevLine.trim().endsWith(',')) {
          lines[insertedIndex - 1] = prevLine + ',';
        }
      }
    } else if (action === 'remove') {
      const newCurrent = lines[change.lineLeft];
      const prevLine = lines[change.lineLeft - 1];

      if (newCurrent && newCurrent.trim().match(/^[}\]]/)) {
        if (prevLine && prevLine.trim().endsWith(',')) {
          lines[change.lineLeft - 1] = prevLine.replace(/,$/, '');
        }
      }
    }

    const newValue = lines.join('\n');
    this.leftEditor.setValue(newValue);

    // Validate and re-compare
    const { error } = Formatter.parse(newValue);
    if (error) {
      this.showError('Warning: Merge resulted in invalid JSON. Please fix manually.');
      this.query('#diff-output').innerHTML = '<div style="padding: 20px; color: var(--error-color);">Diff disabled until JSON errors are fixed.</div>';
    } else {
      this.handleCompare();
    }
  }

  /**
   * Sync editor heights to match content
   */
  syncEditorHeights() {
    if (!this.leftEditor || !this.rightEditor) return;

    const leftTextarea = this.leftEditor.textarea;
    const rightTextarea = this.rightEditor.textarea;

    if (!leftTextarea || !rightTextarea) return;

    // Get wrappers
    const leftWrapper = leftTextarea.closest('.editor-wrapper');
    const rightWrapper = rightTextarea.closest('.editor-wrapper');

    if (!leftWrapper || !rightWrapper) return;

    // Reset heights to recalculate
    leftTextarea.style.height = 'auto';
    rightTextarea.style.height = 'auto';
    leftWrapper.style.height = 'auto';
    rightWrapper.style.height = 'auto';

    // Wait for DOM to update
    requestAnimationFrame(() => {
      // Calculate required heights based on scroll height
      const leftHeight = leftTextarea.scrollHeight;
      const rightHeight = rightTextarea.scrollHeight;
      const maxHeight = Math.max(leftHeight, rightHeight, 300);

      // Apply the same height to both wrappers and textareas
      leftWrapper.style.height = maxHeight + 'px';
      rightWrapper.style.height = maxHeight + 'px';
      leftTextarea.style.height = maxHeight + 'px';
      rightTextarea.style.height = maxHeight + 'px';

      // Get highlight layers - they will size automatically to match wrapper
      const leftHighlight = leftTextarea.previousElementSibling;
      const rightHighlight = rightTextarea.previousElementSibling;

      // Sync scroll positions (in case content changed)
      if (leftHighlight) {
        leftHighlight.scrollTop = leftTextarea.scrollTop;
        leftHighlight.scrollLeft = leftTextarea.scrollLeft;
      }
      if (rightHighlight) {
        rightHighlight.scrollTop = rightTextarea.scrollTop;
        rightHighlight.scrollLeft = rightTextarea.scrollLeft;
      }
    });
  }

  /**
   * Cleanup on unmount
   */
  onUnmount() {
    if (this.leftEditor) this.leftEditor.destroy();
    if (this.rightEditor) this.rightEditor.destroy();
    if (this.copyBtn) this.copyBtn.destroy();
    if (this.dropZoneLeft) this.dropZoneLeft.destroy();
    if (this.dropZoneRight) this.dropZoneRight.destroy();
  }
}

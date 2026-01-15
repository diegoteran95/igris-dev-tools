import { BaseTool } from '../../../components/base/BaseTool.js';
import { CodeEditor } from '../../../components/ui/CodeEditor.js';
import { CopyButton } from '../../../components/ui/CopyButton.js';
import { FileDropZone } from '../../../components/ui/FileDropZone.js';
import { Formatter } from './formatter.js';

/**
 * JSON Formatter Tool
 * Format, minify, and escape JSON
 */
export class FormatterTool extends BaseTool {
  constructor(containerId) {
    super(containerId);
    this.inputEditor = null;
    this.copyBtn = null;
    this.dropZone = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="formatter-tool">
        <div class="toolbar">
          <button id="btn-format" class="btn primary">Format</button>
          <button id="btn-minify" class="btn">Minify</button>
          <button id="btn-escape" class="btn">Escape</button>
          <button id="btn-clear" class="btn">Clear</button>
        </div>

        <div class="workspace">
          <div class="pane">
            <div class="pane-label-static">Input</div>
            <div class="editor-container" id="formatter-input-container"></div>
          </div>

          <div class="pane">
            <div class="pane-label-static">Output</div>
            <div class="editor-container" style="position: relative;">
              <div id="btn-copy-output"></div>
              <div id="formatter-output" class="code-view"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize input editor
    this.inputEditor = new CodeEditor({
      containerId: 'formatter-input-container',
      placeholder: 'Paste JSON here...',
      language: 'json',
      autoFormat: false
    });

    // Initialize copy button
    this.copyBtn = new CopyButton({
      getText: () => this.query('#formatter-output').textContent,
      position: 'floating'
    });
    const copyBtnEl = this.copyBtn.render();
    this.query('#btn-copy-output').replaceWith(copyBtnEl);

    // Initialize file drop zone
    const inputContainer = this.query('#formatter-input-container');
    this.dropZone = new FileDropZone({
      targetElement: inputContainer,
      accept: ['application/json', '.json'],
      onFile: (content, fileName) => {
        this.inputEditor.setValue(content);
        this.showSuccess(`Loaded ${fileName}`);
      },
      onError: (error) => {
        this.showError(error);
      }
    });
  }

  bindEvents() {
    // Format button
    this.getElementById('btn-format').addEventListener('click', () => this.handleFormat());

    // Minify button
    this.getElementById('btn-minify').addEventListener('click', () => this.handleMinify());

    // Escape button
    this.getElementById('btn-escape').addEventListener('click', () => this.handleEscape());

    // Clear button
    this.getElementById('btn-clear').addEventListener('click', () => this.handleClear());
  }

  /**
   * Handle format action
   */
  handleFormat() {
    const input = this.inputEditor.getValue();

    if (!input.trim()) {
      this.showError('Please enter JSON to format');
      return;
    }

    const { data, error } = Formatter.parse(input);

    if (error) {
      this.showError(`Invalid JSON: ${Formatter.getErrorDetails(error)}`);
      return;
    }

    const formatted = Formatter.format(data);
    const highlighted = Formatter.highlight(formatted);

    this.query('#formatter-output').innerHTML = highlighted;
    this.showSuccess('JSON formatted successfully');
  }

  /**
   * Handle minify action
   */
  handleMinify() {
    const input = this.inputEditor.getValue();

    if (!input.trim()) {
      this.showError('Please enter JSON to minify');
      return;
    }

    const { data, error } = Formatter.parse(input);

    if (error) {
      this.showError(`Invalid JSON: ${Formatter.getErrorDetails(error)}`);
      return;
    }

    const minified = Formatter.minify(data);

    this.query('#formatter-output').textContent = minified;
    this.showSuccess('JSON minified successfully');
  }

  /**
   * Handle escape action
   */
  handleEscape() {
    const input = this.inputEditor.getValue();

    if (!input.trim()) {
      this.showError('Please enter JSON to escape');
      return;
    }

    const { data, error } = Formatter.parse(input);

    if (error) {
      this.showError(`Invalid JSON: ${Formatter.getErrorDetails(error)}`);
      return;
    }

    const escaped = Formatter.escape(data);

    this.query('#formatter-output').textContent = escaped;
    this.showSuccess('JSON escaped successfully');
  }

  /**
   * Handle clear action
   */
  handleClear() {
    this.inputEditor.clear();
    this.query('#formatter-output').textContent = '';
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
    if (this.dropZone) {
      this.dropZone.destroy();
    }
  }
}

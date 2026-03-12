import { BaseTool } from '../../../components/base/BaseTool.js';
import { CodeEditor } from '../../../components/ui/CodeEditor.js';
import { CopyButton } from '../../../components/ui/CopyButton.js';

/**
 * URL Encoder/Decoder Tool
 * Encode and decode URLs and components
 */
export class URLEncoderTool extends BaseTool {
  constructor(containerId) {
    super(containerId);
    this.inputEditor = null;
    this.outputEditor = null;
    this.copyBtn = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="url-encoder-tool">
        <div class="toolbar">
          <div class="btn-group">
            <button id="btn-encode-url" class="btn primary">Encode Component</button>
            <button id="btn-decode-url" class="btn">Decode Component</button>
          </div>
          <div class="btn-group">
            <button id="btn-encode-full" class="btn">Encode URL</button>
            <button id="btn-decode-full" class="btn">Decode URL</button>
          </div>
          <span class="toolbar-sep"></span>
          <button id="btn-clear-url" class="btn ghost">Clear</button>
        </div>

        <div class="workspace">
          <div class="pane">
            <div class="pane-label-static">Input</div>
            <div class="editor-container" id="url-input-container"></div>
          </div>

          <div class="pane">
            <div class="pane-label-static">Output</div>
            <div class="editor-container" style="position: relative;">
              <div id="btn-copy-url"></div>
              <div id="url-output-container"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize editors
    this.inputEditor = new CodeEditor({
      containerId: 'url-input-container',
      placeholder: 'Enter URL or URL component...',
      language: 'text',
      autoFormat: false
    });

    this.outputEditor = new CodeEditor({
      containerId: 'url-output-container',
      placeholder: 'Result will appear here...',
      language: 'text',
      autoFormat: false,
      readOnly: true
    });

    // Initialize copy button
    this.copyBtn = new CopyButton({
      getText: () => this.outputEditor.getValue(),
      position: 'floating'
    });
    const copyBtnEl = this.copyBtn.render();
    this.query('#btn-copy-url').replaceWith(copyBtnEl);
  }

  bindEvents() {
    // Encode component button
    this.getElementById('btn-encode-url').addEventListener('click', () => this.handleEncodeComponent());

    // Decode component button
    this.getElementById('btn-decode-url').addEventListener('click', () => this.handleDecodeComponent());

    // Encode full URL button
    this.getElementById('btn-encode-full').addEventListener('click', () => this.handleEncodeFull());

    // Decode full URL button
    this.getElementById('btn-decode-full').addEventListener('click', () => this.handleDecodeFull());

    // Clear button
    this.getElementById('btn-clear-url').addEventListener('click', () => this.handleClear());
  }

  /**
   * Handle encode component action
   */
  handleEncodeComponent() {
    const input = this.inputEditor.getValue();

    if (!input.trim()) {
      this.showError('Please enter text to encode');
      return;
    }

    try {
      const encoded = encodeURIComponent(input);
      this.outputEditor.setValue(encoded);
      this.showSuccess('Encoded URL component successfully');
    } catch (error) {
      this.showError(`Encoding failed: ${error.message}`);
    }
  }

  /**
   * Handle decode component action
   */
  handleDecodeComponent() {
    const input = this.inputEditor.getValue();

    if (!input.trim()) {
      this.showError('Please enter encoded text to decode');
      return;
    }

    try {
      const decoded = decodeURIComponent(input);
      this.outputEditor.setValue(decoded);
      this.showSuccess('Decoded URL component successfully');
    } catch (error) {
      this.showError(`Decoding failed: Invalid encoded string`);
    }
  }

  /**
   * Handle encode full URL action
   */
  handleEncodeFull() {
    const input = this.inputEditor.getValue();

    if (!input.trim()) {
      this.showError('Please enter a URL to encode');
      return;
    }

    try {
      const encoded = encodeURI(input);
      this.outputEditor.setValue(encoded);
      this.showSuccess('Encoded full URL successfully');
    } catch (error) {
      this.showError(`Encoding failed: ${error.message}`);
    }
  }

  /**
   * Handle decode full URL action
   */
  handleDecodeFull() {
    const input = this.inputEditor.getValue();

    if (!input.trim()) {
      this.showError('Please enter an encoded URL to decode');
      return;
    }

    try {
      const decoded = decodeURI(input);
      this.outputEditor.setValue(decoded);
      this.showSuccess('Decoded full URL successfully');
    } catch (error) {
      this.showError(`Decoding failed: Invalid encoded URL`);
    }
  }

  /**
   * Handle clear action
   */
  handleClear() {
    this.inputEditor.clear();
    this.outputEditor.clear();
  }

  /**
   * Cleanup on unmount
   */
  onUnmount() {
    if (this.inputEditor) this.inputEditor.destroy();
    if (this.outputEditor) this.outputEditor.destroy();
    if (this.copyBtn) this.copyBtn.destroy();
  }
}

import { BaseTool } from '../../../components/base/BaseTool.js';
import { CodeEditor } from '../../../components/ui/CodeEditor.js';
import { CopyButton } from '../../../components/ui/CopyButton.js';
import { FileDropZone } from '../../../components/ui/FileDropZone.js';

/**
 * Base64 Encoder/Decoder Tool
 * Encode and decode Base64 with file support
 */
export class Base64Tool extends BaseTool {
  constructor(containerId) {
    super(containerId);
    this.inputEditor = null;
    this.outputEditor = null;
    this.copyBtn = null;
    this.dropZone = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="base64-tool">
        <div class="toolbar">
          <div class="btn-group">
            <button id="btn-encode" class="btn primary">Encode</button>
            <button id="btn-decode" class="btn">Decode</button>
          </div>
          <span class="toolbar-sep"></span>
          <button id="btn-clear-base64" class="btn ghost">Clear</button>
        </div>

        <p class="note">Tip: Drag & drop a file to encode it to Base64</p>

        <div class="workspace">
          <div class="pane">
            <div class="pane-label-static">Input</div>
            <div class="editor-container" id="base64-input-container"></div>
          </div>

          <div class="pane">
            <div class="pane-label-static">Output</div>
            <div class="editor-container" style="position: relative;">
              <div id="btn-copy-base64"></div>
              <div id="base64-output-container"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize editors
    this.inputEditor = new CodeEditor({
      containerId: 'base64-input-container',
      placeholder: 'Enter text or drop a file...',
      language: 'text',
      autoFormat: false
    });

    this.outputEditor = new CodeEditor({
      containerId: 'base64-output-container',
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
    this.query('#btn-copy-base64').replaceWith(copyBtnEl);

    // Initialize file drop zone
    this.dropZone = new FileDropZone({
      targetElement: this.query('#base64-input-container'),
      accept: ['*/*'], // Accept all file types
      maxSize: 50 * 1024 * 1024, // 50MB
      onFile: (content, fileName) => {
        this.inputEditor.setValue(content);
        this.showSuccess(`Loaded ${fileName}`);
        // Auto-encode after loading file
        this.handleEncode();
      },
      onError: (error) => this.showError(error)
    });
  }

  bindEvents() {
    // Encode button
    this.getElementById('btn-encode').addEventListener('click', () => this.handleEncode());

    // Decode button
    this.getElementById('btn-decode').addEventListener('click', () => this.handleDecode());

    // Clear button
    this.getElementById('btn-clear-base64').addEventListener('click', () => this.handleClear());
  }

  /**
   * Handle encode action
   */
  handleEncode() {
    const input = this.inputEditor.getValue();

    if (!input) {
      this.showError('Please enter text to encode');
      return;
    }

    try {
      // Encode to Base64
      const encoded = btoa(unescape(encodeURIComponent(input)));
      this.outputEditor.setValue(encoded);
      this.showSuccess('Encoded to Base64 successfully');
    } catch (error) {
      this.showError(`Encoding failed: ${error.message}`);
    }
  }

  /**
   * Handle decode action
   */
  handleDecode() {
    const input = this.inputEditor.getValue();

    if (!input.trim()) {
      this.showError('Please enter Base64 to decode');
      return;
    }

    try {
      // Decode from Base64
      const decoded = decodeURIComponent(escape(atob(input.trim())));
      this.outputEditor.setValue(decoded);
      this.showSuccess('Decoded from Base64 successfully');
    } catch (error) {
      this.showError(`Decoding failed: Invalid Base64 string`);
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
    if (this.dropZone) this.dropZone.destroy();
  }
}

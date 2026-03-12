import { BaseTool } from '../../../components/base/BaseTool.js';
import { CopyButton } from '../../../components/ui/CopyButton.js';

/**
 * UUID Generator Tool
 * Generate UUID v4 (random) and v7 (timestamp-based)
 */
export class UUIDGeneratorTool extends BaseTool {
  constructor(containerId) {
    super(containerId);
    this.uuids = [];
    this.copyAllBtn = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="uuid-generator-tool">
        <div class="toolbar">
          <div class="form-inline">
            <label>
              Quantity:
              <input type="number" id="uuid-quantity" value="1" min="1" max="1000" style="width: 80px;">
            </label>

            <div class="btn-group">
              <button id="btn-generate-v4" class="btn primary">UUID v4</button>
              <button id="btn-generate-v7" class="btn">UUID v7</button>
            </div>
            <span class="toolbar-sep"></span>
            <div id="btn-copy-all-uuids"></div>
            <button id="btn-clear-uuids" class="btn ghost">Clear</button>
          </div>
        </div>

        <div class="pane-label-static">
          <span>Generated UUIDs</span>
          <span id="uuid-count" style="margin-left: 8px; color: var(--text-secondary);"></span>
        </div>

        <div id="uuid-output" class="uuid-output"></div>
      </div>
    `;

    // Initialize copy all button
    this.copyAllBtn = new CopyButton({
      getText: () => this.uuids.join('\n'),
      label: 'Copy All'
    });
    const copyAllBtnEl = this.copyAllBtn.render();
    this.query('#btn-copy-all-uuids').replaceWith(copyAllBtnEl);
  }

  bindEvents() {
    // Generate UUID v4 button
    this.getElementById('btn-generate-v4').addEventListener('click', () => this.handleGenerateV4());

    // Generate UUID v7 button
    this.getElementById('btn-generate-v7').addEventListener('click', () => this.handleGenerateV7());

    // Clear button
    this.getElementById('btn-clear-uuids').addEventListener('click', () => this.handleClear());
  }

  /**
   * Handle generate UUID v4 action
   */
  handleGenerateV4() {
    const quantity = parseInt(this.query('#uuid-quantity').value, 10);

    if (isNaN(quantity) || quantity < 1 || quantity > 1000) {
      this.showError('Quantity must be between 1 and 1000');
      return;
    }

    this.uuids = [];
    for (let i = 0; i < quantity; i++) {
      this.uuids.push(this.generateUUIDv4());
    }

    this.renderUUIDs();
    this.showSuccess(`Generated ${quantity} UUID v4`);
  }

  /**
   * Handle generate UUID v7 action
   */
  handleGenerateV7() {
    const quantity = parseInt(this.query('#uuid-quantity').value, 10);

    if (isNaN(quantity) || quantity < 1 || quantity > 1000) {
      this.showError('Quantity must be between 1 and 1000');
      return;
    }

    this.uuids = [];
    for (let i = 0; i < quantity; i++) {
      this.uuids.push(this.generateUUIDv7());
      // Small delay to ensure unique timestamps for v7
      if (i < quantity - 1) {
        const now = Date.now();
        while (Date.now() === now) { /* busy wait */ }
      }
    }

    this.renderUUIDs();
    this.showSuccess(`Generated ${quantity} UUID v7`);
  }

  /**
   * Generate UUID v4 (random)
   * @returns {string}
   */
  generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate UUID v7 (timestamp-based)
   * @returns {string}
   */
  generateUUIDv7() {
    const timestamp = Date.now();
    const timestampHex = timestamp.toString(16).padStart(12, '0');

    const randomHex = () => Math.floor(Math.random() * 16).toString(16);
    const randomBytes = Array.from({ length: 20 }, randomHex).join('');

    // UUID v7 format: tttttttt-tttt-7xxx-yxxx-xxxxxxxxxxxx
    const uuid = [
      timestampHex.slice(0, 8),
      timestampHex.slice(8, 12),
      '7' + randomBytes.slice(0, 3),
      (parseInt(randomBytes[3], 16) & 0x3 | 0x8).toString(16) + randomBytes.slice(4, 7),
      randomBytes.slice(7, 19)
    ].join('-');

    return uuid;
  }

  /**
   * Render UUIDs
   */
  renderUUIDs() {
    const output = this.query('#uuid-output');
    const count = this.query('#uuid-count');

    if (this.uuids.length === 0) {
      output.innerHTML = '<div style="padding: 20px; color: var(--text-secondary);">No UUIDs generated</div>';
      count.textContent = '';
      return;
    }

    count.textContent = `(${this.uuids.length} UUID${this.uuids.length !== 1 ? 's' : ''})`;

    const html = this.uuids.map((uuid, index) => `
      <div class="uuid-item">
        <span class="uuid-index">${index + 1}</span>
        <code class="uuid-value">${uuid}</code>
        <button class="btn-copy-uuid" data-index="${index}" title="Copy this UUID">📋</button>
      </div>
    `).join('');

    output.innerHTML = html;

    // Bind copy buttons
    this.queryAll('.btn-copy-uuid').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'), 10);
        this.copyUUID(index);
      });
    });
  }

  /**
   * Copy a single UUID
   * @param {number} index
   */
  async copyUUID(index) {
    const uuid = this.uuids[index];
    if (!uuid) return;

    const success = await this.copyToClipboard(uuid);
    if (success) {
      this.showSuccess(`Copied UUID #${index + 1}`);
    }
  }

  /**
   * Handle clear action
   */
  handleClear() {
    this.uuids = [];
    this.query('#uuid-output').textContent = '';
    this.query('#uuid-count').textContent = '';
  }

  /**
   * Cleanup on unmount
   */
  onUnmount() {
    if (this.copyAllBtn) {
      this.copyAllBtn.destroy();
    }
  }
}

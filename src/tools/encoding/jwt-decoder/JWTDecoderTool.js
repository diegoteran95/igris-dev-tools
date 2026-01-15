import { BaseTool } from '../../../components/base/BaseTool.js';
import { CodeEditor } from '../../../components/ui/CodeEditor.js';
import { Formatter } from '../../json/formatter/formatter.js';

/**
 * JWT Decoder Tool
 * Decode and inspect JWT tokens
 */
export class JWTDecoderTool extends BaseTool {
  constructor(containerId) {
    super(containerId);
    this.inputEditor = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="jwt-decoder-tool">
        <div class="toolbar">
          <button id="btn-decode-jwt" class="btn primary">Decode JWT</button>
          <button id="btn-clear-jwt" class="btn">Clear</button>
        </div>

        <div class="workspace vertical">
          <div class="pane" style="flex: 1;">
            <div class="pane-label-static">JWT Token Input</div>
            <div class="editor-container" id="jwt-input-container"></div>
          </div>

          <div class="pane" style="flex: 2;">
            <div class="pane-label-static">Decoded JWT</div>
            <div id="jwt-output" class="jwt-output"></div>
          </div>
        </div>
      </div>
    `;

    // Initialize input editor
    this.inputEditor = new CodeEditor({
      containerId: 'jwt-input-container',
      placeholder: 'Paste JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)...',
      language: 'text',
      autoFormat: false
    });
  }

  bindEvents() {
    // Decode button
    this.getElementById('btn-decode-jwt').addEventListener('click', () => this.handleDecode());

    // Clear button
    this.getElementById('btn-clear-jwt').addEventListener('click', () => this.handleClear());
  }

  /**
   * Handle decode action
   */
  handleDecode() {
    const token = this.inputEditor.getValue().trim();

    if (!token) {
      this.showError('Please enter a JWT token');
      return;
    }

    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
      }

      // Decode header and payload
      const header = this.decodeBase64Url(parts[0]);
      const payload = this.decodeBase64Url(parts[1]);

      // Parse JSON
      const headerObj = JSON.parse(header);
      const payloadObj = JSON.parse(payload);

      // Check expiration
      const expirationInfo = this.getExpirationInfo(payloadObj);

      // Render decoded JWT
      this.renderDecodedJWT(headerObj, payloadObj, expirationInfo, parts[2]);

      this.showSuccess('JWT decoded successfully');
    } catch (error) {
      this.showError(`Failed to decode JWT: ${error.message}`);
      this.query('#jwt-output').innerHTML = `
        <div style="padding: 20px; color: var(--error-color);">
          <strong>Decoding Error:</strong><br>
          ${this.escapeHtml(error.message)}
        </div>
      `;
    }
  }

  /**
   * Decode Base64 URL-encoded string
   * @param {string} str
   * @returns {string}
   */
  decodeBase64Url(str) {
    // Replace URL-safe characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding
    const pad = base64.length % 4;
    if (pad) {
      base64 += '='.repeat(4 - pad);
    }

    // Decode
    return decodeURIComponent(escape(atob(base64)));
  }

  /**
   * Get expiration information
   * @param {Object} payload
   * @returns {Object}
   */
  getExpirationInfo(payload) {
    if (!payload.exp) {
      return { hasExpiration: false };
    }

    const expirationDate = new Date(payload.exp * 1000);
    const now = new Date();
    const isExpired = expirationDate < now;

    return {
      hasExpiration: true,
      expirationDate,
      isExpired,
      timeUntilExpiration: isExpired ? null : expirationDate - now
    };
  }

  /**
   * Render decoded JWT
   * @param {Object} header
   * @param {Object} payload
   * @param {Object} expirationInfo
   * @param {string} signature
   */
  renderDecodedJWT(header, payload, expirationInfo, signature) {
    const output = this.query('#jwt-output');

    const headerFormatted = Formatter.format(header);
    const payloadFormatted = Formatter.format(payload);

    const headerHighlighted = Formatter.highlight(headerFormatted);
    const payloadHighlighted = Formatter.highlight(payloadFormatted);

    let expirationHtml = '';
    if (expirationInfo.hasExpiration) {
      const statusClass = expirationInfo.isExpired ? 'expired' : 'valid';
      const statusText = expirationInfo.isExpired ? '❌ Expired' : '✅ Valid';
      const dateStr = expirationInfo.expirationDate.toLocaleString();

      expirationHtml = `
        <div class="jwt-expiration ${statusClass}">
          <strong>Expiration:</strong> ${statusText}<br>
          <span style="font-size: 13px;">${dateStr}</span>
        </div>
      `;
    }

    output.innerHTML = `
      <div class="jwt-section">
        <div class="jwt-section-header">
          <strong>HEADER</strong>
          <span class="jwt-section-info">Algorithm & Token Type</span>
        </div>
        <div class="code-view">${headerHighlighted}</div>
      </div>

      <div class="jwt-section">
        <div class="jwt-section-header">
          <strong>PAYLOAD</strong>
          <span class="jwt-section-info">Claims & Data</span>
        </div>
        ${expirationHtml}
        <div class="code-view">${payloadHighlighted}</div>
      </div>

      <div class="jwt-section">
        <div class="jwt-section-header">
          <strong>SIGNATURE</strong>
          <span class="jwt-section-info">Verify Authenticity (not validated)</span>
        </div>
        <div class="code-view" style="word-break: break-all;">${this.escapeHtml(signature)}</div>
      </div>
    `;
  }

  /**
   * Handle clear action
   */
  handleClear() {
    this.inputEditor.clear();
    this.query('#jwt-output').innerHTML = '';
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
  }
}

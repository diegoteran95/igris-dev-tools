import { BaseTool } from '../../../components/base/BaseTool.js';
import { CodeEditor } from '../../../components/ui/CodeEditor.js';
import { FileDropZone } from '../../../components/ui/FileDropZone.js';

/**
 * Hash Generator Tool
 * Generate MD5, SHA-1, SHA-256 hashes from text or files
 */
export class HashGeneratorTool extends BaseTool {
  constructor(containerId) {
    super(containerId);
    this.inputEditor = null;
    this.dropZone = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="hash-generator-tool">
        <div class="toolbar">
          <button id="btn-hash-md5" class="btn primary">Generate MD5</button>
          <button id="btn-hash-sha1" class="btn primary">Generate SHA-1</button>
          <button id="btn-hash-sha256" class="btn primary">Generate SHA-256</button>
          <button id="btn-hash-all" class="btn">Generate All</button>
          <button id="btn-clear-hash" class="btn">Clear</button>
        </div>

        <p class="note">Tip: Drag & drop a file to generate its hash</p>

        <div class="workspace vertical">
          <div class="pane">
            <div class="pane-label-static">Input Text</div>
            <div class="editor-container" id="hash-input-container"></div>
          </div>

          <div class="pane">
            <div class="pane-label-static">Hashes</div>
            <div id="hash-output" class="hash-output"></div>
          </div>
        </div>
      </div>
    `;

    // Initialize input editor
    this.inputEditor = new CodeEditor({
      containerId: 'hash-input-container',
      placeholder: 'Enter text or drop a file...',
      language: 'text',
      autoFormat: false
    });

    // Initialize file drop zone
    this.dropZone = new FileDropZone({
      targetElement: this.query('#hash-input-container'),
      accept: ['*/*'],
      maxSize: 100 * 1024 * 1024, // 100MB
      onFile: (content, fileName) => {
        this.inputEditor.setValue(content);
        this.showSuccess(`Loaded ${fileName}`);
        // Auto-generate all hashes after loading file
        this.handleGenerateAll();
      },
      onError: (error) => this.showError(error)
    });
  }

  bindEvents() {
    // Hash buttons
    this.getElementById('btn-hash-md5').addEventListener('click', () => this.handleGenerate('MD5'));
    this.getElementById('btn-hash-sha1').addEventListener('click', () => this.handleGenerate('SHA-1'));
    this.getElementById('btn-hash-sha256').addEventListener('click', () => this.handleGenerate('SHA-256'));
    this.getElementById('btn-hash-all').addEventListener('click', () => this.handleGenerateAll());

    // Clear button
    this.getElementById('btn-clear-hash').addEventListener('click', () => this.handleClear());
  }

  /**
   * Handle generate hash action
   * @param {string} algorithm
   */
  async handleGenerate(algorithm) {
    const text = this.inputEditor.getValue();

    if (!text) {
      this.showError('Please enter text to hash');
      return;
    }

    try {
      const hash = await this.generateHash(text, algorithm);
      this.renderHash(algorithm, hash);
      this.showSuccess(`${algorithm} hash generated`);
    } catch (error) {
      this.showError(`Failed to generate ${algorithm} hash: ${error.message}`);
    }
  }

  /**
   * Handle generate all hashes action
   */
  async handleGenerateAll() {
    const text = this.inputEditor.getValue();

    if (!text) {
      this.showError('Please enter text to hash');
      return;
    }

    try {
      const algorithms = ['MD5', 'SHA-1', 'SHA-256'];
      const hashes = {};

      for (const algorithm of algorithms) {
        hashes[algorithm] = await this.generateHash(text, algorithm);
      }

      this.renderAllHashes(hashes);
      this.showSuccess('All hashes generated');
    } catch (error) {
      this.showError(`Failed to generate hashes: ${error.message}`);
    }
  }

  /**
   * Generate hash
   * @param {string} text
   * @param {string} algorithm
   * @returns {Promise<string>}
   */
  async generateHash(text, algorithm) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    if (algorithm === 'MD5') {
      // MD5 is not available in WebCrypto, use a simple implementation
      return this.md5(text);
    }

    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  /**
   * Simple MD5 implementation
   * @param {string} string
   * @returns {string}
   */
  md5(string) {
    // Simple MD5 implementation for client-side use
    // Note: This is a simplified version and not cryptographically secure
    function rotateLeft(lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function addUnsigned(lX, lY) {
      const lX8 = (lX & 0x80000000);
      const lY8 = (lY & 0x80000000);
      const lX4 = (lX & 0x40000000);
      const lY4 = (lY & 0x40000000);
      const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
      if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
      if (lX4 | lY4) {
        if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      } else return (lResult ^ lX8 ^ lY8);
    }

    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }

    function FF(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(string) {
      let lWordCount;
      const lMessageLength = string.length;
      const lNumberOfWords_temp1 = lMessageLength + 8;
      const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
      const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
      const lWordArray = Array(lNumberOfWords - 1);
      let lBytePosition = 0;
      let lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    }

    function wordToHex(lValue) {
      let wordToHexValue = "", wordToHexValue_temp = "", lByte, lCount;
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        wordToHexValue_temp = "0" + lByte.toString(16);
        wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
      }
      return wordToHexValue;
    }

    const x = convertToWordArray(string);
    let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;

    for (let k = 0; k < x.length; k += 16) {
      const AA = a, BB = b, CC = c, DD = d;
      a = FF(a, b, c, d, x[k + 0], 7, 0xD76AA478);
      d = FF(d, a, b, c, x[k + 1], 12, 0xE8C7B756);
      c = FF(c, d, a, b, x[k + 2], 17, 0x242070DB);
      b = FF(b, c, d, a, x[k + 3], 22, 0xC1BDCEEE);
      a = FF(a, b, c, d, x[k + 4], 7, 0xF57C0FAF);
      d = FF(d, a, b, c, x[k + 5], 12, 0x4787C62A);
      c = FF(c, d, a, b, x[k + 6], 17, 0xA8304613);
      b = FF(b, c, d, a, x[k + 7], 22, 0xFD469501);
      a = FF(a, b, c, d, x[k + 8], 7, 0x698098D8);
      d = FF(d, a, b, c, x[k + 9], 12, 0x8B44F7AF);
      c = FF(c, d, a, b, x[k + 10], 17, 0xFFFF5BB1);
      b = FF(b, c, d, a, x[k + 11], 22, 0x895CD7BE);
      a = FF(a, b, c, d, x[k + 12], 7, 0x6B901122);
      d = FF(d, a, b, c, x[k + 13], 12, 0xFD987193);
      c = FF(c, d, a, b, x[k + 14], 17, 0xA679438E);
      b = FF(b, c, d, a, x[k + 15], 22, 0x49B40821);
      a = GG(a, b, c, d, x[k + 1], 5, 0xF61E2562);
      d = GG(d, a, b, c, x[k + 6], 9, 0xC040B340);
      c = GG(c, d, a, b, x[k + 11], 14, 0x265E5A51);
      b = GG(b, c, d, a, x[k + 0], 20, 0xE9B6C7AA);
      a = GG(a, b, c, d, x[k + 5], 5, 0xD62F105D);
      d = GG(d, a, b, c, x[k + 10], 9, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], 14, 0xD8A1E681);
      b = GG(b, c, d, a, x[k + 4], 20, 0xE7D3FBC8);
      a = GG(a, b, c, d, x[k + 9], 5, 0x21E1CDE6);
      d = GG(d, a, b, c, x[k + 14], 9, 0xC33707D6);
      c = GG(c, d, a, b, x[k + 3], 14, 0xF4D50D87);
      b = GG(b, c, d, a, x[k + 8], 20, 0x455A14ED);
      a = GG(a, b, c, d, x[k + 13], 5, 0xA9E3E905);
      d = GG(d, a, b, c, x[k + 2], 9, 0xFCEFA3F8);
      c = GG(c, d, a, b, x[k + 7], 14, 0x676F02D9);
      b = GG(b, c, d, a, x[k + 12], 20, 0x8D2A4C8A);
      a = HH(a, b, c, d, x[k + 5], 4, 0xFFFA3942);
      d = HH(d, a, b, c, x[k + 8], 11, 0x8771F681);
      c = HH(c, d, a, b, x[k + 11], 16, 0x6D9D6122);
      b = HH(b, c, d, a, x[k + 14], 23, 0xFDE5380C);
      a = HH(a, b, c, d, x[k + 1], 4, 0xA4BEEA44);
      d = HH(d, a, b, c, x[k + 4], 11, 0x4BDECFA9);
      c = HH(c, d, a, b, x[k + 7], 16, 0xF6BB4B60);
      b = HH(b, c, d, a, x[k + 10], 23, 0xBEBFBC70);
      a = HH(a, b, c, d, x[k + 13], 4, 0x289B7EC6);
      d = HH(d, a, b, c, x[k + 0], 11, 0xEAA127FA);
      c = HH(c, d, a, b, x[k + 3], 16, 0xD4EF3085);
      b = HH(b, c, d, a, x[k + 6], 23, 0x4881D05);
      a = HH(a, b, c, d, x[k + 9], 4, 0xD9D4D039);
      d = HH(d, a, b, c, x[k + 12], 11, 0xE6DB99E5);
      c = HH(c, d, a, b, x[k + 15], 16, 0x1FA27CF8);
      b = HH(b, c, d, a, x[k + 2], 23, 0xC4AC5665);
      a = II(a, b, c, d, x[k + 0], 6, 0xF4292244);
      d = II(d, a, b, c, x[k + 7], 10, 0x432AFF97);
      c = II(c, d, a, b, x[k + 14], 15, 0xAB9423A7);
      b = II(b, c, d, a, x[k + 5], 21, 0xFC93A039);
      a = II(a, b, c, d, x[k + 12], 6, 0x655B59C3);
      d = II(d, a, b, c, x[k + 3], 10, 0x8F0CCC92);
      c = II(c, d, a, b, x[k + 10], 15, 0xFFEFF47D);
      b = II(b, c, d, a, x[k + 1], 21, 0x85845DD1);
      a = II(a, b, c, d, x[k + 8], 6, 0x6FA87E4F);
      d = II(d, a, b, c, x[k + 15], 10, 0xFE2CE6E0);
      c = II(c, d, a, b, x[k + 6], 15, 0xA3014314);
      b = II(b, c, d, a, x[k + 13], 21, 0x4E0811A1);
      a = II(a, b, c, d, x[k + 4], 6, 0xF7537E82);
      d = II(d, a, b, c, x[k + 11], 10, 0xBD3AF235);
      c = II(c, d, a, b, x[k + 2], 15, 0x2AD7D2BB);
      b = II(b, c, d, a, x[k + 9], 21, 0xEB86D391);
      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }

    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
  }

  /**
   * Render single hash
   * @param {string} algorithm
   * @param {string} hash
   */
  renderHash(algorithm, hash) {
    const output = this.query('#hash-output');
    output.innerHTML = this.createHashItem(algorithm, hash);
    this.bindCopyButton();
  }

  /**
   * Render all hashes
   * @param {Object} hashes
   */
  renderAllHashes(hashes) {
    const output = this.query('#hash-output');
    const html = Object.entries(hashes).map(([algorithm, hash]) =>
      this.createHashItem(algorithm, hash)
    ).join('');
    output.innerHTML = html;
    this.bindCopyButtons();
  }

  /**
   * Create hash item HTML
   * @param {string} algorithm
   * @param {string} hash
   * @returns {string}
   */
  createHashItem(algorithm, hash) {
    return `
      <div class="uuid-item">
        <span class="uuid-index">${algorithm}</span>
        <code class="uuid-value">${hash}</code>
        <button class="btn-copy-hash" data-hash="${hash}" title="Copy hash">📋</button>
      </div>
    `;
  }

  /**
   * Bind copy button
   */
  bindCopyButton() {
    const btn = this.query('.btn-copy-hash');
    if (btn) {
      btn.addEventListener('click', () => {
        const hash = btn.getAttribute('data-hash');
        this.copyHash(hash);
      });
    }
  }

  /**
   * Bind copy buttons
   */
  bindCopyButtons() {
    this.queryAll('.btn-copy-hash').forEach(btn => {
      btn.addEventListener('click', () => {
        const hash = btn.getAttribute('data-hash');
        this.copyHash(hash);
      });
    });
  }

  /**
   * Copy hash
   * @param {string} hash
   */
  async copyHash(hash) {
    const success = await this.copyToClipboard(hash);
    if (success) {
      this.showSuccess('Hash copied');
    }
  }

  /**
   * Handle clear action
   */
  handleClear() {
    this.inputEditor.clear();
    this.query('#hash-output').textContent = '';
  }

  /**
   * Cleanup on unmount
   */
  onUnmount() {
    if (this.inputEditor) this.inputEditor.destroy();
    if (this.dropZone) this.dropZone.destroy();
  }
}

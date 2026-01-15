/**
 * Copy Button Component
 * Reusable button for copying text to clipboard
 */
export class CopyButton {
  constructor(options = {}) {
    this.options = {
      getText: () => '',         // Function to get text to copy
      position: 'inline',        // 'inline' | 'floating'
      label: 'Copy',
      successLabel: '✓ Copied!',
      successDuration: 2000,
      onCopy: null,              // Callback(success, text)
      ...options
    };

    this.element = null;
    this.labelEl = null;
  }

  /**
   * Render button
   * @returns {HTMLElement}
   */
  render() {
    const btn = document.createElement('button');
    btn.className = `copy-btn ${this.options.position === 'floating' ? 'floating-copy' : ''}`;

    btn.innerHTML = `
      <span class="copy-icon">📋</span>
      <span class="copy-label">${this.options.label}</span>
    `;

    btn.addEventListener('click', () => this.copy());

    this.element = btn;
    this.labelEl = btn.querySelector('.copy-label');

    return btn;
  }

  /**
   * Copy text to clipboard
   */
  async copy() {
    const text = this.options.getText();

    if (!text) {
      this.showFeedback('Nothing to copy', false);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.showFeedback(this.options.successLabel, true);

      if (this.options.onCopy) {
        this.options.onCopy(true, text);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      this.showFeedback('Failed to copy', false);

      if (this.options.onCopy) {
        this.options.onCopy(false, text);
      }
    }
  }

  /**
   * Show feedback message
   * @param {string} message
   * @param {boolean} success
   */
  showFeedback(message, success) {
    if (!this.labelEl) return;

    const originalText = this.labelEl.textContent;
    this.labelEl.textContent = message;

    if (success) {
      this.element.classList.add('success');
    }

    setTimeout(() => {
      this.labelEl.textContent = originalText;
      this.element.classList.remove('success');
    }, this.options.successDuration);
  }

  /**
   * Update button label
   * @param {string} label
   */
  setLabel(label) {
    this.options.label = label;
    if (this.labelEl) {
      this.labelEl.textContent = label;
    }
  }

  /**
   * Destroy button
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
  }
}

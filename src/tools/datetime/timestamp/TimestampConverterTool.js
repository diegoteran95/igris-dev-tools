import { BaseTool } from '../../../components/base/BaseTool.js';
import { CopyButton } from '../../../components/ui/CopyButton.js';

/**
 * Timestamp Converter Tool
 * Convert between Unix timestamps and human-readable dates with timezone support
 */
export class TimestampConverterTool extends BaseTool {
  constructor(containerId) {
    super(containerId);
    this.timezone = localStorage.getItem('timestamp-timezone') || 'UTC';
    this.copySecondsBtn = null;
    this.copyMillisBtn = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="timestamp-converter-tool">
        <!-- Timezone Selector -->
        <div class="toolbar">
          <div class="form-inline">
            <label>
              <strong>Timezone:</strong>
              <select id="timezone-select" style="min-width: 200px;">
                ${this.renderTimezoneOptions()}
              </select>
            </label>
            <button id="btn-now" class="btn">Now</button>
          </div>
        </div>

        <div class="workspace vertical">
          <!-- Unix to Date -->
          <div class="pane">
            <div class="pane-label-static">Unix Timestamp → Date</div>
            <div class="timestamp-section">
              <div class="form-group">
                <label>Unix Timestamp:</label>
                <input type="text" id="unix-input" placeholder="e.g., 1704067200 or 1704067200000" style="width: 100%;">
                <small style="color: var(--text-secondary); font-size: 12px;">
                  Auto-detects seconds (10 digits) or milliseconds (13 digits)
                </small>
              </div>

              <div id="unix-to-date-output" class="timestamp-output"></div>
            </div>
          </div>

          <!-- Date to Unix -->
          <div class="pane">
            <div class="pane-label-static">Date → Unix Timestamp</div>
            <div class="timestamp-section">
              <div class="form-group">
                <label>Date & Time:</label>
                <input type="datetime-local" id="date-input" style="width: 100%;">
              </div>

              <div id="date-to-unix-output" class="timestamp-results">
                <div class="timestamp-result-item">
                  <span class="timestamp-result-label">Unix (seconds):</span>
                  <code class="timestamp-result-value" id="unix-seconds">-</code>
                  <div id="btn-copy-seconds"></div>
                </div>

                <div class="timestamp-result-item">
                  <span class="timestamp-result-label">Unix (milliseconds):</span>
                  <code class="timestamp-result-value" id="unix-millis">-</code>
                  <div id="btn-copy-millis"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Set timezone select value
    this.query('#timezone-select').value = this.timezone;

    // Initialize copy buttons
    this.copySecondsBtn = new CopyButton({
      getText: () => this.query('#unix-seconds').textContent,
      position: 'inline',
      label: '📋'
    });
    const copySecondsBtnEl = this.copySecondsBtn.render();
    this.query('#btn-copy-seconds').replaceWith(copySecondsBtnEl);

    this.copyMillisBtn = new CopyButton({
      getText: () => this.query('#unix-millis').textContent,
      position: 'inline',
      label: '📋'
    });
    const copyMillisBtnEl = this.copyMillisBtn.render();
    this.query('#btn-copy-millis').replaceWith(copyMillisBtnEl);
  }

  /**
   * Render timezone options
   * @returns {string}
   */
  renderTimezoneOptions() {
    const timezones = [
      'UTC',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Bogota',
      'America/Mexico_City',
      'America/Sao_Paulo',
      'Europe/London',
      'Europe/Paris',
      'Europe/Madrid',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Dubai',
      'Asia/Kolkata',
      'Australia/Sydney',
      'Pacific/Auckland'
    ];

    return timezones.map(tz =>
      `<option value="${tz}" ${tz === this.timezone ? 'selected' : ''}>${tz}</option>`
    ).join('');
  }

  bindEvents() {
    // Timezone change
    this.query('#timezone-select').addEventListener('change', (e) => {
      this.timezone = e.target.value;
      localStorage.setItem('timestamp-timezone', this.timezone);

      // Re-convert if there's input
      const unixInput = this.query('#unix-input').value;
      if (unixInput.trim()) {
        this.handleUnixToDate();
      }

      const dateInput = this.query('#date-input').value;
      if (dateInput) {
        this.handleDateToUnix();
      }
    });

    // Unix input change
    this.query('#unix-input').addEventListener('input', () => this.handleUnixToDate());

    // Date input change
    this.query('#date-input').addEventListener('change', () => this.handleDateToUnix());

    // Now button
    this.getElementById('btn-now').addEventListener('click', () => this.handleNow());
  }

  /**
   * Handle Unix to Date conversion
   */
  handleUnixToDate() {
    const input = this.query('#unix-input').value.trim();
    const output = this.query('#unix-to-date-output');

    if (!input) {
      output.innerHTML = '';
      return;
    }

    const timestamp = parseInt(input, 10);

    if (isNaN(timestamp)) {
      output.innerHTML = '<div style="color: var(--error-color);">Invalid timestamp</div>';
      return;
    }

    // Auto-detect seconds (10 digits) vs milliseconds (13 digits)
    const isMilliseconds = input.length === 13;
    const date = new Date(isMilliseconds ? timestamp : timestamp * 1000);

    if (isNaN(date.getTime())) {
      output.innerHTML = '<div style="color: var(--error-color);">Invalid timestamp</div>';
      return;
    }

    // Format date in different formats
    const iso = date.toISOString();
    const localeString = this.formatInTimezone(date, this.timezone);
    const relative = this.getRelativeTime(date);

    output.innerHTML = `
      <div class="timestamp-display">
        <div class="timestamp-display-item">
          <span class="timestamp-display-label">Type:</span>
          <span class="timestamp-display-value">${isMilliseconds ? 'Milliseconds (13 digits)' : 'Seconds (10 digits)'}</span>
        </div>

        <div class="timestamp-display-item">
          <span class="timestamp-display-label">ISO 8601:</span>
          <code class="timestamp-display-value">${iso}</code>
        </div>

        <div class="timestamp-display-item">
          <span class="timestamp-display-label">${this.timezone}:</span>
          <span class="timestamp-display-value">${localeString}</span>
        </div>

        <div class="timestamp-display-item">
          <span class="timestamp-display-label">Relative:</span>
          <span class="timestamp-display-value">${relative}</span>
        </div>
      </div>
    `;
  }

  /**
   * Handle Date to Unix conversion
   */
  handleDateToUnix() {
    const dateInput = this.query('#date-input').value;

    if (!dateInput) {
      this.query('#unix-seconds').textContent = '-';
      this.query('#unix-millis').textContent = '-';
      return;
    }

    // Parse date in the selected timezone
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
      this.query('#unix-seconds').textContent = 'Invalid date';
      this.query('#unix-millis').textContent = 'Invalid date';
      return;
    }

    const unixSeconds = Math.floor(date.getTime() / 1000);
    const unixMillis = date.getTime();

    this.query('#unix-seconds').textContent = unixSeconds;
    this.query('#unix-millis').textContent = unixMillis;
  }

  /**
   * Handle Now button click
   */
  handleNow() {
    const now = Date.now();
    const unixSeconds = Math.floor(now / 1000);

    // Fill Unix input
    this.query('#unix-input').value = unixSeconds;
    this.handleUnixToDate();

    // Fill Date input
    const nowDate = new Date(now);
    const dateStr = nowDate.toISOString().slice(0, 16);
    this.query('#date-input').value = dateStr;
    this.handleDateToUnix();

    this.showSuccess('Filled with current timestamp');
  }

  /**
   * Format date in timezone
   * @param {Date} date
   * @param {string} timezone
   * @returns {string}
   */
  formatInTimezone(date, timezone) {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(date);
    } catch (error) {
      return date.toLocaleString();
    }
  }

  /**
   * Get relative time
   * @param {Date} date
   * @returns {string}
   */
  getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return diffSeconds === 0 ? 'just now' : `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) {
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
      } else {
        const diffYears = Math.floor(diffMonths / 12);
        return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
      }
    }
  }

  /**
   * Cleanup on unmount
   */
  onUnmount() {
    if (this.copySecondsBtn) this.copySecondsBtn.destroy();
    if (this.copyMillisBtn) this.copyMillisBtn.destroy();
  }
}

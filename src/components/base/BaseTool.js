/**
 * Base class providing common tool functionality
 * All tools should extend this class
 */
export class BaseTool {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);

    if (!this.container) {
      throw new Error(`BaseTool: Container element "${containerId}" not found`);
    }

    this.state = {};
    this.elements = {};
  }

  /**
   * Lifecycle: Mount the tool
   * Called when the tool becomes active
   */
  mount() {
    this.render();
    this.bindEvents();
    this.onMount();
  }

  /**
   * Lifecycle: Unmount the tool
   * Called when the tool becomes inactive
   */
  unmount() {
    this.onUnmount();
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.elements = {};
  }

  /**
   * Render the tool's HTML
   * Must be implemented by subclasses
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }

  /**
   * Bind event listeners
   * Override in subclasses
   */
  bindEvents() {
    // Override in subclass
  }

  /**
   * Called after mount
   * Override in subclasses
   */
  onMount() {
    // Override in subclass
  }

  /**
   * Called before unmount
   * Override in subclasses for cleanup
   */
  onUnmount() {
    // Override in subclass
  }

  /**
   * Update tool state
   * @param {Object} newState
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Show error message
   * @param {string} message
   */
  showError(message) {
    this.emit('notification', {
      type: 'error',
      message
    });
  }

  /**
   * Show success message
   * @param {string} message
   */
  showSuccess(message) {
    this.emit('notification', {
      type: 'success',
      message
    });
  }

  /**
   * Show info message
   * @param {string} message
   */
  showInfo(message) {
    this.emit('notification', {
      type: 'info',
      message
    });
  }

  /**
   * Copy text to clipboard
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Emit custom event
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    window.dispatchEvent(new CustomEvent(`tool:${event}`, {
      detail: data
    }));
  }

  /**
   * Listen to custom event
   * @param {string} event
   * @param {Function} handler
   * @returns {Function} cleanup function
   */
  on(event, handler) {
    const listener = (e) => handler(e.detail);
    window.addEventListener(`tool:${event}`, listener);

    // Return cleanup function
    return () => window.removeEventListener(`tool:${event}`, listener);
  }

  /**
   * Helper: Get element by ID
   * @param {string} id
   * @returns {HTMLElement|null}
   */
  getElementById(id) {
    return document.getElementById(id);
  }

  /**
   * Helper: Query selector within container
   * @param {string} selector
   * @returns {HTMLElement|null}
   */
  query(selector) {
    return this.container.querySelector(selector);
  }

  /**
   * Helper: Query selector all within container
   * @param {string} selector
   * @returns {NodeList}
   */
  queryAll(selector) {
    return this.container.querySelectorAll(selector);
  }
}

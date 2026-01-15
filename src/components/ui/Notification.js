/**
 * Notification Manager
 * Displays toast notifications for user feedback
 */
export class NotificationManager {
  constructor() {
    this.container = null;
    this.notifications = [];
    this.init();
  }

  /**
   * Initialize notification system
   */
  init() {
    // Create notification container
    this.container = document.createElement('div');
    this.container.className = 'notification-container';
    document.body.appendChild(this.container);

    // Listen for tool notifications
    window.addEventListener('tool:notification', (e) => {
      this.show(e.detail);
    });
  }

  /**
   * Show a notification
   * @param {Object} options - { type, message, duration }
   */
  show({ type = 'info', message, duration = 3000 }) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    // Add icon based on type
    const icon = this.getIcon(type);

    notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-message">${this.escapeHtml(message)}</span>
      <button class="notification-close" aria-label="Close">×</button>
    `;

    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.hide(notification));

    // Add to container
    this.container.appendChild(notification);
    this.notifications.push(notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('visible');
    });

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => this.hide(notification), duration);
    }
  }

  /**
   * Hide a notification
   * @param {HTMLElement} notification
   */
  hide(notification) {
    notification.classList.remove('visible');

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }

      const index = this.notifications.indexOf(notification);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    }, 300); // Match CSS transition duration
  }

  /**
   * Get icon for notification type
   * @param {string} type
   * @returns {string}
   */
  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications.forEach(notification => this.hide(notification));
  }
}

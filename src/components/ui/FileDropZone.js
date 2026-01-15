/**
 * File Drop Zone Component
 * Handles drag-and-drop file uploads
 */
export class FileDropZone {
  constructor(options = {}) {
    this.options = {
      targetElement: null,
      accept: ['application/json', '.json'], // MIME types or extensions
      maxSize: 10 * 1024 * 1024,             // 10MB default
      onFile: null,                           // Callback(content, fileName, file)
      onError: null,                          // Callback(error)
      highlightClass: 'drag-over',
      ...options
    };

    if (!this.options.targetElement) {
      throw new Error('FileDropZone: targetElement is required');
    }

    this.bindEvents();
  }

  /**
   * Bind drag-and-drop events
   */
  bindEvents() {
    const el = this.options.targetElement;

    // Prevent default behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      el.addEventListener(eventName, this.preventDefaults.bind(this), false);
      document.body.addEventListener(eventName, this.preventDefaults.bind(this), false);
    });

    // Highlight drop zone
    ['dragenter', 'dragover'].forEach(eventName => {
      el.addEventListener(eventName, () => this.highlight(), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      el.addEventListener(eventName, () => this.unhighlight(), false);
    });

    // Handle drop
    el.addEventListener('drop', (e) => this.handleDrop(e), false);
  }

  /**
   * Prevent default drag behaviors
   * @param {Event} e
   */
  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Highlight drop zone
   */
  highlight() {
    this.options.targetElement.classList.add(this.options.highlightClass);
  }

  /**
   * Remove highlight
   */
  unhighlight() {
    this.options.targetElement.classList.remove(this.options.highlightClass);
  }

  /**
   * Handle file drop
   * @param {DragEvent} e
   */
  handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length === 0) return;

    // Process first file only
    this.handleFile(files[0]);
  }

  /**
   * Handle file
   * @param {File} file
   */
  handleFile(file) {
    // Check file size
    if (file.size > this.options.maxSize) {
      const error = `File too large. Max size: ${this.formatFileSize(this.options.maxSize)}`;
      this.handleError(error);
      return;
    }

    // Check file type
    const isAccepted = this.isFileAccepted(file);
    if (!isAccepted) {
      const error = `File type not accepted. Expected: ${this.options.accept.join(', ')}`;
      this.handleError(error);
      return;
    }

    // Read file
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target.result;

      if (this.options.onFile) {
        this.options.onFile(content, file.name, file);
      }
    };

    reader.onerror = () => {
      this.handleError('Failed to read file');
    };

    reader.readAsText(file);
  }

  /**
   * Check if file is accepted
   * @param {File} file
   * @returns {boolean}
   */
  isFileAccepted(file) {
    return this.options.accept.some(type => {
      // Check MIME type
      if (type.startsWith('.')) {
        return file.name.endsWith(type);
      }
      return file.type === type;
    });
  }

  /**
   * Handle error
   * @param {string} error
   */
  handleError(error) {
    console.error('FileDropZone:', error);

    if (this.options.onError) {
      this.options.onError(error);
    }
  }

  /**
   * Format file size
   * @param {number} bytes
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Destroy drop zone
   */
  destroy() {
    // Remove event listeners
    const el = this.options.targetElement;
    if (el) {
      el.classList.remove(this.options.highlightClass);
    }
  }
}

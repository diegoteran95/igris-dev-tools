export const UI = {
  elements: {},

  init() {
    this.elements = {
      input: document.getElementById('json-input'),
      output: document.getElementById('json-output'),
      formatBtn: document.getElementById('btn-format'),
      minifyBtn: document.getElementById('btn-minify'),
      escapeBtn: document.getElementById('btn-escape'),
      compareBtn: document.getElementById('btn-compare'),
      diffBtn: document.getElementById('btn-diff'),
      themeToggle: document.getElementById('theme-toggle'),
      errorMsg: document.getElementById('error-msg'),
      successMsg: document.getElementById('success-msg'),
      
      // Diff elements
      formatWorkspace: document.getElementById('format-workspace'),
      diffWorkspace: document.getElementById('diff-workspace'),
      diffInputLeft: document.getElementById('diff-input-left'),
      diffInputRight: document.getElementById('diff-input-right'),
      diffOutput: document.getElementById('diff-output'),
    };
    
    this.setupListeners();
    this.loadTheme();
  },

  setupListeners() {
    this.elements.themeToggle?.addEventListener('click', () => this.toggleTheme());
    this.elements.diffBtn?.addEventListener('click', () => this.toggleMode());
  },

  toggleMode() {
    const isDiffMode = this.elements.diffWorkspace.style.display !== 'none';
    const diffNote = document.getElementById('diff-note');
    
    if (isDiffMode) {
      // Switch to Format Mode
      this.elements.diffWorkspace.style.display = 'none';
      this.elements.formatWorkspace.style.display = 'flex';
      this.elements.diffBtn.textContent = 'Switch to Diff Mode';
      this.elements.formatBtn.style.display = 'inline-block';
      this.elements.minifyBtn.style.display = 'inline-block';
      this.elements.escapeBtn.style.display = 'inline-block';
      this.elements.compareBtn.style.display = 'none';
      if (diffNote) diffNote.style.display = 'none';
    } else {
      // Switch to Diff Mode
      this.elements.diffWorkspace.style.display = 'flex';
      this.elements.formatWorkspace.style.display = 'none';
      this.elements.diffBtn.textContent = 'Switch to Format Mode';
      this.elements.formatBtn.style.display = 'none';
      this.elements.minifyBtn.style.display = 'none';
      this.elements.escapeBtn.style.display = 'none';
      this.elements.compareBtn.style.display = 'inline-block';
      if (diffNote) diffNote.style.display = 'block';
    }
  },

  toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  },

  loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
  },

  showError(msg) {
    if (this.elements.errorMsg) {
      this.elements.errorMsg.textContent = msg;
      this.elements.errorMsg.classList.add('visible');
    }
  },

  clearError() {
    if (this.elements.errorMsg) {
      this.elements.errorMsg.classList.remove('visible');
    }
  },

  showSuccess(msg) {
    if (this.elements.successMsg) {
      this.elements.successMsg.textContent = msg;
      this.elements.successMsg.classList.add('visible');
    }
  },

  clearSuccess() {
    if (this.elements.successMsg) {
      this.elements.successMsg.classList.remove('visible');
    }
  },

  clearAllMessages() {
    this.clearError();
    this.clearSuccess();
  }
};

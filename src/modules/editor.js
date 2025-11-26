import { Formatter } from './formatter.js';

export class SimpleEditor {
  constructor(containerId, placeholder = '') {
    this.container = document.getElementById(containerId);
    this.placeholder = placeholder;
    this.value = '';
    
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="editor-wrapper">
        <pre class="editor-highlight code-view" aria-hidden="true"></pre>
        <textarea class="editor-input" placeholder="${this.placeholder}" spellcheck="false"></textarea>
      </div>
    `;
    
    this.textarea = this.container.querySelector('.editor-input');
    this.pre = this.container.querySelector('.editor-highlight');
  }

  bindEvents() {
    this.textarea.addEventListener('input', () => this.update());
    this.textarea.addEventListener('scroll', () => this.syncScroll());
    
    // Auto-format on blur if valid JSON
    this.textarea.addEventListener('blur', () => {
      const val = this.textarea.value.trim();
      if (val) {
        const { data, error } = Formatter.parse(val);
        if (!error) {
          this.setValue(Formatter.format(data));
        }
      }
    });
  }

  update() {
    this.value = this.textarea.value;
    const highlighted = Formatter.highlight(this.value);
    
    // We need to add a trailing space to the pre if the textarea ends with a newline
    // so that scrolling matches
    this.pre.innerHTML = highlighted + (this.value.endsWith('\n') ? '<br>&nbsp;' : '');
  }

  syncScroll() {
    this.pre.scrollTop = this.textarea.scrollTop;
    this.pre.scrollLeft = this.textarea.scrollLeft;
  }

  setValue(text) {
    this.textarea.value = text;
    this.update();
  }

  getValue() {
    return this.textarea.value;
  }
}

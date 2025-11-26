import { UI } from './modules/ui.js';
import { Formatter } from './modules/formatter.js';
import { Differ } from './modules/differ.js';
import { SimpleEditor } from './modules/editor.js';

document.addEventListener('DOMContentLoaded', () => {
  UI.init();
  
  // Initialize Editors
  const leftEditor = new SimpleEditor('diff-input-left-container', 'Original JSON...');
  const rightEditor = new SimpleEditor('diff-input-right-container', 'Modified JSON...');
  
  // Store editors in UI for access (optional, or just keep local)
  UI.editors = { left: leftEditor, right: rightEditor };

  // Wire up buttons
  document.getElementById('btn-format')?.addEventListener('click', () => {
    const input = UI.elements.input.value;
    if (!input.trim()) return;

    const { data, error } = Formatter.parse(input);
    
    if (error) {
      UI.showError(`Invalid JSON: ${Formatter.getErrorDetails(error)}`);
    } else {
      UI.clearError();
      const formatted = Formatter.format(data);
      UI.elements.output.innerHTML = Formatter.highlight(formatted);
    }
  });

  document.getElementById('btn-minify')?.addEventListener('click', () => {
    const input = UI.elements.input.value;
    if (!input.trim()) return;

    const { data, error } = Formatter.parse(input);
    
    if (error) {
      UI.showError(`Invalid JSON: ${Formatter.getErrorDetails(error)}`);
    } else {
      UI.clearError();
      const minified = Formatter.minify(data);
      UI.elements.output.textContent = minified;
    }
  });
  
  document.getElementById('btn-clear')?.addEventListener('click', () => {
      UI.elements.input.value = '';
      UI.elements.output.textContent = '';
      UI.editors.left.setValue('');
      UI.editors.right.setValue('');
      UI.elements.diffOutput.textContent = '';
      UI.clearError();
  });

  document.getElementById('btn-compare')?.addEventListener('click', () => {
      const leftStr = UI.editors.left.getValue();
      const rightStr = UI.editors.right.getValue();
      
      if (!leftStr.trim() || !rightStr.trim()) return;
      
      const res1 = Formatter.parse(leftStr);
      const res2 = Formatter.parse(rightStr);
      
      if (res1.error || res2.error) {
          UI.showError('Invalid JSON in one of the inputs');
          return;
      }
      
      // Force format the editors so that the text matches the diff lines
      // This is crucial for the merge logic (splice) to use correct indices
      const formatted1 = Formatter.format(res1.data);
      const formatted2 = Formatter.format(res2.data);
      
      UI.editors.left.setValue(formatted1);
      UI.editors.right.setValue(formatted2);
      
      UI.clearError();
      const diffHtml = Differ.compare(res1.data, res2.data);
      UI.elements.diffOutput.innerHTML = diffHtml;

  });

  const copyToClipboard = (text, btnId) => {
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
          const btn = document.getElementById(btnId);
          if (btn) {
              const originalText = btn.textContent;
              btn.textContent = '✅ Copied!';
              setTimeout(() => {
                  btn.textContent = originalText;
              }, 2000);
          }
      });
  };

  document.getElementById('btn-copy-format')?.addEventListener('click', () => {
      copyToClipboard(UI.elements.output.innerText, 'btn-copy-format');
  });

  document.getElementById('btn-copy-diff')?.addEventListener('click', () => {
      // Copy from the Left Editor (Original/Merged JSON)
      copyToClipboard(UI.editors.left.getValue(), 'btn-copy-diff');
  });


  // Drag & Drop Support
  const handleDrop = (e, targetInput) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        targetInput.value = event.target.result;
        // Trigger format/diff if needed?
      };
      reader.readAsText(file);
    }
  };

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Drop on Format Input
  UI.elements.input.addEventListener('drop', (e) => handleDrop(e, UI.elements.input));
  
  // Drop on Diff Inputs (Target the textarea inside the editor)
  UI.editors.left.textarea.addEventListener('drop', (e) => handleDrop(e, UI.editors.left.textarea));
  UI.editors.right.textarea.addEventListener('drop', (e) => handleDrop(e, UI.editors.right.textarea));

  // Merge Logic
  UI.elements.diffOutput.addEventListener('click', (e) => {
    if (e.target.classList.contains('merge-btn')) {
      const index = parseInt(e.target.getAttribute('data-index'), 10);
      const action = e.target.getAttribute('data-action');
      mergeChange(index, action);
    }
  });

  const mergeChange = (index, action) => {
    const diff = Differ.lastDiff;
    if (!diff || !diff[index]) return;

    const change = diff[index];
    const leftValue = UI.editors.left.getValue();
    
    let lines = leftValue.split('\n');
    
    if (action === 'add') {
      // Insert content at lineLeft
      lines.splice(change.lineLeft, 0, change.content);
    } else if (action === 'remove') {
      // Remove content at lineLeft
      lines.splice(change.lineLeft, 1);
    } else if (action === 'replace') {
      // Replace content at lineLeft
      // The 'change' object is the 'removed' part.
      // We need the 'added' part content.
      // Since we grouped them, the next item in diff is the added part.
      const nextChange = diff[index + 1];
      if (nextChange && nextChange.type === 'added') {
         lines.splice(change.lineLeft, 1, nextChange.content);
      }
    }
    
    // Update Editor
    const newValue = lines.join('\n');
    UI.editors.left.setValue(newValue);
    
    // Re-run Diff
    document.getElementById('btn-compare').click();
  };
});


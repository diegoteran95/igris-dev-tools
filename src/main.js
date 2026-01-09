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
      UI.clearAllMessages();
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
      UI.clearAllMessages();
      const minified = Formatter.minify(data);
      UI.elements.output.textContent = minified;
    }
  });

  document.getElementById('btn-escape')?.addEventListener('click', () => {
    const input = UI.elements.input.value;
    if (!input.trim()) return;

    const { data, error } = Formatter.parse(input);
    
    if (error) {
      UI.showError(`Invalid JSON: ${Formatter.getErrorDetails(error)}`);
    } else {
      UI.clearAllMessages();
      const escaped = Formatter.escape(data);
      UI.elements.output.textContent = escaped;
    }
  });
  
  document.getElementById('btn-clear')?.addEventListener('click', () => {
      UI.elements.input.value = '';
      UI.elements.output.textContent = '';
      UI.editors.left.setValue('');
      UI.editors.right.setValue('');
      UI.elements.diffOutput.textContent = '';
      UI.clearAllMessages();
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
      // We also SORT keys here so the editor content matches the internal sorted comparison
      const sorted1 = Differ.sortKeys(res1.data);
      const sorted2 = Differ.sortKeys(res2.data);
      
      
      const formatted1 = Formatter.format(sorted1);
      const formatted2 = Formatter.format(sorted2);
      
      UI.editors.left.setValue(formatted1);
      UI.editors.right.setValue(formatted2);
      
      UI.clearAllMessages();
      // Pass the sorted data to Differ (it will sort again, which is harmless, but ensures consistency)
      // FIX: Pass the formatted strings directly to ensure the diff matches the editor LINE-FOR-LINE.
      // This avoids any subtle differences between re-sorting/re-stringifying.
      const { hasDifferences, html } = Differ.compare(sorted1, sorted2, formatted1, formatted2);
      UI.elements.diffOutput.innerHTML = html;
      
      if (!hasDifferences) {
          UI.showSuccess('✅ No differences found - JSONs are identical!');
      }

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
    // Traverse up just in case the icon inside the button was clicked
    const btn = e.target.closest('.merge-btn');
    if (btn) {
      const index = parseInt(btn.getAttribute('data-index'), 10);
      const action = btn.getAttribute('data-action');
      mergeChange(index, action);
    }
  });

  const mergeChange = (index, action) => {
    const diff = Differ.lastDiff;
    if (!diff || !diff[index]) return;

    const change = diff[index];
    const leftValue = UI.editors.left.getValue();
    
    // Normalize newlines for splitting, handle potential CR/LF differences
    let lines = leftValue.replace(/\r\n/g, '\n').split('\n');
    
    // --- Safety Check ---
    // Only verify content if we are modifying existing lines (remove/replace)
    // For 'add', we are inserting new content, so the current line won't match change.content
    if (action === 'remove' || action === 'replace') {
        const targetLine = lines[change.lineLeft];
        const expectedContent = change.content;
        
        if (targetLine === undefined || targetLine.trim() !== expectedContent.trim()) {
            UI.showError(`⚠️ Sync Error: Editor content changed. Expected "${expectedContent.trim().substring(0, 20)}..." at line ${change.lineLeft + 1}. Please re-compare.`);
            return;
        }
    }
    // --------------------
    
    
    if (action === 'add') {
      // SPECIAL CASE: If lineLeft is beyond the array length, we need to find where to insert
      // This happens when the diff thinks we should add at a line that doesn't exist yet
      let insertionPoint = change.lineLeft;
      
      if (insertionPoint >= lines.length) {
        // Find the last closing brace/bracket
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].trim().match(/^[}\]]/)) {
            insertionPoint = i;
            break;
          }
        }
      }
      
      lines.splice(insertionPoint, 0, change.content);
      // Update change.lineLeft for comma logic below
      change.lineLeft = insertionPoint;
    } else if (action === 'remove') {
      lines.splice(change.lineLeft, 1);
    } else if (action === 'replace') {
      const nextChange = diff[index + 1];
      if (nextChange && nextChange.type === 'added') {
         lines.splice(change.lineLeft, 1, nextChange.content);
      }
    }
    
    // Update Editor
    // FIX: JSON Comma Management
    // Inspect the lines around the change to fix commas.
    // 1. If we inserted a line (add/replace)
    if (action === 'add' || action === 'replace') {
        const insertedIndex = change.lineLeft;
        const insertedLine = lines[insertedIndex];
        const nextLine = lines[insertedIndex + 1];
        const prevLine = lines[insertedIndex - 1];

        // Case A: Inserted at the end of an object/array (followed by closing brace)
        if (nextLine && nextLine.trim().match(/^[}\]]/)) {
            // New line must NOT have a comma
            if (insertedLine.trim().endsWith(',')) {
                lines[insertedIndex] = insertedLine.replace(/,$/, '');
            }
            // Previous line MUST have a comma (if it's a property/value)
            if (prevLine && !prevLine.trim().match(/^[{\[]/) && !prevLine.trim().endsWith(',')) {
                lines[insertedIndex - 1] = prevLine + ',';
            }
        } 
        // Case B: Inserted in the middle
        else if (nextLine) {
            // New line MUST have a comma
            if (!insertedLine.trim().endsWith(',')) {
                lines[insertedIndex] = insertedLine + ',';
            }
            // Previous line MUST have a comma
            if (prevLine && !prevLine.trim().match(/^[{\[]/) && !prevLine.trim().endsWith(',')) {
                lines[insertedIndex - 1] = prevLine + ',';
            }
        }
    }
    // 2. If we removed a line
    else if (action === 'remove') {
        // If we removed the last element, the new last element must NOT have a comma
        const newCurrent = lines[change.lineLeft]; // This is the line that shifted up
        const prevLine = lines[change.lineLeft - 1];
        
        if (newCurrent && newCurrent.trim().match(/^[}\]]/)) {
            // We are now at the end. Previous line must NOT have comma.
            if (prevLine && prevLine.trim().endsWith(',')) {
                lines[change.lineLeft - 1] = prevLine.replace(/,$/, '');
            }
        }
    }

    // NOW join after all modifications
    let newValue = lines.join('\n');
    
    UI.editors.left.setValue(newValue);
    
    // Validate and Re-Compare
    const { error } = Formatter.parse(newValue);
    if (error) {
        UI.showError('⚠️ Warning: Merge resulted in invalid JSON (check braces). Please fix manually.');
         UI.elements.diffOutput.innerHTML = '<div style="padding: 20px; color: var(--error-color);">Diff is disabled until JSON errors are fixed.</div>';
    } else {
        document.getElementById('btn-compare').click();
    }
  };
});


export const Differ = {
  compare(json1, json2) {
    // 1. Format both JSONs to ensure consistent comparison
    const str1 = JSON.stringify(json1, null, 2);
    const str2 = JSON.stringify(json2, null, 2);
    
    const lines1 = str1.split('\n');
    const lines2 = str2.split('\n');
    
    // 2. Compute diff
    const diff = this.diffLines(lines1, lines2);
    this.lastDiff = diff; // Store for merging
    return this.renderDiff(diff);
  },

  diffLines(lines1, lines2) {
    let i = 0;
    let j = 0;
    const result = [];
    
    while (i < lines1.length || j < lines2.length) {
      // Store current indices to track where this chunk starts in the original files
      const currentI = i;
      const currentJ = j;

      if (i < lines1.length && j < lines2.length && lines1[i] === lines2[j]) {
        result.push({ type: 'same', content: lines1[i], lineLeft: i, lineRight: j });
        i++;
        j++;
      } else {
        let foundSync = false;
        
        // Look ahead in lines2 for lines1[i] (Detect Insertion)
        for (let k = j + 1; k < Math.min(j + 10, lines2.length); k++) {
           if (lines2[k] === lines1[i]) {
             // Found match, everything from j to k is ADDED
             for (let l = j; l < k; l++) {
               result.push({ type: 'added', content: lines2[l], lineLeft: i, lineRight: l });
             }
             j = k;
             foundSync = true;
             break;
           }
        }
        
        if (foundSync) continue;
        
        // Look ahead in lines1 for lines2[j] (Detect Deletion)
        for (let k = i + 1; k < Math.min(i + 10, lines1.length); k++) {
           if (lines1[k] === lines2[j]) {
             // Found match, everything from i to k is REMOVED
             for (let l = i; l < k; l++) {
               result.push({ type: 'removed', content: lines1[l], lineLeft: l, lineRight: j });
             }
             i = k;
             foundSync = true;
             break;
           }
        }
        
        if (foundSync) continue;
        
        // No sync found, treat as modification (Remove then Add)
        // We push them as separate chunks so they can be merged separately
        if (i < lines1.length) {
          result.push({ type: 'removed', content: lines1[i], lineLeft: i, lineRight: j });
          i++;
        }
        if (j < lines2.length) {
          result.push({ type: 'added', content: lines2[j], lineLeft: i, lineRight: j });
          j++;
        }
      }
    }
    
    return result;
  },

  renderDiff(diff) {
    let html = '';
    
    for (let i = 0; i < diff.length; i++) {
      const part = diff[i];
      const nextPart = diff[i + 1];
      
      // Check for Modification (Remove followed by Add)
      if (part.type === 'removed' && nextPart && nextPart.type === 'added') {
        // Render as a "Replace" block
        // We'll show both lines, but with a single "Replace" button on the first line (or both?)
        // Let's put a "Replace" button on the Removed line, and maybe an "Add" on the Added line?
        // Or better: A "Replace" button that does both.
        
        const removeContent = this.escapeHtml(part.content);
        const addContent = this.escapeHtml(nextPart.content);
        
        // Button to "Replace" (Delete Left, Insert Right)
        const replaceBtn = `<button class="merge-btn" data-index="${i}" data-action="replace" title="Merge: Replace Original with New">🔄</button>`;
        
        html += `<div class="diff-line diff-removed">${replaceBtn}<span class="diff-text">- ${removeContent}</span></div>`;
        html += `<div class="diff-line diff-added"><span class="merge-spacer"></span><span class="diff-text">+ ${addContent}</span></div>`;
        
        i++; // Skip next part
      } else {
        // Normal rendering
        let cls = '';
        let prefix = '  ';
        let actionBtn = '';

        if (part.type === 'added') {
          cls = 'diff-added';
          prefix = '+ ';
          actionBtn = `<button class="merge-btn" data-index="${i}" data-action="add" title="Merge: Add to Original">←</button>`;
        } else if (part.type === 'removed') {
          cls = 'diff-removed';
          prefix = '- ';
          actionBtn = `<button class="merge-btn" data-index="${i}" data-action="remove" title="Merge: Delete from Original">🗑️</button>`;
        } else {
           // Same
           html += `<div class="diff-line"><span class="merge-spacer"></span><span class="diff-text">  ${this.escapeHtml(part.content)}</span></div>`;
           continue;
        }
        
        html += `<div class="diff-line ${cls}">${actionBtn}<span class="diff-text">${prefix}${this.escapeHtml(part.content)}</span></div>`;
      }
    }
    return html;
  },
  
  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
};

import { ToolRegistry } from '../../../core/registry.js';
import { DifferTool } from './DifferTool.js';

// Register JSON Differ tool
ToolRegistry.registerTool({
  id: 'json-differ',
  categoryId: 'json',
  name: 'JSON Diff & Merge',
  description: 'Compare and merge JSON documents with interactive conflict resolution',
  icon: '⇄',
  keywords: ['json', 'diff', 'compare', 'merge', 'difference', 'conflict'],
  component: DifferTool,
  order: 2
});

export { DifferTool };

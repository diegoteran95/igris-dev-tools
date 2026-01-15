import { ToolRegistry } from '../../../core/registry.js';
import { TextSplitterTool } from './TextSplitterTool.js';

// Register Text Splitter tool
ToolRegistry.registerTool({
  id: 'text-splitter',
  categoryId: 'text',
  name: 'Text Splitter',
  description: 'Split text by separator with trim and filter options',
  icon: '✂️',
  keywords: ['text', 'split', 'separator', 'divide', 'delimiter', 'parse'],
  component: TextSplitterTool,
  order: 2
});

export { TextSplitterTool };

import { ToolRegistry } from '../../../core/registry.js';
import { CharacterCounterTool } from './CharacterCounterTool.js';

// Register Character Counter tool
ToolRegistry.registerTool({
  id: 'character-counter',
  categoryId: 'text',
  name: 'Character Counter',
  description: 'Count characters, words, lines, and text selection',
  icon: '📊',
  keywords: ['text', 'count', 'characters', 'words', 'lines', 'selection', 'stats'],
  component: CharacterCounterTool,
  order: 1
});

export { CharacterCounterTool };

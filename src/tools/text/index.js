import { ToolRegistry } from '../../core/registry.js';

// Register Text Tools category FIRST
ToolRegistry.registerCategory({
  id: 'text',
  name: 'Text Tools',
  icon: '📝',
  order: 2
});

// Then register tools using dynamic imports to ensure category exists
export async function init() {
  await import('./character-counter/index.js');
  await import('./text-splitter/index.js');
}

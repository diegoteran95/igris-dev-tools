import { ToolRegistry } from '../../core/registry.js';

// Register Date/Time category FIRST
ToolRegistry.registerCategory({
  id: 'datetime',
  name: 'Date/Time',
  icon: '🕐',
  order: 5
});

// Then register tools using dynamic imports to ensure category exists
export async function init() {
  await import('./timestamp/index.js');
}

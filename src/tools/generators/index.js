import { ToolRegistry } from '../../core/registry.js';

// Register Generators category FIRST
ToolRegistry.registerCategory({
  id: 'generators',
  name: 'Generators',
  icon: '⚙️',
  order: 4
});

// Then register tools using dynamic imports to ensure category exists
export async function init() {
  await import('./uuid/index.js');
  await import('./hash/index.js');
}

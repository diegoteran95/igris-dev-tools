import { ToolRegistry } from '../../core/registry.js';

// Register JSON Tools category FIRST
ToolRegistry.registerCategory({
  id: 'json',
  name: 'JSON Tools',
  icon: '{ }',
  order: 1
});

// Then register tools using dynamic imports to ensure category exists
export async function init() {
  await import('./formatter/index.js');
  await import('./differ/index.js');
}

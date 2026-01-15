import { ToolRegistry } from '../../core/registry.js';

// Register Encoding Tools category FIRST
ToolRegistry.registerCategory({
  id: 'encoding',
  name: 'Encoding',
  icon: '🔐',
  order: 3
});

// Then register tools using dynamic imports to ensure category exists
export async function init() {
  await import('./base64/index.js');
  await import('./url-encoder/index.js');
  await import('./jwt-decoder/index.js');
}

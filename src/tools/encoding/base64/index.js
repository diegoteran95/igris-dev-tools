import { ToolRegistry } from '../../../core/registry.js';
import { Base64Tool } from './Base64Tool.js';

// Register Base64 tool
ToolRegistry.registerTool({
  id: 'base64',
  categoryId: 'encoding',
  name: 'Base64 Encoder/Decoder',
  description: 'Encode and decode Base64 strings with file support',
  icon: '🔐',
  keywords: ['base64', 'encode', 'decode', 'encoding', 'file'],
  component: Base64Tool,
  order: 1
});

export { Base64Tool };

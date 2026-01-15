import { ToolRegistry } from '../../../core/registry.js';
import { URLEncoderTool } from './URLEncoderTool.js';

// Register URL Encoder tool
ToolRegistry.registerTool({
  id: 'url-encoder',
  categoryId: 'encoding',
  name: 'URL Encoder/Decoder',
  description: 'Encode and decode URLs and URL components',
  icon: '🔗',
  keywords: ['url', 'encode', 'decode', 'uri', 'percent', 'encoding'],
  component: URLEncoderTool,
  order: 2
});

export { URLEncoderTool };

import { ToolRegistry } from '../../../core/registry.js';
import { HashGeneratorTool } from './HashGeneratorTool.js';

// Register Hash Generator tool
ToolRegistry.registerTool({
  id: 'hash-generator',
  categoryId: 'generators',
  name: 'Hash Generator',
  description: 'Generate MD5, SHA-1, and SHA-256 hashes from text or files',
  icon: '#️⃣',
  keywords: ['hash', 'md5', 'sha1', 'sha256', 'checksum', 'digest'],
  component: HashGeneratorTool,
  order: 2
});

export { HashGeneratorTool };

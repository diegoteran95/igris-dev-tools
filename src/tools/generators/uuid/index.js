import { ToolRegistry } from '../../../core/registry.js';
import { UUIDGeneratorTool } from './UUIDGeneratorTool.js';

// Register UUID Generator tool
ToolRegistry.registerTool({
  id: 'uuid-generator',
  categoryId: 'generators',
  name: 'UUID Generator',
  description: 'Generate UUID v4 (random) and v7 (timestamp-based) with batch support',
  icon: '🆔',
  keywords: ['uuid', 'guid', 'unique', 'identifier', 'generate', 'v4', 'v7'],
  component: UUIDGeneratorTool,
  order: 1
});

export { UUIDGeneratorTool };

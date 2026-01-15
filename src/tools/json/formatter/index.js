import { ToolRegistry } from '../../../core/registry.js';
import { FormatterTool } from './FormatterTool.js';

// Register JSON Formatter tool
ToolRegistry.registerTool({
  id: 'json-formatter',
  categoryId: 'json',
  name: 'JSON Formatter',
  description: 'Format, minify, and escape JSON data',
  icon: '{ }',
  keywords: ['json', 'format', 'beautify', 'pretty', 'minify', 'compress', 'escape'],
  component: FormatterTool,
  order: 1
});

export { FormatterTool };

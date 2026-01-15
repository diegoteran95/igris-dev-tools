import { ToolRegistry } from '../../../core/registry.js';
import { TimestampConverterTool } from './TimestampConverterTool.js';

// Register Timestamp Converter tool
ToolRegistry.registerTool({
  id: 'timestamp-converter',
  categoryId: 'datetime',
  name: 'Timestamp Converter',
  description: 'Convert between Unix timestamps and dates with timezone support',
  icon: '🕐',
  keywords: ['timestamp', 'unix', 'date', 'time', 'timezone', 'convert', 'epoch'],
  component: TimestampConverterTool,
  order: 1
});

export { TimestampConverterTool };

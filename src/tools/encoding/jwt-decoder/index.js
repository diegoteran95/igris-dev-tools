import { ToolRegistry } from '../../../core/registry.js';
import { JWTDecoderTool } from './JWTDecoderTool.js';

// Register JWT Decoder tool
ToolRegistry.registerTool({
  id: 'jwt-decoder',
  categoryId: 'encoding',
  name: 'JWT Decoder',
  description: 'Decode and inspect JWT tokens (header, payload, expiration)',
  icon: '🎫',
  keywords: ['jwt', 'token', 'decode', 'json web token', 'auth', 'authentication'],
  component: JWTDecoderTool,
  order: 3
});

export { JWTDecoderTool };

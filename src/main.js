import { Router } from './core/router.js';
import { MainLayout } from './layouts/MainLayout.js';
import { NotificationManager } from './components/ui/Notification.js';

/**
 * Application initialization
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Igris Dev Tools initializing...');

  // Import and initialize tool categories
  // Categories are registered synchronously, tools are loaded asynchronously
  const jsonTools = await import('./tools/json/index.js');
  const textTools = await import('./tools/text/index.js');
  const encodingTools = await import('./tools/encoding/index.js');
  const generatorTools = await import('./tools/generators/index.js');
  const datetimeTools = await import('./tools/datetime/index.js');

  // Initialize each category (loads tools)
  await Promise.all([
    jsonTools.init(),
    textTools.init(),
    encodingTools.init(),
    generatorTools.init(),
    datetimeTools.init()
  ]);

  console.log('📦 All tools loaded');

  // Render main layout
  const layout = new MainLayout();
  const appContainer = document.getElementById('app');

  if (!appContainer) {
    console.error('App container not found');
    return;
  }

  appContainer.innerHTML = layout.render();

  // Initialize layout
  layout.init();

  // Initialize router
  const router = new Router();
  router.init();

  // Initialize notification system
  new NotificationManager();

  console.log('✅ Igris Dev Tools initialized');
});

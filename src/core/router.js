import { ToolRegistry } from './registry.js';

/**
 * Simple hash-based router for SPA navigation
 */
export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.currentTool = null;
    this.containerEl = null;
    this.headerEl = null;
  }

  /**
   * Initialize router and set up event listeners
   */
  init() {
    this.containerEl = document.getElementById('tool-container');
    this.headerEl = document.getElementById('tool-header');

    if (!this.containerEl) {
      console.error('Router: tool-container element not found');
      return;
    }

    window.addEventListener('hashchange', () => this.handleRoute());

    // Handle the initial route immediately — the 'load' event has already
    // fired by the time init() is called (async tool imports in main.js).
    this.handleRoute();
  }

  /**
   * Handle route changes
   */
  handleRoute() {
    // Extract tool ID from hash (#/tool-id)
    const hash = window.location.hash.slice(2);

    // Get default tool if no hash - show home page
    let toolId = hash;
    let isHomePage = false;

    if (!toolId) {
      toolId = 'home';
      isHomePage = true;
    }

    // Don't reload if same route
    if (toolId === this.currentRoute) {
      return;
    }

    // Get tool from registry
    let toolConfig = ToolRegistry.getTool(toolId);

    // If home page, create a special config
    if (isHomePage || toolId === 'home') {
      toolConfig = {
        id: 'home',
        name: 'Home',
        description: 'Welcome to Igris Dev Tools',
        icon: '🏠',
        component: null // Will be loaded dynamically
      };
    } else if (!toolConfig) {
      console.warn(`Router: Tool "${toolId}" not found`);
      // Redirect to home
      this.navigate('');
      return;
    }

    // Unmount previous tool
    if (this.currentTool && typeof this.currentTool.unmount === 'function') {
      this.currentTool.unmount();
    }

    // Update route
    this.currentRoute = toolId;

    // Update header
    this.updateHeader(toolConfig);

    // Mount new tool
    if (toolId === 'home') {
      // Load HomePage dynamically
      import('../components/views/HomePage.js')
        .then(module => {
          const HomePage = module.HomePage;
          this.currentTool = new HomePage('tool-container');

          if (typeof this.currentTool.mount === 'function') {
            this.currentTool.mount();
          }

          // Update navigation active state after mounting
          this.updateNavActiveState(toolId);
        })
        .catch(error => {
          console.error('Router: Error loading HomePage', error);
          this.containerEl.innerHTML = `
            <div style="padding: 20px; color: var(--error-color);">
              <h2>Error loading home page</h2>
              <p>${error.message}</p>
            </div>
          `;
        });
    } else {
      try {
        const ToolClass = toolConfig.component;
        this.currentTool = new ToolClass('tool-container');

        if (typeof this.currentTool.mount === 'function') {
          this.currentTool.mount();
        } else {
          console.error(`Router: Tool "${toolId}" does not have a mount method`);
        }

        // Update navigation active state
        this.updateNavActiveState(toolId);
      } catch (error) {
        console.error(`Router: Error mounting tool "${toolId}"`, error);
        this.containerEl.innerHTML = `
          <div style="padding: 20px; color: var(--error-color);">
            <h2>Error loading tool</h2>
            <p>${error.message}</p>
          </div>
        `;
      }
    }

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('tool:changed', {
      detail: { toolId, toolConfig }
    }));
  }

  /**
   * Navigate to a tool
   * @param {string} toolId
   */
  navigate(toolId) {
    window.location.hash = `#/${toolId}`;
  }

  /**
   * Update tool header with breadcrumb and description
   * @param {Object} toolConfig
   */
  updateHeader(toolConfig) {
    if (!this.headerEl) return;

    // Hide header for home page
    if (toolConfig.id === 'home') {
      this.headerEl.innerHTML = '';
      return;
    }

    // Find category for breadcrumb
    let categoryName = '';
    try {
      const categories = ToolRegistry.getCategoriesWithTools();
      for (const cat of categories) {
        if (cat.tools.some(t => t.id === toolConfig.id)) {
          categoryName = cat.name;
          break;
        }
      }
    } catch (e) {
      // ignore
    }

    const breadcrumbPrefix = categoryName
      ? `<span class="breadcrumb-category">${categoryName}</span><span class="breadcrumb-sep">/</span>`
      : '';

    this.headerEl.innerHTML = `
      <div class="tool-header-content">
        <span class="tool-icon-inline">${toolConfig.icon}</span>
        <div class="tool-breadcrumb">
          ${breadcrumbPrefix}
          <h1 class="tool-title">${toolConfig.name}</h1>
          <span class="tool-description">${toolConfig.description}</span>
        </div>
      </div>
    `;
  }

  /**
   * Update navigation active state
   * @param {string} activeToolId
   */
  updateNavActiveState(activeToolId) {
    // Don't mark any tool as active if we're on home page
    if (activeToolId === 'home') {
      document.querySelectorAll('.nav-tool-link').forEach(link => {
        link.classList.remove('active');
      });
      return;
    }

    document.querySelectorAll('.nav-tool-link').forEach(link => {
      const isActive = link.dataset.toolId === activeToolId;
      link.classList.toggle('active', isActive);

      // Expand parent category if tool is active
      if (isActive) {
        const categoryEl = link.closest('.nav-category');
        if (categoryEl) {
          categoryEl.classList.add('expanded');
        }
      }
    });
  }

  /**
   * Get current tool ID
   * @returns {string|null}
   */
  getCurrentToolId() {
    return this.currentRoute;
  }

  /**
   * Get current tool instance
   * @returns {Object|null}
   */
  getCurrentTool() {
    return this.currentTool;
  }
}

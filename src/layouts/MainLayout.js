import { ToolRegistry } from '../core/registry.js';

/**
 * Main application layout with sidebar navigation
 */
export class MainLayout {
  constructor() {
    this.sidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    this.searchQuery = '';
  }

  /**
   * Render the main layout structure
   * @returns {string} HTML string
   */
  render() {
    return `
      <div class="app-layout ${this.sidebarCollapsed ? 'sidebar-collapsed' : ''}">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-header">
            <img src="/favicon.png" alt="Logo" class="sidebar-logo">
            <span class="sidebar-title">Igris Dev Tools</span>
            <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle Sidebar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
          </div>

          <div class="sidebar-search">
            <input
              type="text"
              id="tool-search"
              placeholder="Search tools..."
              autocomplete="off"
            />
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>

          <nav class="sidebar-nav" id="sidebar-nav">
            <!-- Dynamically populated from registry -->
          </nav>

          <div class="sidebar-footer">
            <button id="theme-toggle" class="theme-btn" aria-label="Toggle Theme">
              <svg class="theme-icon-light" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <svg class="theme-icon-dark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>
          </div>
        </aside>

        <main class="main-content" id="main-content">
          <header class="tool-header" id="tool-header">
            <!-- Tool name and description rendered by router -->
          </header>
          <div class="tool-container" id="tool-container">
            <!-- Active tool renders here -->
          </div>
        </main>
      </div>
    `;
  }

  /**
   * Render navigation from registry
   */
  renderNavigation() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;

    const categories = ToolRegistry.getCategoriesWithTools();

    if (categories.length === 0) {
      nav.innerHTML = '<div class="nav-empty">No tools available</div>';
      return;
    }

    const filteredCategories = this.searchQuery
      ? this.filterCategoriesBySearch(categories)
      : categories;

    nav.innerHTML = filteredCategories.map(category => this.renderCategory(category)).join('');
  }

  /**
   * Render a single category
   * @param {Object} category
   * @returns {string}
   */
  renderCategory(category) {
    if (category.tools.length === 0) return '';

    return `
      <div class="nav-category expanded">
        <div class="nav-category-header">
          <span class="nav-category-icon">${category.icon}</span>
          <span class="nav-category-name">${category.name}</span>
          <svg class="nav-category-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <ul class="nav-category-tools">
          ${category.tools.map(tool => this.renderToolLink(tool)).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Render a tool link
   * @param {Object} tool
   * @returns {string}
   */
  renderToolLink(tool) {
    return `
      <li>
        <a href="#/${tool.id}"
           class="nav-tool-link"
           data-tool-id="${tool.id}"
           title="${tool.description}">
          <span class="nav-tool-icon">${tool.icon}</span>
          <span class="nav-tool-name">${tool.name}</span>
        </a>
      </li>
    `;
  }

  /**
   * Filter categories by search query
   * @param {Array} categories
   * @returns {Array}
   */
  filterCategoriesBySearch(categories) {
    const query = this.searchQuery.toLowerCase();

    return categories.map(category => ({
      ...category,
      tools: category.tools.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.keywords.some(kw => kw.toLowerCase().includes(query))
      )
    })).filter(category => category.tools.length > 0);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Sidebar toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleSidebar());
    }

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Search
    const searchInput = document.getElementById('tool-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Logo and title click - navigate to home
    const logo = document.querySelector('.sidebar-logo');
    const title = document.querySelector('.sidebar-title');

    if (logo) {
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', () => this.navigateHome());
    }

    if (title) {
      title.style.cursor = 'pointer';
      title.addEventListener('click', () => this.navigateHome());
    }

    // Category expand/collapse
    document.addEventListener('click', (e) => {
      const header = e.target.closest('.nav-category-header');
      if (header) {
        const category = header.parentElement;
        category.classList.toggle('expanded');
      }
    });
  }

  /**
   * Navigate to home page
   */
  navigateHome() {
    window.location.hash = '#/';
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('sidebar-collapsed', this.sidebarCollapsed);

    const layout = document.querySelector('.app-layout');
    if (layout) {
      layout.classList.toggle('sidebar-collapsed', this.sidebarCollapsed);
    }
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  /**
   * Handle search input
   * @param {string} query
   */
  handleSearch(query) {
    this.searchQuery = query.trim();
    this.renderNavigation();
  }

  /**
   * Initialize layout
   */
  init() {
    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);

    // Render navigation
    this.renderNavigation();

    // Bind events
    this.bindEvents();
  }
}

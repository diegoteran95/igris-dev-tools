import { BaseTool } from '../base/BaseTool.js';
import { ToolRegistry } from '../../core/registry.js';

/**
 * Home Page - Landing view
 */
export class HomePage extends BaseTool {
  constructor(containerId) {
    super(containerId);
  }

  render() {
    const categories = ToolRegistry.getCategoriesWithTools();

    this.container.innerHTML = `
      <div class="home-page">
        <div class="home-hero">
          <img src="/favicon.png" alt="Igris Dev Tools" class="home-logo">
          <h1 class="home-title">Igris Dev Tools</h1>
          <p class="home-subtitle">Herramientas esenciales para desarrolladores. 100% en tu navegador.</p>
        </div>

        <div class="home-features">
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>100% Privado</h3>
            <p>Todo se procesa localmente en tu navegador. Tus datos nunca salen de tu máquina.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Rápido y Ligero</h3>
            <p>Sin instalaciones, sin dependencias. Solo abre y usa.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Interfaz Limpia</h3>
            <p>Diseño simple y funcional para maximizar tu productividad.</p>
          </div>
        </div>

        <div class="home-tools">
          <h2 class="home-section-title">Herramientas Disponibles</h2>
          <div class="tools-grid">
            ${this.renderToolsGrid(categories)}
          </div>
        </div>
      </div>
    `;
  }

  renderToolsGrid(categories) {
    return categories.map(category => `
      <div class="tool-category-section">
        <h3 class="category-title">
          <span class="category-icon">${category.icon}</span>
          ${category.name}
        </h3>
        <div class="tools-list">
          ${category.tools.map(tool => `
            <a href="#/${tool.id}" class="tool-card">
              <span class="tool-card-icon">${tool.icon}</span>
              <div class="tool-card-info">
                <h4 class="tool-card-name">${tool.name}</h4>
                <p class="tool-card-desc">${tool.description}</p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    // No additional events needed - links work automatically
  }
}

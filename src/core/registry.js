// Tool Registry - Singleton pattern for managing all tools

export const ToolRegistry = {
  tools: new Map(),
  categories: new Map(),

  /**
   * Register a tool category
   * @param {Object} categoryConfig - { id, name, icon, order }
   */
  registerCategory(categoryConfig) {
    this.categories.set(categoryConfig.id, {
      ...categoryConfig,
      tools: []
    });
  },

  /**
   * Register a tool within a category
   * @param {Object} toolConfig - {
   *   id: 'json-formatter',
   *   categoryId: 'json',
   *   name: 'JSON Formatter',
   *   description: 'Format, minify, and escape JSON',
   *   icon: '{ }',
   *   keywords: ['format', 'beautify', 'minify'],
   *   component: FormatterTool,
   *   order: 1
   * }
   */
  registerTool(toolConfig) {
    this.tools.set(toolConfig.id, toolConfig);

    const category = this.categories.get(toolConfig.categoryId);
    if (category) {
      category.tools.push(toolConfig.id);
    }
  },

  /**
   * Get tool by ID
   * @param {string} toolId
   * @returns {Object|undefined}
   */
  getTool(toolId) {
    return this.tools.get(toolId);
  },

  /**
   * Get all categories with their tools
   * @returns {Array}
   */
  getCategoriesWithTools() {
    return Array.from(this.categories.values())
      .sort((a, b) => a.order - b.order)
      .map(category => ({
        ...category,
        tools: category.tools
          .map(id => this.tools.get(id))
          .filter(Boolean)
          .sort((a, b) => a.order - b.order)
      }));
  },

  /**
   * Search tools by keyword
   * @param {string} query
   * @returns {Array}
   */
  searchTools(query) {
    const lowered = query.toLowerCase();
    return Array.from(this.tools.values()).filter(tool =>
      tool.name.toLowerCase().includes(lowered) ||
      tool.description.toLowerCase().includes(lowered) ||
      tool.keywords.some(kw => kw.includes(lowered))
    );
  },

  /**
   * Get first available tool (for default route)
   * @returns {Object|null}
   */
  getFirstTool() {
    const categories = this.getCategoriesWithTools();
    if (categories.length > 0 && categories[0].tools.length > 0) {
      return categories[0].tools[0];
    }
    return null;
  }
};

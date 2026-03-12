# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Igris Developer Tools is a 100% client-side web app (vanilla JS + Vite) providing developer utilities across JSON, text, encoding, generation, and date/time categories. No backend, no external API calls, desktop-only UI.

## Development Commands

```bash
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # outputs to /dist
pnpm preview
```

```bash
docker-compose up -d
# or manually: docker build -t igris-json-tools:latest . && docker run -d -p 8080:80 --name igris-json-tools igris-json-tools:latest
```

## Architecture

The app uses a **Tool Registry Pattern** with hash-based SPA routing (`#/tool-id`):

- **`/src/core/registry.js`** — Singleton `ToolRegistry` that manages categories and tools
- **`/src/core/router.js`** — Listens to `hashchange`, mounts/unmounts tools via their lifecycle
- **`/src/components/base/BaseTool.js`** — Base class all tools extend
- **`/src/layouts/MainLayout.js`** — Sidebar with dynamic nav, search, theme toggle
- **`/src/modules/`** — Legacy re-export wrappers (don't add new ones here)

### Self-Registration Flow

Tools register themselves when their category index is imported. `main.js` imports each `/src/tools/{category}/index.js`, which in turn imports tool `index.js` files, each calling `ToolRegistry.registerTool()`. No central manifest to update — just import the tool's index in its category index.

### BaseTool Lifecycle

```javascript
export class MyTool extends BaseTool {
  render()    { this.container.innerHTML = `...`; }  // Required
  bindEvents() { /* use this.query() / this.getElementById() */ }  // Required
  onMount()   { /* after render + bindEvents */ }    // Optional
  onUnmount() { /* cleanup */ }                      // Optional
}
```

Available utility methods: `showError(msg)`, `showSuccess(msg)`, `copyToClipboard(text)`, `emit(eventName, detail)`, `query(selector)`, `getElementById(id)`.

Notifications flow through a custom event: `this.emit('tool:notification', { message, type })` → `NotificationManager` in `Notification.js`.

### Router Behavior

Default route: `#/json-formatter`. The router instantiates the tool class, calls `mount()`, and on navigation calls `unmount()` before mounting the next tool.

### Styling

Three modular CSS files imported via `style.css`:
- `base.css` — CSS custom properties, light/dark theming (`data-theme` on `<html>`, persisted to `localStorage`)
- `layouts.css` — Sidebar and workspace layouts
- `components.css` — All tool-specific styles (add new tool styles here)

### Notable Implementation Details

- **CodeEditor** (`/src/components/ui/CodeEditor.js`): `<textarea>` overlaid on `<pre>` for syntax highlighting with synchronized scrolling. Supports `json`/`plaintext` modes, `onSelectionChange` callback, and auto-format on blur.
- **JSON Differ** (`/src/tools/json/differ/differ.js`): Most complex tool — line-based diff with 100-line look-ahead, key sorting, indentation normalization, comma management, and safety checks before merge.
- **MD5**: Custom client-side implementation in `HashGeneratorTool.js` (WebCrypto doesn't support MD5); SHA-1/SHA-256 use native WebCrypto.
- **LocalStorage keys**: `timestamp-timezone` (timestamp converter), theme preference (MainLayout).

## Adding a New Tool

1. Create `/src/tools/{category}/{tool-name}/` with `{ToolName}Tool.js` (extends `BaseTool`) and `index.js` (calls `ToolRegistry.registerTool({ id, categoryId, name, description, icon, keywords, component, order })`)
2. Add `import './{tool-name}/index.js';` to `/src/tools/{category}/index.js`
3. Add any styles to `/src/styles/components.css`

To add a new **category**, also call `ToolRegistry.registerCategory({ id, name, icon, order })` in the category `index.js` and import it in `main.js`.

## Docker Build

Two-stage Dockerfile: Node.js builds with pnpm, Nginx serves `/dist`. Final image ~40MB.

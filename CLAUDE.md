# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Igris Developer Tools is a client-side web application providing a collection of developer utilities. Built with vanilla JavaScript and Vite, it offers tools for JSON manipulation, text processing, encoding/decoding, generation, and date/time conversion. The application is privacy-first (100% client-side, no external API calls) and designed for desktop use.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (typically runs on http://localhost:5173)
pnpm dev

# Build for production (outputs to /dist)
pnpm build

# Preview production build
pnpm preview
```

## Docker Commands

```bash
# Build and run with Docker Compose
docker-compose up -d

# Build Docker image manually
docker build -t igris-json-tools:latest .

# Run container
docker run -d -p 8080:80 --name igris-json-tools igris-json-tools:latest
```

## Architecture

### Core Design Patterns

The application uses a **Tool Registry Pattern** with hash-based routing for a scalable, extensible multi-tool architecture:

- **Tool Registry** (`/src/core/registry.js`): Singleton that manages tool and category registration
- **Hash Router** (`/src/core/router.js`): SPA routing using `#/tool-id` format, handles tool mounting/unmounting
- **BaseTool Class** (`/src/components/base/BaseTool.js`): Base class with lifecycle methods for all tools
- **Self-Registration**: Tools auto-register themselves when imported via category index files

### Folder Structure

```
/src
  /core                           # Framework core
    app.js                        # (Future) Application bootstrap
    router.js                     # Hash-based SPA router
    registry.js                   # Tool Registry singleton

  /components                     # Reusable components
    /base
      BaseTool.js                 # Base class for all tools
    /ui
      CodeEditor.js               # Syntax-highlighted editor
      CopyButton.js               # Copy-to-clipboard button
      FileDropZone.js             # Drag-and-drop file upload
      Notification.js             # Toast notification system

  /tools                          # Self-contained tool implementations
    /json                         # JSON Tools category
      index.js                    # Category registration
      /formatter                  # Format, minify, escape
        FormatterTool.js
        formatter.js              # Core logic
        index.js                  # Tool registration
      /differ                     # Diff and merge
        DifferTool.js
        differ.js                 # Diff algorithm
        index.js                  # Tool registration

    /text                         # Text Tools category
      index.js
      /character-counter          # Character, word, line counter
      /text-splitter              # Text splitting by separator

    /encoding                     # Encoding category
      index.js
      /base64                     # Base64 encoder/decoder
      /url-encoder                # URL encoding/decoding
      /jwt-decoder                # JWT token inspector

    /generators                   # Generators category
      index.js
      /uuid                       # UUID v4/v7 generator
      /hash                       # MD5, SHA-1, SHA-256

    /datetime                     # Date/Time category
      index.js
      /timestamp                  # Unix timestamp converter

  /layouts
    MainLayout.js                 # Sidebar + tool content area

  /styles
    base.css                      # Variables, reset, theming
    layouts.css                   # Sidebar, workspace styles
    components.css                # Component-specific styles

  /modules                        # Legacy compatibility wrappers
    formatter.js                  # Re-exports from tools/json/formatter
    differ.js                     # Re-exports from tools/json/differ
    editor.js                     # SimpleEditor wrapper for CodeEditor

  main.js                         # Application entry point
  style.css                       # Imports modular styles
```

### Tool Registry System

Tools self-register using the ToolRegistry singleton:

```javascript
// Category registration (in /src/tools/{category}/index.js)
ToolRegistry.registerCategory({
  id: 'json',
  name: 'JSON Tools',
  icon: '{ }',
  order: 1
});

// Tool registration (in /src/tools/{category}/{tool}/index.js)
ToolRegistry.registerTool({
  id: 'json-formatter',
  categoryId: 'json',
  name: 'JSON Formatter',
  description: 'Format, minify, and escape JSON',
  icon: '✨',
  keywords: ['format', 'beautify', 'minify', 'escape'],
  component: FormatterTool,
  order: 1
});
```

### BaseTool Lifecycle

All tools extend `BaseTool` and implement:

```javascript
export class MyTool extends BaseTool {
  constructor(containerId) {
    super(containerId);
    // Initialize state
  }

  render() {
    // Set this.container.innerHTML
  }

  bindEvents() {
    // Attach event listeners using this.query() or this.getElementById()
  }

  onMount() {
    // Optional: Called after render + bindEvents
  }

  onUnmount() {
    // Optional: Cleanup (destroy components, remove listeners)
  }
}
```

**Utility methods** available in BaseTool:
- `showError(message)` - Display error notification
- `showSuccess(message)` - Display success notification
- `copyToClipboard(text)` - Copy text to clipboard with feedback
- `emit(eventName, detail)` - Emit custom events
- `query(selector)` - QuerySelector scoped to tool container
- `getElementById(id)` - Get element by ID scoped to tool

### Hash-based Router

The router listens to `hashchange` events and:
1. Parses the hash (`#/tool-id` → `tool-id`)
2. Retrieves the tool configuration from ToolRegistry
3. Unmounts the current tool (calls `unmount()`)
4. Mounts the new tool (instantiates class, calls `mount()`)
5. Updates the UI (active sidebar item, tool description)

Default route: `#/json-formatter` (first tool)

### Navigation: Sidebar

The sidebar (`MainLayout.js`) dynamically generates navigation from registered categories and tools:
- Collapsible categories
- Active tool highlighting
- Search functionality (filters by tool name/description/keywords)
- Theme toggle (light/dark mode)
- Sidebar collapse toggle

## Available Tools

### JSON Tools
1. **JSON Formatter** (`#/json-formatter`)
   - Format, minify, escape JSON
   - File drag-and-drop support
   - Three-level parse fallback (standard, double-encoded, escaped)
   - Copy button for formatted output

2. **JSON Diff/Merge** (`#/json-differ`)
   - Side-by-side comparison with interactive merge
   - Key sorting for structural comparison
   - Indentation normalization and comma management
   - Safety checks before applying merges

### Text Tools
3. **Character Counter** (`#/character-counter`)
   - Real-time stats: characters, chars without spaces, words, lines
   - **Selection tracking**: Highlights stats when text is selected
   - Plain text editor with selection change events

4. **Text Splitter** (`#/text-splitter`)
   - Split text by custom separator (comma, newline, tab, custom)
   - Options: trim whitespace, remove empty parts
   - Individual and bulk copy functionality

### Encoding Tools
5. **Base64** (`#/base64-encoder`)
   - Encode/decode Base64
   - File drag-and-drop for encoding files
   - UTF-8 handling with btoa/atob

6. **URL Encoder** (`#/url-encoder`)
   - Component encoding (`encodeURIComponent`)
   - Full URL encoding (`encodeURI`)
   - Bidirectional encode/decode

7. **JWT Decoder** (`#/jwt-decoder`)
   - Decode JWT header and payload
   - Display formatted JSON
   - Check token expiration (`exp` claim)
   - Base64 URL-safe decoding

### Generators
8. **UUID Generator** (`#/uuid-generator`)
   - UUID v4 (random)
   - UUID v7 (timestamp-based)
   - Batch generation (1-1000)
   - Individual and bulk copy

9. **Hash Generator** (`#/hash-generator`)
   - MD5, SHA-1, SHA-256
   - Custom MD5 implementation (not in WebCrypto)
   - WebCrypto API for SHA algorithms
   - File drag-and-drop for hashing files

### Date/Time Tools
10. **Timestamp Converter** (`#/timestamp-converter`)
    - **Unix → Date**: Auto-detects seconds (10 digits) or milliseconds (13 digits)
    - **Date picker → Unix**: Shows both seconds and milliseconds
    - Timezone selector with 18 common zones (UTC, America/Bogota, etc.)
    - Timezone applies to all conversions
    - Relative time display ("2 hours ago")
    - Uses `Intl.DateTimeFormat` for timezone conversions
    - "Now" button fills current timestamp
    - Copy buttons for both second and millisecond formats

## Key Implementation Details

### CodeEditor Component

Generalized syntax-highlighted editor (`/src/components/ui/CodeEditor.js`):
- Overlays `<pre>` behind `<textarea>` for highlighting
- Synchronized scrolling
- Auto-format on blur (for JSON mode)
- Selection tracking with `onSelectionChange` callback (used by Character Counter)
- Language modes: `json`, `plaintext`
- Configurable placeholder, onChange, onSelectionChange

### Diff and Merge System

The diff/merge system (`/src/tools/json/differ/`) is the most complex:

1. **Key Sorting**: Both JSONs are sorted recursively by key before comparison
2. **Line-based Diffing**: Custom diff algorithm with 100-line look-ahead windows
3. **Interactive Merging**: Each diff line has merge buttons
4. **Indentation Normalization**: Inserted lines match surrounding indentation
5. **Comma Management**: Automatically fixes trailing commas
6. **Safety Checks**: Validates content hasn't changed before applying merge

### Formatter Resilience

`Formatter.parse()` has three-level fallback:
1. Standard `JSON.parse()`
2. Double-encoded JSON detection
3. Escaped string handling (for log-copied JSON)

### MD5 Implementation

Since WebCrypto API doesn't include MD5, a custom client-side implementation is used in `HashGeneratorTool.js`. SHA-1 and SHA-256 use the native WebCrypto API.

### Timezone Conversion

The Timestamp Converter uses `Intl.DateTimeFormat` with `timeZone` option for accurate timezone conversions. The selected timezone is persisted to `localStorage` under the key `timestamp-timezone`.

### Notification System

The `NotificationManager` listens for `tool:notification` custom events emitted by tools via `this.emit('tool:notification', { message, type })`. Toast notifications auto-dismiss after 3 seconds.

## Styling System

CSS is modularized into three files:

- **base.css**: CSS custom properties, theming (light/dark), reset, utilities
- **layouts.css**: Sidebar, workspace, pane layouts
- **components.css**: Tool-specific styles (editors, diff, stats, JWT, UUID, timestamp, etc.)

**Theme Toggle**: Changes `data-theme` attribute on `<html>` element, persisted to `localStorage`.

## Important Notes

- **100% Client-side**: No backend API, all processing happens in the browser
- **Privacy-first**: No external API calls, no data leaves the browser
- **Desktop-only**: UI is optimized for desktop, no mobile responsive design
- **Vanilla JavaScript**: No frameworks, uses ES6 modules
- **Self-registration**: Importing a tool category index file triggers tool registration
- **Hash routing**: Enables browser back/forward navigation without server config
- **Drag-and-drop**: Supported in JSON Formatter, Base64, and Hash Generator for file uploads
- **LocalStorage**: Used for theme preference and timestamp timezone persistence

## Adding New Tools

To add a new tool:

1. Create tool folder: `/src/tools/{category}/{tool-name}/`
2. Create tool class extending `BaseTool`: `{ToolName}Tool.js`
3. Implement `render()` and `bindEvents()` methods
4. Create registration file: `index.js` that calls `ToolRegistry.registerTool()`
5. Import in category index: Add `import './{tool-name}/index.js';` to `/src/tools/{category}/index.js`
6. Add CSS if needed to `/src/styles/components.css`

Example:

```javascript
// /src/tools/text/lorem-ipsum/LoremIpsumTool.js
import { BaseTool } from '../../../components/base/BaseTool.js';

export class LoremIpsumTool extends BaseTool {
  render() {
    this.container.innerHTML = `<div>Lorem Ipsum Generator</div>`;
  }

  bindEvents() {
    // Attach event listeners
  }
}

// /src/tools/text/lorem-ipsum/index.js
import { ToolRegistry } from '../../../core/registry.js';
import { LoremIpsumTool } from './LoremIpsumTool.js';

ToolRegistry.registerTool({
  id: 'lorem-ipsum',
  categoryId: 'text',
  name: 'Lorem Ipsum',
  description: 'Generate placeholder text',
  icon: '📝',
  keywords: ['lorem', 'ipsum', 'placeholder', 'text'],
  component: LoremIpsumTool,
  order: 3
});

// /src/tools/text/index.js (add this line)
import './lorem-ipsum/index.js';
```

## Docker Multi-stage Build

The Dockerfile uses a two-stage build:
1. **Node.js stage**: Installs pnpm, runs `pnpm build`
2. **Nginx stage**: Serves static files from `/dist`

This keeps the final image lightweight (~40MB) by excluding build tools.

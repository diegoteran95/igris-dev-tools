# Plan: Evolución de Igris JSON Tools a Plataforma Multi-herramientas

## Resumen

Transformar la aplicación actual de JSON Tools en una plataforma extensible de utilidades para desarrolladores, manteniendo JavaScript vanilla, arquitectura client-side only, y preservando toda la funcionalidad existente.

**Decisiones de Diseño:**
- Navegación: Sidebar lateral persistente con categorías
- Soporte: Solo desktop (sin optimización mobile)
- Privacidad: 100% client-side, sin envío de datos a servidores externos

---

## Nueva Estructura de Carpetas

```
/src
  /core                           # Framework central
    app.js                        # Bootstrap de la aplicación
    router.js                     # Routing basado en hash
    registry.js                   # Patrón Tool Registry

  /components                     # Componentes reutilizables
    /base
      BaseTool.js                 # Clase base para herramientas
    /ui
      CodeEditor.js               # Editor generalizado (desde SimpleEditor)
      CopyButton.js               # Botón copiar reutilizable
      FileDropZone.js             # Drag-and-drop de archivos
      Notification.js             # Sistema de notificaciones

  /tools                          # Herramientas auto-contenidas
    /json
      index.js                    # Registro de categoría JSON
      /formatter                  # Format/Minify/Escape
      /differ                     # Diff/Merge

    /text
      index.js                    # Registro de categoría Text
      /character-counter          # Contador de caracteres
      /text-splitter              # Divisor de texto

    /encoding                     # Incluido en v1
      index.js
      /base64                     # Base64 encoder/decoder
      /url-encoder                # URL encoder/decoder
      /jwt-decoder                # JWT token inspector

    /generators                   # Incluido en v1
      index.js
      /uuid                       # UUID v4/v7 generator
      /hash                       # MD5, SHA-1, SHA-256

    /datetime                     # Incluido en v1
      index.js
      /timestamp                  # Unix timestamp converter

    /converters                   # Futuro
      /yaml-json
      /csv-json

  /layouts
    MainLayout.js                 # Shell con sidebar

  /styles
    base.css                      # Variables, reset
    components.css                # Estilos de componentes
    layouts.css                   # Sidebar, layouts

  main.js                         # Entry point nuevo
```

---

## Arquitectura Core

### 1. Tool Registry (`/src/core/registry.js`)

Sistema de registro donde cada herramienta se auto-registra:

```javascript
ToolRegistry.registerCategory({ id: 'json', name: 'JSON Tools', icon: '{ }', order: 1 });
ToolRegistry.registerTool({
  id: 'json-formatter',
  categoryId: 'json',
  name: 'JSON Formatter',
  component: FormatterTool,
  keywords: ['format', 'beautify', 'minify']
});
```

### 2. Router Hash-Based (`/src/core/router.js`)

- URLs tipo `#/json-formatter`, `#/character-counter`
- Soporta navegación del browser (back/forward)
- Sin configuración de servidor requerida

### 3. BaseTool Class (`/src/components/base/BaseTool.js`)

Clase base con lifecycle methods:
- `mount()` / `unmount()`
- `render()` / `bindEvents()`
- Utilidades: `showError()`, `showSuccess()`, `copyToClipboard()`

---

## Navegación: Sidebar

Reemplaza el botón "Diff Mode" con una barra lateral persistente:

```
+------------------+------------------------+
| Igris Dev Tools  |  [Tool Name]           |
|------------------|  [Description]         |
| [Search...]      |                        |
|                  |  +------------------+  |
| JSON Tools       |  |                  |  |
|  > Formatter     |  |   Tool Content   |  |
|  > Diff/Merge    |  |                  |  |
|                  |  +------------------+  |
| Text Tools       |                        |
|  > Char Counter  |                        |
|  > Text Splitter |                        |
|                  |                        |
| [Theme Toggle]   |                        |
+------------------+------------------------+
```

---

## Herramientas Nuevas Solicitadas

### 1. Character Counter (`/src/tools/text/character-counter/`)

**Funcionalidades:**
- Total de caracteres
- Caracteres sin espacios
- Conteo de palabras
- Conteo de líneas
- **Conteo de selección** (se actualiza al seleccionar texto)

### 2. Text Splitter (`/src/tools/text/text-splitter/`)

**Funcionalidades:**
- Input: texto a dividir
- Configuración: separador (coma, newline, custom)
- Opciones: trim whitespace, remove empty
- Output: lista de partes con conteo
- Copiar todas las partes o individualmente

### 3. Timestamp Converter (`/src/tools/datetime/timestamp/`)

**Funcionalidades:**

**Sección 1: Unix → Fecha**
- Input: campo numérico para Unix timestamp
- Auto-detecta si es segundos (10 dígitos) o milisegundos (13 dígitos)
- Output: Fecha formateada según timezone seleccionado
- Formatos mostrados: ISO 8601, fecha local legible, relativo ("hace 2 horas")

**Sección 2: Fecha → Unix**
- Input: Date-time picker nativo (`<input type="datetime-local">`)
- Output: Muestra ambos valores:
  - Unix en segundos (ej: `1704067200`)
  - Unix en milisegundos (ej: `1704067200000`)
- Botones de copiar para cada formato

**Selector de Timezone (global):**
- Dropdown con timezones comunes + opción de buscar
- Timezones sugeridos: UTC, America/Bogota, America/New_York, Europe/Madrid, etc.
- Usa `Intl.DateTimeFormat` para la conversión
- Persiste selección en localStorage

**Botón "Now":** Llena con timestamp actual

---

## Fases de Implementación

### Fase 1: Fundación (Sin romper nada)
1. Crear `/src/core/` con registry.js, router.js
2. Crear `/src/components/base/BaseTool.js`
3. Crear `/src/layouts/MainLayout.js`
4. Crear estructura `/src/styles/`

### Fase 2: Refactorizar Módulos Existentes
1. Generalizar SimpleEditor → CodeEditor
2. Extraer CopyButton, FileDropZone
3. Mover formatter.js, differ.js a `/src/tools/json/`
4. Mantener re-exports en `/src/modules/` para compatibilidad

### Fase 3: Crear Tool Components
1. FormatterTool.js con toda la lógica format/minify/escape
2. DifferTool.js con la lógica de diff/merge
3. Archivos de registro (index.js) para cada tool

### Fase 4: Implementar Navegación
1. Actualizar index.html con nueva estructura
2. Nuevo main.js con inicialización del sistema
3. CSS para sidebar responsive
4. Router funcional

### Fase 5: Agregar Text Tools
1. Crear categoría Text Tools
2. Implementar CharacterCounterTool
3. Implementar TextSplitterTool

### Fase 6: Agregar Encoding Tools
1. Crear categoría Encoding
2. Implementar Base64Tool (encode/decode, soporte de archivos)
3. Implementar URLEncoderTool (encode/decode componentes y URLs)
4. Implementar JWTDecoderTool (header, payload, verificación de expiración)

### Fase 7: Agregar Generators
1. Crear categoría Generators
2. Implementar UUIDGeneratorTool (v4, v7, generación en batch)
3. Implementar HashGeneratorTool (MD5, SHA-1, SHA-256, desde texto o archivo)

### Fase 8: Agregar DateTime Tools
1. Crear categoría Date/Time
2. Implementar TimestampConverterTool (Unix ↔ ISO ↔ Legible)

### Fase 9: Limpieza y Documentación
1. Remover código legacy
2. Consolidar CSS
3. Actualizar CLAUDE.md con nueva arquitectura
4. Testing final de todas las herramientas

---

## Resumen de Herramientas v1

### Categoría: JSON Tools (existente)
- **JSON Formatter** - Format, minify, escape
- **JSON Diff/Merge** - Comparación y merge interactivo

### Categoría: Text Tools (nuevo)
- **Character Counter** - Caracteres, palabras, líneas, selección
- **Text Splitter** - Dividir por separador configurable

### Categoría: Encoding (nuevo)
- **Base64** - Encode/decode texto y archivos
- **URL Encoder** - Encode/decode para URLs y query params
- **JWT Decoder** - Inspeccionar header, payload, expiración

### Categoría: Generators (nuevo)
- **UUID Generator** - v4, v7, generación en batch
- **Hash Generator** - MD5, SHA-1, SHA-256

### Categoría: Date/Time (nuevo)
- **Timestamp Converter** - Conversor completo con:
  - Unix (segundos) → Fecha legible
  - Unix (milisegundos) → Fecha legible
  - Date picker → Unix (muestra ambos: segundos y milisegundos)
  - Selector de timezone para todas las conversiones
  - Soporte para ISO 8601

---

## Herramientas para Futuras Versiones

| Herramienta | Categoría | Descripción |
|-------------|-----------|-------------|
| Regex Tester | Text | Probar expresiones regulares en vivo |
| Lorem Ipsum Generator | Generators | Texto placeholder configurable |
| Color Converter | Converters | HEX ↔ RGB ↔ HSL |
| Markdown Preview | Text | Vista previa de Markdown |
| YAML ↔ JSON | Converters | Conversión bidireccional |
| Cron Expression Parser | Date/Time | Explicar y generar cron |
| CSV to JSON | Converters | Conversión con opciones |
| QR Code Generator | Generators | Generar códigos QR |
| HTML Entity Encoder | Encoding | Encode/decode entidades HTML |

---

## Archivos Críticos a Modificar

| Archivo | Acción |
|---------|--------|
| `/src/main.js` | Refactorizar → nuevo orchestrator |
| `/src/modules/ui.js` | Extraer lógica a MainLayout |
| `/src/modules/editor.js` | Generalizar → CodeEditor |
| `/src/style.css` | Modularizar en /styles/ |
| `/index.html` | Nueva estructura con sidebar |

---

## Verificación

### Funcionalidad Core
1. **JSON Tools**: Format, Minify, Escape, Diff/Merge funcionan igual que antes
2. **Navegación**: Sidebar muestra 5 categorías con sus herramientas, routing hash funciona
3. **Theme**: Dark/Light mode persiste en localStorage
4. **Build**: `pnpm build` genera bundle funcional

### Text Tools
5. **Character Counter**: Cuenta caracteres, palabras, líneas en tiempo real
6. **Character Counter - Selección**: Al seleccionar texto, muestra conteo de selección
7. **Text Splitter**: Divide por separador, opciones trim/remove empty funcionan

### Encoding Tools
8. **Base64**: Encode/decode texto, soporte drag-drop de archivos
9. **URL Encoder**: Encode/decode, detecta si es URL completa o componente
10. **JWT Decoder**: Muestra header y payload formateados, indica si está expirado

### Generators
11. **UUID**: Genera v4 y v7, copia individual y batch
12. **Hash**: Genera MD5, SHA-1, SHA-256 desde texto o archivo

### DateTime
13. **Timestamp - Unix a Fecha**: Convierte Unix (seg o ms) a fecha legible con timezone seleccionado
14. **Timestamp - Fecha a Unix**: Date picker convierte a Unix, muestra tanto segundos como milisegundos
15. **Timestamp - Timezone**: Selector permite elegir cualquier timezone (UTC, America/Bogota, etc.)

### Comandos de Verificación
```bash
# Desarrollo
pnpm dev
# Abrir http://localhost:5173

# Build de producción
pnpm build
pnpm preview
```

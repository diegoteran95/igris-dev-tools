# Compartir Imagen Docker - Igris JSON Tools

## Opción 1: Exportar/Importar (Sin registro Docker)

### Para compartir (tú):

```bash
# Exportar la imagen a un archivo .tar
docker save igris-json-tools:latest -o igris-json-tools.tar

# Comprimir para reducir tamaño (opcional pero recomendado)
gzip igris-json-tools.tar
# Resultado: igris-json-tools.tar.gz (~8-10MB)
```

Comparte el archivo `igris-json-tools.tar.gz` por email, Drive, etc.

### Para instalar (receptor):

```bash
# Si está comprimido, descomprimir primero
gunzip igris-json-tools.tar.gz

# Importar la imagen
docker load -i igris-json-tools.tar

# Ejecutar el contenedor
docker run -d -p 8080:80 --name igris-json-tools igris-json-tools:latest
```

---

## Opción 2: Docker Hub (Público o Privado)

### Configuración inicial:

```bash
# 1. Crear cuenta en hub.docker.com (si no tienes)

# 2. Login desde terminal
docker login

# 3. Etiquetar la imagen con tu usuario
docker tag igris-json-tools:latest TU_USUARIO/igris-json-tools:latest

# 4. Subir la imagen
docker push TU_USUARIO/igris-json-tools:latest
```

### Para instalar (cualquier persona):

```bash
# Descargar y ejecutar
docker run -d -p 8080:80 --name igris-json-tools TU_USUARIO/igris-json-tools:latest
```

---

## Opción 3: GitHub Container Registry (Recomendado para empresas)

### Configuración:

```bash
# 1. Crear Personal Access Token en GitHub
# Settings → Developer settings → Personal access tokens → Generate new token
# Permisos: write:packages, read:packages

# 2. Login
echo "TU_TOKEN" | docker login ghcr.io -u TU_USUARIO --password-stdin

# 3. Etiquetar
docker tag igris-json-tools:latest ghcr.io/TU_USUARIO/igris-json-tools:latest

# 4. Subir
docker push ghcr.io/TU_USUARIO/igris-json-tools:latest
```

### Para instalar:

```bash
docker pull ghcr.io/TU_USUARIO/igris-json-tools:latest
docker run -d -p 8080:80 --name igris-json-tools ghcr.io/TU_USUARIO/igris-json-tools:latest
```

---

## Opción 4: Compartir solo el código fuente

La forma más profesional es compartir el repositorio con el Dockerfile:

```bash
# El receptor clona el repo
git clone https://github.com/TU_USUARIO/igris-json-tools.git
cd igris-json-tools

# Y ejecuta
docker-compose up -d
```

---

## Comparación rápida:

| Método | Pros | Contras | Mejor para |
|--------|------|---------|------------|
| **Exportar/Importar** | Simple, sin cuenta | Archivo grande, manual | Pocas personas, uso interno |
| **Docker Hub** | Fácil de usar, público | Límites en plan gratuito | Proyectos open source |
| **GitHub Registry** | Integrado con GitHub, privado | Requiere token | Proyectos empresariales |
| **Código fuente** | Transparente, versionado | Requiere build | Desarrollo colaborativo |

---

## Recomendación

- **Para Kushki (interno)**: Usa **GitHub Container Registry** o un registro privado de AWS/GCP
- **Para compartir rápido**: Usa **Exportar/Importar**
- **Para open source**: Usa **Docker Hub**

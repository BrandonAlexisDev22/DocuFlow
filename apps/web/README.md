# DocuFlow — Frontend

Aplicación Angular 22 (standalone, zoneless, SSR) para la gestión documental de DocuFlow. Consume la API NestJS de `apps/api`.

## Requisitos

- Node.js 22 o superior
- La API de DocuFlow ejecutándose (por defecto en `http://localhost:3000`)

## Ejecución

Desde la raíz del monorepo:

```bash
npm install

# API (en otra terminal)
npm run start:dev --workspace=apps/api

# Frontend en modo desarrollo → http://localhost:4200
npm run start --workspace=apps/web
```

Compilación de producción:

```bash
npm run build --workspace=apps/web

# Servir el build con SSR → http://localhost:4000
npm run serve:ssr:web --workspace=apps/web
```

Pruebas unitarias:

```bash
npm run test --workspace=apps/web -- --watch=false
```

## Configuración

| Archivo / variable | Uso |
|---|---|
| `src/environments/environment.ts` → `apiUrl` | URL base de la API (`http://localhost:3000`). |
| `CORS_ORIGIN` (en `apps/api/.env`) | Orígenes permitidos por la API, separados por comas. Si no se define, se permite `http://localhost:4200`. |
| `angular.json` → `security.allowedHosts` | Hosts aceptados por el servidor SSR. Agrega aquí el dominio de producción al desplegar. |

## Funcionalidades

- **Autenticación:** login, registro, validación de formularios, sesión persistente, interceptor JWT, guards y cierre de sesión. Si la API responde `401`, la sesión se cierra y se redirige al login.
- **Panel:** totales, documentos con y sin archivo, almacenamiento usado, distribución por categoría y documentos recientes.
- **Documentos:** listado, búsqueda (nombre, descripción o archivo), filtro por categoría, creación, edición, detalle y eliminación con confirmación.
- **Archivos:** subida de PDF, DOC y DOCX (máximo 10 MB, validado también en el cliente) y descarga mediante enlace temporal.
- **Perfil:** datos de la cuenta (`GET /auth/profile`) y cierre de sesión.

## Arquitectura

```text
src/app/
├── data/            Acceso HTTP y modelos que reflejan los contratos de la API
│   ├── auth/        AuthApiService, TokenStorageService, modelos
│   └── documents/   DocumentsApiService, modelos
├── application/     Lógica de la aplicación
│   ├── auth/        AuthService (estado de sesión), interceptor, guards
│   ├── documents/   DocumentsService, categorías, reglas de archivos
│   └── shared/      Traducción de errores HTTP a mensajes
└── presentation/    Componentes standalone
    ├── auth/        Login y registro
    ├── layout/      Shell con navegación lateral
    ├── dashboard/
    ├── documents/   Listado, formulario y detalle
    ├── profile/
    └── shared/      Iconos, diálogo de confirmación, selector de archivos, pipes
```

Los componentes no usan `HttpClient` directamente: llaman a los servicios de `application/`, que a su vez usan los de `data/`.

### SSR

`/auth/login` y `/auth/register` se prerenderizan. Las rutas privadas se renderizan en el cliente (`RenderMode.Client`), porque la sesión se guarda en `localStorage`, que no existe en el servidor. `TokenStorageService` no hace nada cuando se ejecuta en el servidor.

### Notas sobre la API

- La API no permite reemplazar el archivo de un documento: si ya tiene uno, responde `409`. Para cambiar el archivo, crea un documento nuevo.
- La API no ofrece búsqueda ni filtros, así que se aplican en el cliente sobre `GET /documents`.
- Al crear un documento con archivo, primero se guarda el documento y después se sube el archivo. Si la subida falla, el documento queda creado y su detalle permite reintentar la subida.

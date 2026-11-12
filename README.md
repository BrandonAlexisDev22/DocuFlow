# DocuFlow

Plataforma web de gestión documental para empresas. Cada usuario organiza sus documentos (contratos, facturas, informes, certificados) en categorías y guarda el archivo correspondiente en la nube de forma privada.

![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma_7-336791?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)

---

## Contenido

- [Funcionalidades](#funcionalidades)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [API](#api)
- [Modelo de datos](#modelo-de-datos)
- [Seguridad](#seguridad)
- [Scripts](#scripts)
- [Limitaciones conocidas](#limitaciones-conocidas)

## Funcionalidades

| Módulo | Qué incluye |
|---|---|
| **Autenticación** | Registro, inicio de sesión con JWT, sesión persistente, rutas protegidas y cierre de sesión automático cuando el token expira. |
| **Panel** | Total de documentos, documentos con y sin archivo, almacenamiento usado, distribución por categoría y documentos recientes. |
| **Documentos** | Crear, consultar, editar y eliminar. Búsqueda por texto y filtro por categoría. |
| **Archivos** | Subida de PDF, DOC y DOCX (máximo 10 MB) y descarga mediante enlace temporal de 5 minutos. |
| **Perfil** | Datos de la cuenta y cierre de sesión. |

Cada usuario solo puede ver y modificar sus propios documentos.

## Stack tecnológico

**Frontend:** `apps/web`
- Angular 22: componentes standalone, signals, zoneless y SSR
- Reactive Forms, Angular Router, HttpClient y RxJS
- CSS propio, sin librerías de UI

**Backend:** `apps/api`
- NestJS 12
- PostgreSQL con Prisma ORM 7
- Autenticación con Passport JWT y contraseñas con bcrypt
- Almacenamiento de archivos en Cloudinary (recursos privados `authenticated`)
- Validación con `class-validator`

## Arquitectura

```text
DocuFlow/
├── apps/
│   ├── api/                      # API REST (NestJS)
│   │   ├── prisma/               # Esquema y migraciones
│   │   └── src/
│   │       ├── application/      # Casos de uso: auth, users, documents
│   │       ├── infrastructure/   # Prisma, JWT/Passport, Cloudinary
│   │       └── presentation/     # Controladores, DTOs y módulos
│   └── web/                      # Aplicación Angular
│       └── src/app/
│           ├── data/             # Acceso HTTP y modelos
│           ├── application/      # Estado de sesión, guards, interceptor, servicios
│           └── presentation/     # Páginas y componentes
├── libs/shared/                  # Contratos compartidos (reservado)
└── package.json                  # Workspaces npm
```

Ambas aplicaciones separan **presentación**, **lógica de aplicación** e **infraestructura/datos**. Los componentes de Angular no llaman a `HttpClient` directamente, y los controladores de NestJS delegan en servicios de aplicación.

```text
Navegador ──► Angular (4200) ──HTTP + JWT──► NestJS (3000) ──► PostgreSQL
                                                   │
                                                   └──► Cloudinary (archivos privados)
```

## Requisitos

- Node.js 22 o superior y npm 11
- PostgreSQL 14 o superior
- Una cuenta de [Cloudinary](https://cloudinary.com) (el plan gratuito es suficiente)

## Instalación y ejecución

```bash
# 1. Clonar e instalar dependencias (todas las apps del monorepo)
git clone https://github.com/BrandonAlexisDev22/DocuFlow.git
cd DocuFlow
npm install

# 2. Configurar las variables de entorno de la API
cp apps/api/.env.example apps/api/.env
# Edita apps/api/.env con tus credenciales

# 3. Crear las tablas en la base de datos
cd apps/api
npx prisma migrate deploy
cd ../..

# 4. Iniciar la API → http://localhost:3000
npm run dev:api

# 5. En otra terminal, iniciar el frontend → http://localhost:4200
npm run dev:web
```

Comprueba que la API está en marcha con `GET http://localhost:3000/health`.

> Después de modificar `prisma/schema.prisma`, ejecuta `npx prisma migrate dev` y `npx prisma generate` dentro de `apps/api`.

## Variables de entorno

Archivo `apps/api/.env` (plantilla en [`apps/api/.env.example`](apps/api/.env.example)):

| Variable | Obligatoria | Descripción |
|---|:---:|---|
| `DATABASE_URL` | Sí | Cadena de conexión de PostgreSQL. |
| `JWT_SECRET` | Sí | Secreto para firmar los tokens JWT. Usa un valor largo y aleatorio. |
| `CLOUDINARY_CLOUD_NAME` | Sí | Nombre del *cloud* de Cloudinary. |
| `CLOUDINARY_API_KEY` | Sí | API key de Cloudinary. |
| `CLOUDINARY_API_SECRET` | Sí | API secret de Cloudinary. |
| `PORT` | No | Puerto de la API. Por defecto `3000`. |
| `CORS_ORIGIN` | No | Orígenes permitidos, separados por comas. Por defecto `http://localhost:4200`. |

El frontend toma la URL de la API de [`apps/web/src/environments/environment.ts`](apps/web/src/environments/environment.ts).

## API

URL base: `http://localhost:3000`. Las rutas marcadas con 🔒 requieren la cabecera `Authorization: Bearer <token>`.

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/register` | Registra un usuario y devuelve `{ message, user, accessToken }`. |
| `POST` | `/auth/login` | Inicia sesión y devuelve `{ message, user, accessToken }`. |
| `GET` | `/auth/profile` 🔒 | Devuelve `{ id, name, email, createdAt }`. |

```json
// POST /auth/register
{ "name": "Ana Martínez", "email": "ana@empresa.com", "password": "Password123" }
```

### Documentos 🔒

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/documents` | Lista los documentos del usuario, del más reciente al más antiguo. |
| `POST` | `/documents` | Crea un documento: `{ name, category, description? }`. |
| `GET` | `/documents/:id` | Obtiene un documento. |
| `PATCH` | `/documents/:id` | Actualiza `name`, `description` o `category`. |
| `DELETE` | `/documents/:id` | Elimina el documento y su archivo en Cloudinary. |
| `POST` | `/documents/:id/upload` | Sube el archivo (`multipart/form-data`, campo `file`). |
| `GET` | `/documents/:id/download` | Devuelve `{ downloadUrl, expiresIn }` con un enlace temporal. |

Categorías válidas: `CONTRACT`, `INVOICE`, `REPORT`, `CERTIFICATE`, `OTHER`.

### Errores

Los errores siguen el formato estándar de NestJS, con mensajes en español:

```json
{ "statusCode": 400, "error": "Bad Request", "message": ["El correo electrónico no es válido"] }
```

| Código | Cuándo ocurre |
|---|---|
| `400` | Datos inválidos, archivo ausente o con formato no permitido. |
| `401` | Token ausente, inválido o expirado, o credenciales incorrectas. |
| `404` | El documento no existe o pertenece a otro usuario. |
| `409` | El correo ya está registrado, o el documento ya tiene un archivo. |
| `413` | El archivo supera los 10 MB. |

## Modelo de datos

```text
User                         Document
─────────────────            ──────────────────────────────
id          Int  PK          id           Int  PK
name        String           name         String
email       String unique    description  String?
password    String (hash)    category     DocumentCategory
createdAt   DateTime         fileName     String?
updatedAt   DateTime         fileType     String?
                             fileSize     Int?   (bytes)
        1 ───────────── N    fileUrl      String?
                             publicId     String?  (Cloudinary)
                             userId       Int  FK → User (cascade)
                             createdAt / updatedAt
```

## Seguridad

- Las contraseñas se guardan con **bcrypt** (12 rondas) y nunca se devuelven en las respuestas.
- Los tokens JWT **expiran a los 15 minutos**. Al expirar, el frontend cierra la sesión y redirige al login.
- Todas las consultas de documentos filtran por el `userId` del token, así que un usuario no puede acceder a documentos ajenos.
- Los archivos se guardan en Cloudinary como recursos **privados**. Solo se accede a ellos mediante URLs firmadas que caducan a los 5 minutos.
- El tipo de archivo se valida por extensión y tipo MIME en la API y también en el navegador.
- `ValidationPipe` con `whitelist` y `forbidNonWhitelisted` rechaza campos no esperados.
- CORS está restringido a los orígenes configurados en `CORS_ORIGIN`.
- El interceptor del frontend solo adjunta el token a peticiones dirigidas a la API.

## Scripts

Desde la raíz del repositorio:

| Comando | Descripción |
|---|---|
| `npm run dev:api` | API en modo desarrollo con recarga automática. |
| `npm run dev:web` | Frontend en modo desarrollo (`http://localhost:4200`). |
| `npm run build:api` | Compila la API en `apps/api/dist`. |
| `npm run build:web` | Compila el frontend con SSR en `apps/web/dist`. |
| `npm run start:prod --workspace=apps/api` | Ejecuta la API compilada. |
| `npm run serve:ssr:web --workspace=apps/web` | Sirve el frontend compilado (`http://localhost:4000`). |
| `npm run test --workspace=apps/web -- --watch=false` | Pruebas unitarias del frontend. |

Más detalles del frontend en [`apps/web/README.md`](apps/web/README.md).

## Limitaciones conocidas

- **Una sesión dura 15 minutos.** No hay *refresh token*, así que al expirar hay que volver a iniciar sesión.
- **No se puede reemplazar el archivo de un documento.** Si ya tiene uno, la API responde `409`.
- **La búsqueda y los filtros se hacen en el navegador.** La API devuelve todos los documentos del usuario sin paginación.
- **No hay recuperación de contraseña ni edición del perfil.**

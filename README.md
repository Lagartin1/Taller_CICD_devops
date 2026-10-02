# Recordando APIs

Aplicación web con autenticación basada en JWT y cookies. El repositorio contiene un frontend React/Vite, una API Express/TypeScript y una base de datos PostgreSQL administrada en Supabase mediante Prisma.

El proyecto está preparado para ejecutarse con Docker y para publicar/desplegar las imágenes mediante GitHub Actions, Docker Hub y un servidor en AWS.

## Arquitectura

| Componente | Tecnología | Puerto local |
| --- | --- | --- |
| Frontend | React, Vite y Nginx | `5173` |
| API | Express, TypeScript y Prisma | `3000` |
| Base de datos | PostgreSQL en Supabase | Administrada por Supabase |
| Contenedores | Docker Compose | — |

La API se expone bajo el prefijo `/api`. El frontend se comunica con ella usando la variable de compilación `VITE_API_URL`.

## Requisitos

- Node.js 22 o posterior y npm.
- Una cuenta y proyecto de Supabase con PostgreSQL.
- Docker Engine con Docker Compose v2, para la ejecución en contenedores.
- Para el despliegue: una cuenta de Docker Hub, un repositorio en GitHub y una instancia EC2 en AWS.

## Configuración local

### 1. Base de datos y API

En Supabase, abre **Project Settings → Database → Connection string → URI** y copia la URI del **Session Pooler**. Crea el archivo de entorno a partir del ejemplo:

```bash
cp baceknd/.env.example baceknd/.env
```

Completa estos valores en `baceknd/.env`:

```dotenv
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:5432/postgres?sslmode=require"
JWT_SECRET="un-secreto-largo-y-aleatorio"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

Instala las dependencias, genera el cliente Prisma y crea/aplica la migración inicial:

```bash
cd baceknd
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

La API estará disponible en `http://localhost:3000`. Puedes comprobarla con:

```bash
curl http://localhost:3000/api/health
```

### 2. Frontend

En otra terminal, prepara la URL de la API y arranca Vite:

```bash
cp frontend/.env.example frontend/.env
cd frontend
npm install
npm run dev
```

El valor local esperado en `frontend/.env` es:

```dotenv
VITE_API_URL="http://localhost:3000/api"
```

Abre `http://localhost:5173` en el navegador.

## Endpoints principales

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/` | Estado básico del servidor |
| `GET` | `/api/health` | Health check de la API |
| `POST` | `/api/auth/register` | Registro de usuario |
| `POST` | `/api/auth/login` | Inicio de sesión |
| `POST` | `/api/auth/refresh` | Renovación de sesión |
| `POST` | `/api/auth/logout` | Cierre de sesión |
| `GET` | `/api/protected` | Ruta protegida por autenticación |

## Ejecutar con Docker

Desde la raíz del repositorio, asegúrate de que `baceknd/.env` exista y define las URL públicas que correspondan al entorno:

```bash
export FRONTEND_URL="http://localhost:5173"
export VITE_API_URL="http://localhost:3000/api"
docker compose -f docker/compose.yml up --build
```

Docker publica el frontend en `http://localhost:5173` y la API en `http://localhost:3000`. Para ejecutarlo en segundo plano, sustituye el final del comando por `up -d --build`.

> `VITE_API_URL` se incorpora al construir el frontend. En producción debe apuntar a la URL pública de la API, por ejemplo `https://api.tu-dominio.com/api`.

## Despliegue en AWS (EC2)

El workflow de despliegue está pensado para un **runner autoalojado de GitHub Actions** instalado en una instancia EC2. El runner descarga las imágenes desde Docker Hub y las inicia con Docker Compose.

### Preparar la instancia

1. Crea una instancia EC2 con una distribución Linux compatible con Docker y acceso SSH.
2. En el Security Group permite tráfico TCP entrante a los puertos `3000` (API) y `5173` (frontend) con la configuración actual; abre `22` solo desde tu IP para administración. Si más adelante añades un proxy inverso, expón `80`/`443` en lugar de publicar esos puertos directamente.
3. Instala Docker Engine y el complemento Docker Compose en la instancia, y permite que el usuario del runner ejecute Docker.
4. En GitHub, ve a **Settings → Actions → Runners → New self-hosted runner**, registra el runner Linux en la instancia y mantenlo activo como servicio.
5. Si las imágenes de Docker Hub son privadas, inicia sesión en Docker Hub en la instancia con una cuenta que tenga permisos de lectura.

### Variables y secretos de GitHub

Configura estos valores en **Settings → Secrets and variables → Actions** del repositorio:

| Tipo | Nombre | Uso |
| --- | --- | --- |
| Secret | `DOCKER_USERNAME` | Usuario de Docker Hub para publicar imágenes |
| Secret | `DOCKER_PSWD` | Token o contraseña de Docker Hub |
| Secret | `DATABASE_URL` | URI de PostgreSQL/Supabase de producción |
| Secret | `JWT_SECRET` | Secreto JWT de producción, largo y aleatorio |
| Variable | `VITE_API_URL` | URL pública de la API usada al compilar el frontend |
| Variable | `FRONTEND_URL` | URL pública permitida para el frontend |

No subas `baceknd/.env` ni secretos al repositorio. El workflow de despliegue genera ese archivo únicamente en el host de AWS.

### Migraciones en producción

Antes del primer despliegue —y después de introducir una migración— aplícala de forma controlada con las variables de producción disponibles:

```bash
cd baceknd
npm ci
npm run prisma:generate
npm run prisma:deploy
```

El workflow actual no ejecuta migraciones automáticamente; separarlas del despliegue evita cambios de esquema inesperados al arrancar contenedores.

## CI/CD

Hay dos workflows en `.github/workflows`:

1. **Docker Image CI** (`build-containers.yml`): se activa en `push` y `pull request` hacia `main`; construye las imágenes de backend y frontend con `docker compose`, y las publica en Docker Hub como `lagartin1/devops-ci-cd-taller:api-latest` y `lagartin1/devops-ci-cd-taller:frontend-latest`.
2. **Deploy pipeline** (`deploy.yml`): se ejecuta cuando el workflow anterior finaliza correctamente. En el runner de AWS crea `baceknd/.env` con los secretos de GitHub, descarga las imágenes y ejecuta `docker compose up -d --remove-orphans`.

Flujo resultante:

```text
push / PR a main → build de imágenes → Docker Hub → runner EC2 → docker compose up
```

## Pruebas y verificación en AWS

Después de un despliegue exitoso, conéctate a la instancia y confirma el estado de los contenedores:

```bash
docker compose -f docker/compose.yml ps
docker compose -f docker/compose.yml logs --tail=100 backend
docker compose -f docker/compose.yml logs --tail=100 frontend
```

Desde tu equipo o desde la propia instancia, comprueba el health check con la URL pública configurada:

```bash
curl -i http://TU_HOST:3000/api/health
```

Debe devolver `200 OK` y un JSON con `"ok": true`. Comprueba también la carga del frontend:

```bash
curl -I http://TU_HOST:5173
```

Actualmente no hay una suite de pruebas automatizadas: `baceknd` no define pruebas y el frontend dispone de `npm run lint` y `npm run build`. Antes de publicar cambios conviene ejecutar:

```bash
cd frontend && npm run lint && npm run build
cd ../baceknd && npm run prisma:generate
```

## Estructura

```text
.
├── baceknd/                # API Express, Prisma y Dockerfile
├── frontend/               # Aplicación React/Vite y Nginx
├── docker/compose.yml      # Orquestación de los dos contenedores
└── .github/workflows/      # Construcción/publicación y despliegue
```

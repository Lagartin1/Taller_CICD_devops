# RecordandoAPis

## Backend con Supabase

El backend usa la base de datos PostgreSQL de Supabase mediante Prisma 7 y `@prisma/adapter-pg`.

1. En Supabase, abre `Project Settings > Database > Connection string > URI` y copia la URI del **Session Pooler**.
2. Copia `baceknd/.env.example` a `baceknd/.env` y reemplaza `[PROJECT-REF]`, `[PASSWORD]` y `[POOLER-HOST]`.
3. Define un `JWT_SECRET` largo y aleatorio.
4. Desde `baceknd`, ejecuta:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

La API quedará disponible en `http://localhost:3000`. El endpoint `GET /api/health` permite comprobar que está activa.

Para el frontend, copia `frontend/.env.example` a `frontend/.env` y configura `VITE_API_URL` con la URL base de la API.



workflows para ci cd con docker - aws

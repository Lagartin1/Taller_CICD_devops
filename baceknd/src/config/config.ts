import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve .env from the backend directory, regardless of the process cwd.
const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(backendDirectory, '.env') });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Add your Supabase PostgreSQL connection string to backend/.env');
}

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required. Add a secure value to backend/.env');
}

const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;



export const config = {
    port: Number(process.env.PORT || 3000),
    databaseUrl,
    jwtSecret,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

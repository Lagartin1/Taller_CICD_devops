import {PrismaClient} from '../generated/prisma/client';

import {config} from '../config/config';
import {PrismaPg} from '@prisma/adapter-pg'
import {Pool} from 'pg';

const pool = new Pool({
    connectionString: config.databaseUrl,
});


const prismaPg = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter: prismaPg } );
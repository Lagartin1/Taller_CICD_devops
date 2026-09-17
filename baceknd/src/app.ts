
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './config/config';

import router from './routes/routes';



const app: express.Application = express() ;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: config.frontendUrl, credentials: true }));


app.use('/api', router);

app.get('/', (req, res) => {
    res.send(
      {
        ok: true,
        status: 'Server is running',
        timestamp: new Date().toISOString()
      }
    )
});

export default app;








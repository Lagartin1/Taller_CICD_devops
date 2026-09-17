
import app from './src/app';


import {config} from './src/config/config';


app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});



import express = require('express');
// import bodyParser = require('body-parser');
import routes from './routes';

const app: express.Application = express();

app.use(routes);

app.listen(8080, () => {
    console.log('App is listening on port 8080!')
});
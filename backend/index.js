const express = require('express');
const bodyParser = require('body-parser');
const routesHandler = require('./routes/handler.js');
require('dotenv/config');

const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/', routesHandler);

const populateDB = require('./utils/populateDB.js');

if (process.env.CREATE_DB.toLowerCase() !== 'true' && process.env.CREATE_DB.toLowerCase() !== 'false') {
    throw new Error('ERROR: Invalid value "'+process.env.CREATE_DB+'" for environment variable CREATE_DB. Must be "true" or "false"');
}
process.env.CREATE_DB === 'true' && populateDB();


const PORT = process.env.PORT || 4000; // backend routing port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

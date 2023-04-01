const express = require('express');
const bodyParser = require('body-parser');
const routesHandler = require('./routes/handler.js');
require('dotenv/config');

const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use('/', routesHandler);

const populateDB = require('./utils/populateDB.js');

// UNCOMMENT populateDB() TO RESET AND REPOPULATE THE DATABASE ****************************************************************************
// *****************************************************************************************************************************************
// *****************************************************************************************************************************************


// populateDB();


// *****************************************************************************************************************************************
// *****************************************************************************************************************************************
// *****************************************************************************************************************************************

const PORT = process.env.PORT || 4000; // backend routing port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

/*  
  server.js

  Backend of the website!
*/
require('dotenv').config();


/*  Important Modules!  */
const express = require('express');
const cors = require('cors');
const path = require('path');

/*  Database Setup!  */


// Initialize Express app
const app = express();  
const port = process.env.PORT;

// Use CORS middleware
app.use(cors());

// Serve static files from the 'build' directory
app.use('/', express.static(path.join(__dirname, './build')));


/*  Starting and Killing Server  */
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Shutting down...');
  process.exit(0);
});

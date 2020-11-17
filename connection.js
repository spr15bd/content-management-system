const mysql = require("mysql");
// changed connection to heliohost
let connection = mysql.createConnection({
  host     : 'johnny.heliohost.org',
  user     : 'bdady_tiger',
  password : '!_cXj8£;',
  database : 'bdady_cms'
});

module.exports = connection;

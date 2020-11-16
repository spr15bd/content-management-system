const mysql = require("mysql");
let connection = mysql.createConnection({
  host     : 'johnny.heliohost.org',
  user     : 'bdady@localhost',
  password : '_B!3Ex£lk$Tu',
  database : 'bdady_cms'
});

module.exports = connection;

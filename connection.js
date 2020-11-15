const mysql = require("mysql");
let connection = mysql.createConnection({
  host     : 'johnny.heliohost.org',
  user     : 'bdady@localhost',
  password : 'l_B3Ex£lk$Tu',
  database : 'bdady_cms'
});

module.exports = connection;

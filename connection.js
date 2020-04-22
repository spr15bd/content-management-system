const mysql = require("mysql");




let connection = mysql.createConnection({
  host     : 'sql2.freemysqlhosting.net',
  user     : 'sql2333242',
  password : 'lT8!hP9%',
  database : 'sql2333242'
});

module.exports = connection;
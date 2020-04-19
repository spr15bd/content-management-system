// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const mysql = require("mysql");
let data;

//app.engine('html', require('ejs').renderFile);
app.set("view engine","ejs");

var connection = mysql.createConnection({
  host     : 'sql2.freemysqlhosting.net',
  user     : 'sql2333242',
  password : 'lT8!hP9%',
  database : 'sql2333242'
});

connection.connect();

connection.query('SELECT * from categories', function (error, results, fields) {
  if (error) {
    console.log("Connection error");
    throw error;
  }
  console.log('The solution is: ', results);
  data = results;
  
});

connection.end();



// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.render('index', { title: 'User List', userData: data});
  //response.sendFile(__dirname + "/views/index.html");
});




// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

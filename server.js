// server.js
// where your node app starts

let data;
const express = require("express");
const app = express();

app.set("view engine","ejs");

let connection = require("./connection.js");

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

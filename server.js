// server.js
// where your node app starts

let data, posts, search_posts;
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());       // to support JSON-encoded bodies
app.set("view engine","ejs");

let connection = require("./connection.js");

//connection.connect();

connection.query('SELECT * from categories', function (error, results, fields) {
  if (error) {
    console.log("Connection error");
    throw error;
  }
  //console.log('The solution is: ', results);
  data = results;
  
});

connection.query('SELECT * from posts', function (error, results, fields) {
  if (error) {
    console.log("Connection error");
    throw error;
  }
  //console.log('The solution is: ', results);
  posts = results;
  
});

//connection.end();



// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));



app.post("/search", (request, response) => {
  console.log(request.body.search_text);
  connection.query('SELECT * from posts WHERE post_tags LIKE \"'+request.body.search_text+'\"', function (error, results, fields) {
    if (error) {
      console.log("Connection error");
      throw error;
    }
    console.log('The solution is: ' +results);
    search_posts = results;
    response.render('index', { title: 'User List', userData: data,
                               title: 'User List', userPosts: search_posts
    });
  });
  
});

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  
  
  response.render('index', { title: 'User List', userData: data,
                             title: 'User List', userPosts: posts
                           });
  //response.sendFile(__dirname + "/views/index.html");
});



// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
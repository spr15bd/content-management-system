// server.js
// where your node app starts

let data, posts, search_posts;
let message="";
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

app.post("/add_category", (request, response) => {
  console.log(request.body.category);
  if (request.body.category=="") {
    message = "Please enter a category";
  } else {
    message="Added new category";
    connection.query('INSERT INTO categories (cat_title) values (\"'+request.body.category+'\")', function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      console.log("Data is "+results);
      //data=results;
    });
  }  
  console.log('message is '+message);
  response.redirect('/admin/categories');
});

app.get("/delete_category", async (request, response) => {
  //let results1;
  async function delQuery() {
    fetchQuery(request, response);
  }
  await delQuery().then(()=>{rerun(request, response)});
  
  
  //response.redirect('/admin/categories');
});



app.get("/admin", (request, response) => {
  
  
  response.render('admin/index', { title: 'User List', userData: data,
                             title: 'User List', userPosts: posts
                           });
  //response.sendFile(__dirname + "/views/index.html");
});

app.get("/admin/categories", (request, response) => {
  
  async function categoryQuery() {
    await new Promise((resolve) => {
      connection.query('SELECT * from categories', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }
        //console.log('The solution is: ', results);
        data = results;
      });
      resolve();
    })
  }
  
  categoryQuery().then(()=>response.render('admin/categories', { userData: data,
                             userMessage: message,
                              edit: request.query.edit
                           }));
  //response.sendFile(__dirname + "/views/index.html");
});

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  
  
  response.render('index', { userData: data,
                             userPosts: posts
                           });
  //response.sendFile(__dirname + "/views/index.html");
});


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});



var fetchQuery = function(request, response) {
  new Promise((resolve) => {
      connection.query('DELETE from categories WHERE cat_id=\"'+request.query.del+'\"', function (error, results, fields) {
    
    
        if (error) {
          console.log("Connection error");
          throw error;
          //reject(results);
        }
        
        console.log('Deleted'+request.query.del);
        message="Deleted "+request.query.del;
        console.log("Results are: "+results);
        resolve(results);
        //return results;
      
      });
      
    });
    
}

var rerun = function(req, res) {
  res.redirect('/admin/categories')
                 ;
}
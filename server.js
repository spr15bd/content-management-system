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
  
  if (request.body.category=="") {
    message = "Please enter a category";
  } else {
    message="Added new category";
    connection.query('INSERT INTO categories (cat_title) values (\"'+request.body.category+'\")', function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      //console.log("Data is "+results);
      //data=results;
    });
  }  
  //console.log('message is '+message);
  response.redirect('/admin/categories');
});

app.post("/edit_category", (request, response) => {
  //console.log("Edit "+request.body.category);
  if (request.body.category=="") {
    message = "Please enter a category";
  } else {
    message="Added new category";
    connection.query('UPDATE categories SET cat_title = (\"'+request.body.edit_category+'\" WHERE cat_title=\"+request.body.categoryName+")', function (error, results, fields) {
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


app.get("/delete_category", (request, response) => {
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
        resolve(response.redirect('/admin/categories'));
        //return results;
      
      });
      
    });
  
  
  //response.redirect('/admin/categories');
});





app.get("/admin/categories", (request, response) => {
  let categoryToEdit;
  //async function categoryQuery() {
    /*await */new Promise((resolve) => {
      connection.query('SELECT * from categories', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }
        //console.log('The solution is: ', results);
        //data = results;
        Object.keys(results).forEach((key) => {
          if (results[key].cat_id == request.query.edit) {
            categoryToEdit = results[key].cat_title;
            console.log("we are going to edit "+categoryToEdit);
          }
        });
        resolve(response.render('admin/categories', { userData: results,
                             userMessage: message+", "+"count is "+data.length,
                              categoryName: categoryToEdit
                           }));
      });
      
    })
  //}
  console.log("count is "+data.length);
  //categoryQuery();
  //response.sendFile(__dirname + "/views/index.html");
});

app.get("/admin", (request, response) => {
  
  console.log("rendering admin");
  response.render('admin/index', { title: 'User List', userData: data,
                             title: 'User List', userPosts: posts
                           });
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





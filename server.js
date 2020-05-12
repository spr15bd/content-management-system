// server.js
// where your node app starts

let data, posts, search_posts;
let message="";
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
//let formidable = require('formidable');
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

app.post("/add_post", (request, response) => {
  console.log("Post status is "+ request.body.post_status);
  console.log("in add_post");
  if (request.body.post_content=="") {
    message = "Please enter a category";
  } else {
    message="Added new post";
    console.log(message);
    /*let form = new formidable.IncomingForm();
    form.parse(request, function (err, fields, files) {
      let fileToUpload = request.body.image_name;
      
      let oldPath = files.fileToUpload.path;
      console.log('File uploaded to '+oldPath);
      //response.write('File uploaded');
      //response.end();
    });
    */
    connection.query('INSERT INTO posts (post_cat_id, post_title, post_author, post_date, post_img, post_content, post_tags, post_comment_count, post_status) values (\"'+request.body.post_cat_id+'\", \"'+request.body.post_title+'\", \"'+request.body.post_author+'\", now(), \"https://cdn.glitch.com/48fe6ce9-7345-460e-b0ab-288a73ffe14d%2FenemyBullet.png?v=1587678871997\", \"'+request.body.post_content+'\", \"'+request.body.post_tags+'\", 4, \"'+request.body.post_status+'\")', function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      
    });
  }  
  //response.redirect('/admin/posts?');
  response.render('admin/posts', {  userMessage: message,
                                                  option: 'add_post'
        });
});

app.post("/edit_category", (request, response) => {
  if (request.body.category=="") {
    message = "Please enter a category";
  } else {
    message="<p class=\"alert alert-success\">Updated category name</p>";
    console.log("The old category was "+request.body.old_category_name);
    console.log("The new category is "+request.body.new_category_name);
    connection.query('UPDATE categories SET cat_title = \"'+request.body.new_category_name+'\" WHERE cat_title=\"'+request.body.old_category_name+'\"', function (error, results, fields) {
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
  
  
 
});

app.get("/delete_post", (request, response) => {
  new Promise((resolve) => {
      connection.query('DELETE from posts WHERE post_id=\"'+request.query.del+'\"', function (error, results, fields) {
    
    
        if (error) {
          console.log("Connection error");
          throw error;
          //reject(results);
        }
        
        console.log('Deleted'+request.query.del);
        message="Deleted "+request.query.del;
        console.log("Results are: "+results);
        resolve(response.redirect('/admin/posts'));
        //return results;
      
      });
      
    });
  
  
 
});



app.get("/admin/categories", (request, response) => {
  let categoryToEdit;
  
    new Promise((resolve) => {
      connection.query('SELECT * from categories', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }
        Object.keys(results).forEach((key) => {
          if (results[key].cat_id == request.query.edit) {
            categoryToEdit = results[key].cat_title;
            
          }
        });
        resolve(response.render('admin/categories', { userData: results,
                             userMessage: message,
                              categoryName: categoryToEdit
                           }));
      });
      
    })
  
  
});

app.get("/admin", (request, response) => {
  
  console.log("rendering admin");
  response.render('admin/index', { title: 'User List', userData: data,
                             title: 'User List', userPosts: posts
                           });
  //response.sendFile(__dirname + "/views/index.html");
});

app.get("/admin/posts", (request, response) => {
  let postToEditId;
  console.log("rendering posts");
  new Promise((resolve) => {
      connection.query('SELECT * from posts', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }
        Object.keys(results).forEach((key) => {
          if (results[key].post_id == request.query.edit) {
            postToEditId = results[key].postId;
            
          }
        });
        resolve(response.render('admin/posts', {  userData: results,
                                                  userMessage: message,
                                                  postToEditId: postToEditId,
                                                  option: request.query.option
        }));
      });
      
    });
  
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





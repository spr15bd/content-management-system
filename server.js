// server.js
// where your node app starts

let data, posts, search_posts, sess;
let message="";
const express = require("express");
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'ssshhhhh'}));
//let formidable = require('formidable');
app.use(express.json());       // to support JSON-encoded bodies
app.set("view engine","ejs");

let connection = require("./connection.js");

//connection.connect();
/*
connection.query('SELECT * from categories', function (error, results, fields) {
  if (error) {
    console.log("Connection error");
    throw error;
  }
  data = results;
  
});
*/
connection.query('SELECT * from posts WHERE post_status="published"', function (error, results, fields) {
  if (error) {
    console.log("Connection error");
    throw error;
  }
  posts = results;
  
});

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));


app.get("/category", (request, response) => {
  sess=request.session;
  connection.query('SELECT * from posts WHERE post_cat_id=\"'+request.query.category+'\"', function (error, results, fields) {
    if (error) {
      console.log("Connection error");
      throw error;
    }
    console.log('The solution is: ' +results);
    search_posts = results;
    response.render('index', { 
                                title: 'User List', userData: data,
                                title: 'User List', userPosts: search_posts,
                                sess:sess
    });
  });
});

app.get("/post", (request, response) => {
  sess=request.session;
  let comments;
  connection.query('SELECT * from categories', function (error, results, fields) {
    if (error) {
      console.log("Connection error");
      throw error;
    }
    
    data = results;
    
  });
  
  connection.query('SELECT * from comments WHERE comment_post_id=\"'+request.query.id+'\" AND comment_status=\"Approved\" ORDER BY comment_id DESC', function (error, results, fields) {
    if (error) {
      console.log("Connection error");
      throw error;
    }
    
    comments = results;
    
  });
  
  connection.query('SELECT * from posts WHERE post_id = \"'+request.query.id+'\"', function (error, results, fields) {
    if (error) {
      console.log("Connection error");
      throw error;
    }
    
    response.render('post', {  userData: data,
                               userPosts: results,
                               userComments: comments,
                               id: request.query.id,
                               sess: sess
    });
  });
});

app.get("/users", (request, response) => {
  let users;
  if (request.query.option=="all_users") {
    connection.query('SELECT * from users', function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      
      users = results;
      response.render('admin/users', {  userData: users,
                                        option: request.query.option,
                                        sess:sess
      });
    });
  } else {
    response.render('admin/users', {  option: request.query.option,
                                      sess:sess
    });
  }
});

app.get("/update_user", (request, response) => {
  if (request.query.role!=null) {
    connection.query('UPDATE users SET user_role=\"'+request.query.role+'\" WHERE user_id='+request.query.id, function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      response.redirect("/users?option=all_users");
    });
  } else {
    connection.query('SELECT * FROM users WHERE user_id='+request.query.id, (error, results, fields)=>{
      if (error) {
        console.log("Connection error");
        throw error;
      }
      console.log("Data "+results);
      response.render('admin/users', {  option: 'edit_user',
                                        userData: results,
                                        sess: sess
      });
    });
  }
  
});
app.post("/add_user", (request, response) => {
  //let users;
  connection.query('INSERT INTO users (user_name, user_password, first_name, last_name, user_email, user_role) VALUES (\"'+request.body.user_name+'\", \"'+request.body.user_password+'\", \"'+request.body.first_name+'\", \"'+request.body.last_name+'\", \"'+request.body.user_email+'\", \"'+request.body.user_role+'\")', function (error, results, fields) {
    if (error) {
      console.log("Connection error");
      throw error;
    }
    console.log('The solution is: ' +results);
    //users = results;
    response.redirect("/users?option=all_users");
    
  });
});
app.post("/login", (request, response) => {
  
  
  console.log("Username is "+request.body.username);
  connection.query('SELECT * FROM users WHERE user_name=\"'+request.body.username+'\"', function (error, results, fields) {
    if (error) {
      console.log("Connection error");
      throw error;
    }
    console.log(results[0].user_name);
    if (request.body.username==results[0].user_name && request.body.password==results[0].user_password) {
      sess=request.session;
      sess.db_user_role=results[0].user_role;
      sess.db_user_name=results[0].user_name;
      response.redirect("/admin");
    } else {
      response.redirect("/");
    }
    //users = results;
    //response.redirect("/users?option=all_users");
    
  });
});
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

app.post("/add_comment", (request, response) => {
  //console.log("Post status is "+ request.body.post_status);
  console.log("in add_comment");
  if (request.body.author=="") {
    message = "Please enter an author";
  } else {
    message="Added new comment";
    connection.query('INSERT INTO comments (comment_post_id, comment_author, comment_email, comment_content, comment_status, comment_date) values (\"'+request.body.post_id+'\", \"'+request.body.author+'\", \"'+request.body.email+'\", \"'+request.body.comment+'\", \"approved\", now())', function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      message="Your comment has been submitted";
    });
    connection.query('UPDATE posts SET post_comment_count=post_comment_count+1 WHERE post_id='+request.body.post_id, function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      message="Your comment has been submitted";
    });
  }  
  //response.redirect('/admin/posts?');
  response.redirect('/post?post_id='+request.body.post_id);
});

app.post("/add_post", (request, response) => {
  console.log("Post status is "+ request.body.post_status);
  console.log("in add_post");
  if (request.body.post_content=="") {
    message = "Please enter a post";
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
    connection.query('INSERT INTO posts (post_cat_id, post_title, post_author, post_date, post_img, post_content, post_tags, post_status) values (\"'+request.body.post_cat_id+'\", \"'+request.body.post_title+'\", \"'+request.body.post_author+'\", now(), \"https://cdn.glitch.com/48fe6ce9-7345-460e-b0ab-288a73ffe14d%2FenemyBullet.png?v=1587678871997\", \"'+request.body.post_tags+'\", 4, \"'+request.body.post_status+'\")', function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      
    });
  }  
  response.render('admin/posts', {  userMessage: message,
                                    option: 'add_post',
                                    categories: request.body.categories,
                                    sess: sess
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

app.post("/edit_post", (request, response) => {
  console.log("Post status is "+ request.body.post_status);
  console.log("in add_post");
  if (request.body.post_content=="") {
    message = "Please enter a post";
  } else {
    message="Amending post";
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
    connection.query('UPDATE posts SET post_title=\"'+request.body.post_title+'\", post_cat_id=\"'+request.body.cat_name+'\", post_author=\"'+request.body.post_author+'\", post_date=now(), post_img=\"https://cdn.glitch.com/48fe6ce9-7345-460e-b0ab-288a73ffe14d%2FenemyBullet.png?v=1587678871997\", post_content=\"'+request.body.post_content+'\", post_tags=\"'+request.body.post_tags+'\", post_comment_count=2, post_status=\"'+request.body.post_status+'\" WHERE post_id=\"'+request.body.post+'\"', function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      
    });
    response.redirect('/admin/posts');
  }
}); 

app.post("/edit_user", (request, response) => {
  //console.log("Post status is "+ request.body.post_status);
  console.log("in edit user");
  if (request.body.user_name=="") {
    message = "Please enter a username";
  } else {
    message="Amending user";
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
    if (request.query.from=="edit_user"){
      connection.query('UPDATE users SET first_name=\"'+request.body.first_name+'\", last_name=\"'+request.body.last_name+'\", user_name=\"'+request.body.user_name+'\", user_password=\"'+request.body.user_password+'\", user_email=\"'+request.body.user_email+'\", user_role=\"'+request.body.user_role+'\" WHERE user_id=\"'+request.body.user_id+'\"', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }

      });
    } else {
      connection.query('UPDATE users SET first_name=\"'+request.body.first_name+'\", last_name=\"'+request.body.last_name+'\", user_name=\"'+request.body.user_name+'\", user_password=\"'+request.body.user_password+'\", user_email=\"'+request.body.user_email+'\", user_role=\"'+request.body.user_role+'\" WHERE user_name=\"'+request.body.user_name+'\"', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }

      });
    }
    
    response.redirect('users?option=all_users');
  }
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


app.get("/delete_comment", (request, response) => {
  new Promise((resolve) => {
      connection.query('DELETE from comments WHERE comment_id=\"'+request.query.del+'\"', function (error, results, fields) {
    
    
        if (error) {
          console.log("Connection error");
          throw error;
          //reject(results);
        }
        
        console.log('Deleted'+request.query.del);
        message="Deleted "+request.query.del;
        console.log("Results are: "+results);
        resolve(response.redirect('/admin/comments'));
        //return results;
      
      });
      
    });
});
app.get("/delete_user", (request, response) => {
  new Promise((resolve) => {
      connection.query('DELETE from users WHERE user_id=\"'+request.query.del+'\"', function (error, results, fields) {
    
    
        if (error) {
          console.log("Connection error");
          throw error;
          //reject(results);
        }
        
        console.log('Deleted'+request.query.del);
        message="Deleted "+request.query.del;
        console.log("Results are: "+results);
        resolve(response.redirect('/users?option=all_users'));
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
        resolve(response.render('admin/categories', {  userData: results,
                                                       userMessage: message,
                                                       categoryName: categoryToEdit,
                                                       sess: sess
        }));
      });
      
    })
  
  
});

app.get("/admin/comments", (request, response) => {
  let posts;
  new Promise((resolve) => {
      connection.query('SELECT * from posts', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }
        
        resolve(posts=results);
      });
      
  })
  
  new Promise((resolve) => {
    connection.query('SELECT * from comments', function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      resolve(response.render('admin/comments', {  userData: results,
                                                      userMessage: message,
                                                      userPosts: posts|| "no posts",
                                                      option: 'all_comments',
                                                      sess: sess                     
      }));
    });
      
  })
  
  
});

app.get("/admin/approve_comments", (request, response) => {
  //let posts;
  new Promise((resolve) => {
    
    console.log("status is "+request.query.status);
      connection.query('UPDATE comments SET comment_status=\"'+request.query.status+'\" WHERE comment_id=\"'+request.query.comment_id+'\"', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }
        
        resolve(response.redirect('/admin/comments'));
      });
      
  })
});

app.get("/admin", (request, response) => {
  let posts, comments, users, categories;
  if (sess==null||sess.db_user_name==null) {
    response.redirect("/");
    
  //response.sendFile(__dirname + "/views/index.html");
  } else if (sess.db_user_name.length>0) {
    
    connection.query('SELECT * from posts', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }
        
        posts=results;
        
      });
    
    
    connection.query('SELECT * from comments', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }
        
        comments=results;
        
      });
  
    
    connection.query('SELECT * from users', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }
        
        users=results;
        
      });
    
    
    connection.query('SELECT * from categories', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }
        
        categories=results;
        response.render('admin/index', {  title: 'User List', posts: posts,
                                      title: 'User List', comments: comments,
                                      title: 'User List', users: users,
                                      title: 'User List', categories: categories,
                                      title: 'User List', sess: sess
    });
      });
    
    
    
    
  }
  
});

app.get("/category", (request, response) => {
  
  console.log("rendering category");
  response.render('category', { title: 'User List', userData: data,
                             title: 'User List', userPosts: posts
                           });
  //response.sendFile(__dirname + "/views/index.html");
});

app.get("/admin/posts", (request, response) => {
  let postToEdit;
  let categories;
  
  // send categories data to edit post page since there is an option to change category with a dropdown
  //new Promise((resolve) => {
      connection.query('SELECT * from categories', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }
        
        categories=results;
      });
      
    //});
  new Promise((resolve) => {
      connection.query('SELECT * from posts', function (error, results, fields) {
        if (error) {
          console.log("Connection error");
          throw error;
        }
        Object.keys(results).forEach((key) => {
          if (results[key].post_id == request.query.edit) {
            postToEdit = results[key];
            
          }
        });
        resolve(response.render('admin/posts', {  userData: results,
                                                  categories: categories,
                                                  userMessage: message,
                                                  postToEdit: postToEdit,
                                                  option: request.query.option,
                                                  sess: sess
        }));
      });
      
    });
  
});

app.get("/logout", (request, response) => {
  request.session.db_user_name=null;
  request.session.db_user_role=null;
  sess=request.session;
  response.render('index', {  title: 'User List', userData: data,
                              title: 'User List', userPosts: posts,
                              sess:sess
                           });
  //response.sendFile(__dirname + "/views/index.html");
});

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  sess=request.session;
  new Promise((resolve) => {
    connection.query('SELECT * from categories', function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      data = results;
  
});
    connection.query('SELECT * from posts WHERE post_status="published"', function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      //console.log('The solution is: ', results);
      response.render('index', { 
                                  userData: data,
                                  userPosts: results,
                                  sess:sess
      });
    });
  });
});
  

  
app.get("/profile", (request, response) => {
  if (sess.db_user_name.length>0) {
    connection.query('SELECT * from users WHERE user_name="'+sess.db_user_name+'"', function (error, results, fields) {
      if (error) {
        console.log("Connection error");
        throw error;
      }
      response.render('admin/profile', { title: 'User List', userData: results,
                                         title: 'User List', sess: sess
      });
    });//end connection
  
  //response.sendFile(__dirname + "/views/index.html");
  }//end if
  
}); //end app.get


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

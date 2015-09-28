var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    morgan = require('morgan'),
    methodOverride = require("method-override"),
    session = require("cookie-session"),
    db = require("./models"),
    loginMiddleware = require("./middleware/loginHelper"),
    routeMiddleware = require("./middleware/routeHelper");

app.set("view engine", "ejs");
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({extended: true}));   
app.use(methodOverride("_method"));
app.use(express.static(__dirname + '/public'));
app.use(loginMiddleware);
app.use(session({
    maxAge: 3600000,
    secret: 'secretword',
    name: "chocochips"  // name of the cookie
}));

//------------------- HOME -------------------

// ROOT
app.get("/", function(req,res){
    res.redirect("/events");
});

// LOGIN FORM
app.get("/login",function(req,res){
    res.render("login");
});

// AUTHENTICATE LOGIN
app.post("/login", function (req, res) {
    db.User.authenticate(req.body, function (err, user) {
        if (!err && user !== null) {
            req.login(user);
            res.redirect("/");
        } 
        else {
            console.log(err);
            res.render("login");
        }
    });
});

// LOGOUT
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

//------------------- USERS -------------------

// INDEX 
/*app.get("/users", function(req,res){     // Just for test and "admin" - REMOVE ON PRODUCTION -
    NOT FOR NOW
});*/

// NEW
app.get("/users/new", function(req,res){
    res.render("users/new");
});

// SHOW
/*app.get("/users/:id", function(req,res){    // Just for test and "admin" - REMOVE ON PRODUCTION -
    NOT FOR NOW
});*/

// EDIT
/*app.get("/users/:id/edit", function(req,res){
    NOT FOR NOW
});*/

// CREATE
app.post("/users", function(req,res){
    db.User.create(req.body, function(err, user){ 
        if(err) {
            console.log(err);
            res.render("users/new");
        }
        else {
            console.log(user);
            res.redirect("/");
        }
    });
});

// UPDATE
/*app.put("/users/:id", function(req,res){
    NOT FOR NOW
});*/

// DESTROY
/*app.delete("/users/:id", function(req,res){
    NOT FOR NOW
});*/

//------------------- EVENTS -------------------

// INDEX
app.get("/events", function(req,res){
    db.Event.find({}).populate("owner", "username").exec(function(err, events) {
        console.log(events);
        if (err) {
            console.log(err);
        } 
        else {
            console.log("USEEEEER:"+req.session.id);
            if(req.session.id === null || req.session.id === undefined){
                res.render("events/index", {events: events, currentuser: ""});
            }
            else {
                db.User.findById(req.session.id, function(err,user){
                    res.render("events/index", {events: events, currentuser: user.username});
                });
            }
        }
    });
});

// NEW
app.get("/events/new", routeMiddleware.ensureLoggedIn, function(req,res){
    res.render("events/new", {user_id:req.session.id});
});

// SHOW
app.get("/events/:id", function(req,res){   //Try to refactor later
    db.Event.findById(req.params.id,function (err, eventr) {
        db.Comment.find({ _id: { $in: eventr.comments }}).populate("user").exec(function(err, comments){
            db.Event.findById(req.params.id).populate("owner advices").exec(function(err,eventr){
                console.log(eventr.user);
                res.render("events/show", {eventr: eventr, comments:comments});
            });
        });
    });
});

// EDIT
app.get("/events/:id/edit", routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserForPost, function(req,res){
    db.Event.findById(req.params.id).populate("owner").exec(function(err,eventr){
        if (err) {
          console.log(err);
        }
        res.render("events/edit", {eventr:eventr});
    });
});

// CREATE
app.post("/users/:user_id/events", function(req,res){
    db.Event.create(req.body, function(err, eventr){
        console.log(eventr);
        if(err) {
            console.log(err);
            res.render("events/new");
        }
        else {
            db.User.findById(req.params.user_id,function(err,user){
                user.events.push(eventr);
                eventr.owner = user._id;
                eventr.save();
                user.save();
                res.redirect("/events");
            });
        }
    });
});

// UPDATE
app.put("/events/:id", routeMiddleware.ensureCorrectUserForPost, function(req,res){
    db.Event.findByIdAndUpdate(req.params.id, req.body, function (err, post) { 
        if(err) {  
            console.log(err);
            res.redirect("/events");
        }
        else {
            res.redirect("/events/"+req.params.id);
        }
    });
});

// DESTROY
          
app.delete("/events/:id", routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUserForPost, function(req,res){
    db.Event.findByIdAndRemove(req.params.id, function (err, post) { 
        if(err) {
            console.log(err);
            res.redirect("/events");
        }
        else {
            res.redirect("/events");
        }
    });
});

//------------------- COMMENTS -------------------

// INDEX
/*app.get("/users/:user_id/events/:event_id/comments", function(req,res){
    // Not for now
});*/

// NEW 
app.get("/events/:event_id/comments/new",routeMiddleware.ensureLoggedIn, function(req,res){
    db.Event.findById(req.params.event_id,function (err, eventr){
        res.render("comments/new", {user_id:req.session.id, eventr:eventr});
    });  
});

// SHOW
app.get("/users/:user_id/events/:event_id/comments/:id", function(req,res){
    db.Comment.findById(req.params.id).populate("eventr").populate("user").exec(function(err,comment){
        res.render("comments/show", {user_id:req.params.user_id, event_id:req.params.event_id, comment:comment});
    });
});

// EDIT
app.get("/comments/:id/edit", routeMiddleware.ensureCorrectUserForComment, function(req,res){
    db.Comment.findById(req.params.id).populate("eventr").exec(function(err,comment){
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else{
            res.render("comments/edit", {comment:comment});
        }
    });
});

// CREATE 
app.post("/events/:event_id/comments",routeMiddleware.ensureLoggedIn, function(req,res){
    db.Comment.create(req.body, function(err, comment){
        if(err) {
            console.log(err);
            res.redirect("/events");
        }
        else {
            db.Event.findById(req.params.event_id,function(err,eventr){
                eventr.comments.push(comment);
                comment.eventr = eventr._id;
                comment.save();
                eventr.save();
                db.User.findById(req.session.id,function(err,user){
                    user.comments.push(comment);
                    comment.user = user._id;
                    comment.save();
                    user.save();
                    res.redirect("/events/"+req.params.event_id);
                });
            });
        }
    });
});

// UPDATE
app.put("/comments/:id", routeMiddleware.ensureCorrectUserForComment, function(req,res){
    db.Comment.findByIdAndUpdate(req.params.id, req.body, function (err, comment) { 
        if(err) {  
            console.log(err);
            res.redirect("/");
        }
        else {
            res.redirect("/events/"+comment.eventr);
        }
    });
});

// DESTROY
app.delete("/comments/:id", routeMiddleware.ensureCorrectUserForComment, function(req,res){
    db.Comment.findByIdAndRemove(req.params.id, function (err, comment) { 
        if(err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            res.redirect("/events/"+ comment.eventr);
        }
    });
});

// ------------------- DEFAULT CODE -------------------

// CATCH ALL
app.get("*", function(req,res){
  res.send("404");
});

// START SERVER
app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});
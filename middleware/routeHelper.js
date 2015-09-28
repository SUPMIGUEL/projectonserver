var db = require("../models");

var routeHelpers = {
    ensureLoggedIn: function(req, res, next) {
        if (req.session.id !== null && req.session.id !== undefined) {
            return next();
        }
        else { 
          res.redirect('/login');
        }
    },

    ensureCorrectUserForPost: function(req, res, next) {
        db.Event.findById(req.params.id).populate("owner").exec(function(err,eventr){
            if (eventr.owner.id !== req.session.id) {
                res.redirect('/events');
            }
            else {
                return next();
            }
        });
    },

    ensureCorrectUserForComment: function(req, res, next) {
        db.Comment.findById(req.params.id).populate("user").exec(function(err,comment){
            if (comment.user !== undefined && comment.user.id != req.session.id) {
                console.log("Teeeeeeeest");
                res.redirect("users/"+comment.user.id+"/events/"+comment.user.id+"/"+comment.id);
                // res.redirect("/events/"+ comment.post +"/comments"); 
            }
            else {
                return next();
            }
        });
    },

    preventLoginSignup: function(req, res, next) {
        if (req.session.id !== null && req.session.id !== undefined) {
            res.redirect('/index');
        }
        else {
            return next();
        }
    }
};

module.exports = routeHelpers;
var Event = require("./event"), 
    Comment = require("./comment"),
    mongoose = require("mongoose"),
    bcrypt = require("bcrypt"),
    SALT_WORK_FACTOR = 10;

var userSchema = new mongoose.Schema({
                username: String,
                mail: String,
                password: String,
                avatar: String,
                twitter: String,
                events: [{ 
                          type: mongoose.Schema.Types.ObjectId,
                          ref: "Event"
                        }],
/*                myevents:[{
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Event"
                        }],*/
                comments: [{
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Comment"
                        }]
                });

userSchema.pre("remove", function(callback) {
    Event.remove( { owner: this._id } ).exec();
    // Event.remove( { assistants: this._id }).exec(); only remove reference
    Comment.remove( { user: this._id }).exec();
    callback();
});

userSchema.pre("save", function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')){
        return next();
    }

    // generate a salt (Some trash)
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err){
            return next(err);
        }

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) {
                return next(err);
            }
            // override the plane text password with the hashed password
            user.password = hash;
            next();
        });
    });
});

userSchema.statics.authenticate = function (formData, callback) {
    // this refers to the model!
    this.findOne({ mail: formData.mail }, function (err, user) {
        if (user === null){
          callback("Invalid mail",null);
        }
        else {
          user.checkPassword(formData.password, callback);
        }
    });
};

userSchema.methods.checkPassword = function(password, callback) {
    var user = this;
    bcrypt.compare(password, user.password, function (err, isMatch) {
        if (isMatch) {
            callback(null, user);
        } else {
            callback("Invalid password", null);
        }
    });
};

var User = mongoose.model("User", userSchema);
module.exports = User;
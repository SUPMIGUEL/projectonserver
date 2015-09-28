var mongoose = require("mongoose");
var Comment = require("./comment");
var User = require("./user");

var eventSchema = new mongoose.Schema({
                    name: String,
                    address: String,
                    lat: Number,
                    lng: Number,
                    type: String,
                    web: String,
                    info: String,
                    contact: String,
                    logo: String, //picture
                    banner: String, //picture 
                    homepicture: String, //picture
                    advices:[{
                              type: mongoose.Schema.Types.ObjectId,
                              ref: "Advice"
                            }],
/*                    assistants:[{
                              type: mongoose.Schema.Types.ObjectId,
                              ref: "User"
                            }],*/
                    comments: [{
                              type: mongoose.Schema.Types.ObjectId,
                              ref: "Comment"
                            }],
                    owner: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "User"
                          }
                });

eventSchema.pre("remove", function(callback) {
    Comment.remove( { eventr: this._id } ).exec();
    Advice.remove( { eventr: this._id } ).exec();
    callback();
});

var Event = mongoose.model("Event", eventSchema);
module.exports = Event;

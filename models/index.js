var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/events_app");

mongoose.set("debug",true); //////// FOR TEST

module.exports.Advice = require("./advice");
module.exports.Comment = require("./comment");
module.exports.Event = require("./event");
module.exports.User = require("./user");
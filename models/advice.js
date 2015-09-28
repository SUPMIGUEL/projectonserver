var mongoose = require("mongoose");

var adviceSchema = new mongoose.Schema({
                    text: String,
                    picture: String,
                    eventr: {
                          type: mongoose.Schema.Types.ObjectId,
                          ref: "Event"
                          }
                });

var Advice = mongoose.model("Advice", adviceSchema);
module.exports = Advice;
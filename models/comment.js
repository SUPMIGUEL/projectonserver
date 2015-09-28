var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
                    content: String,
                    photo: String,
                    user: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "User"
                          },
                    eventr: {
                          type: mongoose.Schema.Types.ObjectId,
                          ref: "Event"
                          },
                });

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
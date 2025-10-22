const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // for replies
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);

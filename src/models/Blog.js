// src/models/Blog.js
const mongoose = require('mongoose');


const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a blog title'],
    },
    content: {
      type: String,
      required: [true, 'Please provide blog content'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [String],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);


// Git - 1hr ( 3-4hrs ) (1-2 hrs implementation) Tuesday 
// Mongodb - (2 days) wed-Thu
// Graphql, Apollo Server - Friday


// Mercury - thursfrday  
// Build app using mercury - 
// Platform

// actual project
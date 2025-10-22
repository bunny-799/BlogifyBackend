// src/routes/blogRoutes.js

const express = require('express');
const {
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
  togglePublish,
  getPublishedBlogs,
  searchBlogs,
  getPublishedBlogById,
} = require('../controllers/blogController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const commentRoutes = require('./commentRoutes');
const router = express.Router();

//comment routes
router.use('/:blogId/comments', commentRoutes);


//public Routes
router.get('/published', getPublishedBlogs);
router.get('/search', searchBlogs);
router.get('/published/:id', getPublishedBlogById);



// 🟠 Protected routes
router.post('/', verifyToken, authorizeRoles('author', 'admin'), createBlog);
router.put('/:id', verifyToken, authorizeRoles('author', 'admin'), updateBlog);
router.delete('/:id', verifyToken, authorizeRoles('author','admin'), deleteBlog);
//router.get('/:id',authorizeRoles('author', 'admin'), getBlogById);
router.put('/:id/publish', verifyToken, authorizeRoles('author', 'admin'), togglePublish);



module.exports = router;

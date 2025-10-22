const express = require('express');
const { createComment, getComments, deleteComment } = require('../controllers/commentController');
const { verifyToken } = require('../middleware/authMiddleware');

// IMPORTANT: { mergeParams: true } is required to get 'blogId' from the parent router
const router = express.Router({ mergeParams: true }); 

// Create comment (any logged-in user) - REQUIRES AUTHENTICATION
router.post('/', verifyToken, createComment);

// Get all comments for a blog (public) - REMOVED verifyToken here
// If you want this route to be public, remove the token middleware.
router.get('/', getComments); 

// Delete comment (admin or comment author) - REQUIRES AUTHENTICATION
router.delete('/:id', verifyToken, deleteComment);

module.exports = router;

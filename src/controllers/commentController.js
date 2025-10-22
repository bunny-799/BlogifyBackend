const Comment = require('../models/Comment');
const { sendEmail } = require('../utils/sendEmail');  // 📩 import mail utility

// 📝 Create a new comment
exports.createComment = async (req, res) => {
  const { blogId } = req.params;
  const { content, parent } = req.body;

  try {
    // 1. Create comment in DB
    const comment = await Comment.create({
      content,
      author: req.user._id, // from verifyToken
      blog: blogId,
      parent: parent || null,
    });

    // 2. 📩 Send email notification to admin
    await sendEmail(
      'bunnycharycsm19@example.com',  // 👉 Replace with process.env.ADMIN_EMAIL if needed
      'New Comment Notification',
      `<p>User <strong>${req.user.name}</strong> commented on blog ID <strong>${blogId}</strong>:</p>
       <blockquote>${content}</blockquote>`
    );

    // 3. Send response
    res.status(201).json(comment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🧾 Get all comments for a blog
exports.getComments = async (req, res) => {
  const { blogId } = req.params;

  try {
    const comments = await Comment.find({ blog: blogId })
      .populate("author", "name role") // ✅ corrected to match your User model field (not 'username')
      .populate("parent")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔁 Recursive helper to delete a comment and all its replies
async function deleteCommentAndReplies(commentId) {
  const childComments = await Comment.find({ parent: commentId });

  for (const child of childComments) {
    await deleteCommentAndReplies(child._id);
  }

  await Comment.findByIdAndDelete(commentId);
}

// 🗑️ Delete a comment (admin or comment author)
exports.deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only admin or comment author can delete
    if (req.user.role !== "admin" && !comment.author.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await deleteCommentAndReplies(comment._id);

    res.json({ message: "Comment and all replies deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

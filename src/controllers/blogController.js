// src/controllers/blogController.js

const Blog = require('../models/Blog');

// 🟢 Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, tags, isPublished } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Create blog
    const blog = await Blog.create({
      title,
      content,
      tags,
      isPublished,
      author: req.user.id, // comes from token
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully ✍️',
      blog,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🟠 Get single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔵 Update blog (Author or Admin only)
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Check permission
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this blog' });
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Blog updated successfully', updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔴 Delete blog (Admin only)
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await blog.deleteOne();
    res.status(200).json({ success: true, message: 'Blog deleted successfully 🗑️' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Toggle publish status (author or admin)
// @route   PUT /api/blogs/:id/publish
exports.togglePublish = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Only author of this blog or admin can change publish status
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to change publish status' });
    }

    blog.isPublished = !blog.isPublished; // Toggle true/false
    await blog.save();

    res.status(200).json({
      success: true,
      message: `Blog ${blog.isPublished ? 'published' : 'unpublished'} successfully ✅`,
      blog,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all published blogs (Public)
// @route   GET /api/blogs/published
exports.getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 🧠 Search and filter published blogs
exports.searchBlogs = async (req, res) => {
  try {
    const { keyword, tag, author } = req.query;

    // Build dynamic filter
    const filter = { isPublished: true };

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    if (author) {
      filter.author = author;
    }

    const blogs = await Blog.find(filter)
      .populate('author', 'name role email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 📘 Get one published blog by ID (public)
exports.getPublishedBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      _id: req.params.id, 
      isPublished: true 
    }).populate('author', 'name email role');

    if (!blog) {
      return res.status(404).json({ message: 'Published blog not found' });
    }

    res.status(200).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

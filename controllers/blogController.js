import { validationResult } from 'express-validator';
import BlogPost from '../models/BlogPostModel.js';

// Get all blog posts with filtering and pagination
export const getAllBlogPosts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { published: true };
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.featured === 'true') {
      query.featured = true;
    }
    
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Execute query
    const posts = await BlogPost.find(query)
      .select('-content') // Exclude full content for list view
      .sort({ createdAt: -1, featured: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single blog post by slug
export const getBlogPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ 
      slug: req.params.slug, 
      published: true 
    });

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get blog categories with post counts
export const getBlogCategories = async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categoryList = [
      { id: 'all', label: 'All Posts', count: await BlogPost.countDocuments({ published: true }) },
      ...categories.map(cat => ({
        id: cat._id,
        label: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
        count: cat.count
      }))
    ];

    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new blog post (admin/author only)
export const createBlogPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user has permission to create posts
    if (req.user.role !== 'admin' && req.user.role !== 'author') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const blogPost = new BlogPost(req.body);
    await blogPost.save();

    res.status(201).json(blogPost);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A post with this title already exists' });
    }
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update blog post (admin/author only)
export const updateBlogPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user has permission to update posts
    if (req.user.role !== 'admin' && req.user.role !== 'author') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete blog post (admin only)
export const deleteBlogPost = async (req, res) => {
  try {
    // Check if user has permission to delete posts
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const post = await BlogPost.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like a blog post
export const likeBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    post.likes += 1;
    await post.save();

    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Error liking blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add comment to blog post
export const addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const comment = {
      author: req.body.author,
      email: req.body.email,
      content: req.body.content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({ message: 'Comment added successfully (pending approval)' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

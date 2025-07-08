import { Router } from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogCategories,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  likeBlogPost,
  addComment
} from '../controllers/blogController.js';

const blogRouter = Router();

blogRouter.get('/posts', getAllBlogPosts);
blogRouter.get('/categories/list', getBlogCategories);
blogRouter.post('/create-blog-post', verifyToken, createBlogPost);
blogRouter.get('/posts/:slug', getBlogPostBySlug);
blogRouter.put('/update-post/:id', verifyToken, updateBlogPost);
blogRouter.delete('/delete-post/:id', verifyToken, deleteBlogPost);
blogRouter.post('/posts/:id/like', likeBlogPost);
blogRouter.post('/posts/:id/comments', addComment);

export default blogRouter;

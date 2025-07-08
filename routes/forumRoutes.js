import { Router } from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import {
  getDiscussions,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  createReply,
  updateReply,
  deleteReply,
  voteDiscussion,
  voteReply,
  getCategories,
  getReplies
} from '../controllers/forumController.js';

const forumRouter = Router();

// Public routes (no authentication required)
forumRouter.get('/get-discussions', getDiscussions);
forumRouter.get('/get-categories', getCategories);
forumRouter.get('/get-replies/:id/replies', getReplies);

// Protected routes (authentication required)
forumRouter.post('/create-discussion', verifyToken, createDiscussion);
forumRouter.put('/update-discussion/:id', verifyToken, updateDiscussion);
forumRouter.delete('/delete-discussion/:id', verifyToken, deleteDiscussion);

// Reply routes (authentication required)
forumRouter.post('/create-reply/:id/replies', verifyToken, createReply);
forumRouter.put('/update-reply/:discussionId/replies/:replyId', verifyToken, updateReply);
forumRouter.delete('/delete-reply/:discussionId/replies/:replyId', verifyToken, deleteReply);

// Voting routes (authentication required)
forumRouter.post('/vote-discussion/:id/vote', verifyToken, voteDiscussion);
forumRouter.post('/vote-reply/:discussionId/replies/:replyId/vote', verifyToken, voteReply);

export default forumRouter;

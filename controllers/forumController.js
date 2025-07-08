import { validationResult } from 'express-validator';
import Discussion from '../models/DiscussionModel.js';
import Reply from '../models/ReplyModel.js';
import Vote from '../models/VoteModel.js';
import ReplyVote from '../models/ReplyVoteModel.js';

// Mock data for now - in production this would use a database
let votes = [];

const categories = [
  { id: 'installation', name: 'Installation', icon: '🔧' },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: '❓' },
  { id: 'financing', name: 'Financing', icon: '💰' },
  { id: 'maintenance', name: 'Maintenance', icon: '⚙️' },
  { id: 'technology', name: 'Technology', icon: '⚡' }
];

// Get all discussions
export const getDiscussions = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, sort = 'recent' } = req.query;
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { votes: -1 };
    if (sort === 'unanswered') query.replies = 0;
    const discussions = await Discussion.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Discussion.countDocuments(query);
    res.json({
      discussions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new discussion (requires authentication)
export const createDiscussion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, content, category, tags = [] } = req.body;
    const { userId, username } = req.user;
    const newDiscussion = new Discussion({
      title,
      content,
      category,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()),
      author: username,
      authorId: userId
    });
    await newDiscussion.save();
    res.status(201).json({
      message: 'Discussion created successfully',
      discussion: newDiscussion
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update discussion (requires authentication and ownership)
export const updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Use MongoDB for discussion lookup
    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user owns the discussion
    if (discussion.authorId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, content, category, tags } = req.body;

    if (title) discussion.title = title;
    if (content) discussion.content = content;
    if (category) discussion.category = category;
    if (tags) discussion.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    discussion.updatedAt = new Date();

    await discussion.save();

    res.json({
      message: 'Discussion updated successfully',
      discussion
    });
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete discussion (requires authentication and ownership)
export const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Use MongoDB for discussion lookup
    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.authorId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await discussion.deleteOne();
    // Optionally: delete related replies, votes, bookmarks, etc.

    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create reply (requires authentication)
export const createReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentReplyId = null } = req.body;
    const { userId, username } = req.user;
    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }
    const newReply = new Reply({
      discussionId: discussion._id,
      content,
      author: username,
      authorId: userId,
      parentReplyId: parentReplyId || null
    });
    await newReply.save();
    discussion.replies += 1;
    await discussion.save();
    res.status(201).json({
      message: 'Reply created successfully',
      reply: newReply
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update reply (requires authentication and ownership)
export const updateReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const { userId } = req.user;

    const reply = replies.find(r => r.id === replyId);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    if (reply.authorId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { content } = req.body;
    reply.content = content;
    reply.updatedAt = new Date();

    res.json({
      message: 'Reply updated successfully',
      reply
    });
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete reply (requires authentication and ownership)
export const deleteReply = async (req, res) => {
  try {
    const { discussionId, replyId } = req.params;
    const { userId } = req.user;

    const replyIndex = replies.findIndex(r => r.id === replyId);

    if (replyIndex === -1) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const reply = replies[replyIndex];

    if (reply.authorId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    replies.splice(replyIndex, 1);

    // Update discussion reply count
    const discussion = discussions.find(d => d.id === discussionId);
    if (discussion) {
      discussion.replies = Math.max(0, discussion.replies - 1);
    }

    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vote on discussion (requires authentication)
export const voteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'up' or 'down'
    const { userId } = req.user;

    // Find the discussion in MongoDB
    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check for existing vote
    let vote = await Vote.findOne({ userId, discussionId: id });
    let voteChange = 0;
    if (vote) {
      if (vote.type === type) {
        // Remove vote if clicking same vote type
        await vote.deleteOne();
        voteChange = type === 'up' ? -1 : 1;
      } else {
        // Change vote type
        vote.type = type;
        await vote.save();
        voteChange = type === 'up' ? 2 : -2;
      }
    } else {
      // Add new vote
      await Vote.create({ userId, discussionId: id, type });
      voteChange = type === 'up' ? 1 : -1;
    }
    discussion.votes = (discussion.votes || 0) + voteChange;
    await discussion.save();

    res.json({
      message: 'Vote recorded successfully',
      votes: discussion.votes
    });
  } catch (error) {
    console.error('Error voting on discussion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vote on reply (requires authentication)
export const voteReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const { type } = req.body;
    const { userId } = req.user;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find the reply in MongoDB
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check for existing vote
    let vote = await ReplyVote.findOne({ userId, replyId });
    let voteChange = 0;
    if (vote) {
      if (vote.type === type) {
        // Remove vote if clicking same vote type
        await vote.deleteOne();
        voteChange = type === 'up' ? -1 : 1;
      } else {
        // Change vote type
        vote.type = type;
        await vote.save();
        voteChange = type === 'up' ? 2 : -2;
      }
    } else {
      // Add new vote
      await ReplyVote.create({ userId, replyId, type });
      voteChange = type === 'up' ? 1 : -1;
    }
    reply.votes = (reply.votes || 0) + voteChange;
    await reply.save();

    res.json({
      message: 'Vote recorded successfully',
      votes: reply.votes
    });
  } catch (error) {
    console.error('Error voting on reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get categories
export const getCategories = async (req, res) => {
  try {
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get replies for a discussion (public)
export const getReplies = async (req, res) => {
  try {
    const { id } = req.params;
    // Debug log to help track excessive requests
    console.log(`[getReplies] Called for discussionId=${id} at ${new Date().toISOString()}`);
    const replies = await Reply.find({ discussionId: id }).sort({ createdAt: 1 }).lean();
    // Group replies by parentReplyId for easy nesting
    const replyMap = {};
    replies.forEach(reply => {
      reply.children = [];
      replyMap[reply._id] = reply;
    });
    const rootReplies = [];
    replies.forEach(reply => {
      if (reply.parentReplyId) {
        if (replyMap[reply.parentReplyId]) {
          replyMap[reply.parentReplyId].children.push(reply);
        }
      } else {
        rootReplies.push(reply);
      }
    });

    // Add userVote for each reply if authenticated
    if (req.user && req.user.userId) {
      const userId = req.user.userId;
      const replyIds = replies.map(r => r._id);
      const votes = await ReplyVote.find({ userId, replyId: { $in: replyIds } });
      const voteMap = {};
      votes.forEach(v => { voteMap[v.replyId.toString()] = v.type; });
      // Recursively add userVote to each reply
      const addUserVote = (replyList) => {
        replyList.forEach(reply => {
          reply.userVote = voteMap[reply._id.toString()] || null;
          if (reply.children && reply.children.length > 0) addUserVote(reply.children);
        });
      };
      addUserVote(rootReplies);
    } else {
      // Not authenticated, set userVote to null
      const addUserVote = (replyList) => {
        replyList.forEach(reply => {
          reply.userVote = null;
          if (reply.children && reply.children.length > 0) addUserVote(reply.children);
        });
      };
      addUserVote(rootReplies);
    }

    res.json({ replies: rootReplies });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

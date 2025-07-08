import mongoose from 'mongoose';

const DiscussionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    author: { type: String, required: true },
    authorId: { type: String, required: true },
    votes: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    solved: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Discussion', DiscussionSchema);

import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
    discussionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    authorId: { type: String, required: true },
    votes: { type: Number, default: 0 },
    parentReplyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reply', default: null },
}, { timestamps: true });

export default mongoose.model('Reply', ReplySchema);

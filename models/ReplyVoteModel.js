import mongoose from 'mongoose';

const ReplyVoteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  replyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reply', required: true },
  type: { type: String, enum: ['up', 'down'], required: true },
}, { timestamps: true });

ReplyVoteSchema.index({ userId: 1, replyId: 1 }, { unique: true });

export default mongoose.model('ReplyVote', ReplyVoteSchema);

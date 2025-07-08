import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  discussionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', required: true },
  type: { type: String, enum: ['up', 'down'], required: true },
}, { timestamps: true });

VoteSchema.index({ userId: 1, discussionId: 1 }, { unique: true });

export default mongoose.model('Vote', VoteSchema);

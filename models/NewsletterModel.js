import mongoose from 'mongoose';

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['subscribed', 'unsubscribed', 'pending'],
    default: 'subscribed'
  },
  preferences: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    categories: [{
      type: String,
      enum: ['installation', 'technology', 'financing', 'maintenance', 'commercial', 'news']
    }]
  },
  source: {
    type: String,
    default: 'website'
  },
  unsubscribeToken: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate unsubscribe token before saving
NewsletterSchema.pre('save', function(next) {
  if (this.isNew) {
    import('crypto').then(crypto => {
      this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
      next();
    });
  } else {
    next();
  }
});

export default mongoose.model('Newsletter', NewsletterSchema);

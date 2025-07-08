import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String,
    website: String,
    social: {
      twitter: String,
      linkedin: String,
      github: String
    }
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    categories: [{
      type: String,
      enum: ['installation', 'technology', 'financing', 'maintenance', 'commercial', 'news']
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Don't return password in JSON
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', UserSchema);

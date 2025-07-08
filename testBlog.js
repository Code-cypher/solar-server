import mongoose from 'mongoose';
import BlogPost from './models/BlogPostModel.js';

const testBlogPost = {
  title: "How to Install Solar Panels",
  excerpt: "A step-by-step guide to installing solar panels for your home.",
  content: "Installing solar panels can be a great way to save on energy costs...",
  category: "installation",
  author: "Jane Doe",
  slug: "how-to-install-solar-panels",
  featured: true,
  published: true,
  readTime: "7 min read",
  image: "https://example.com/solar.jpg",
  imageUrl: "https://example.com/solar.jpg",
  tags: ["solar", "installation", "guide"],
  views: 123,
  likes: 45,
  comments: [
    {
      author: "John Smith",
      email: "john@example.com",
      content: "Great article! Very helpful.",
      createdAt: new Date(),
      approved: true
    },
    {
      author: "Alice Johnson",
      email: "alice@example.com",
      content: "Thanks for the tips!",
      createdAt: new Date(),
      approved: false
    }
  ],
  seo: {
    metaTitle: "How to Install Solar Panels - Complete Guide",
    metaDescription: "Learn how to install solar panels with this comprehensive guide.",
    keywords: ["solar", "installation", "energy"]
  }
};

async function insertTestBlogPost() {
  await mongoose.connect('mongodb://localhost:27017/solar-blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const blog = new BlogPost(testBlogPost);
    await blog.save();
    console.log('Test blog post inserted!');
  } catch (err) {
    console.error('Error inserting test blog post:', err);
  } finally {
    await mongoose.disconnect();
  }
}

insertTestBlogPost();
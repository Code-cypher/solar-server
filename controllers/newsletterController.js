import { validationResult } from 'express-validator';
import Newsletter from '../models/NewsletterModel.js';

// Subscribe to newsletter
export const subscribeToNewsletter = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email });
    
    if (existingSubscription) {
      if (existingSubscription.status === 'subscribed') {
        return res.status(400).json({ 
          message: 'Email is already subscribed to our newsletter' 
        });
      }
      
      // Reactivate if previously unsubscribed
      existingSubscription.status = 'subscribed';
      await existingSubscription.save();
      
      return res.json({ 
        message: 'Successfully resubscribed to newsletter!' 
      });
    }

    // Create new subscription
    const subscription = new Newsletter({
      email,
      status: 'subscribed',
      source: 'website'
    });

    await subscription.save();

    res.status(201).json({ 
      message: 'Successfully subscribed to newsletter!' 
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unsubscribe from newsletter
export const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, token } = req.body;

    if (!email && !token) {
      return res.status(400).json({ 
        message: 'Email or unsubscribe token is required' 
      });
    }

    let subscription;
    
    if (token) {
      subscription = await Newsletter.findOne({ unsubscribeToken: token });
    } else {
      subscription = await Newsletter.findOne({ email });
    }

    if (!subscription) {
      return res.status(404).json({ 
        message: 'Subscription not found' 
      });
    }

    subscription.status = 'unsubscribed';
    await subscription.save();

    res.json({ 
      message: 'Successfully unsubscribed from newsletter' 
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update newsletter preferences
export const updateNewsletterPreferences = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, preferences } = req.body;

    const subscription = await Newsletter.findOne({ email });
    
    if (!subscription) {
      return res.status(404).json({ 
        message: 'Subscription not found' 
      });
    }

    if (subscription.status !== 'subscribed') {
      return res.status(400).json({ 
        message: 'Cannot update preferences for inactive subscription' 
      });
    }

    subscription.preferences = { ...subscription.preferences, ...preferences };
    await subscription.save();

    res.json({ 
      message: 'Preferences updated successfully',
      preferences: subscription.preferences
    });
  } catch (error) {
    console.error('Newsletter preferences update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get newsletter statistics (admin only)
export const getNewsletterStats = async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments({ status: 'subscribed' });
    const unsubscribed = await Newsletter.countDocuments({ status: 'unsubscribed' });
    const pending = await Newsletter.countDocuments({ status: 'pending' });

    const categoryStats = await Newsletter.aggregate([
      { $match: { status: 'subscribed' } },
      { $unwind: '$preferences.categories' },
      { $group: { _id: '$preferences.categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const frequencyStats = await Newsletter.aggregate([
      { $match: { status: 'subscribed' } },
      { $group: { _id: '$preferences.frequency', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalSubscribers,
      unsubscribed,
      pending,
      categoryPreferences: categoryStats,
      frequencyPreferences: frequencyStats
    });
  } catch (error) {
    console.error('Newsletter stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

import { Router } from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateNewsletterPreferences,
  getNewsletterStats
} from '../controllers/newsletterController.js';

const newsletterRouter = Router();

newsletterRouter.post('/subscribe', subscribeToNewsletter);
newsletterRouter.post('/unsubscribe', unsubscribeFromNewsletter);
newsletterRouter.put('/preferences', updateNewsletterPreferences);
newsletterRouter.get('/stats', verifyToken, getNewsletterStats);

export default newsletterRouter;

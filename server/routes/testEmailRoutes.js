import express from 'express';
import { sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

// Test endpoint to send demo welcome email
router.post('/test-welcome-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ 
        message: 'Email and name are required' 
      });
    }

    const result = await sendWelcomeEmail(email, name);
    
    if (result.success) {
      res.json({
        message: 'Welcome email sent successfully!',
        messageId: result.messageId,
        previewUrl: result.previewUrl, // For Ethereal test emails
        note: 'Check server console for preview link'
      });
    } else {
      res.status(500).json({
        message: 'Failed to send email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      message: 'Failed to send test email',
      error: error.message 
    });
  }
});

export default router;

import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Handle Google Login
 * Verifies Google ID token, creates user if doesn't exist, returns JWT
 */
export const handleGoogleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not found in Google account' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    // If user doesn't exist, create new user
    if (!user) {
      // Hash a random password (not used for Google login but required by schema)
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = new User({
        email,
        name: name || email.split('@')[0],
        avatar: picture || '',
        role: 'user',
        passwordHash: hashedPassword,
        googleId: payload.sub, // Store Google ID
      });
      await user.save();
    } else {
      // Update avatar and googleId if it changed
      let needsUpdate = false;
      
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        needsUpdate = true;
      }
      
      if (!user.googleId && payload.sub) {
        user.googleId = payload.sub;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
      }
    }

    // Generate JWT token (same as regular login)
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return token and user info
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        homeRegion: user.homeRegion,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
};

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

export const configurePassport = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const avatar = profile.photos[0]?.value;

      let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

      if (user) {
        if (!user.googleId) {
          user.googleId = profile.id;
          user.avatar = user.avatar || avatar;
          user.authProvider = 'google';
          await user.save();
        }
        return done(null, user);
      }

      user = await User.create({
        name: profile.displayName,
        email,
        avatar,
        googleId: profile.id,
        authProvider: 'google',
        isVerified: true,
        role: null,
      });

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-passwordHash');
      done(null, user);
    } catch (err) { done(err, null); }
  });
};

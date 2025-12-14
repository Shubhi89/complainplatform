import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser, UserRole } from '../models/User';

// 1. Serialize User (Store user ID in the session)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// 2. Deserialize User (Retrieve full user from ID in session)
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// 3. Define the Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: '/auth/google/callback',
      passReqToCallback: true // Important: Allows us to read the "state" (role)
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // A. Check if user already exists
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          // If user exists, just log them in (ignore the state role)
          return done(null, existingUser);
        }

        // B. If user is new, determine their role from the 'state' query param
        // The state is passed as a base64 string or plain text from the frontend
        let role = UserRole.CONSUMER; // Default
        
        if (req.query.state) {
            // Simple check: logic to decode state if complex, or direct string check
            const stateStr = req.query.state as string;
            if (stateStr.includes('BUSINESS')) {
                role = UserRole.BUSINESS;
            }
        }

        // C. Create the new User
        const newUser = await new User({
          googleId: profile.id,
          email: profile.emails?.[0].value,
          displayName: profile.displayName,
          role: role, 
          // customId will be generated later
        }).save();

        done(null, newUser);

      } catch (error) {
        done(error, undefined);
      }
    }
  )
);
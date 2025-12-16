import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser, UserRole } from '../models/User';
import { generateCustomId } from '../services/idGenerator';

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
        
        if (req.session && (req.session as any).tempRole) {
          const requestedRole = (req.session as any).tempRole;
          // Validate it's a valid role
          if (['CONSUMER', 'BUSINESS', 'ADMIN'].includes(requestedRole)) {
            role = requestedRole;
          }
        }

        // C. Create the new User
        const customId = await generateCustomId('user_id', 'USR');

        const newUser = await new User({
          googleId: profile.id,
          email: profile.emails?.[0].value,
          displayName: profile.displayName,
          role: role, 
          customId: customId // <--- Now we save the generated ID
        }).save();

        done(null, newUser);
        console.log('New user created:', newUser , customId);

      } catch (error) {
        done(error, undefined);
      }
    }
  )
);
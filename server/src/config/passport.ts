import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User, { IUser, UserRole } from "../models/User";
import { generateCustomId } from "../services/idGenerator";

// 1. Serialize User
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// 2. Deserialize User
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "/api/auth/google/callback",
      proxy: true,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        let role = UserRole.CONSUMER; // Default

        if (req.session && (req.session as any).tempRole) {
          const requestedRole = (req.session as any).tempRole;

          if (["CONSUMER", "BUSINESS", "ADMIN"].includes(requestedRole)) {
            role = requestedRole;
          }
        }

        const customId = await generateCustomId("user_id", "USR");

        const newUser = await new User({
          googleId: profile.id,
          email: profile.emails?.[0].value,
          displayName: profile.displayName,
          role: role,
          customId: customId,
        }).save();

        done(null, newUser);
        console.log("New user created:", newUser, customId);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);

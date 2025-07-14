const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback", // must match backend route
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let existingUser = await User.findOne({ email: profile.emails[0].value });

        if (!existingUser) {
          // Create new user
          existingUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            isVerified: true,
            password: "google-oauth", // required field in schema, placeholder
            phone: "N/A", // required field in schema, you can update later
          });
        }

        return done(null, existingUser);
      } catch (err) {
        console.error("❌ Google strategy error:", err);
        return done(err, null);
      }
    }
  )
);

// Serialize user for session (not used with JWT, but required by Passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;

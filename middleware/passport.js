const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // your mongoose user model

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://busbee.onrender.com/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile:", profile); // ✅ DEBUG
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

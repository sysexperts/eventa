import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../db.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export function configurePassport() {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error("No email found in Google profile"), undefined);
          }

          // Check if user exists
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Update existing user with Google info
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                oauthProvider: "google",
                oauthAccessToken: accessToken,
                avatarUrl: user.avatarUrl || profile.photos?.[0]?.value,
                emailVerified: true, // Google emails are verified
                lastLoginAt: new Date(),
              },
            });
          } else {
            // Create new user from Google profile
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || email.split("@")[0],
                googleId: profile.id,
                oauthProvider: "google",
                oauthAccessToken: accessToken,
                avatarUrl: profile.photos?.[0]?.value,
                emailVerified: true,
                passwordHash: null, // No password for OAuth users
              },
            });
          }

          return done(null, user);
        } catch (error) {
          console.error("Google OAuth error:", error);
          return done(error as Error, undefined);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

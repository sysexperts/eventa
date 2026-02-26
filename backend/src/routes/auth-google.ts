import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

export const authGoogleRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Initiate Google OAuth
authGoogleRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google OAuth callback
authGoogleRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  (req, res) => {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_user`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend
    res.redirect(`${FRONTEND_URL}/?login=success`);
  }
);

// Google OAuth logout
authGoogleRouter.post("/google/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { prisma } from "../db.js";
import { emailService } from "../services/email.js";

export const authExtendedRouter = Router();

// ═══════════════════ EMAIL VERIFICATION ═══════════════════

authExtendedRouter.post("/verify-email", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token ist erforderlich." });
  }

  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    return res.status(404).json({ error: "Ungültiger oder abgelaufener Token." });
  }

  // Check if token is expired
  if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
    return res.status(400).json({ error: "Token ist abgelaufen. Bitte fordere einen neuen an." });
  }

  // Verify email
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  });

  // Send welcome email
  await emailService.sendWelcomeEmail(user.email, user.name);

  return res.json({ message: "E-Mail erfolgreich verifiziert!" });
});

authExtendedRouter.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "E-Mail ist erforderlich." });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Don't reveal if user exists
    return res.json({ message: "Falls ein Account mit dieser E-Mail existiert, wurde eine Verifizierungs-E-Mail gesendet." });
  }

  if (user.emailVerified) {
    return res.status(400).json({ error: "E-Mail ist bereits verifiziert." });
  }

  // Generate new token
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: token,
      emailVerificationExpiry: expiry,
    },
  });

  // Send verification email
  await emailService.sendVerificationEmail(user.email, user.name, token);

  return res.json({ message: "Verifizierungs-E-Mail wurde gesendet." });
});

// ═══════════════════ PASSWORD RESET ═══════════════════

authExtendedRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "E-Mail ist erforderlich." });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Don't reveal if user exists (security best practice)
    return res.json({ message: "Falls ein Account mit dieser E-Mail existiert, wurde eine Passwort-Reset-E-Mail gesendet." });
  }

  // Generate reset token
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpiry: expiry,
    },
  });

  // Send password reset email
  await emailService.sendPasswordResetEmail(user.email, user.name, token);

  return res.json({ message: "Passwort-Reset-E-Mail wurde gesendet." });
});

authExtendedRouter.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token und neues Passwort sind erforderlich." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Passwort muss mindestens 8 Zeichen lang sein." });
  }

  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
  });

  if (!user) {
    return res.status(404).json({ error: "Ungültiger oder abgelaufener Token." });
  }

  // Check if token is expired
  if (user.passwordResetExpiry && user.passwordResetExpiry < new Date()) {
    return res.status(400).json({ error: "Token ist abgelaufen. Bitte fordere einen neuen an." });
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiry: null,
      loginAttempts: 0, // Reset login attempts
      lockedUntil: null, // Unlock account if locked
    },
  });

  return res.json({ message: "Passwort erfolgreich zurückgesetzt!" });
});

// ═══════════════════ ACCOUNT SECURITY ═══════════════════

authExtendedRouter.post("/check-account-status", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "E-Mail ist erforderlich." });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      emailVerified: true,
      isBanned: true,
      lockedUntil: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "Account nicht gefunden." });
  }

  const isLocked = user.lockedUntil && user.lockedUntil > new Date();

  return res.json({
    emailVerified: user.emailVerified,
    isBanned: user.isBanned,
    isLocked,
    lockedUntil: isLocked ? user.lockedUntil : null,
  });
});

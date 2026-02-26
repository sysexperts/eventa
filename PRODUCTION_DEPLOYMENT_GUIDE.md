# 🚀 Production Deployment Guide - Omekan Events Platform

## 📋 Übersicht

Dieser Guide führt dich durch alle notwendigen Schritte, um die Omekan Events Platform produktionsreif zu machen.

---

## ✅ Production Readiness Checklist

### 🔐 1. Secrets & Environment Variables

#### Was fehlt aktuell:
- ❌ Email Service (SendGrid/Nodemailer) für Registrierung & Verifizierung
- ❌ Email Verification System
- ❌ Password Reset Funktionalität
- ❌ Sichere Secret Management Strategie
- ⚠️ Spotify Keys sind im .env (sollten in GitHub Secrets)

#### Was implementiert werden muss:

**A. Email Service Setup (SendGrid)**
```bash
# 1. SendGrid Account erstellen (100 emails/day kostenlos)
# https://signup.sendgrid.com/

# 2. Sender Identity verifizieren
# 3. API Key generieren

# 4. Zu .env hinzufügen:
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@omekan.com
SENDGRID_FROM_NAME=Omekan Events
```

**B. Environment Variables für Production**
```env
# ============================================
# PRODUCTION ENVIRONMENT VARIABLES
# ============================================

# App Config
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://omekan.com

# Database (PostgreSQL)
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<STRONG_PASSWORD_HERE>
DB_NAME=local_events
DATABASE_URL=postgresql://postgres:<STRONG_PASSWORD_HERE>@db:5432/local_events?schema=public

# Security
JWT_SECRET=<GENERATE_STRONG_SECRET_64_CHARS>
COOKIE_SECURE=true
COOKIE_DOMAIN=.omekan.com

# CORS
CORS_ORIGIN=https://omekan.com

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@omekan.com
SENDGRID_FROM_NAME=Omekan Events

# Spotify API
SPOTIFY_CLIENT_ID=<YOUR_SPOTIFY_CLIENT_ID>
SPOTIFY_CLIENT_SECRET=<YOUR_SPOTIFY_CLIENT_SECRET>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Uploads
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/app/uploads
```

---

### 📧 2. Email System Implementation

#### Benötigte Features:
1. ✅ **Email Verification bei Registrierung**
   - User registriert sich → Email mit Verification Link
   - User klickt Link → Account wird aktiviert
   
2. ✅ **Password Reset**
   - User fordert Password Reset an
   - Email mit Reset Link (Token, 1h gültig)
   - User setzt neues Passwort

3. ✅ **Welcome Email**
   - Nach erfolgreicher Verifizierung

4. ✅ **Event Notifications** (Optional, später)
   - Neue Events in deiner Stadt
   - Events von gefolgten Artists

#### Technologie:
- **SendGrid** (empfohlen, 100 emails/day kostenlos)
- **Nodemailer** (als Wrapper für SendGrid SMTP)

---

### 🗄️ 3. Database Schema Updates

#### Neue Felder für User-Tabelle:
```prisma
model User {
  // ... existing fields
  
  emailVerified       Boolean   @default(false)
  emailVerificationToken String?  @unique
  emailVerificationExpiry DateTime?
  
  passwordResetToken  String?   @unique
  passwordResetExpiry DateTime?
  
  lastLoginAt         DateTime?
  loginAttempts       Int       @default(0)
  lockedUntil         DateTime?
}
```

---

### 🔒 4. Security Best Practices

#### Implementiert werden muss:

**A. Rate Limiting** (teilweise vorhanden)
```typescript
// Erweiterte Rate Limits für sensitive Endpoints
- Login: 5 Versuche / 15 Min
- Register: 3 Versuche / Stunde
- Password Reset: 3 Versuche / Stunde
- Email Verification Resend: 3 / Stunde
```

**B. Account Lockout**
```typescript
// Nach 5 fehlgeschlagenen Login-Versuchen
// Account für 30 Minuten sperren
```

**C. HTTPS Enforcement**
```typescript
// Helmet.js bereits vorhanden
// HSTS Header setzen
// Cookie Secure Flag (bereits implementiert)
```

**D. Input Validation**
```typescript
// Zod Schemas bereits vorhanden
// XSS Protection durch Helmet
// SQL Injection Protection durch Prisma
```

---

### 🐳 5. Docker Production Setup

#### Optimierungen:

**A. Multi-Stage Builds** (bereits implementiert)
- ✅ Build Stage
- ✅ Production Stage
- ✅ Minimale Image Size

**B. Docker Secrets** (zu implementieren)
```yaml
# docker-compose.prod.yml
secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  sendgrid_api_key:
    file: ./secrets/sendgrid_api_key.txt
```

**C. Health Checks** (bereits implementiert)
- ✅ Database Health Check
- ✅ Backend Health Check
- ✅ Auto-Restart bei Failures

---

### 📊 6. Monitoring & Logging

#### Zu implementieren:

**A. Application Logging**
```typescript
// Winston Logger
- Error Logs → File + Console
- Access Logs → Morgan (bereits vorhanden)
- Audit Logs → User Actions
```

**B. Error Tracking**
```typescript
// Optional: Sentry Integration
- Frontend Errors
- Backend Errors
- Performance Monitoring
```

**C. Database Backups** (bereits implementiert)
- ✅ Tägliche Backups
- ✅ 7 Tage Retention
- ✅ Automatische Cleanup

---

### 🌐 7. Deployment Strategie

#### Option A: VPS (Hetzner, DigitalOcean, etc.)
```bash
# 1. Server Setup
- Ubuntu 22.04 LTS
- Docker & Docker Compose installieren
- Nginx als Reverse Proxy
- SSL Zertifikat (Let's Encrypt)

# 2. GitHub Actions CI/CD
- Auto-Deploy bei Push auf main
- Tests laufen vor Deployment
- Rollback bei Fehlern
```

#### Option B: Cloud Platform (Railway, Render, Fly.io)
```bash
# Einfacher, aber teurer
- Railway: $5-20/Monat
- Render: $7-25/Monat
- Fly.io: $0-10/Monat (Free Tier)
```

---

### 📝 8. Pre-Deployment Checklist

#### Vor dem Go-Live:

- [ ] **Secrets generieren**
  - [ ] JWT_SECRET (64+ Zeichen)
  - [ ] DB_PASSWORD (starkes Passwort)
  - [ ] SendGrid API Key

- [ ] **Email System testen**
  - [ ] Registrierung + Verification
  - [ ] Password Reset
  - [ ] Email Templates designen

- [ ] **Database**
  - [ ] Migration auf Production DB
  - [ ] Seed Data (Communities, Categories)
  - [ ] Backup-Strategie testen

- [ ] **Security**
  - [ ] HTTPS aktiviert
  - [ ] Rate Limiting getestet
  - [ ] CORS korrekt konfiguriert
  - [ ] Helmet Security Headers

- [ ] **Performance**
  - [ ] Database Indizes optimiert
  - [ ] Image Optimization
  - [ ] CDN für Static Assets (optional)

- [ ] **Monitoring**
  - [ ] Logging funktioniert
  - [ ] Error Tracking aktiv
  - [ ] Uptime Monitoring (UptimeRobot)

---

## 🎯 Nächste Schritte

### Phase 1: Email System (JETZT)
1. SendGrid Account erstellen
2. Email Service implementieren
3. User Verification System
4. Password Reset System
5. Email Templates erstellen

### Phase 2: Security Hardening
1. Rate Limiting erweitern
2. Account Lockout
3. Audit Logging
4. Security Headers optimieren

### Phase 3: Deployment Vorbereitung
1. Docker Secrets Setup
2. Production Environment Variables
3. CI/CD Pipeline (GitHub Actions)
4. Monitoring Setup

### Phase 4: Go-Live
1. DNS Setup
2. SSL Zertifikat
3. Deployment auf Production Server
4. Smoke Tests
5. Monitoring aktivieren

---

## 🔧 Automatische Setup-Scripte

Ich werde folgende Scripte erstellen:

1. **setup-production.sh** - Generiert alle Secrets
2. **deploy.sh** - Deployment Script
3. **backup-db.sh** - Manual Backup Script
4. **health-check.sh** - System Health Check

---

## 📞 Support & Hilfe

Bei Fragen oder Problemen:
- GitHub Issues
- Email: support@omekan.com (nach Go-Live)

---

**Letzte Aktualisierung:** 26. Februar 2026
**Version:** 1.0.0

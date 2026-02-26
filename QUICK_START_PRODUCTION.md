# 🚀 Quick Start - Production Deployment

## Voraussetzungen

- Server mit Docker & Docker Compose
- Domain mit DNS-Zugriff
- SendGrid Account (kostenlos für 100 emails/Tag)
- Optional: Spotify Developer Account

---

## 1️⃣ Repository Klonen

```bash
git clone https://github.com/sysexperts/eventa.git
cd eventa
```

---

## 2️⃣ Secrets & Environment Setup

### Automatisches Setup (empfohlen)

```bash
chmod +x setup-production.sh
./setup-production.sh
```

Das Script generiert automatisch:
- ✅ JWT_SECRET (64 Zeichen)
- ✅ DB_PASSWORD (32 Zeichen)
- ✅ `.env` Datei aus Template

### Manuelle Secrets generieren

```bash
# JWT Secret
openssl rand -hex 32

# DB Password
openssl rand -base64 24 | tr -d "=+/" | cut -c1-32
```

---

## 3️⃣ SendGrid Email Service Setup

### Account erstellen
1. Gehe zu: https://signup.sendgrid.com/
2. Registriere dich (100 emails/Tag kostenlos)
3. Verifiziere deine Email-Adresse

### Sender Identity verifizieren
1. Dashboard → Settings → Sender Authentication
2. "Verify a Single Sender" wählen
3. Email-Adresse eingeben (z.B. `noreply@omekan.com`)
4. Verifizierungs-Email bestätigen

### API Key generieren
1. Dashboard → Settings → API Keys
2. "Create API Key" klicken
3. Name: "Omekan Production"
4. Permissions: "Full Access"
5. Key kopieren (wird nur einmal angezeigt!)

### In .env eintragen
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@omekan.com
SENDGRID_FROM_NAME=Omekan Events
```

---

## 4️⃣ Production URLs konfigurieren

In `.env` anpassen:

```env
# Frontend URL (wo die App läuft)
FRONTEND_URL=https://omekan.com

# API URL (Backend)
VITE_API_URL=https://api.omekan.com

# CORS Origin
CORS_ORIGIN=https://omekan.com

# Cookies nur über HTTPS
COOKIE_SECURE=true
```

---

## 5️⃣ Spotify Integration (Optional)

### Developer App erstellen
1. Gehe zu: https://developer.spotify.com/dashboard
2. "Create App" klicken
3. App Name: "Omekan Events"
4. Redirect URI: `https://omekan.com/callback`
5. Client ID & Secret kopieren

### In .env eintragen
```env
SPOTIFY_CLIENT_ID=your-client-id-here
SPOTIFY_CLIENT_SECRET=your-client-secret-here
```

---

## 6️⃣ Docker Deployment

### Services starten
```bash
docker compose up -d
```

### Logs überprüfen
```bash
# Alle Services
docker compose logs -f

# Nur Backend
docker compose logs -f backend

# Nur Frontend
docker compose logs -f frontend
```

### Status prüfen
```bash
docker compose ps
```

Alle Services sollten "Up" sein:
- ✅ local-events-db
- ✅ local-events-backend
- ✅ local-events-frontend
- ✅ local-events-backup

---

## 7️⃣ Datenbank Migration

Die Migration läuft automatisch beim Start. Falls manuell nötig:

```bash
docker compose exec backend npx prisma migrate deploy
```

---

## 8️⃣ Health Checks

### Backend Health
```bash
curl http://localhost:4000/health
# Sollte zurückgeben: {"ok":true}
```

### Frontend
```bash
curl http://localhost:5173
# Sollte HTML zurückgeben
```

---

## 9️⃣ Reverse Proxy Setup (Nginx)

### Nginx Konfiguration

```nginx
# /etc/nginx/sites-available/omekan.com

# Frontend
server {
    listen 80;
    server_name omekan.com www.omekan.com;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.omekan.com;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL Zertifikat (Let's Encrypt)

```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx

# Zertifikate generieren
sudo certbot --nginx -d omekan.com -d www.omekan.com
sudo certbot --nginx -d api.omekan.com

# Auto-Renewal testen
sudo certbot renew --dry-run
```

---

## 🔟 Erste Schritte nach Deployment

### Admin-Account erstellen

1. Registriere dich über die Webseite
2. Bestätige deine Email
3. In der Datenbank Admin-Rechte setzen:

```bash
docker compose exec db psql -U postgres -d local_events -c \
  "UPDATE \"User\" SET \"isAdmin\" = true WHERE email = 'deine@email.com';"
```

### Communities & Kategorien seeden

```bash
docker compose exec backend npm run prisma db seed
```

---

## 📊 Monitoring & Maintenance

### Logs ansehen
```bash
# Live logs
docker compose logs -f

# Letzte 100 Zeilen
docker compose logs --tail=100
```

### Backups

Automatische tägliche Backups in `./backups/`:
```bash
ls -lh backups/
```

### Manuelles Backup
```bash
docker compose exec db pg_dump -U postgres local_events > backup_$(date +%Y%m%d).sql
```

### Backup wiederherstellen
```bash
docker compose exec -T db psql -U postgres local_events < backup_20260226.sql
```

---

## 🔒 Security Checklist

- [ ] ✅ HTTPS aktiviert (Let's Encrypt)
- [ ] ✅ Starke Passwörter in .env
- [ ] ✅ `.env` nicht in Git
- [ ] ✅ `COOKIE_SECURE=true`
- [ ] ✅ Firewall konfiguriert (nur Ports 80, 443, 22)
- [ ] ✅ SSH Key-basierte Authentifizierung
- [ ] ✅ Regelmäßige Updates (`apt update && apt upgrade`)
- [ ] ✅ Backups funktionieren
- [ ] ✅ Monitoring aktiv

---

## 🆘 Troubleshooting

### Backend startet nicht
```bash
# Logs prüfen
docker compose logs backend

# Container neu starten
docker compose restart backend
```

### Datenbank-Verbindungsfehler
```bash
# DB Status prüfen
docker compose exec db pg_isready -U postgres

# DB neu starten
docker compose restart db
```

### Email werden nicht versendet
```bash
# Backend Logs prüfen
docker compose logs backend | grep -i email

# SendGrid API Key testen
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### Migrations fehlgeschlagen
```bash
# Migration Status
docker compose exec backend npx prisma migrate status

# Migration neu ausführen
docker compose exec backend npx prisma migrate deploy

# Prisma Client regenerieren
docker compose exec backend npx prisma generate
```

---

## 📞 Support

- **GitHub Issues**: https://github.com/sysexperts/eventa/issues
- **Dokumentation**: Siehe `PRODUCTION_DEPLOYMENT_GUIDE.md`

---

**Viel Erfolg mit deinem Omekan Events Deployment! 🎉**

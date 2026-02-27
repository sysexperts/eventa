# ⚡ Quick Start - Production Deployment

**Schnellstart-Anleitung für erfahrene Admins**

## 🎯 Übersicht

1. Server vorbereiten (5 Min)
2. Docker installieren (5 Min)
3. Projekt klonen & konfigurieren (10 Min)
4. SSL-Zertifikate (5 Min)
5. Container starten (2 Min)
6. Admin-Benutzer erstellen (2 Min)

**Gesamtzeit: ~30 Minuten**

---

## 1️⃣ Server vorbereiten

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Tools installieren
sudo apt install -y curl git nano ufw certbot python3-certbot-nginx

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 2️⃣ Docker installieren

```bash
# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose Plugin
sudo apt install -y docker-compose-plugin

# Testen
docker --version
docker compose version
```

## 3️⃣ Nginx installieren

```bash
# Nginx installieren
sudo apt install -y nginx

# Nginx starten
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 4️⃣ Projekt klonen

```bash
# Projekt-Verzeichnis erstellen
sudo mkdir -p /var/www/omekan
cd /var/www/omekan

# Git Repository klonen
sudo git clone https://github.com/sysexperts/eventa.git .

# Berechtigungen setzen
sudo chown -R $USER:$USER /var/www/omekan
```

## 5️⃣ Umgebungsvariablen konfigurieren

```bash
cd /var/www/omekan

# .env erstellen
cp .env.example .env
nano .env
```

**WICHTIG - Diese Werte anpassen:**

```bash
# Database
DB_PASSWORD=SICHERES-PASSWORT-HIER

# JWT Secret (generieren mit: openssl rand -hex 32)
JWT_SECRET=DEIN-JWT-SECRET-HIER

# URLs (ANPASSEN!)
VITE_API_URL=https://api.deine-domain.de
BACKEND_URL=https://api.deine-domain.de
FRONTEND_URL=https://deine-domain.de
CORS_ORIGIN=https://deine-domain.de

# Security
COOKIE_SECURE=true
NODE_ENV=production

# SMTP (Strato Beispiel)
SMTP_HOST=smtp.strato.de
SMTP_PORT=465
SMTP_USER=noreply@deine-domain.de
SMTP_PASS=DEIN-SMTP-PASSWORT
SMTP_FROM_NAME=Deine App

# Optional: Spotify
SPOTIFY_CLIENT_ID=deine-spotify-client-id
SPOTIFY_CLIENT_SECRET=deine-spotify-client-secret

# Optional: Google OAuth
GOOGLE_CLIENT_ID=deine-google-client-id
GOOGLE_CLIENT_SECRET=deine-google-client-secret
```

**Speichern:** `Strg+O`, Enter, `Strg+X`

## 6️⃣ Nginx konfigurieren

```bash
# Frontend-Config kopieren
sudo cp nginx-configs/frontend.conf /etc/nginx/sites-available/deine-domain.de

# API-Config kopieren
sudo cp nginx-configs/api.conf /etc/nginx/sites-available/api.deine-domain.de

# Configs bearbeiten (Domain anpassen!)
sudo nano /etc/nginx/sites-available/deine-domain.de
sudo nano /etc/nginx/sites-available/api.deine-domain.de

# Symlinks erstellen
sudo ln -s /etc/nginx/sites-available/deine-domain.de /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.deine-domain.de /etc/nginx/sites-enabled/

# Default-Config entfernen
sudo rm /etc/nginx/sites-enabled/default

# Nginx testen
sudo nginx -t

# Nginx neu laden
sudo systemctl reload nginx
```

## 7️⃣ SSL-Zertifikate installieren

```bash
# Frontend-Domain
sudo certbot --nginx -d deine-domain.de

# API-Domain
sudo certbot --nginx -d api.deine-domain.de

# Auto-Renewal testen
sudo certbot renew --dry-run
```

## 8️⃣ Container starten

```bash
cd /var/www/omekan

# Container bauen und starten
sudo docker compose up -d --build

# Status prüfen (alle sollten "healthy" oder "running" sein)
sudo docker compose ps

# Logs anschauen
sudo docker compose logs -f
```

**Warten bis alle Container laufen (ca. 2-3 Minuten)**

## 9️⃣ Backend-Health-Check

```bash
# Backend testen
curl https://api.deine-domain.de/health

# Erwartete Antwort: {"status":"ok"}
```

## 🔟 Admin-Benutzer erstellen

1. **Im Browser:** Gehe zu `https://deine-domain.de`
2. **Registrieren:** Erstelle einen Account
3. **Auf dem Server:**

```bash
cd /var/www/omekan

# Datenbank öffnen
sudo docker compose exec db psql -U postgres local_events

# Admin-Rechte setzen (E-Mail anpassen!)
UPDATE users SET "isAdmin" = true WHERE email = 'deine-email@example.com';

# Prüfen
SELECT email, "isAdmin" FROM users;

# Beenden
\q
```

4. **Im Browser:** Logout/Login → Du bist jetzt Admin! 🎉

---

## ✅ Fertig!

**Teste jetzt:**
- ✅ Frontend: `https://deine-domain.de`
- ✅ API: `https://api.deine-domain.de/health`
- ✅ Event erstellen
- ✅ Bild hochladen
- ✅ Video hochladen
- ✅ Spotify-Import

---

## 🔧 Nützliche Befehle

```bash
# Logs anschauen
sudo docker compose logs -f backend
sudo docker compose logs -f frontend

# Container neu starten
sudo docker compose restart backend
sudo docker compose restart frontend

# Alle Container neu starten
sudo docker compose down
sudo docker compose up -d

# Updates vom Git holen
git pull origin main
sudo docker compose up -d --build

# Backup erstellen
sudo docker compose exec db pg_dump -U postgres local_events > backup.sql

# Backup wiederherstellen
cat backup.sql | sudo docker compose exec -T db psql -U postgres local_events
```

---

## 📚 Weitere Dokumentation

- **Vollständige Anleitung:** `DEPLOYMENT_UBUNTU_SERVER.md`
- **Post-Deployment Checklist:** `POST_DEPLOYMENT_CHECKLIST.md`
- **Umgebungsvariablen:** `.env.example`

---

## 🆘 Probleme?

### Frontend zeigt 502 Bad Gateway
```bash
# Backend-Logs prüfen
sudo docker compose logs backend

# Backend neu starten
sudo docker compose restart backend
```

### Video-Upload schlägt fehl
```bash
# Nginx-Config prüfen
sudo cat /etc/nginx/sites-available/api.deine-domain.de | grep client_max_body_size

# Sollte sein: client_max_body_size 100M;
```

### CORS-Fehler
```bash
# .env prüfen
cat .env | grep CORS_ORIGIN

# Sollte sein: CORS_ORIGIN=https://deine-domain.de (ohne Trailing Slash!)
```

### Datenbank-Verbindung fehlgeschlagen
```bash
# Datenbank-Status
sudo docker compose exec db pg_isready -U postgres

# Datenbank-Logs
sudo docker compose logs db
```

---

**Bei weiteren Problemen:** Siehe `DEPLOYMENT_UBUNTU_SERVER.md` für detaillierte Troubleshooting-Schritte.

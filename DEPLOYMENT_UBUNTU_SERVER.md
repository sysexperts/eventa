# 🚀 Production Deployment - Ubuntu 24.04 Server

**Komplette Schritt-für-Schritt Anleitung für Live-Deployment**

---

## 📋 **Voraussetzungen**

- ✅ Ubuntu 24.04 Server (frisch installiert)
- ✅ Root/Sudo Zugriff
- ✅ Domain: `events.sys-experts.de`
- ✅ DNS A-Records konfiguriert:
  - `events.sys-experts.de` → Server IP
  - `www.events.sys-experts.de` → Server IP
  - `api.events.sys-experts.de` → Server IP
- ✅ Strato Email Account
- ✅ Google OAuth Credentials
- ✅ Spotify API Keys (optional)

---

## 🔧 **TEIL 1: Server Vorbereitung**

### 1.1 Mit Server verbinden

```
ssh root@DEINE-SERVER-IP
# oder
ssh dein-user@DEINE-SERVER-IP
```

### 1.2 System aktualisieren

```
# System Update
sudo apt update && sudo apt upgrade -y

# Essenzielle Tools installieren
sudo apt install -y curl git wget nano ufw fail2ban
```

### 1.3 Firewall konfigurieren

```
# UFW Firewall aktivieren
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Status prüfen
sudo ufw status
```

### 1.4 Fail2Ban aktivieren (Brute-Force Schutz)

```
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 🐳 **TEIL 2: Docker Installation**

### 2.1 Docker installieren

```
# Alte Docker Versionen entfernen
sudo apt remove docker docker-engine docker.io containerd runc

# Docker Repository hinzufügen
sudo apt install -y ca-certificates curl gnupg lsb-release

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker installieren
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Docker ohne sudo nutzen (optional)
sudo usermod -aG docker $USER
# WICHTIG: Nach diesem Befehl neu einloggen!
```

### 2.2 Docker testen

```
# Docker Version prüfen
docker --version
docker compose version

# Test Container
sudo docker run hello-world
```

---

## 📦 **TEIL 3: Projekt auf Server deployen**

### 3.1 Arbeitsverzeichnis erstellen

```
# Projekt-Ordner erstellen
sudo mkdir -p /var/www/events
sudo chown -R $USER:$USER /var/www/events
cd /var/www/events
```

### 3.2 Repository klonen

```
# Repository klonen
git clone https://github.com/sysexperts/eventa.git .

# Prüfen ob alles da ist
ls -la
```

### 3.3 Environment Variables erstellen

```
# .env Datei erstellen
nano .env
```

**Füge folgendes ein (WICHTIG: Ersetze die Werte!):**

```env
# ─────────────────────────────────────────────────────────────
# PRODUCTION ENVIRONMENT VARIABLES
# ─────────────────────────────────────────────────────────────

# Database
DB_USER=postgres
DB_PASSWORD=DEIN-SICHERES-DB-PASSWORT-HIER-32-ZEICHEN
DB_NAME=local_events

# Application
NODE_ENV=production

# JWT Secret (generiere mit: openssl rand -hex 32)
JWT_SECRET=DEIN-JWT-SECRET-HIER-64-ZEICHEN

# Frontend & API URLs (WICHTIG: Deine Domain!)
VITE_API_URL=https://api.events.sys-experts.de
CORS_ORIGIN=https://events.sys-experts.de
FRONTEND_URL=https://events.sys-experts.de
BACKEND_URL=https://api.events.sys-experts.de

# Security
COOKIE_SECURE=true

# Email Service (Strato SMTP)
SMTP_HOST=smtp.strato.de
SMTP_PORT=465
SMTP_USER=noreply@deine-domain.de
SMTP_PASS=DEIN-SMTP-PASSWORT
SMTP_FROM_NAME=Deine App Name

# Google OAuth
GOOGLE_CLIENT_ID=deine-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=dein-google-client-secret

# Spotify API (Optional)
SPOTIFY_CLIENT_ID=deine-spotify-client-id
SPOTIFY_CLIENT_SECRET=deine-spotify-client-secret

# Backups
BACKUP_RETENTION_DAYS=7
```

**Speichern:** `Strg+O`, `Enter`, `Strg+X`

### 3.4 Secrets generieren

```
# JWT Secret generieren
openssl rand -hex 32

# DB Password generieren
openssl rand -base64 24 | tr -d "=+/" | cut -c1-32

# Kopiere die Werte und füge sie in .env ein
nano .env
```

---

## 🌐 **TEIL 4: Nginx Reverse Proxy**

### 4.1 Nginx installieren

```
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4.2 Nginx Konfiguration für Frontend

```
sudo nano /etc/nginx/sites-available/events.sys-experts.de
```

**Füge ein:**

```nginx
# Frontend - events.sys-experts.de
server {
    listen 80;
    listen [::]:80;
    server_name events.sys-experts.de www.events.sys-experts.de;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4.3 Nginx Konfiguration für Backend API

```
sudo nano /etc/nginx/sites-available/api.events.sys-experts.de
```

**Füge ein:**

```nginx
# Backend API - api.events.sys-experts.de
server {
    listen 80;
    listen [::]:80;
    server_name api.events.sys-experts.de;

    # Größere Upload-Limits für Event-Bilder
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4.4 Nginx Konfigurationen aktivieren

```
# Symlinks erstellen
sudo ln -s /etc/nginx/sites-available/events.sys-experts.de /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.events.sys-experts.de /etc/nginx/sites-enabled/

# Default Site deaktivieren
sudo rm /etc/nginx/sites-enabled/default

# Nginx Konfiguration testen
sudo nginx -t

# Nginx neu laden
sudo systemctl reload nginx
```

---

## 🔒 **TEIL 5: SSL/HTTPS mit Let's Encrypt**

### 5.1 Certbot installieren

```
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 SSL Zertifikate generieren

```
# Für Frontend (events.sys-experts.de)
sudo certbot --nginx -d events.sys-experts.de -d www.events.sys-experts.de

# Für Backend API (api.events.sys-experts.de)
sudo certbot --nginx -d api.events.sys-experts.de

# Folge den Anweisungen:
# - Email eingeben
# - Terms akzeptieren (Y)
# - Newsletter optional (N)
# - Redirect auf HTTPS: YES (2)
```

### 5.3 Auto-Renewal testen

```
# Certbot Renewal testen
sudo certbot renew --dry-run

# Sollte erfolgreich sein!
```

---

## 🚀 **TEIL 6: Docker Container starten**

### 6.1 Docker Compose Build

```
cd /var/www/events

# Container bauen und starten
sudo docker compose up -d --build

# Logs anschauen
sudo docker compose logs -f
```

**Warte bis du siehst:**
```
✅ Email service configured with smtp.strato.de
Backend listening on http://0.0.0.0:4000
```

`Strg+C` zum Beenden der Logs

### 6.2 Container Status prüfen

```
# Alle Container sollten "Up" sein
sudo docker compose ps

# Sollte zeigen:
# local-events-db        Up (healthy)
# local-events-backend   Up (healthy)
# local-events-frontend  Up
# local-events-backup    Up
```

### 6.3 Datenbank Migration

```
# Migration sollte automatisch laufen, falls nicht:
sudo docker compose exec backend npx prisma migrate deploy

# Prisma Client regenerieren
sudo docker compose exec backend npx prisma generate
```

---

## ✅ **TEIL 7: Testen & Verifizieren**

### 7.1 Health Checks

```
# Backend Health Check
curl https://api.events.sys-experts.de/health
# Sollte zurückgeben: {"ok":true}

# Frontend Check
curl https://events.sys-experts.de
# Sollte HTML zurückgeben
```

### 7.2 Browser Tests

1. **Frontend:** https://events.sys-experts.de
   - ✅ Seite lädt
   - ✅ Events werden angezeigt
   - ✅ Login-Button funktioniert

2. **Login testen:**
   - ✅ Email/Passwort Login
   - ✅ Google OAuth Login

3. **API testen:**
   - ✅ Events laden
   - ✅ Communities laden
   - ✅ Kategorien laden

### 7.3 SSL Zertifikat prüfen

```
# SSL Grade testen
curl -I https://events.sys-experts.de

# Sollte zeigen:
# HTTP/2 200
# server: nginx
```

---

## 🔧 **TEIL 8: Google OAuth Production Setup**

### 8.1 Google Cloud Console

1. Gehe zu: https://console.cloud.google.com/
2. Wähle dein Projekt
3. **APIs & Services** → **Credentials**
4. Klicke auf deine OAuth 2.0 Client ID
5. **Authorized redirect URIs** hinzufügen:
   ```
   https://api.events.sys-experts.de/api/auth/google/callback
   ```
6. **Speichern**

---

## 📊 **TEIL 9: Monitoring & Wartung**

### 9.1 Logs anschauen

```
# Alle Container Logs
sudo docker compose logs -f

# Nur Backend
sudo docker compose logs -f backend

# Nur Frontend
sudo docker compose logs -f frontend

# Nur Datenbank
sudo docker compose logs -f db

# Letzte 100 Zeilen
sudo docker compose logs --tail=100
```

### 9.2 Container neu starten

```
# Alle Container
sudo docker compose restart

# Nur Backend
sudo docker compose restart backend

# Nur Frontend
sudo docker compose restart frontend
```

### 9.3 Updates deployen

```
cd /var/www/events

# Neueste Änderungen holen
git pull origin main

# Container neu bauen
sudo docker compose down
sudo docker compose up -d --build

# Logs prüfen
sudo docker compose logs -f
```

### 9.4 Backups

```
# Backups anschauen
ls -lh backups/

# Manuelles Backup
sudo docker compose exec db pg_dump -U postgres local_events > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup wiederherstellen
sudo docker compose exec -T db psql -U postgres local_events < backup_20260226.sql
```

---

## 🆘 **TEIL 10: Troubleshooting**

### Problem: Container startet nicht

```
# Logs prüfen
sudo docker compose logs backend

# Container neu bauen
sudo docker compose down
sudo docker compose up -d --build
```

### Problem: Datenbank-Verbindung fehlgeschlagen

```
# DB Status prüfen
sudo docker compose exec db pg_isready -U postgres

# DB neu starten
sudo docker compose restart db
```

### Problem: SSL funktioniert nicht

```
# Nginx Konfiguration testen
sudo nginx -t

# Nginx neu laden
sudo systemctl reload nginx

# Certbot Logs
sudo journalctl -u certbot
```

### Problem: Frontend zeigt 502 Bad Gateway

```
# Frontend Container prüfen
sudo docker compose ps frontend
sudo docker compose logs frontend

# Nginx neu starten
sudo systemctl restart nginx
```

### Problem: Email werden nicht versendet

```
# Backend Logs prüfen
sudo docker compose logs backend | grep -i email

# SMTP Verbindung testen
telnet smtp.strato.de 465
```

---

## 🔐 **TEIL 11: Sicherheit**

### 11.1 SSH absichern

```
sudo nano /etc/ssh/sshd_config
```

**Ändern:**
```
PermitRootLogin no
PasswordAuthentication no  # Nur mit SSH Keys!
```

```
sudo systemctl restart sshd
```

### 11.2 Automatische Updates

```
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 11.3 Fail2Ban Monitoring

```
# Fail2Ban Status
sudo fail2ban-client status

# Geblockte IPs
sudo fail2ban-client status sshd
```

---

## 📝 **TEIL 12: Admin Account erstellen**

### 12.1 Registrieren über Website

1. Gehe zu https://events.sys-experts.de/register
2. Registriere dich mit deiner Email
3. Bestätige die Email (Check Posteingang)

### 12.2 Admin-Rechte setzen

```
# In Datenbank Admin-Rechte setzen
sudo docker compose exec db psql -U postgres -d local_events -c \
  "UPDATE \"User\" SET \"isAdmin\" = true WHERE email = 'deine@email.de';"
```

### 12.3 Communities & Kategorien seeden

```
sudo docker compose exec backend npm run prisma db seed
```

---

## ✅ **FERTIG! Deine Seite ist LIVE! 🎉**

### **URLs:**
- 🌐 **Frontend:** https://events.sys-experts.de
- 🔌 **API:** https://api.events.sys-experts.de
- 🔒 **SSL:** ✅ Let's Encrypt
- 📧 **Email:** ✅ Strato SMTP
- 🔐 **Google Login:** ✅ OAuth 2.0

### **Wichtige Befehle:**

```
# Status prüfen
sudo docker compose ps

# Logs anschauen
sudo docker compose logs -f

# Neu starten
sudo docker compose restart

# Updates deployen
git pull && sudo docker compose up -d --build

# Backup erstellen
sudo docker compose exec db pg_dump -U postgres local_events > backup.sql
```

---

## 📞 **Support & Hilfe**

- **Logs:** `/var/www/events/`
- **Nginx Logs:** `/var/log/nginx/`
- **Docker Logs:** `sudo docker compose logs`
- **System Logs:** `sudo journalctl -xe`

**Bei Problemen:**
1. Logs prüfen
2. Container neu starten
3. Nginx neu laden
4. Server neu starten (nur im Notfall!)

---

**Viel Erfolg mit deinem Live-Deployment! 🚀**

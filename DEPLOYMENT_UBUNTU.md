# Deployment auf Ubuntu Server mit Docker

## 1. Vorbereitung: SSH zum Server verbinden

```bash
ssh user@your-server-ip
```

---

## 2. Docker & Docker Compose installieren

```bash
# System aktualisieren
sudo apt update
sudo apt upgrade -y

# Docker installieren
sudo apt install -y docker.io docker-compose-v2

# Docker autostart aktivieren
sudo systemctl enable docker
sudo systemctl start docker

# User zur docker-gruppe hinzufügen (optional, für sudo-freie Nutzung)
sudo usermod -aG docker $USER
newgrp docker
```

---

## 3. Projekt auf den Server laden

### Option A: Mit Git klonen (empfohlen)
```bash
cd /opt  # oder wo du es haben möchtest
sudo git clone <dein-repo-url> local-events
cd local-events
```

### Option B: Mit SCP hochladen
```bash
# Von deinem PC:
scp -r "g:\Meine Ablage\8 - Intelego Projekte\local-events" user@your-server-ip:/opt/
```

---

## 4. Environment-Variablen konfigurieren

```bash
cd /opt/local-events

# .env.example anschauen
cat .env.example

# .env erstellen
nano .env
```

**Inhalt für `.env`:**
```bash
# ── Database ──
DB_USER=postgres
DB_PASSWORD=SICHERES_PASSWORT_HIER  # ⚠️ Ändern!
DB_NAME=local_events

# ── JWT Secret ──
JWT_SECRET=RANDOM_STRING_MIN_32_CHARS  # Mit `openssl rand -hex 32` generieren

# ── Frontend/Backend URLs ──
CORS_ORIGIN=https://deine-domain.de  # oder http://localhost:5173 für local dev
VITE_API_URL=https://deine-domain.de/api  # Backend API URL

# ── Spotify (Optional) ──
# SPOTIFY_CLIENT_ID=xxx
# SPOTIFY_CLIENT_SECRET=xxx
```

**Sicheres JWT Secret generieren:**
```bash
openssl rand -hex 32
# Kopier den Output in JWT_SECRET
```

---

## 5. Docker-Compose starten

```bash
# Container bauen und starten
docker-compose up -d

# Logs anschauen
docker-compose logs -f backend

# Status checken
docker-compose ps
```

**Wenn alles läuft:**
- Frontend: http://your-server-ip:5173
- Backend API: http://your-server-ip:4000

---

## 6. Nginx Reverse Proxy (für Domain + SSL)

Damit die App über `https://deine-domain.de` erreichbar ist:

```bash
# Nginx installieren
sudo apt install -y nginx

# Config erstellen
sudo nano /etc/nginx/sites-available/local-events
```

**Nginx Config (`/etc/nginx/sites-available/local-events`):**
```nginx
upstream backend {
    server localhost:4000;
}

upstream frontend {
    server localhost:5173;
}

server {
    listen 80;
    server_name deine-domain.de www.deine-domain.de;

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Config aktivieren
sudo ln -s /etc/nginx/sites-available/local-events /etc/nginx/sites-enabled/

# Nginx neustarten
sudo systemctl restart nginx

# Testen
curl -I http://deine-domain.de
```

---

## 7. SSL mit Let's Encrypt (HTTPS)

```bash
# Certbot installieren
sudo apt install -y certbot python3-certbot-nginx

# SSL-Zertifikat generieren
sudo certbot --nginx -d deine-domain.de -d www.deine-domain.de

# Auto-renewal checken
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

Nach Certbot sollte deine Nginx-Config automatisch zu HTTPS aktualisiert sein.

---

## 8. Datenbank Backups automatisieren

**Backup-Script erstellen:**

```bash
nano /opt/local-events/backup-db.sh
```

**Inhalt:**
```bash
#!/bin/bash

BACKUP_DIR="/opt/local-events/backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"

mkdir -p "$BACKUP_DIR"

# Backup erstellen
docker exec local-events-db pg_dump -U postgres local_events > "$BACKUP_FILE"

# Komprimieren
gzip "$BACKUP_FILE"

# Nur letzte 7 Backups behalten
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup erstellt: $BACKUP_FILE.gz"
```

```bash
# Script ausführbar machen
chmod +x /opt/local-events/backup-db.sh

# Cronjob für täglich 2:00 Uhr
sudo crontab -e
```

**Cronjob eintragen:**
```
0 2 * * * /opt/local-events/backup-db.sh >> /opt/local-events/backups/cron.log 2>&1
```

---

## 9. Containerlogs anschauen & Fehlersuche

```bash
# Alle Logs
docker-compose logs -f

# Nur Backend
docker-compose logs -f backend

# Nur Frontend
docker-compose logs -f frontend

# Nur Datenbank
docker-compose logs -f db
```

---

## 10. Container stoppen / neustarten

```bash
# Alles stoppen
docker-compose down

# Nur neustarten (ohne Datenverlust!)
docker-compose restart

# Mit Rebuild
docker-compose up -d --build
```

---

## ⚠️ Wichtige Sicherheit

- [ ] `.env` nie in Git committen
- [ ] `DB_PASSWORD` in `.env` sicheres Passwort
- [ ] Firewall konfigurieren (nur Port 80, 443 offen)
- [ ] Regelmäßig Backups machen
- [ ] SSH-Key statt Passwort verwenden

```bash
# Firewall-Beispiel (UFW)
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
```

---

## Monitoring & Wartung

```bash
# Docker Disk-Usage
docker system df

# Alte Images löschen
docker image prune -a

# Container Health-Status
docker-compose ps

# System-Load
htop
```

---

## Fragen?

Falls was nicht funktioniert:
1. Logs checken: `docker-compose logs -f`
2. `.env` Datei prüfen
3. Firewall-Rules checken
4. DNS-Records prüfen (für Domain)

Viel Erfolg! 🚀

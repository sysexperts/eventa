# 🚀 SIMPLE DEPLOYMENT - Copy & Paste

**Einfach Schritt für Schritt durchgehen. Kein Schnickschnack.**

---

## 1️⃣ Server vorbereiten

```
ssh root@212.227.20.59
```

```
apt update && apt upgrade -y
apt install -y curl git nano nginx certbot python3-certbot-nginx
```

```
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

---

## 2️⃣ Docker installieren

```
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install -y docker-compose-plugin
```

---

## 3️⃣ Projekt klonen

```
mkdir -p /var/www/events
cd /var/www/events
git clone https://github.com/sysexperts/eventa.git .
```

---

## 4️⃣ .env erstellen

```
nano .env
```

**Kopiere das rein:**

```
DB_USER=postgres
DB_PASSWORD=GENERIERE-GLEICH
DB_NAME=local_events

NODE_ENV=production
JWT_SECRET=GENERIERE-GLEICH

VITE_API_URL=https://api.events.sys-experts.de
BACKEND_URL=https://api.events.sys-experts.de
FRONTEND_URL=https://events.sys-experts.de
CORS_ORIGIN=https://events.sys-experts.de

COOKIE_SECURE=true

SMTP_HOST=smtp.strato.de
SMTP_PORT=465
SMTP_USER=noreply@events.sys-experts.de
SMTP_PASS=PWD4Events$
SMTP_FROM_NAME=Omekan Events

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

SPOTIFY_CLIENT_ID=5109167b84ae4bbeb7d3f27d9ad1217b
SPOTIFY_CLIENT_SECRET=7b9dbfb345c84425826718cb67f84512

BACKUP_RETENTION_DAYS=7
```

**Speichern:** `Strg+O` → Enter → `Strg+X`

---

## 5️⃣ Secrets generieren

```
openssl rand -hex 32
```

**Kopiere die Ausgabe und ersetze `GENERIERE-GLEICH` bei JWT_SECRET**

```
openssl rand -base64 24
```

**Kopiere die Ausgabe und ersetze `GENERIERE-GLEICH` bei DB_PASSWORD**

```
nano .env
```

Füge die generierten Werte ein, speichern: `Strg+O` → Enter → `Strg+X`

---

## 6️⃣ Nginx konfigurieren (HTTP-only erstmal)

### Frontend

```
nano /etc/nginx/sites-available/events.sys-experts.de
```

**Kopiere das rein:**

```
server {
    listen 80;
    server_name events.sys-experts.de;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Speichern:** `Strg+O` → Enter → `Strg+X`

### API

```
nano /etc/nginx/sites-available/api.events.sys-experts.de
```

**Kopiere das rein:**

```
server {
    listen 80;
    server_name api.events.sys-experts.de;
    
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
    }
}
```

**Speichern:** `Strg+O` → Enter → `Strg+X`

### Nginx aktivieren

```
ln -s /etc/nginx/sites-available/events.sys-experts.de /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/api.events.sys-experts.de /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

---

## 7️⃣ SSL-Zertifikate

```
certbot --nginx -d events.sys-experts.de
```

**Email eingeben, Agree to Terms: Y, Share email: N**

```
certbot --nginx -d api.events.sys-experts.de
```

**Email eingeben, Agree to Terms: Y, Share email: N**

---

## 8️⃣ Container starten

```
cd /var/www/events
docker compose up -d --build
```

**Warte 2-3 Minuten...**

```
docker compose ps
```

**Alle sollten "running" oder "healthy" sein**

---

## 9️⃣ Testen

**Im Browser:**
- `https://events.sys-experts.de` → Sollte laden
- `https://api.events.sys-experts.de/health` → Sollte `{"status":"ok"}` zeigen

---

## 🔟 Admin-Benutzer erstellen

1. **Gehe zu:** `https://events.sys-experts.de`
2. **Registriere dich** mit deiner E-Mail
3. **Auf dem Server:**

```
docker compose exec db psql -U postgres local_events
```

```
UPDATE users SET "isAdmin" = true WHERE email = 'deine-email@example.com';
```

**WICHTIG: Ersetze `deine-email@example.com` mit deiner echten E-Mail!**

```
\q
```

4. **Im Browser:** Logout → Login → Du bist Admin! ✅

---

## ✅ FERTIG!

**Teste:**
- Event erstellen
- Bild hochladen
- Video hochladen
- Spotify-Import

---

## 🔧 Nützliche Befehle

```
# Logs anschauen
docker compose logs -f

# Container neu starten
docker compose restart

# Alles neu starten
docker compose down
docker compose up -d

# Updates holen
git pull
docker compose up -d --build
```

---

**Bei Problemen:** Schau in die Logs mit `docker compose logs backend` oder `docker compose logs frontend`

# Nginx Configuration Templates

Diese Nginx-Konfigurationen sind Templates für das Production-Deployment.

## 📁 Dateien

- **`frontend.conf`** - Nginx-Config für Frontend-Domain
- **`api.conf`** - Nginx-Config für API-Domain

## 🚀 Installation

### 1. Configs auf den Server kopieren

```
# Frontend-Config
sudo cp frontend.conf /etc/nginx/sites-available/deine-domain.de

# API-Config
sudo cp api.conf /etc/nginx/sites-available/api.deine-domain.de
```

### 2. Domain-Namen anpassen

```
# Frontend-Config bearbeiten
sudo nano /etc/nginx/sites-available/deine-domain.de

# Ersetze "events.sys-experts.de" mit deiner Domain
# Suchen & Ersetzen: :%s/events.sys-experts.de/deine-domain.de/g

# API-Config bearbeiten
sudo nano /etc/nginx/sites-available/api.deine-domain.de

# Ersetze "api.events.sys-experts.de" mit deiner API-Domain
# Suchen & Ersetzen: :%s/api.events.sys-experts.de/api.deine-domain.de/g
```

### 3. Symlinks erstellen

```
# Frontend aktivieren
sudo ln -s /etc/nginx/sites-available/deine-domain.de /etc/nginx/sites-enabled/

# API aktivieren
sudo ln -s /etc/nginx/sites-available/api.deine-domain.de /etc/nginx/sites-enabled/

# Default-Config deaktivieren
sudo rm /etc/nginx/sites-enabled/default
```

### 4. Nginx testen und neu laden

```
# Konfiguration testen
sudo nginx -t

# Nginx neu laden
sudo systemctl reload nginx
```

## 🔒 SSL-Zertifikate

Nach der Nginx-Konfiguration SSL-Zertifikate mit Certbot installieren:

```
# Frontend-Domain
sudo certbot --nginx -d deine-domain.de

# API-Domain
sudo certbot --nginx -d api.deine-domain.de
```

Certbot wird die Configs automatisch anpassen und SSL aktivieren.

## ⚙️ Wichtige Einstellungen

### Frontend-Config (`frontend.conf`)
- Port 80 → HTTPS Redirect
- Port 443 → Proxy zu `localhost:5173` (Frontend-Container)
- SSL-Zertifikate von Let's Encrypt
- Security Headers

### API-Config (`api.conf`)
- Port 80 → HTTPS Redirect
- Port 443 → Proxy zu `localhost:4000` (Backend-Container)
- SSL-Zertifikate von Let's Encrypt
- **`client_max_body_size 100M`** - Wichtig für Video-Uploads!
- Extended Timeouts für große Uploads
- Security Headers

## 🔧 Troubleshooting

### Nginx startet nicht

```
# Logs prüfen
sudo tail -f /var/log/nginx/error.log

# Syntax prüfen
sudo nginx -t
```

### 502 Bad Gateway

```
# Container-Status prüfen
sudo docker compose ps

# Backend-Logs prüfen
sudo docker compose logs backend
```

### SSL-Fehler

```
# Certbot-Logs prüfen
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Zertifikate erneuern
sudo certbot renew
```

### Video-Upload schlägt fehl

Prüfe ob `client_max_body_size 100M;` in der API-Config gesetzt ist:

```
sudo cat /etc/nginx/sites-available/api.deine-domain.de | grep client_max_body_size
```

## 📚 Weitere Dokumentation

- **Quick Start:** `../QUICK_START.md`
- **Vollständige Anleitung:** `../DEPLOYMENT_UBUNTU_SERVER.md`
- **Post-Deployment Checklist:** `../POST_DEPLOYMENT_CHECKLIST.md`

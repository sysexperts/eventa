# 📋 Post-Deployment Checklist

Nach dem Deployment diese Schritte durchführen, um sicherzustellen, dass alles funktioniert.

## ✅ 1. Umgebungsvariablen prüfen

Auf dem Server in `/var/www/omekan/.env`:

```bash
cd /var/www/omekan
cat .env
```

**Folgende Variablen MÜSSEN gesetzt sein:**

- [ ] `VITE_API_URL=https://api.deine-domain.de`
- [ ] `BACKEND_URL=https://api.deine-domain.de`
- [ ] `FRONTEND_URL=https://deine-domain.de`
- [ ] `CORS_ORIGIN=https://deine-domain.de`
- [ ] `COOKIE_SECURE=true`
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` (mindestens 32 Zeichen)
- [ ] `DB_PASSWORD` (sicheres Passwort)
- [ ] SMTP-Einstellungen (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)

## ✅ 2. DNS-Records prüfen

```bash
nslookup deine-domain.de
nslookup api.deine-domain.de
```

**Beide müssen auf die Server-IP zeigen!**

- [ ] `deine-domain.de` → Server-IP
- [ ] `api.deine-domain.de` → Server-IP

## ✅ 3. SSL-Zertifikate installieren

```bash
# Frontend-Domain
sudo certbot --nginx -d deine-domain.de

# API-Domain
sudo certbot --nginx -d api.deine-domain.de

# Nginx neu laden
sudo systemctl reload nginx
```

- [ ] SSL für Frontend-Domain
- [ ] SSL für API-Domain
- [ ] Nginx läuft ohne Fehler

## ✅ 4. Container starten

```bash
cd /var/www/omekan

# Alle Container starten
sudo docker compose up -d

# Status prüfen
sudo docker compose ps
```

**Alle Container müssen "healthy" oder "running" sein:**

- [ ] `local-events-db` - healthy
- [ ] `local-events-backend` - healthy
- [ ] `local-events-frontend` - running

## ✅ 5. Backend-Health-Check

```bash
curl https://api.deine-domain.de/health
```

**Erwartete Antwort:** `{"status":"ok"}`

- [ ] Backend antwortet mit Status OK

## ✅ 6. Frontend erreichbar

Im Browser: `https://deine-domain.de`

- [ ] Frontend lädt ohne Fehler
- [ ] Keine CORS-Fehler in Browser-Console (F12)
- [ ] Keine SSL-Warnungen

## ✅ 7. Admin-Benutzer erstellen

```bash
cd /var/www/omekan

# 1. Registriere dich über die Website
# 2. Dann auf dem Server:

sudo docker compose exec db psql -U postgres local_events

# In der Datenbank:
UPDATE users SET "isAdmin" = true WHERE email = 'deine-email@example.com';

# Prüfen:
SELECT email, "isAdmin" FROM users;

# Beenden:
\q
```

- [ ] Admin-Benutzer erstellt
- [ ] Admin-Rechte gesetzt
- [ ] Login funktioniert

## ✅ 8. Funktionen testen

### Event erstellen
- [ ] Event-Formular öffnet sich
- [ ] Bild-Upload funktioniert
- [ ] Video-Upload funktioniert (bis 100MB)
- [ ] Event wird gespeichert
- [ ] Event erscheint auf der Startseite

### Spotify-Import
- [ ] Spotify-Import-Seite öffnet sich
- [ ] Künstler-Suche funktioniert
- [ ] Künstler werden importiert

### Scraping
- [ ] URL zum Scraping hinzufügen
- [ ] Scraping startet
- [ ] Gescrapte Events erscheinen im Dashboard

## ✅ 9. Backup-Service prüfen

```bash
# Backup-Logs anschauen
sudo docker compose logs backup

# Backup-Verzeichnis prüfen
ls -lh backups/
```

- [ ] Backup-Service läuft
- [ ] Backups werden erstellt
- [ ] Alte Backups werden gelöscht

## ✅ 10. Logs prüfen

```bash
# Alle Logs
sudo docker compose logs --tail=50

# Nur Backend
sudo docker compose logs backend --tail=50

# Nur Frontend
sudo docker compose logs frontend --tail=50

# Nginx-Logs
sudo tail -f /var/log/nginx/api-error.log
sudo tail -f /var/log/nginx/frontend-error.log
```

- [ ] Keine kritischen Fehler in Backend-Logs
- [ ] Keine kritischen Fehler in Frontend-Logs
- [ ] Keine kritischen Fehler in Nginx-Logs

## ✅ 11. Performance-Test

Von verschiedenen Geräten testen:

- [ ] Desktop-Browser (Chrome, Firefox, Safari)
- [ ] Mobiles Gerät (Smartphone)
- [ ] Anderes Netzwerk (nicht lokales Netzwerk)

**Prüfen:**
- [ ] Seite lädt schnell (< 3 Sekunden)
- [ ] Bilder werden angezeigt
- [ ] Videos werden abgespielt
- [ ] API-Aufrufe funktionieren

## ✅ 12. Sicherheit

- [ ] HTTPS erzwungen (HTTP → HTTPS Redirect)
- [ ] Cookies sind `Secure` und `HttpOnly`
- [ ] CORS nur für eigene Domain
- [ ] Rate-Limiting aktiv
- [ ] Keine Secrets in Git

## 🔧 Troubleshooting

### Frontend zeigt alte Daten
```bash
# Browser-Cache leeren
# Strg + Shift + R (Windows)
# Cmd + Shift + R (Mac)
```

### Backend ist "unhealthy"
```bash
# Logs prüfen
sudo docker compose logs backend --tail=100

# Backend neu starten
sudo docker compose restart backend
```

### Video-Upload schlägt fehl
```bash
# Nginx-Config prüfen
sudo cat /etc/nginx/sites-available/api.deine-domain.de | grep client_max_body_size

# Sollte sein: client_max_body_size 100M;
```

### Datenbank-Verbindung fehlgeschlagen
```bash
# Datenbank-Status prüfen
sudo docker compose exec db pg_isready -U postgres

# Datenbank-Logs
sudo docker compose logs db --tail=50
```

## 📊 Monitoring

### Tägliche Checks
- [ ] Backup-Status prüfen
- [ ] Disk-Space prüfen: `df -h`
- [ ] Container-Status: `sudo docker compose ps`

### Wöchentliche Checks
- [ ] Logs durchsehen
- [ ] Performance prüfen
- [ ] Backup-Restore testen

### Monatliche Checks
- [ ] Dependencies aktualisieren
- [ ] SSL-Zertifikate erneuern (automatisch via Certbot)
- [ ] Sicherheits-Updates installieren

---

## ✅ Deployment erfolgreich!

Wenn alle Punkte abgehakt sind, ist das Deployment erfolgreich abgeschlossen! 🎉

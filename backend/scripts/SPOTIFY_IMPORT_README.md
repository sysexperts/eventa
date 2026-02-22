# 🎵 Spotify Artist Import - Anleitung

Dieses Tool importiert automatisch Künstler von Spotify in deine Datenbank.

## 📋 Voraussetzungen

### 1. Spotify Developer Account erstellen

1. Gehe zu: https://developer.spotify.com/dashboard
2. Klicke auf **"Log in"** (mit deinem Spotify-Account)
3. Akzeptiere die Terms of Service
4. Klicke auf **"Create app"**
5. Fülle das Formular aus:
   - **App name:** Local Events Artist Importer
   - **App description:** Import artists for local events platform
   - **Redirect URI:** http://localhost (egal, wird nicht genutzt)
   - **Which API/SDKs are you planning to use?** Web API
6. Akzeptiere die Terms und klicke **"Save"**
7. Auf der App-Seite findest du:
   - **Client ID** (kopieren)
   - **Client Secret** (auf "View client secret" klicken und kopieren)

### 2. Credentials in .env eintragen

Öffne `backend/.env` und füge hinzu:

```env
SPOTIFY_CLIENT_ID=deine_client_id_hier
SPOTIFY_CLIENT_SECRET=dein_client_secret_hier
```

## 🚀 Verwendung

### Basis-Kommando (Türkische Künstler importieren)

```bash
docker compose exec backend npx tsx scripts/import-spotify-artists.ts
```

### Mit eigener Suchanfrage

```bash
docker compose exec backend npx tsx scripts/import-spotify-artists.ts --query "german hip hop" --limit 100
```

### Dry Run (nur anzeigen, nicht importieren)

```bash
docker compose exec backend npx tsx scripts/import-spotify-artists.ts --query "turkish pop" --limit 50 --dry-run
```

### In JSON-Datei speichern

```bash
docker compose exec backend npx tsx scripts/import-spotify-artists.ts --query "greek music" --limit 100 --save
```

## 🎯 Parameter

| Parameter | Beschreibung | Standard | Beispiel |
|-----------|--------------|----------|----------|
| `--query` | Suchanfrage für Spotify | `"turkish music"` | `--query "german rap"` |
| `--limit` | Max. Anzahl Künstler | `50` | `--limit 200` |
| `--dry-run` | Nur anzeigen, nicht importieren | `false` | `--dry-run` |
| `--save` | Als JSON-Datei speichern | `false` | `--save` |

## 💡 Beispiele für Suchanfragen

### Nach Community/Land
```bash
# Türkische Künstler
--query "turkish music"

# Griechische Künstler
--query "greek music"

# Arabische Künstler
--query "arabic music"

# Deutsche Künstler
--query "german music"
```

### Nach Genre
```bash
# Pop
--query "turkish pop"

# Hip-Hop
--query "german hip hop"

# Rock
--query "greek rock"

# Electronic
--query "turkish electronic"
```

### Kombiniert
```bash
# Spezifisch
--query "turkish rap artists"
--query "balkan folk music"
--query "persian traditional"
```

## 📊 Was wird importiert?

Für jeden Künstler wird gespeichert:
- ✅ Name
- ✅ Profilbild (von Spotify)
- ✅ Genre (erstes Genre von Spotify)
- ✅ Tags (bis zu 5 Genres)
- ✅ Spotify-Link
- ✅ Bio (automatisch generiert mit Follower-Anzahl)

## 🔄 Workflow-Empfehlung

### 1. Erst testen (Dry Run)
```bash
docker compose exec backend npx tsx scripts/import-spotify-artists.ts --query "turkish music" --limit 20 --dry-run
```

### 2. Dann importieren
```bash
docker compose exec backend npx tsx scripts/import-spotify-artists.ts --query "turkish music" --limit 100
```

### 3. Für mehrere Communities wiederholen
```bash
# Türkisch
docker compose exec backend npx tsx scripts/import-spotify-artists.ts --query "turkish music" --limit 100

# Griechisch
docker compose exec backend npx tsx scripts/import-spotify-artists.ts --query "greek music" --limit 100

# Arabisch
docker compose exec backend npx tsx scripts/import-spotify-artists.ts --query "arabic music" --limit 100

# Balkan
docker compose exec backend npx tsx scripts/import-spotify-artists.ts --query "balkan music" --limit 100
```

## ⚠️ Wichtige Hinweise

- **Duplikate:** Künstler die bereits existieren werden automatisch übersprungen
- **Limit:** Spotify API erlaubt max. 200 Künstler pro Anfrage
- **Rate Limiting:** Bei vielen Anfragen kurz warten zwischen den Imports
- **Qualität:** Die ersten Ergebnisse sind meist die populärsten/relevantesten

## 🐛 Troubleshooting

### "Spotify credentials not set"
→ Stelle sicher dass `SPOTIFY_CLIENT_ID` und `SPOTIFY_CLIENT_SECRET` in `backend/.env` gesetzt sind

### "Failed to get Spotify access token"
→ Überprüfe ob Client ID und Secret korrekt sind

### "No artists found"
→ Versuche eine andere/breitere Suchanfrage

## 📝 Beispiel-Output

```
🎵 Spotify Artist Importer

Query: "turkish pop"
Limit: 50
Dry Run: No

🔑 Getting Spotify access token...
✓ Access token obtained

🔍 Searching for artists: "turkish pop"...
✓ Found 50 artists

📥 Importing artists to database...

✓ Created: Tarkan
✓ Created: Sezen Aksu
✓ Created: Ajda Pekkan
⏭️  Skipped: Tarkan (already exists)
✓ Created: Sertab Erener
...

📊 Summary:
   Created: 45
   Skipped: 5
   Errors: 0
   Total: 50
```

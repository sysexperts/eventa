# 🚀 LocalEvents – Vollständige Go-Live Checkliste

> Erstellt: Februar 2026 | Basiert auf: DSGVO, BFSG, TMG, OWASP, Express Security Best Practices, PostgreSQL Best Practices, NIS2
> Sortiert nach Priorität – **oben = sofort umsetzen**

---

## ⚡ TAGESPLAN – Empfohlene Reihenfolge

```
TAG 1  (2-3h):  favicon + robots.txt + 404-Seite + Meta-Tags pro Seite
TAG 2  (3-4h):  Impressum + Datenschutz + AGB + Barrierefreiheitserklärung
TAG 3  (2-3h):  Cookie-Banner + Footer-Links auf alle Rechtsseiten
TAG 4  (1-2h):  Rate-Limiting Backend + MIME-Type-Check Upload
TAG 5  (4-6h):  Soft-Delete ins DB-Schema + Migration
TAG 6  (4-6h):  Passwort-Reset per E-Mail (nodemailer)
TAG 7  (2-3h):  HTTPS + nginx + Let's Encrypt Setup
TAG 8  (1h):    NODE_ENV=production + COOKIE_SECURE=true + morgan("combined")
DANACH:         Analytics, Skeleton-Loader, E-Mail-Verifizierung, Sentry
```

---

## 🔴 STUFE 1 – Launch-Blocker (vor Go-Live zwingend)

### ⚖️ Rechtliches – Deutschland (TMG, DSGVO, BFSG, TDDDG)

- [ ] **Impressum erstellen** (`/impressum`)
  - Pflicht nach §18 MStV / §5 TMG – Abmahnrisiko ab Tag 1, keine Gnadenfrist
  - **Pflichtinhalt:** Vollständiger Name + Anschrift (kein Postfach!), E-Mail-Adresse, ggf. Handelsregisternummer + Gericht (GmbH/UG), USt-ID falls vorhanden, Verantwortlicher für Inhalte nach §18 Abs. 2 MStV
  - Muss innerhalb von **2 Klicks** von jeder Seite erreichbar sein
  - Kein Kontaktformular als E-Mail-Ersatz – direkte E-Mail-Adresse Pflicht

- [ ] **Datenschutzerklärung erstellen** (`/datenschutz`)
  - DSGVO Art. 13/14 – Bußgeld bis **20 Mio. € oder 4% des Jahresumsatzes**
  - **Pflichtinhalt:** Verantwortlicher (Name + Adresse), Zweck der Datenverarbeitung, Rechtsgrundlage (Art. 6 DSGVO), Speicherdauer, Empfänger/Dritte, Nutzerrechte (Auskunft, Löschung, Widerspruch, Portabilität), Beschwerderecht bei Aufsichtsbehörde
  - **Was bei euch verarbeitet wird:** IP-Adressen (Serverlog), E-Mail + Name (Registrierung), Session-Cookies (JWT), Event-Views (Tracking), hochgeladene Bilder/Videos
  - **Speicherdauer konkret angeben:** z.B. "Accountdaten bis zur Löschung", "Serverlogs 7 Tage", "Cookies bis Session-Ende"
  - **Empfehlung:** Datenschutz-Generator von eRecht24 oder Datenschutz.org nutzen

- [ ] **Verarbeitungsverzeichnis (VVT) anlegen** – intern, nicht öffentlich
  - DSGVO Art. 30 – Pflicht für ALLE Unternehmen (keine Ausnahme für Kleine!)
  - Dokument das intern beschreibt: welche Daten, zu welchem Zweck, wie lange, wer hat Zugriff
  - Bußgeld bei Fehlen: bis zu 10 Mio. €
  - Vorlage: https://www.bfdi.bund.de/DE/Fachthemen/Inhalte/Allgemein/Verzeichnis-Verarbeitungstaetigkeiten.html

- [ ] **AGB erstellen** (`/agb`)
  - Dritte stellen Inhalte ein → Haftungsausschluss für Inhalte Dritter zwingend
  - **Pflichtinhalt:** Nutzungsbedingungen, Verantwortlichkeit für Inhalte, Sperrrecht für Accounts, Haftungsausschluss, anwendbares Recht (Deutschland), Gerichtsstand

- [ ] **Cookie-Banner / Consent-Manager implementieren**
  - Pflicht nach TDDDG (ehem. TTDSG) + DSGVO – gilt auch für technisch notwendige Cookies wenn Tracking stattfindet
  - **Technisch notwendige Cookies** (JWT Session) = keine Einwilligung nötig, aber Dokumentation in Datenschutzerklärung
  - **Tracking/Analytics** = Einwilligung zwingend vor dem Setzen
  - Empfehlung: `react-cookie-consent` für einfachen Banner, oder Klaro.js für vollständigen Consent-Manager
  - **Wichtig:** "Ablehnen"-Button muss genauso prominent wie "Akzeptieren" sein

- [ ] **Barrierefreiheitserklärung erstellen** (`/barrierefreiheit`)
  - Pflicht nach BFSG §14 seit 28. Juni 2025 – Bußgeld bis 100.000 €
  - Muss im Footer verlinkt sein
  - Inhalt: Beschreibung des Angebots, Konformitätsstand (WCAG 2.1 AA), bekannte Mängel + Zeitplan zur Behebung, Feedback-Kontakt, zuständige Marktüberwachungsbehörde

- [ ] **Footer-Links vollständig setzen**
  - Impressum, Datenschutz, AGB, Barrierefreiheit – von jeder Seite erreichbar
  - Aktuell: Footer-Links führen zu `href="#"` (leer) – sofort korrigieren

### 🔒 Sicherheit (OWASP Top 10 + Express Best Practices)

- [ ] **Rate-Limiting für Auth-Endpoints** – OWASP A07: Identification Failures
  - `/api/auth/login` + `/api/auth/register` offen für Brute-Force und Credential Stuffing
  - Package: `express-rate-limit` – Empfehlung: max. 5 Versuche/15min pro IP bei Login
  - Zusätzlich: `rate-limiter-flexible` für kombinierte IP + Username-Sperre (Express-Empfehlung)
  - Alle API-Endpunkte: generelles Limit z.B. 100 Requests/min pro IP

- [ ] **MIME-Type-Check beim Datei-Upload** – OWASP A03: Injection
  - Aktuell nur Dateiendung geprüft – angreifbar durch Umbenennung (z.B. `shell.php` → `shell.jpg`)
  - `file-type` Package für echten Magic-Bytes-Check verwenden
  - Zusätzlich: Uploads in separatem Verzeichnis außerhalb des Web-Roots speichern

- [ ] **Starkes JWT_SECRET in Produktion**
  - `.env.example` enthält `dev-secret-change-me` – muss vor Deployment ersetzt werden
  - Mindestens 64 zufällige Zeichen: `openssl rand -hex 64`
  - Secret niemals in Git committen – `.env` in `.gitignore` prüfen

- [ ] **`npm audit` ausführen und Vulnerabilities beheben**
  - Bekannte Sicherheitslücken in Dependencies prüfen: `npm audit --audit-level=high`
  - Regelmäßig wiederholen (monatlich)

- [ ] **Dependency-Versionen einfrieren**
  - `package-lock.json` committen – verhindert unerwartete Updates mit Sicherheitslücken
  - Keine `*` oder `latest` in package.json

- [ ] **Fehler-Details nicht an Client senden**
  - Aktuell: `res.status(500).json({ error: "Internal Server Error" })` – gut
  - Sicherstellen dass kein Stack-Trace oder DB-Fehler an den Client geht
  - `NODE_ENV=production` verhindert verbose Express-Fehler automatisch

- [ ] **Input-Validierung auf allen Endpunkten**
  - Zod-Validierung bereits bei Auth – auf ALLE Endpunkte ausweiten
  - Besonders: Event-Erstellung, Kommentare, Profil-Update

### 🗺️ SEO & Auffindbarkeit

- [ ] **Favicon + App-Icons hinzufügen**
  - `favicon.ico` (32x32), `favicon.svg`, `apple-touch-icon.png` (180x180)
  - Im `<head>` der `index.html` verlinken
  - Ohne Favicon: Browser-Tab leer, wirkt unprofessionell, schadet Vertrauen

- [ ] **`robots.txt` erstellen** (im `frontend`-Root, wird von Vite als statische Datei ausgeliefert)
  ```
  User-agent: *
  Allow: /
  Disallow: /admin
  Disallow: /dashboard
  Disallow: /api/
  Sitemap: https://deinedomain.de/sitemap.xml
  ```

- [ ] **`react-helmet-async` installieren + Meta-Tags pro Seite**
  - Aktuell: ALLE Seiten haben `<title>Local Events</title>` – Google-Ranking katastrophal
  - Jede Seite braucht: eindeutigen `<title>` (50-60 Zeichen), `<meta name="description">` (150-160 Zeichen)
  - Beispiel EventDetailPage: `"${event.title} – ${event.city} | LocalEvents"`
  - **Wichtig für React SPA:** `react-helmet-async` funktioniert für User-Navigation; für Social-Crawler (WhatsApp, Telegram) braucht ihr zusätzlich SSR oder einen Prerender-Service

- [ ] **Open Graph + Twitter Card Tags** (besonders wichtig für Event-Detailseiten)
  - `og:title`, `og:description`, `og:image` (Event-Bild), `og:url`, `og:type: "event"`
  - `twitter:card: "summary_large_image"`
  - Ohne OG-Tags: Links auf WhatsApp/Telegram/Instagram zeigen kein Vorschaubild – massive Conversion-Einbuße

- [ ] **Strukturierte Daten (JSON-LD Schema.org `Event`)** auf Event-Detailseiten
  - Google zeigt dann Rich Snippets in Suchergebnissen (Datum, Ort, Preis direkt sichtbar)
  - Erhöht Click-Through-Rate massiv
  - Beispiel: `{ "@type": "Event", "name": "...", "startDate": "...", "location": {...} }`

- [ ] **`sitemap.xml` dynamisch generieren** (Backend-Route)
  - Backend-Route `/sitemap.xml` die alle Events + Städte + Communities aus DB liest
  - Google findet Event-Seiten sonst nicht (SPA = kein Crawling ohne Sitemap)
  - Bei Google Search Console einreichen nach Go-Live

- [ ] **`manifest.json`** für PWA / "Zur Startseite hinzufügen" auf Mobile
  - Name, Icons, Theme-Color, Display-Mode

### 🖥️ UX – Nutzer können Seite nicht richtig benutzen

- [ ] **404-Seite erstellen** (eigene Komponente statt stiller Weiterleitung)
  - Aktuell: `path="*"` leitet still zu `/` weiter – Nutzer ist verwirrt, denkt Seite ist kaputt
  - Eigene 404-Seite mit: klarer Fehlermeldung, Link zur Startseite, Suchfeld

- [ ] **Passwort-Reset per E-Mail implementieren**
  - Nutzer die Passwort vergessen sind dauerhaft ausgesperrt – Support-Aufwand und Vertrauensverlust
  - Benötigt: `nodemailer` + SMTP (z.B. Resend.com, Mailgun, oder eigener SMTP)
  - DB: `passwordResetToken String?` + `passwordResetExpiry DateTime?` auf User-Modell
  - Flow: E-Mail eingeben → Token generieren → Link per Mail → Token prüfen → neues Passwort setzen

---

## 🟡 STUFE 2 – Sollte vor Launch vorhanden sein

### 🖥️ UX & Benutzerfreundlichkeit

- [ ] **Skeleton-Loader statt leerer Seiten**
  - Seiten erscheinen komplett leer bis die API antwortet – wirkt kaputt
  - Besonders kritisch: Homepage, Events-Seite, Event-Detailseite
  - Einfache Tailwind-Lösung: `animate-pulse` auf Platzhalter-Divs

- [ ] **Besserer Lade-State in `RequireAuth`**
  - Aktuell: `<div className="p-6">Lade…</div>` – kein Spinner, sieht kaputt aus
  - Ersetzen durch zentrierten Spinner oder Skeleton

- [ ] **Nach Login: Redirect zurück zur ursprünglichen Seite**
  - Nutzer geht auf `/favorites` → wird zu Login weitergeleitet → nach Login landet er auf `/` statt `/favorites`
  - Lösung: `location.state = { from: location.pathname }` speichern + nach Login dorthin navigieren

- [ ] **"Ähnliche Events" auf Event-Detailseite**
  - Nutzer verlässt die Seite nach einem Event – kein weiteres Engagement, kein Retention
  - Backend: Events gleicher Kategorie + Stadt, sortiert nach Datum

- [ ] **Datumsfilter** ("Heute", "Dieses Wochenende", "Diese Woche") auf Events-Seite
  - Häufigste Nutzeranfrage bei Event-Plattformen laut UX-Studien
  - Schnellfilter-Buttons oben auf der Events-Seite

- [ ] **"Event melden"-Button** auf Event-Detailseite
  - Nutzer können Spam/falsche/illegale Events nicht melden
  - Einfaches Modal: Grund auswählen (Spam, Falsche Infos, Unangemessen) + Absenden
  - Backend: `reportCount` auf Event erhöhen, Admin-Benachrichtigung

- [ ] **Kontaktformular / Support-Kanal** (`/kontakt`)
  - Aktuell kein Weg für Nutzer, Probleme zu melden
  - Einfaches Formular: Name, E-Mail, Nachricht → sendet E-Mail an Support

### 🔧 Technisch / Infrastruktur

- [ ] **HTTPS + nginx Reverse Proxy + Let's Encrypt**
  - Ohne HTTPS: Browser zeigt "Nicht sicher", Google-Ranking schlechter, Cookies unsicher
  - Setup: nginx-Container in docker-compose + certbot für automatische SSL-Erneuerung
  - Danach: `COOKIE_SECURE=true` in `.env` setzen
  - Empfehlung: `docker-compose` mit nginx + certbot Container (fertiges Setup auf GitHub verfügbar)

- [ ] **`NODE_ENV=production` in docker-compose.yml setzen**
  - Aktuell: `NODE_ENV: development` → Express gibt verbose Fehler aus, Performance schlechter
  - Ändern in: `NODE_ENV: production`

- [ ] **`morgan("dev")` → `morgan("combined")` in `server.ts`**
  - `"dev"` ist für Entwicklung – bunt, verbose, nicht für Logs geeignet
  - `"combined"` = Apache-Standard-Format, gut für Log-Analyse

- [ ] **`COOKIE_SECURE=true` nach HTTPS-Setup**
  - Aktuell `false` – Cookies werden auch über HTTP gesendet (unsicher)
  - Erst nach HTTPS-Setup aktivieren

- [ ] **Docker-Container Health-Checks verfeinern**
  - Aktuell: Health-Check vorhanden – sicherstellen dass Backend wirklich bereit ist bevor Frontend startet

- [ ] **Produktions-`.env` sicher verwalten**
  - Niemals `.env` in Git committen – `.gitignore` prüfen
  - Empfehlung: `.env.production.example` mit Platzhaltern committen, echte Werte nur auf Server

---

## 🟠 STUFE 3 – Qualität & Wachstum (nach Launch)

### 📊 Analytics & Monitoring

- [ ] **Analytics einbauen**
  - **Empfehlung: Plausible Analytics** (DSGVO-konform, kein Cookie-Banner nötig, selbst-hostbar)
  - Alternative: Google Analytics 4 (dann Cookie-Banner + Einwilligung zwingend, US-Datentransfer problematisch)
  - Ohne Analytics: keine Ahnung was Nutzer tun, welche Seiten gut/schlecht performen, woher Traffic kommt

- [ ] **Error-Tracking: Sentry.io**
  - Fehler im Frontend + Backend werden aktuell nicht bemerkt
  - Kostenloser Plan reicht für den Start
  - Frontend: `@sentry/react`, Backend: `@sentry/node`
  - Benachrichtigung bei neuen Fehlern per E-Mail

- [ ] **DB-Backup automatisieren** – KRITISCH für Datensicherheit
  - `db_data` Docker-Volume existiert, aber kein automatisches Backup
  - Lösung: Separater Backup-Container mit `kartoza/docker-pg-backup` oder eigener Cron-Script
  - Empfehlung: Täglich `pg_dump` + Upload zu Backblaze B2 oder AWS S3 (günstig)
  - Backup-Rotation: 7 Tage täglich, 4 Wochen wöchentlich, 12 Monate monatlich
  - **Restore-Test** regelmäßig durchführen – ein Backup das man nicht wiederherstellen kann ist wertlos

- [ ] **Uptime-Monitoring**
  - Benachrichtigung wenn Server down ist
  - Kostenlos: UptimeRobot (5-Minuten-Intervall, E-Mail-Alert)
  - Alternativ: Better Uptime, Freshping

### 🔐 Auth & Account-Sicherheit

- [ ] **E-Mail-Verifizierung bei Registrierung**
  - Aktuell: Jeder kann sich mit beliebiger E-Mail registrieren und sofort Events einstellen
  - Verhindert Spam-Accounts, Fake-Events, Missbrauch
  - DB: `emailVerified Boolean @default(false)` + `emailVerifyToken String?` auf User-Modell
  - Flow: Registrierung → Verifikations-E-Mail → Token-Link → Account aktiviert

- [ ] **Account-Löschung für Nutzer ermöglichen**
  - DSGVO Art. 17 – Recht auf Löschung ("Recht auf Vergessenwerden")
  - Nutzer muss seinen Account selbst löschen können
  - Aktuell: Kein Self-Service-Löschung vorhanden
  - Mit Soft-Delete: Account deaktivieren + E-Mail anonymisieren

- [ ] **Veranstalter-Onboarding nach Registrierung**
  - Neuer Partner weiß nicht wie er ein Event erstellt
  - Kurze Schritt-für-Schritt-Anleitung (Modal oder eigene Seite) nach erster Registrierung

### 📄 Content & Vertrauen

- [ ] **"Über uns"-Seite** (`/ueber-uns`)
  - Nutzer vertrauen Plattformen ohne Hintergrundinfo deutlich weniger
  - Inhalt: Wer steckt dahinter, Mission, Gründungsjahr, Team

- [ ] **FAQ-Seite** (`/faq`)
  - Häufige Fragen: Wie erstelle ich ein Event? Ist es kostenlos? Wer kann Events einstellen? Wie melde ich ein Problem?

- [ ] **Social-Media-Profile anlegen + Footer-Links korrigieren**
  - Footer-Links führen aktuell zu `href="#"` (leer) – sofort korrigieren oder entfernen
  - Toter Link wirkt unprofessioneller als gar kein Link

- [x] **"Get App"-Button → `/app` Coming-Soon-Seite** ✅
  - Footer-Links führen jetzt auf `/app` mit vollständig designter App-Seite + Waitlist

### 📱 App-Seite & Waitlist

- [x] **`/app` – Coming-Soon-Seite erstellt** ✅
  - Vollständig designte App-Seite mit Phone-Mockup, Feature-Grid, E-Mail-Waitlist
  - Footer-Links "App Store" / "Google Play" führen jetzt auf `/app` statt `#get-app`
  - Waitlist-Formular sammelt E-Mails (aktuell nur Frontend – Backend-Anbindung noch nötig)

- [ ] **Waitlist-E-Mails im Backend speichern**
  - Aktuell: Formular gibt nur visuelles Feedback, E-Mail wird nicht gespeichert
  - Lösung: `POST /api/waitlist` Endpoint + `WaitlistEntry`-Modell in Prisma
  - Optional: Bestätigungs-E-Mail per nodemailer

### 🔑 Google OAuth / "Mit Google anmelden"

> **Kurze Antwort: JA, die Datenbank muss angepasst werden.**

#### Was Google OAuth bedeutet
- Nutzer klickt "Mit Google anmelden" → wird zu Google weitergeleitet → Google gibt `access_token` + Profildaten zurück → Backend prüft Token, erstellt/findet User, gibt JWT-Cookie aus
- Kein Passwort nötig, keine E-Mail-Verifizierung nötig (Google hat das bereits getan)

#### Notwendige DB-Änderungen (Prisma Schema)

- [ ] **`passwordHash` optional machen** – OAuth-User haben kein Passwort
  ```prisma
  model User {
    passwordHash String?   // war: String – jetzt optional für OAuth-User
  }
  ```

- [ ] **`Account`-Modell für OAuth-Provider hinzufügen**
  ```prisma
  model Account {
    id                String  @id @default(cuid())
    userId            String
    provider          String  // "google", "apple", "local"
    providerAccountId String  // Google User-ID (sub)
    accessToken       String?
    refreshToken      String?
    expiresAt         Int?
    user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
    @@unique([provider, providerAccountId])
  }
  ```
  - Ermöglicht: Ein User kann sich mit Google UND E-Mail/Passwort anmelden
  - Ermöglicht: Später Apple, GitHub, etc. ohne Schema-Änderung hinzufügen

- [ ] **`emailVerified Boolean` auf User** – Google-User sind automatisch verifiziert
  ```prisma
  model User {
    emailVerified Boolean @default(false)
  }
  ```

#### Notwendige Backend-Änderungen

- [ ] **Google OAuth Credentials anlegen**
  - Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID
  - Authorized redirect URIs: `https://deinedomain.de/api/auth/google/callback`
  - `.env`: `GOOGLE_CLIENT_ID=...` + `GOOGLE_CLIENT_SECRET=...`

- [ ] **Backend-Packages installieren**
  - Option A (empfohlen): `passport` + `passport-google-oauth20` + `@types/passport-google-oauth20`
  - Option B (ohne Passport): `google-auth-library` für Token-Verifizierung

- [ ] **OAuth-Flow implementieren** (2 Endpunkte)
  ```
  GET /api/auth/google          → Redirect zu Google
  GET /api/auth/google/callback → Google redirectet zurück, Token verarbeiten
  ```
  - Bei Callback: Google-Profil prüfen → User in DB suchen (per `providerAccountId`) → falls nicht vorhanden: neuen User erstellen → JWT-Cookie setzen → Redirect zu Frontend

- [ ] **Account-Verknüpfung behandeln**
  - Szenario: User hat sich mit E-Mail registriert, meldet sich dann mit Google an (gleiche E-Mail)
  - Lösung: Bei gleichem E-Mail → bestehenden Account mit Google verknüpfen (neuen `Account`-Eintrag erstellen)
  - Alternativ: Fehlermeldung "E-Mail bereits registriert – bitte mit Passwort anmelden"

#### Notwendige Frontend-Änderungen

- [ ] **"Mit Google anmelden"-Button** im Login/Register-Modal
  - Einfacher `<a href="/api/auth/google">` Link – kein AJAX (OAuth braucht echten Redirect)
  - Google-Button Design: weißer Button mit Google-Logo (offizielle Google-Branding-Guidelines beachten!)

#### DSGVO-Hinweis zu Google OAuth
- Google ist US-Unternehmen → Datentransfer in die USA
- Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) – Nutzer muss aktiv "Mit Google anmelden" klicken
- In Datenschutzerklärung dokumentieren: Google als Drittanbieter, Datenübertragung USA, Google Privacy Policy verlinken
- **Standard Contractual Clauses (SCC)** sind seit 2021 die Rechtsgrundlage für US-Transfers – Google hat diese unterzeichnet

#### Aufwand-Einschätzung
| Schritt | Aufwand |
|---|---|
| DB-Migration (Schema-Änderungen) | ~1h |
| Backend OAuth-Flow (Passport.js) | ~3-4h |
| Frontend-Button + Redirect-Handling | ~1h |
| Account-Verknüpfung + Edge Cases | ~2h |
| DSGVO-Dokumentation | ~30min |
| **Gesamt** | **~8-10h** |

### 🌐 NIS2 – Hinweis (ab 50 Mitarbeiter + 10 Mio. € Umsatz relevant)

> **Aktuell noch nicht betroffen** – NIS2 gilt erst ab mittleren Unternehmen (≥50 MA oder ≥10 Mio. € Umsatz). Sobald ihr diese Schwelle erreicht, gelten folgende Pflichten:
- Registrierung beim BSI (Frist: März 2026 für bereits betroffene)
- Strukturiertes Risikomanagement für IT-Sicherheit
- Incident-Response-Konzept + Meldepflicht bei Sicherheitsvorfällen
- Dokumentierte Sicherheitsmaßnahmen

---

## 🗄️ DATENBANK-ANALYSE (Prisma / PostgreSQL)

> **Grundsatz: Ein User darf NIEMALS gezwungen sein, sich neu zu registrieren. Datenverlust = Insolvenzrisiko.**

### ✅ Was bereits gut ist
- `User.id` = CUID – kollisionssicher, nicht erratbar, kein Auto-Increment (besser als Integer-IDs)
- `email @unique` – kein doppelter Account möglich
- `@@unique([userId, eventId])` bei Favorites/Attendees – kein Duplicate-Spam
- Indexes auf allen wichtigen Feldern (category, startsAt, city, userId, eventId)
- `createdAt/updatedAt` auf allen Modellen vorhanden
- 40+ EventCategory Enums – sehr vollständig
- Relationen korrekt mit FK definiert

### 🔴 KRITISCH – Datenverlust-Risiko (sofort angehen)

- [ ] **Kein Soft-Delete** – Gelöschte User/Events sind unwiederbringlich weg
  - `onDelete: Cascade` bei `User → Events` bedeutet: Admin löscht versehentlich einen User → ALLE seine Events sofort weg, keine Wiederherstellung möglich
  - **Lösung Schema:**
    ```prisma
    model User {
      deletedAt DateTime?   // null = aktiv, Datum = gelöscht
    }
    model Event {
      deletedAt DateTime?
    }
    ```
  - Alle Queries: `where: { deletedAt: null }` ergänzen
  - `onDelete: Cascade` bei User→Events auf `onDelete: SetNull` oder `Restrict` ändern

- [ ] **Kein Passwort-Reset-Token im Schema**
  - Nutzer die Passwort vergessen sind dauerhaft ausgesperrt
  - **Lösung:**
    ```prisma
    model User {
      passwordResetToken  String?   @unique
      passwordResetExpiry DateTime?
    }
    ```

- [ ] **Keine E-Mail-Verifizierung im Schema**
  - Jeder kann sich mit beliebiger E-Mail registrieren
  - **Lösung:**
    ```prisma
    model User {
      emailVerified     Boolean  @default(false)
      emailVerifyToken  String?  @unique
    }
    ```

### 🟡 Zukunftssicherheit – Jetzt günstig, später teuer (Migration früh = einfach)

- [ ] **`passwordHash` direkt im User** – schwer erweiterbar für OAuth (Google/Apple Login)
  - Empfehlung: Separates `Account`-Modell für Multi-Provider vorbereiten
  ```prisma
  model Account {
    id           String @id @default(cuid())
    userId       String
    provider     String  // "local", "google", "apple"
    providerAccountId String?
    passwordHash String?
    user         User   @relation(fields: [userId], references: [id], onDelete: Cascade)
    @@unique([provider, userId])
  }
  ```

- [ ] **`isAdmin/isPartner` als Boolean** – nicht skalierbar für mehr Rollen
  - Lösung: `UserRole` Enum (USER, PARTNER, MODERATOR, ADMIN) + Migration

- [ ] **`price` als `String`** – nicht filterbar/sortierbar nach Preis
  - Lösung: `priceMin Float?` + `priceMax Float?` zusätzlich zum bestehenden String-Feld

- [ ] **Keine `publishedAt`** – Events sind sofort live, kein Entwurfsmodus, kein Scheduling
  - Lösung: `publishedAt DateTime?` (null = Entwurf, Datum in Zukunft = geplant)

- [ ] **Kein `slug` auf Event** – URLs `/events/clxyz123` nicht SEO-freundlich
  - Lösung: `slug String @unique` generiert aus Titel + Datum (slugify)

- [ ] **`EventView` ohne Session-Referenz** – View-Inflation möglich
  - Lösung: `sessionId String?` (anonymes Tracking ohne Login)

- [ ] **`reportCount` fehlt** – kein Mechanismus für gemeldete Events
  - Lösung: `reportCount Int @default(0)` auf Event

- [ ] **`CommunityInviteCode.createdById`** – kein FK auf User, Referenz-Integrität fehlt
  - Lösung: `createdBy User @relation(fields: [createdById], references: [id])` hinzufügen

### 🟢 Kleinere Verbesserungen
- `community String?` auf Event ist redundant zu `communityId` – Feld bereinigen
- `tags String[]` funktioniert, aber kein `Tag`-Modell für Autocomplete/Statistiken
- Prisma Migrations-History in Git committen – ermöglicht sauberes Rollback in Produktion

---

## ♿ BARRIEREFREIHEIT – BFSG (Rechtslage Deutschland)

### Rechtliche Einordnung

**Das BFSG (Barrierefreiheitsstärkungsgesetz) gilt seit 28. Juni 2025** – umsetzt die EU-Richtlinie 2019/882 (European Accessibility Act) in deutsches Recht.

**Betroffen:** Alle Unternehmen die digitale Dienstleistungen an Verbraucher anbieten – also Plattformen mit Registrierung, Buchung, Ticketkauf.

**Ausnahme NUR für echte Kleinstunternehmen:** < 10 Mitarbeiter UND < 2 Mio. € Jahresumsatz/Bilanzsumme. Sobald eine Schwelle überschritten wird – greift das Gesetz.

**Sanktionen:** Bis zu **100.000 € Bußgeld** + Marktüberwachungsbehörde kann Dienst vom Markt nehmen.

**Technischer Standard:** EN 301 549 = basiert auf **WCAG 2.1 Level AA**

### Was konkret umzusetzen ist

- [ ] **Barrierefreiheitserklärung veröffentlichen** (`/barrierefreiheit`) – SOFORT
  - Pflichtdokument nach BFSG §14 – schützt rechtlich auch wenn noch nicht alles technisch umgesetzt
  - Muss im Footer verlinkt sein und selbst barrierefrei sein
  - **Pflichtinhalt:** Beschreibung des Angebots, Konformitätsstand (WCAG 2.1 AA), bekannte Mängel + geplanter Behebungszeitraum, Feedback-Kontakt (E-Mail), zuständige Marktüberwachungsbehörde
  - Vorlage: https://www.bundesfachstelle-barrierefreiheit.de

- [ ] **Alt-Texte für alle Bilder** – beschreibend, nicht nur Dateiname
  - Aktuell: `alt={ev.title}` – besser: `alt="${ev.title} – Veranstaltung am ${date} in ${city}"`
  - Dekorative Bilder: `alt=""` (leerer String, nicht weglassen!)

- [ ] **Tastatur-Navigation vollständig** – alle Funktionen ohne Maus bedienbar
  - Modals: per `Escape` schließbar, Fokus-Trap innerhalb des Modals
  - Dropdowns: per `Tab`/`Enter`/`Arrow Keys` bedienbar
  - Suchfeld, Filter, Buttons: alle per `Tab` erreichbar

- [ ] **Sichtbare Fokus-Indikatoren** – aktuell `outline-none` in Input-Klassen
  - Pflicht: Sichtbarer Fokusring für ALLE interaktiven Elemente
  - Tailwind: `focus-visible:ring-2 focus-visible:ring-accent-400` statt `outline-none`

- [ ] **Farbkontraste** – Minimum 4.5:1 für normalen Text (WCAG AA)
  - `text-surface-400` auf `bg-surface-950` prüfen
  - Tool: https://webaim.org/resources/contrastchecker/
  - Besonders: Placeholder-Text, deaktivierte Buttons, sekundäre Labels

- [ ] **ARIA-Labels auf Icon-Buttons** – Buttons ohne sichtbaren Text
  - Hamburger-Menü: `aria-label="Menü öffnen"`
  - Favoriten-Button: `aria-label="Zu Favoriten hinzufügen"`
  - Schließen-Button: `aria-label="Schließen"`
  - Video-Toggle: `aria-label="Video abspielen/pausieren"`

- [ ] **Semantisches HTML + Landmark-Rollen**
  - `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>` korrekt einsetzen
  - Screenreader nutzen diese für Navigation

- [ ] **Nur eine `<h1>` pro Seite** – logische H2-H6 Hierarchie
  - Aktuell: Hero-Section und Section-Headers könnten beide `h1` sein

- [ ] **Formular-Labels korrekt verknüpft**
  - Jedes `<input>` braucht ein `<label htmlFor="inputId">`
  - Oder `aria-label` / `aria-labelledby` als Alternative

- [ ] **Skalierbare Schriftgrößen** – Text bei 200% Browser-Zoom noch lesbar
  - Feste `px`-Werte in Tailwind können problematisch sein → `rem` bevorzugen wo möglich

### Empfohlene Umsetzungsreihenfolge
1. **Sofort (1h):** Barrierefreiheitserklärung veröffentlichen → rechtlich abgesichert
2. **Kurzfristig (1-2 Tage):** ARIA-Labels + Alt-Texte + Fokus-Indikatoren
3. **Mittelfristig:** Tastatur-Navigation + Farbkontraste + Semantisches HTML
4. **Langfristig:** Vollständiger WCAG 2.1 AA Audit mit [axe DevTools](https://www.deque.com/axe/) oder [WAVE](https://wave.webaim.org/)

---

## 📋 AUFWANDS-ÜBERSICHT

| Aufwand | Aufgabe |
|---|---|
| 🟢 Klein (< 1h) | favicon, robots.txt, Footer-Links korrigieren, NODE_ENV, morgan, Barrierefreiheitserklärung |
| 🟡 Mittel (1-4h) | Impressum/Datenschutz/AGB, 404-Seite, Cookie-Banner, Rate-Limiting, Meta-Tags, ARIA-Labels |
| 🔴 Groß (> 4h) | Soft-Delete Migration, Passwort-Reset (E-Mail), HTTPS/nginx, Sitemap, Analytics, E-Mail-Verifizierung |

---

*Letzte Aktualisierung: Februar 2026 | Quellen: DSGVO, BFSG, TMG/MStV, TDDDG, OWASP, Express Security Best Practices, PostgreSQL Best Practices, NIS2UmsuCG*

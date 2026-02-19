export function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white">Datenschutzerklärung</h1>
      <p className="mt-2 text-sm text-surface-500">Gemäß DSGVO Art. 13/14 – Stand: {new Date().getFullYear()}</p>

      <div className="mt-10 space-y-8 text-surface-300">

        <section>
          <h2 className="text-lg font-semibold text-white">1. Verantwortlicher</h2>
          <div className="mt-3 text-sm">
            <p className="font-medium text-amber-400">⚠️ TODO: Eigene Daten eintragen</p>
            <p className="mt-1">Vorname Nachname / Firmenname</p>
            <p>Straße Hausnummer, PLZ Ort</p>
            <p>E-Mail: <a href="mailto:datenschutz@example.com" className="text-accent-400 hover:underline">datenschutz@example.com</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">2. Welche Daten wir verarbeiten</h2>
          <div className="mt-3 space-y-3 text-sm text-surface-400">
            <div>
              <p className="font-medium text-surface-200">Bei Registrierung:</p>
              <p>E-Mail-Adresse, Name, Passwort (verschlüsselt gespeichert). Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>
            </div>
            <div>
              <p className="font-medium text-surface-200">Bei Nutzung der Website:</p>
              <p>IP-Adresse, Browsertyp, Betriebssystem, Datum/Uhrzeit des Zugriffs (Serverlogs). Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Sicherheit und Betrieb).</p>
            </div>
            <div>
              <p className="font-medium text-surface-200">Bei Event-Erstellung:</p>
              <p>Event-Titel, Beschreibung, Bilder/Videos, Ort, Datum. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>
            </div>
            <div>
              <p className="font-medium text-surface-200">Session-Cookies (JWT):</p>
              <p>Technisch notwendige Cookies zur Authentifizierung. Keine Einwilligung erforderlich (§ 25 Abs. 2 TDDDG). Laufzeit: 7 Tage.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">3. Speicherdauer</h2>
          <div className="mt-3 text-sm text-surface-400">
            <ul className="space-y-1 list-disc list-inside">
              <li>Accountdaten: bis zur Löschung des Accounts</li>
              <li>Serverlogs (IP-Adressen): 7 Tage</li>
              <li>Session-Cookies: 7 Tage oder bis zum Logout</li>
              <li>Hochgeladene Bilder/Videos: bis zur Löschung des Events oder Accounts</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">4. Weitergabe an Dritte</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>Wir geben deine Daten nicht an Dritte weiter, außer:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Hosting-Anbieter (Auftragsverarbeitung gemäß Art. 28 DSGVO)</li>
              <li>Wenn gesetzlich verpflichtet (z.B. Behörden)</li>
            </ul>
            <p className="mt-3 font-medium text-amber-400">⚠️ TODO: Falls ihr Analytics (z.B. Plausible) oder andere Dienste nutzt, hier ergänzen.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">5. Deine Rechte (DSGVO Art. 15–22)</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>Du hast folgende Rechte bezüglich deiner personenbezogenen Daten:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li><span className="text-surface-200">Auskunft</span> (Art. 15) – welche Daten wir über dich speichern</li>
              <li><span className="text-surface-200">Berichtigung</span> (Art. 16) – Korrektur falscher Daten</li>
              <li><span className="text-surface-200">Löschung</span> (Art. 17) – "Recht auf Vergessenwerden"</li>
              <li><span className="text-surface-200">Einschränkung</span> (Art. 18) – Verarbeitung einschränken</li>
              <li><span className="text-surface-200">Datenübertragbarkeit</span> (Art. 20) – Daten in maschinenlesbarem Format</li>
              <li><span className="text-surface-200">Widerspruch</span> (Art. 21) – gegen Verarbeitung auf Basis berechtigter Interessen</li>
            </ul>
            <p className="mt-3">
              Zur Ausübung deiner Rechte wende dich an:{" "}
              <a href="mailto:datenschutz@example.com" className="text-accent-400 hover:underline">datenschutz@example.com</a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">6. Beschwerderecht</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
              Die zuständige Behörde richtet sich nach deinem Wohnort. Eine Liste aller deutschen
              Aufsichtsbehörden findest du unter:{" "}
              <a
                href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-400 hover:underline"
              >
                bfdi.bund.de
              </a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">7. Datensicherheit</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um deine Daten
              gegen Manipulation, Verlust oder unberechtigten Zugriff zu schützen. Dazu gehören
              verschlüsselte Passwörter (bcrypt), HTTPS-Übertragung und HttpOnly-Cookies.
            </p>
          </div>
        </section>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300">
          <p className="font-semibold">⚠️ Hinweis für Entwickler</p>
          <p className="mt-1 text-amber-400/80">
            Platzhalter (TODO) vor Go-Live ersetzen. Empfehlung: Datenschutz-Generator von
            eRecht24 oder Datenschutz.org für eine rechtssichere, vollständige Version nutzen.
            Bußgeld bei Fehlen: bis zu 20 Mio. € oder 4 % des Jahresumsatzes (DSGVO Art. 83).
          </p>
        </div>

      </div>
    </div>
  );
}

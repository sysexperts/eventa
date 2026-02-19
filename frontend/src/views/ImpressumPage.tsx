export function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white">Impressum</h1>
      <p className="mt-2 text-sm text-surface-500">Angaben gemäß § 5 TMG / § 18 MStV</p>

      <div className="mt-10 space-y-8 text-surface-300">

        <section>
          <h2 className="text-lg font-semibold text-white">Anbieter</h2>
          <div className="mt-3 space-y-1 text-sm">
            {/* TODO: Vollständigen Namen eintragen */}
            <p className="font-medium text-amber-400">⚠️ Bitte ausfüllen:</p>
            <p>Vorname Nachname / Firmenname</p>
            <p>Straße Hausnummer</p>
            <p>PLZ Ort</p>
            <p>Deutschland</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Kontakt</h2>
          <div className="mt-3 space-y-1 text-sm">
            {/* TODO: E-Mail-Adresse eintragen – Pflicht, kein Kontaktformular als Ersatz */}
            <p>E-Mail: <a href="mailto:kontakt@example.com" className="text-accent-400 hover:underline">kontakt@example.com</a></p>
            {/* Optional: Telefon */}
            {/* <p>Telefon: +49 ...</p> */}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Handelsregister</h2>
          <div className="mt-3 space-y-1 text-sm">
            {/* TODO: Nur ausfüllen wenn GmbH/UG/AG – bei Einzelperson weglassen */}
            <p className="text-surface-500 italic">Nur bei eingetragenen Unternehmen (GmbH, UG, AG etc.):</p>
            <p>Registergericht: Amtsgericht ...</p>
            <p>Registernummer: HRB ...</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Umsatzsteuer-ID</h2>
          <div className="mt-3 text-sm">
            {/* TODO: USt-ID eintragen falls vorhanden */}
            <p className="text-surface-500 italic">Falls vorhanden:</p>
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE...</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Verantwortlich für den Inhalt</h2>
          <div className="mt-3 text-sm">
            {/* TODO: Gemäß § 18 Abs. 2 MStV – Person die inhaltlich verantwortlich ist */}
            <p>Vorname Nachname</p>
            <p>Adresse wie oben</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Streitschlichtung</h2>
          <div className="mt-3 space-y-2 text-sm text-surface-400">
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:underline">
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Haftung für Inhalte</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </div>
        </section>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300">
          <p className="font-semibold">⚠️ Hinweis für Entwickler</p>
          <p className="mt-1 text-amber-400/80">
            Diese Seite enthält Platzhalter (markiert mit TODO). Bitte alle Platzhalter vor dem Go-Live mit echten
            Daten ersetzen. Das Impressum ist ab Tag 1 Pflicht (§ 5 TMG / § 18 MStV) – Abmahnrisiko!
          </p>
        </div>

      </div>
    </div>
  );
}

export function BarrierefreiheitPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white">Erklärung zur Barrierefreiheit</h1>
      <p className="mt-2 text-sm text-surface-500">
        Gemäß § 14 BFSG (Barrierefreiheitsstärkungsgesetz) – Stand: {new Date().getFullYear()}
      </p>

      <div className="mt-10 space-y-8 text-surface-300">

        <section>
          <h2 className="text-lg font-semibold text-white">Über dieses Angebot</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              LocalEvents ist eine Plattform zur Entdeckung und Veröffentlichung lokaler Veranstaltungen.
              Nutzer können Events suchen, filtern, speichern und selbst erstellen.
            </p>
            <p className="mt-2 font-medium text-amber-400">⚠️ TODO: Betreiberdaten eintragen</p>
            <p>Betrieben von: Vorname Nachname / Firmenname, Straße, PLZ Ort</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Konformitätsstand</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Diese Website ist <strong className="text-surface-200">teilweise konform</strong> mit den
              Anforderungen der EN 301 549 (basierend auf WCAG 2.1 Level AA).
            </p>
            <p className="mt-2">
              Wir arbeiten aktiv daran, die Barrierefreiheit kontinuierlich zu verbessern.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Bekannte Mängel</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>Folgende Bereiche erfüllen die Anforderungen noch nicht vollständig:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>
                <span className="text-surface-200">Fokus-Indikatoren:</span> Einige interaktive Elemente
                haben keinen sichtbaren Fokusring. Geplante Behebung: Q2 {new Date().getFullYear()}.
              </li>
              <li>
                <span className="text-surface-200">ARIA-Labels:</span> Einige Icon-Buttons haben noch
                keine beschreibenden ARIA-Labels. Geplante Behebung: Q2 {new Date().getFullYear()}.
              </li>
              <li>
                <span className="text-surface-200">Farbkontraste:</span> Einzelne sekundäre Textelemente
                erreichen noch nicht das Mindestverhältnis von 4,5:1. Geplante Behebung: Q3 {new Date().getFullYear()}.
              </li>
              <li>
                <span className="text-surface-200">Tastatur-Navigation:</span> Einige Modals und Dropdowns
                sind noch nicht vollständig per Tastatur bedienbar. Geplante Behebung: Q3 {new Date().getFullYear()}.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Feedback und Kontakt</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Wenn du Barrieren auf unserer Website feststellst oder Hilfe benötigst, kontaktiere uns:
            </p>
            <div className="mt-3 space-y-1">
              <p className="font-medium text-amber-400">⚠️ TODO: Kontaktdaten eintragen</p>
              <p>
                E-Mail:{" "}
                <a href="mailto:barrierefreiheit@example.com" className="text-accent-400 hover:underline">
                  barrierefreiheit@example.com
                </a>
              </p>
              <p>Wir bemühen uns, innerhalb von 5 Werktagen zu antworten.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Durchsetzungsverfahren</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Wenn du auf unsere Rückmeldung nicht zufriedenstellend reagiert hast, kannst du dich an
              die zuständige Marktüberwachungsbehörde wenden:
            </p>
            <div className="mt-3 space-y-1">
              <p className="font-medium text-amber-400">⚠️ TODO: Zuständige Behörde je nach Bundesland eintragen</p>
              <p>
                Informationen zu den zuständigen Marktüberwachungsbehörden:{" "}
                <a
                  href="https://www.bfdi.bund.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-400 hover:underline"
                >
                  bfdi.bund.de
                </a>
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Technische Spezifikationen</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>Die Barrierefreiheit dieser Website basiert auf folgenden Technologien:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>HTML5 (semantische Elemente)</li>
              <li>CSS (TailwindCSS)</li>
              <li>JavaScript / React</li>
            </ul>
          </div>
        </section>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300">
          <p className="font-semibold">⚠️ Hinweis für Entwickler</p>
          <p className="mt-1 text-amber-400/80">
            Platzhalter (TODO) vor Go-Live ersetzen: Betreiberdaten, Kontakt-E-Mail,
            zuständige Marktüberwachungsbehörde (je nach Bundesland unterschiedlich).
            Das Veröffentlichen dieser Erklärung ist Pflicht nach BFSG § 14 – auch wenn
            noch nicht alle Anforderungen erfüllt sind.
          </p>
        </div>

      </div>
    </div>
  );
}

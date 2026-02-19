export function AgbPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-white">Allgemeine Geschäftsbedingungen (AGB)</h1>
      <p className="mt-2 text-sm text-surface-500">Stand: {new Date().getFullYear()}</p>

      <div className="mt-10 space-y-8 text-surface-300">

        <section>
          <h2 className="text-lg font-semibold text-white">§ 1 Geltungsbereich</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Plattform LocalEvents
              (nachfolgend „Plattform"), betrieben von:
            </p>
            <p className="mt-2 font-medium text-amber-400">⚠️ TODO: Betreiberdaten eintragen</p>
            <p>Vorname Nachname / Firmenname, Straße, PLZ Ort</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">§ 2 Leistungsbeschreibung</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              LocalEvents ist eine Plattform zur Veröffentlichung und Entdeckung lokaler Veranstaltungen.
              Registrierte Nutzer können Events erstellen, bearbeiten und verwalten. Die Nutzung der
              Plattform ist kostenlos.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">§ 3 Registrierung und Account</h2>
          <div className="mt-3 space-y-2 text-sm text-surface-400">
            <p>
              Für die Erstellung von Events ist eine Registrierung erforderlich. Der Nutzer verpflichtet
              sich, wahrheitsgemäße Angaben zu machen und diese aktuell zu halten.
            </p>
            <p>
              Die Weitergabe von Zugangsdaten an Dritte ist nicht gestattet. Der Nutzer ist für alle
              Aktivitäten unter seinem Account verantwortlich.
            </p>
            <p>
              Wir behalten uns das Recht vor, Accounts ohne Angabe von Gründen zu sperren oder zu löschen,
              insbesondere bei Verstößen gegen diese AGB.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">§ 4 Pflichten der Nutzer / Verbotene Inhalte</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>Nutzer verpflichten sich, keine Inhalte zu veröffentlichen, die:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>gegen geltendes Recht verstoßen (insbesondere Strafrecht, Urheberrecht, Markenrecht)</li>
              <li>beleidigend, diskriminierend, rassistisch oder volksverhetzend sind</li>
              <li>Werbung für illegale Produkte oder Dienstleistungen enthalten</li>
              <li>falsche oder irreführende Informationen enthalten</li>
              <li>die Rechte Dritter verletzen</li>
              <li>Spam oder unerwünschte Werbung darstellen</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">§ 5 Haftung für Inhalte Dritter</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Die Plattform stellt lediglich die technische Infrastruktur zur Verfügung. Für die von
              Nutzern eingestellten Inhalte (Events, Beschreibungen, Bilder) übernehmen wir keine Haftung.
            </p>
            <p className="mt-2">
              Wir sind nicht verpflichtet, Inhalte proaktiv zu überwachen. Bei Kenntnis von
              rechtswidrigen Inhalten werden diese unverzüglich entfernt (§ 10 TMG).
            </p>
            <p className="mt-2">
              Nutzer können rechtswidrige Inhalte über den "Event melden"-Button oder per E-Mail melden.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">§ 6 Urheberrecht</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Nutzer, die Inhalte (Texte, Bilder, Videos) hochladen, versichern, dass sie über die
              erforderlichen Rechte verfügen und räumen der Plattform ein einfaches, nicht-exklusives
              Nutzungsrecht zur Darstellung dieser Inhalte ein.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">§ 7 Verfügbarkeit</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Wir bemühen uns um eine hohe Verfügbarkeit der Plattform, übernehmen jedoch keine Garantie
              für eine ununterbrochene Verfügbarkeit. Wartungsarbeiten werden nach Möglichkeit angekündigt.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">§ 8 Haftungsbeschränkung</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Wir haften nicht für Schäden, die durch die Nutzung oder Nichtnutzung der Plattform
              entstehen, soweit diese nicht auf vorsätzlichem oder grob fahrlässigem Verhalten beruhen.
              Die Haftung für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit
              bleibt unberührt.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">§ 9 Anwendbares Recht und Gerichtsstand</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist, soweit gesetzlich
              zulässig, der Sitz des Betreibers.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">§ 10 Änderungen der AGB</h2>
          <div className="mt-3 text-sm text-surface-400">
            <p>
              Wir behalten uns vor, diese AGB jederzeit zu ändern. Nutzer werden über wesentliche
              Änderungen per E-Mail oder durch einen Hinweis auf der Plattform informiert.
              Die fortgesetzte Nutzung nach Änderungen gilt als Zustimmung.
            </p>
          </div>
        </section>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300">
          <p className="font-semibold">⚠️ Hinweis für Entwickler</p>
          <p className="mt-1 text-amber-400/80">
            Diese AGB sind ein Entwurf. Vor Go-Live von einem Rechtsanwalt prüfen lassen,
            insbesondere § 5 (Haftung für Drittinhalte) und § 9 (Gerichtsstand).
            Betreiberdaten in § 1 eintragen.
          </p>
        </div>

      </div>
    </div>
  );
}

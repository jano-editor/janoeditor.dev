<script setup lang="ts">
// Privacy policy. Legal text stays in this page instead of the locale files:
// it is long, rarely changes and is read as a whole.

const { locale } = useI18n();
const de = computed(() => locale.value === "de");

useSeoMeta({ title: () => (de.value ? "Datenschutz · jano" : "Privacy · jano") });

const UPDATED = "2026-10-07";
</script>

<template>
  <div class="legal">
    <article v-if="de">
      <h1>Datenschutz</h1>
      <p class="updated">Stand: {{ UPDATED }}</p>

      <h2>Wer verantwortlich ist</h2>
      <p>
        FH SoftDev (Florian Heuberger Software Development), Freihung. Die vollständigen Angaben
        stehen im
        <a href="https://fh-softdev.de/imprint" target="_blank" rel="noopener">Impressum</a>. Fragen
        zum Datenschutz an <a href="mailto:info@fh-softdev.de">info@fh-softdev.de</a>.
      </p>

      <h2>Kurz gesagt</h2>
      <p>
        Kein Tracking, keine Werbung, keine Analyse-Dienste, kein Cookie-Banner nötig. Schriften und
        alle anderen Dateien kommen von diesem Server, nicht von Google oder einem CDN.
      </p>

      <h2>Server und Hosting</h2>
      <p>
        Die Seite läuft auf einem virtuellen Server der IONOS SE, Elgendorfer Str. 57, 56410
        Montabaur, in einem Rechenzentrum in Deutschland. Mit IONOS besteht ein Vertrag zur
        Auftragsverarbeitung (Art. 28 DSGVO). Beim Aufruf der Seite verarbeitet der Server technisch
        notwendige Daten: IP-Adresse, Zeitpunkt, aufgerufene Adresse und die Kennung deines
        Browsers. Das ist nötig, um die Seite auszuliefern und vor Missbrauch zu schützen (Art. 6
        Abs. 1 lit. f DSGVO).
      </p>

      <h2>Besucherzähler</h2>
      <p>
        Die Seite zählt Aufrufe und Besucher pro Tag und Monat. Dafür wird aus deiner IP-Adresse ein
        Prüfwert gebildet, die IP-Adresse selbst wird nicht gespeichert. Es werden keine Cookies
        gesetzt und keine Profile gebildet (Art. 6 Abs. 1 lit. f DSGVO).
      </p>

      <h2>Anmeldung mit GitHub</h2>
      <p>
        Nur wer Plugins veröffentlicht, meldet sich mit GitHub an. Dabei erhalten wir von GitHub
        deine GitHub-ID, deinen Benutzernamen, deinen Anzeigenamen, die Adresse deines Profilbilds
        und deines Profils. Diese Daten liegen verschlüsselt in einem Sitzungs-Cookie. Dein
        Profilbild wird dann direkt von GitHub geladen. Veröffentlichst du ein Plugin, werden
        Benutzername und GitHub-ID mit dem Plugin gespeichert und dein Benutzername ist öffentlich
        sichtbar (Art. 6 Abs. 1 lit. b DSGVO). Für GitHub gilt deren
        <a
          href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"
          target="_blank"
          rel="noopener"
          >Datenschutzerklärung</a
        >.
      </p>

      <h2>Cookies und lokaler Speicher</h2>
      <ul>
        <li>Deine Sprachwahl wird in einem Cookie gespeichert.</li>
        <li>Nach einer Anmeldung gibt es das Sitzungs-Cookie, es endet mit der Abmeldung.</li>
        <li>Die Farbeinstellung liegt im lokalen Speicher deines Browsers.</li>
      </ul>
      <p>Alle drei sind technisch notwendig, deshalb ist keine Einwilligung nötig.</p>

      <h2>Der Editor selbst</h2>
      <p>
        jano spricht diese Seite nur an, wenn du Plugins suchst oder installierst. Dabei fallen die
        gleichen Server-Daten an wie oben, und der Download-Zähler des Plugins steigt. Für
        Update-Hinweise fragt jano die npm-Registry und GitHub nach der neuesten Version.
      </p>

      <h2>Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
        Datenübertragbarkeit und Widerspruch. Schreib einfach an die Adresse oben. Außerdem kannst
        du dich bei einer Datenschutz-Aufsichtsbehörde beschweren, zuständig ist das Bayerische
        Landesamt für Datenschutzaufsicht (BayLDA).
      </p>
    </article>

    <article v-else>
      <h1>Privacy</h1>
      <p class="updated">Last updated: {{ UPDATED }}</p>

      <h2>Who is responsible</h2>
      <p>
        FH SoftDev (Florian Heuberger Software Development), Freihung, Germany. Full details are in
        the <a href="https://fh-softdev.de/imprint" target="_blank" rel="noopener">imprint</a>.
        Privacy questions go to <a href="mailto:info@fh-softdev.de">info@fh-softdev.de</a>.
      </p>

      <h2>In short</h2>
      <p>
        No tracking, no ads, no analytics services, no cookie banner needed. Fonts and all other
        files come from this server, not from Google or a CDN.
      </p>

      <h2>Server and hosting</h2>
      <p>
        The site runs on a virtual server of IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, in a
        data center in Germany. A data processing agreement with IONOS is in place (Art. 28 GDPR).
        When you open the site, the server processes technically necessary data: IP address, time,
        requested address and your browser's user agent. This is needed to deliver the site and
        protect it from abuse (Art. 6 (1) (f) GDPR).
      </p>

      <h2>Visitor counter</h2>
      <p>
        The site counts page views and visitors per day and month. For this, a checksum is derived
        from your IP address, the IP address itself is not stored. No cookies are set and no
        profiles are built (Art. 6 (1) (f) GDPR).
      </p>

      <h2>Sign in with GitHub</h2>
      <p>
        Only plugin authors sign in, with GitHub. GitHub then sends us your GitHub ID, username,
        display name, and the addresses of your avatar and profile. They are kept encrypted in a
        session cookie. Your avatar is then loaded directly from GitHub. When you publish a plugin,
        your username and GitHub ID are stored with it and your username is public (Art. 6 (1) (b)
        GDPR). GitHub's own
        <a
          href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"
          target="_blank"
          rel="noopener"
          >privacy statement</a
        >
        applies there.
      </p>

      <h2>Cookies and local storage</h2>
      <ul>
        <li>Your language choice is kept in a cookie.</li>
        <li>After signing in there is the session cookie, it ends when you sign out.</li>
        <li>The color setting is kept in your browser's local storage.</li>
      </ul>
      <p>All three are technically necessary, so no consent is required.</p>

      <h2>The editor itself</h2>
      <p>
        jano only talks to this site when you search or install plugins. The same server data as
        above is processed, and the plugin's download counter goes up. For update notices, jano asks
        the npm registry and GitHub for the latest version.
      </p>

      <h2>Your rights</h2>
      <p>
        You have the right to access, correct, delete, restrict and port your data, and to object to
        its processing. Just write to the address above. You can also complain to a data protection
        authority; the responsible one is the Bavarian State Office for Data Protection Supervision
        (BayLDA).
      </p>
    </article>
  </div>
</template>

<style scoped>
.legal {
  max-width: 44rem;
  margin: 0 auto;
  padding: 4rem 1.5rem 0;
  color: var(--color-text);
  line-height: 1.65;
}
h1 {
  font-family: var(--font-mono);
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 700;
  color: var(--color-title);
}
.updated {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: #8a909b;
}
h2 {
  margin-top: 2.25rem;
  font-family: var(--font-mono);
  font-size: 1.05rem;
  font-weight: 700;
  color: #e6e9ee;
}
p,
ul {
  margin-top: 0.6rem;
}
ul {
  padding-left: 1.25rem;
  list-style: disc;
}
a {
  color: var(--color-cursor);
  text-decoration: underline;
  text-underline-offset: 3px;
}
a:focus-visible {
  outline: 2px solid var(--color-cursor);
  outline-offset: 2px;
}
</style>

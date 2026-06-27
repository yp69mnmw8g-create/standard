# ImmoScout24 Bürgergeld-Filter

Ein kleines **Browser-Userscript**, das beim Wohnungssuchen auf
[ImmobilienScout24](https://www.immobilienscout24.de) automatisch die
**Bruttokaltmiete** (Kaltmiete + kalte Nebenkosten, **ohne** Heizung) berechnet
und prüft, ob sie unter der **Jobcenter-Obergrenze** der jeweiligen Stadt liegt.

Statt jede Anzeige manuell zu öffnen und die Kostenaufschlüsselung
durchzurechnen, siehst du oben rechts ein Badge:

- 🟢 **grün** – Bruttokaltmiete liegt unter der Grenze
- 🔴 **rot** – über der Grenze
- 🟡 **gelb** – Stadt unbekannt oder Aufschlüsselung nicht auslesbar

## Warum ein Userscript (und kein Scraper)?

Es läuft **in deinem normalen, eingeloggten Browser**, während du ohnehin
suchst. Dadurch:

- kein separater Scraper, kein Server, kein Bot-Schutz-Problem,
- rechtlich unkritisch (es liest nur die Seite, die du eh ansiehst),
- keine Wartungs-Infrastruktur.

## Installation

1. Browser-Erweiterung **Tampermonkey** installieren
   ([Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) /
   [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/) /
   Edge / Safari).
2. Tampermonkey öffnen → **„Neues Skript erstellen"**.
3. Den Inhalt von [`immoscout-buergergeld-filter.user.js`](./immoscout-buergergeld-filter.user.js)
   einfügen und speichern (`Strg/Cmd + S`).
4. Eine ImmoScout24-Anzeige öffnen – das Badge erscheint oben rechts.
   (Klick auf das Badge blendet es aus.)

## Hinterlegte Jobcenter-Grenzen (Bruttokaltmiete, 1 Person)

| Stadt           | Grenze   | Stand        |
|-----------------|----------|--------------|
| Düsseldorf      | 546 €    | 11/2024      |
| Wuppertal       | 466 €    | 01/2025      |
| Mönchengladbach | 500 €    | –            |
| Neuss           | ~590 €   | 01.05.2025\* |
| Ratingen        | 544 €    | 01.04.2024   |
| Erkrath         | 505 €    | 01.04.2024   |
| Willich         | 480 €    | 01.01.2024   |

\* Neuss ist aus der offiziellen Kreis-Vorlage abgeleitet (Nettokalt 460 € +
kalte NK 130 €). Sicherheitshalber mit dem
[Mietkostenrechner des Jobcenters Rhein-Kreis Neuss](https://www.jobcenter-rhein-kreis-neuss.de/services/mietkostenrechner)
gegenprüfen.

**Werte ändern / Städte ergänzen:** ganz oben im Userscript im Block
`CITY_LIMITS`. Jede Zeile hat `name`, `limit` (€) und `plz` (PLZ-Bereiche zur
Stadterkennung).

## Wie die Bruttokaltmiete berechnet wird

1. Bevorzugt **Kaltmiete + Nebenkosten** (so steht es in der Aufschlüsselung).
2. Falls das fehlt: **Warmmiete − Heizkosten**.
3. Falls nur die Kaltmiete da ist: diese (mit deutlichem Hinweis, dass NK fehlen).

Steht in der Anzeige *„Heizkosten in Nebenkosten enthalten"*, weist das Badge
darauf hin – dann ist die echte Bruttokaltmiete eher **niedriger** als angezeigt.

## Sofort-Hack ohne Installation

Im IS24-Suchfilter die **Kaltmiete-Obergrenze ≈ Jobcenter-Grenze − 80 €** setzen
(grober Puffer für kalte Nebenkosten bei 1 Person). Das siebt die meisten
unpassenden Anzeigen schon vorab aus.

## Quellen für die Grenzwerte

- Düsseldorf / Wuppertal: [gegen-hartz.de – Mietgrenzen-Tabelle](https://www.gegen-hartz.de/news/buergergeld-das-zahlen-die-jobcenter-fuer-miete-tabelle-mit-mietgrenzen)
- Ratingen / Erkrath: [Kreis Mettmann – Angemessenheitsrichtwerte (PDF, Stand 01.04.2024)](https://harald-thome.de/files/pdf/KdU%20New/KdU%20Mettmann%20-%2001.04.2024.pdf)
- Neuss: [Rhein-Kreis Neuss – Neue Mietobergrenzen ab 01.05.2025](https://session.rhein-kreis-neuss.de/bi/vo0050.asp?__kvonr=14697)
- Willich: [Kreis Viersen – KdU-Richtlinien erhöht zum 01.01.2024](https://alzviersen.de/nachrichten/a-blog/Die-Richtlinien-der-Kosten-der-Unterkunft-KdU-wurden-fuer-den-Kreis-Viersen-zum-01.01.2024-erhoeht/)

> Die Werte sind Richtwerte und können sich ändern; im Einzelfall entscheidet
> das zuständige Jobcenter. Bitte vor einer Anmietung beim Jobcenter bestätigen
> lassen.

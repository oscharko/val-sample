# JIRA Ticket: Typsichere Übersetzungsschlüssel mit IDE-Integration (Archiv)

## Status

Dieses Ticket ist seit dem 05.03.2026 archiviert.
Die Lösung ist nicht mehr aktiv, weil die Anwendung auf eine einsprachige
Deutsch-Strategie ohne i18n-Framework umgestellt wurde.

## Historischer Kontext

Früher wurde ein Generator für Übersetzungsschlüssel genutzt, um typsichere
Schlüsselkonstanten für mehrere Sprachkataloge bereitzustellen.
Dieser Build-Schritt wurde vollständig entfernt.

## Aktueller Architekturstand

- Es gibt nur noch einen aktiven Sprachkatalog:
  `src/i18n/locales/de-DE/translation.ts`
- Es gibt keine en-US Locale-Dateien mehr.
- Es gibt keinen Translation-Key-Generator mehr.
- Es gibt keine i18next- oder react-i18next-Integration mehr.
- Das Build-Script enthält keinen i18n-Generator-Schritt.

## Verbindliche Referenz

Für den aktuellen Stand gilt ausschließlich:
`docs/architecture-state-i18n.md`

# Jira Ticket Pack: Investitionsfinanzierung

## Ticket 1
**Issue Type:** Epic  
**Summary:** Übernahme Formular „Investitionsfinanzierung“ in Kundenanwendung  
**Priority:** High  
**Labels:** investment-financing, mui-v7, react-hook-form, zod, micro-state

### Beschreibung
End-to-end Integration der Demo-Maske „Investitionsfinanzierung“ in die bestehende React-Kundenanwendung inklusive UI, Validierung, Hook-State, Feedback- und Submit-Flow.

### Scope
- MUI v7 Komponenten und Formularstruktur mit 5 Sektionen.
- Validierung mit Zod + React Hook Form inkl. Cross-Field-Regeln.
- Micro State Management mit React Hooks für globalen Submission-Status, lokalen Sektionen-Status und Derived State.
- Submit-Adapter mit Success/Error-Handling und optionalem `fieldErrors` Mapping.
- QA- und Regressionstests für kritische Formpfade.

### Out of Scope
- Kein neues React-/TypeScript-Projektsetup.
- Keine Infrastruktur-/Deployment-Themen.
- Keine Backend-Vertragsänderungen.

### Definition of Done
- Alle Story-Akzeptanzkriterien erfüllt.
- Relevante Tests implementiert und grün.
- Keine Regression in bestehenden Formularpfaden.

---

## Ticket 2
**Issue Type:** Story  
**Summary:** Form-Shell und Sektionenstruktur aufbauen  
**Priority:** High  
**Labels:** investment-financing, form-shell, mui-v7  
**Epic Link:** Übernahme Formular „Investitionsfinanzierung“ in Kundenanwendung

### Beschreibung
Implementierung der Formularhülle mit 5 kollabierbaren Sektionen, globalen Expand/Collapse-Aktionen, Action-Buttons und FormProvider-Integration.

### Abhängigkeiten
- Keine

### Akzeptanzkriterien
- 5 Sektionen werden stabil gerendert: Basisdaten, Kosten, Zeitpunkt, Betriebsmittelbedarf, Nachhaltigkeit.
- Jede Sektion ist einzeln auf- und zuklappbar.
- Globale Aktionen „Alle öffnen“ und „Alle schließen“ funktionieren.
- Sektionen-Zähler (expanded/total) wird korrekt angezeigt.
- Formular ist über `FormProvider` gekapselt.

### Testhinweise
- Expand/Collapse pro Sektion und global validieren.
- Render-Stabilität bei wiederholtem Toggle prüfen.

---

## Ticket 3
**Issue Type:** Story  
**Summary:** Sektion „Basisdaten“ mit RHF-Controllern übernehmen  
**Priority:** High  
**Labels:** investment-financing, basisdaten, mui-v7, react-hook-form  
**Epic Link:** Übernahme Formular „Investitionsfinanzierung“ in Kundenanwendung

### Beschreibung
Implementierung der Felder `person`, `financingObjectName`, `financingObjectCategory`, `fleetPurchase`, `expansionInvestment`, `grossPrice` als MUI v7 Eingaben mit RHF-Bindung.

### Abhängigkeiten
- Form-Shell und Sektionenstruktur aufbauen

### Akzeptanzkriterien
- Alle genannten Felder sind vollständig mit RHF verbunden.
- Fehlerzustände und Fehlermeldungen pro Feld werden angezeigt.
- Tri-State (`unklar|ja|nein`) und Binary (`ja|nein`) Verhalten ist korrekt.
- Toggle `grossPrice` ist korrekt gebunden.

### Testhinweise
- Pflichtfeldvalidierung von `person` und `financingObjectName`.
- Tri-State/Binary-Auswahl in UI und Form-State verifizieren.

---

## Ticket 4
**Issue Type:** Story  
**Summary:** Sektion „Kosten“ inkl. lokalisierter Numeric-Inputs übernehmen  
**Priority:** High  
**Labels:** investment-financing, kosten, numeric-input, zod  
**Epic Link:** Übernahme Formular „Investitionsfinanzierung“ in Kundenanwendung

### Beschreibung
Implementierung der Felder `netPurchasePrice`, `additionalCosts`, `vatDeductible`, `vatRate` mit lokalisierter numerischer Eingabe (de-DE) und EUR-EndAdornment.

### Abhängigkeiten
- Form-Shell und Sektionenstruktur aufbauen

### Akzeptanzkriterien
- Tausender-/Dezimaltrennung entspricht deutschem Format.
- Negative Werte werden nicht akzeptiert.
- Felder sind RHF-gebunden und validieren gegen Schema.
- VAT-Rate (`19|7|0`) ist als Auswahlfeld korrekt abgebildet.

### Testhinweise
- Numeric-Parsing und Speicherung als Zahl prüfen.
- Validierungsfehler bei negativen oder ungültigen Zahlen prüfen.

---

## Ticket 5
**Issue Type:** Story  
**Summary:** Sektion „Zeitpunkt der Anschaffung“ übernehmen  
**Priority:** Medium  
**Labels:** investment-financing, zeitpunkt, date-fields  
**Epic Link:** Übernahme Formular „Investitionsfinanzierung“ in Kundenanwendung

### Beschreibung
Implementierung der Felder `purchaseDate`, `paymentDate`, `usefulLifeYears` (optional) mit RHF-Bindung und korrekter Anzeige/Validierung.

### Abhängigkeiten
- Form-Shell und Sektionenstruktur aufbauen

### Akzeptanzkriterien
- Datumsfelder sind korrekt bindbar und validierbar.
- `usefulLifeYears` ist optional und kann leer bleiben.
- Fehlermeldungen werden korrekt dargestellt.

### Testhinweise
- Leere/gefüllte Datumsfelder testen.
- Optionalität von `usefulLifeYears` verifizieren.

---

## Ticket 6
**Issue Type:** Story  
**Summary:** Sektion „Betriebsmittelbedarf“ mit Conditional UI und Pflichtlogik übernehmen  
**Priority:** High  
**Labels:** investment-financing, conditional-fields, betriebsmittel  
**Epic Link:** Übernahme Formular „Investitionsfinanzierung“ in Kundenanwendung

### Beschreibung
Implementierung von `operatingResourcesNeeded` sowie konditionalen Feldern `operatingResourcesAmount` und `operatingResourcesType` inklusive Sichtbarkeits- und Pflichtregeln.

### Abhängigkeiten
- Form-Shell und Sektionenstruktur aufbauen
- Zod-Schema + RHF Resolver implementieren

### Akzeptanzkriterien
- Konditionale Felder werden nur bei `operatingResourcesNeeded = ja` angezeigt.
- Bei `ja` sind Betrag und Art Pflicht.
- Bei `nein|unklar` sind die konditionalen Felder nicht verpflichtend.
- Fehlermeldungen werden feldspezifisch angezeigt.

### Testhinweise
- `ja` ohne Betrag/Typ muss Validierungsfehler liefern.
- `nein|unklar` ohne Betrag/Typ muss submit-fähig sein.

---

## Ticket 7
**Issue Type:** Story  
**Summary:** Sektion „Nachhaltigkeit“ mit Tri-State-Komponente übernehmen  
**Priority:** Medium  
**Labels:** investment-financing, nachhaltigkeit, tri-state  
**Epic Link:** Übernahme Formular „Investitionsfinanzierung“ in Kundenanwendung

### Beschreibung
Implementierung des Feldes `esgCompliant` über Tri-State-Radio inklusive RHF-Bindung und Fehlerdarstellung.

### Abhängigkeiten
- Form-Shell und Sektionenstruktur aufbauen

### Akzeptanzkriterien
- Tri-State-Auswahl ist korrekt gebunden.
- Feldfehler sind sichtbar.
- Keyboard-Bedienbarkeit ist gegeben.

### Testhinweise
- Auswahlwechsel und Persistenz im Form-State prüfen.
- Fokus-/Keyboard-Navigation prüfen.

---

## Ticket 8
**Issue Type:** Story  
**Summary:** Zod-Schema und RHF-Resolver für vollständige Formularvalidierung implementieren  
**Priority:** High  
**Labels:** investment-financing, zod, react-hook-form, validation  
**Epic Link:** Übernahme Formular „Investitionsfinanzierung“ in Kundenanwendung

### Beschreibung
Implementierung des vollständigen Formschemas inklusive Enum-Werte, Pflichtfelder, numerischer Regeln und Cross-Field-Validierung für Betriebsmittelabhängigkeiten.

### Abhängigkeiten
- Sektion „Basisdaten“ mit RHF-Controllern übernehmen
- Sektion „Kosten“ inkl. lokalisierter Numeric-Inputs übernehmen
- Sektion „Zeitpunkt der Anschaffung“ übernehmen
- Sektion „Betriebsmittelbedarf“ mit Conditional UI und Pflichtlogik übernehmen
- Sektion „Nachhaltigkeit“ mit Tri-State-Komponente übernehmen

### Akzeptanzkriterien
- Alle Wertebereiche sind strikt: `TriState`, `BinaryChoice`, `VatRate`, `OperatingResourceType`.
- Pflichtfelder und numerische Mindestwerte greifen konsistent.
- Cross-Field-Regel bei `operatingResourcesNeeded = ja` ist aktiv.
- RHF-Resolver bindet Schema-Fehler korrekt an Felder.

### Testhinweise
- Pflichtfeldtests und Enum-Tests.
- Cross-Field-Tests für Betriebsmittel.

---

## Ticket 9
**Issue Type:** Story  
**Summary:** Micro State Management mit Hooks integrieren  
**Priority:** High  
**Labels:** investment-financing, micro-state, hooks, performance  
**Epic Link:** Übernahme Formular „Investitionsfinanzierung“ in Kundenanwendung

### Beschreibung
Implementierung von getrennten State-Domänen: globaler Submission-Status, lokaler Sektionen-Status und Derived Values für Anzeige-/Berechnungslogik.

### Abhängigkeiten
- Form-Shell und Sektionenstruktur aufbauen
- Zod-Schema und RHF-Resolver für vollständige Formularvalidierung implementieren

### Akzeptanzkriterien
- Globaler Status enthält: `submissionState`, `lastError`, `lastSuccessMessage`, `validationSummary`, `isDirty`.
- UI-lokaler Sektionen-State ist separat und unabhängig vom globalen Status.
- Derived Values (z. B. Gesamtbetrag, Conditional Visibility) sind deterministisch.
- Selektorbasierte Subscriptions minimieren unnötige Re-Renders.

### Testhinweise
- Statusübergänge `idle -> submitting -> success/error`.
- Dirty-Status und Validation Summary prüfen.
- Derived State bei Feldänderung prüfen.

---

## Ticket 10
**Issue Type:** Story  
**Summary:** Submit-Flow und Feedback-Handling integrieren  
**Priority:** High  
**Labels:** investment-financing, submission, snackbar, api-adapter  
**Epic Link:** Übernahme Formular „Investitionsfinanzierung“ in Kundenanwendung

### Beschreibung
Implementierung des Submit-Prozesses mit API-Adapter, Success/Error-Snackbar, Feldfehler-Mapping aus `fieldErrors`, Reset nach Erfolg und Disable-Logik während des Submits.

### Abhängigkeiten
- Zod-Schema und RHF-Resolver für vollständige Formularvalidierung implementieren
- Micro State Management mit Hooks integrieren

### Akzeptanzkriterien
- Antwortvertrag wird unterstützt: `success` oder `error`, optional `fieldErrors`.
- Success zeigt Erfolgsmeldung und setzt Formular zurück.
- Error zeigt globale Fehlermeldung; `fieldErrors` werden den Feldern zugeordnet.
- Während Submit sind relevante Aktionen deaktiviert.
- Doppel-Submit wird verhindert.

### Testhinweise
- Success- und Error-Flow mit Mock-API prüfen.
- Feldfehler-Mapping vollständig prüfen.

---

## Ticket 11
**Issue Type:** Story  
**Summary:** QA- und Regressionstests für Formularlogik implementieren  
**Priority:** High  
**Labels:** investment-financing, qa, regression, testing  
**Epic Link:** Übernahme Formular „Investitionsfinanzierung“ in Kundenanwendung

### Beschreibung
Implementierung von Unit- und Integrationstests für Kernlogik, Validierung, Conditional Rendering, Submission- und Feedback-Flows.

### Abhängigkeiten
- Alle Implementierungsstories (Ticket 2 bis Ticket 10)

### Akzeptanzkriterien
- Folgende Szenarien sind automatisiert abgedeckt:
  - Pflichtfelder leer -> Submit blockiert.
  - `operatingResourcesNeeded = ja` und Betrag/Typ leer -> Feldfehler.
  - `operatingResourcesNeeded = nein|unklar` -> Betrag/Typ nicht erforderlich.
  - Numeric Input verarbeitet de-DE Format korrekt.
  - Expand/Collapse pro Sektion und global inkl. Zähler.
  - Submit-Erfolg zeigt Feedback und resettet Formular.
  - Submit-Fehler zeigt Fehlermeldung und feldgenaue Zuordnung.
  - Submit-Pending deaktiviert Aktionen.
  - Derived Values werden korrekt aktualisiert.
- Keine Regression in vorhandenen Formularpfaden.

### Testhinweise
- Tests auf CI-fähigem Standard ausführen.
- Grenzfälle mit leeren, optionalen und konditionalen Feldern abdecken.

---

## Gemeinsame Annahmen (für alle Tickets)
- Zielsystem ist eine bestehende React-Anwendung.
- Kein neues React-/TypeScript-Bootstrap im Scope.
- Keine Backend-Vertragsänderungen.
- Sprache der Jira-Tickets: Deutsch.
- Keine Story-Points, nur Prioritäten.

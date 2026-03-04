# JIRA Ticket: Type-Safe Translation Keys mit IDE-Integration

## 📋 Zusammenfassung

Implementierung eines **Translation Key Generators**, der automatisch alle i18n-Schlüssel als TypeScript-Konstanten exportiert. Dies ermöglicht:
- ✅ Vollständige IDE-Unterstützung (Intellisense, Go to Definition)
- ✅ Type-Safety für Übersetzungsschlüssel
- ✅ Automatische Refactoring-Unterstützung
- ✅ Keine Runtime-Fehler durch falsche Schlüssel

---

## 🎯 Akzeptanzkriterien

### Implementierung
- [x] `scripts/generate-translation-keys.mjs` erstellt
  - [x] Liest `src/i18n/locales/en-US/translation.ts`
  - [x] Extrahiert alle Schlüssel rekursiv
  - [x] Generiert `src/i18n/translationKeys.ts`
  - [x] Gibt Erfolgs-/Fehlermeldung aus

### Integration
- [x] NPM Script in `package.json` hinzugefügt:
  ```json
  "generate:i18n-keys": "node scripts/generate-translation-keys.mjs"
  ```
- [x] Build-Script aktualisiert:
  ```json
  "build": "yarn generate:i18n-keys && tsc -b && vite build"
  ```
- [x] Befehl funktioniert: `yarn generate:i18n-keys`
- [x] Befehl funktioniert: `yarn build` (mit automatischer Generierung)

### Qualität
- [x] `src/i18n/translationKeys.ts` wird korrekt generiert
- [x] Alle Schlüssel sind vorhanden und sortiert
- [x] TypeScript-Typen sind korrekt
- [x] Keine Fehler bei der Generierung

### Dokumentation
- [x] Dokumentation in `docs/architecture-state-i18n.md` aktualisiert
- [x] Beispiele in Dokumentation
- [x] Workflow dokumentiert

---

## 🏗️ Technische Lösung

### 1. **Translation Key Generator** (`scripts/generate-translation-keys.mjs`)

```javascript
// Liest src/i18n/locales/en-US/translation.ts
// Parst die Datei per TypeScript-AST (keine Runtime-Execution)
// Extrahiert alle Blatt-Schlüssel rekursiv (z.B. 'form.fields.person')
// Generiert src/i18n/translationKeys.ts mit Konstanten
```

**Input:**
```typescript
export const enUSTranslation = {
  form: {
    fields: {
      person: 'Person',
      investmentObjectName: '...',
    }
  }
}
```

**Output:**
```typescript
export const TRANSLATION_KEYS = {
  'form.fields.person': 'form.fields.person',
  'form.fields.investmentObjectName': 'form.fields.investmentObjectName',
  // ... alle 100+ Schlüssel
} as const;

export type TranslationKey = typeof TRANSLATION_KEYS[keyof typeof TRANSLATION_KEYS];
```

### 2. **Verwendung im Code**

**Vorher (fehleranfällig):**
```typescript
const label = t('form.fields.person'); // String-Literal, keine IDE-Unterstützung
```

**Nachher (Type-Safe):**
```typescript
import { TRANSLATION_KEYS } from './i18n/translationKeys';

const label = t(TRANSLATION_KEYS['form.fields.person']);
// ✅ Intellisense zeigt alle verfügbaren Schlüssel
// ✅ Refactoring funktioniert automatisch
// ✅ TypeScript warnt bei ungültigen Schlüsseln
```

### 3. **IDE-Integration**

**WebStorm/IntelliJ:**
- `Cmd+Click` auf `TRANSLATION_KEYS['form.fields.person']` → springt zur Definition
- `Cmd+B` → zeigt alle Verwendungsstellen
- Refactoring: Schlüssel umbenennen → alle Stellen werden aktualisiert

---

## 📦 Implementierungsschritte

### Phase 1: Generator Script erstellen
**Datei:** `scripts/generate-translation-keys.mjs`

**Anforderungen:**
1. Node.js Script (ESM-Modul)
2. Liest `src/i18n/locales/en-US/translation.ts`
3. Extrahiert alle Schlüssel rekursiv (Dot-Notation: `form.fields.person`)
4. Generiert `src/i18n/translationKeys.ts` mit:
   - `TRANSLATION_KEYS` Konstante (alle Schlüssel als Objekt)
   - `TranslationKey` Type (Union aller Schlüssel)
   - `createTranslationKey()` Helper-Funktion
5. Gibt Erfolgs-/Fehlermeldung aus

**Pseudocode:**
```
1. Parse en-US/translation.ts über TypeScript-AST
2. Rekursiv alle Blatt-Keys extrahieren (mit Prefix)
3. Keys sortieren
4. TypeScript-Datei generieren
5. In src/i18n/translationKeys.ts schreiben
6. Erfolgs-Meldung: "✅ Generated X translation keys"
```

### Phase 2: NPM Script Integration
**Datei:** `package.json`

**Änderungen:**
1. Neues Script hinzufügen:
   ```json
   "generate:i18n-keys": "node scripts/generate-translation-keys.mjs"
   ```

2. Build-Script aktualisieren:
   ```json
   "build": "yarn generate:i18n-keys && tsc -b && vite build"
   ```
   → Generator läuft automatisch vor jedem Build

3. Optional: Pre-commit Hook (Husky) für automatische Generierung

**Verwendung:**
```bash
# Manuell ausführen
yarn generate:i18n-keys

# Automatisch beim Build
yarn build
```

### Phase 3: Dokumentation & Tests
1. `docs/architecture-state-i18n.md` aktualisieren mit Kurzbefehl
2. Unit-Tests für Generator schreiben
3. Beispiele in Code-Dokumentation

---

## 🔄 Workflow für Entwickler

### Szenario 1: Neue Übersetzung hinzufügen
```bash
# 1. Neue Schlüssel in en-US/translation.ts hinzufügen
# 2. Neue Schlüssel in de-DE/translation.ts übersetzen
# 3. Generator ausführen
yarn generate:i18n-keys

# 4. Neue Schlüssel sind jetzt in translationKeys.ts verfügbar
# 5. Im Code verwenden: t(TRANSLATION_KEYS['form.fields.newField'])
# 6. Commit: en-US/translation.ts, de-DE/translation.ts, translationKeys.ts
```

### Szenario 2: Automatisch beim Build
```bash
# Generator läuft automatisch vor dem Build
yarn build
# → yarn generate:i18n-keys wird zuerst ausgeführt
# → Dann tsc -b && vite build
```

### Szenario 3: Vor dem Commit (Optional mit Husky)
```bash
# Pre-commit Hook kann Generator automatisch ausführen
# Verhindert, dass veraltete translationKeys.ts committed wird
```

---

## 💡 Vorteile

| Vorteil | Beschreibung |
|---------|-------------|
| **Type-Safety** | TypeScript warnt bei ungültigen Schlüsseln |
| **IDE-Support** | Vollständige Intellisense & Refactoring |
| **Wartbarkeit** | Keine manuellen Schlüssel-Listen |
| **Fehlerprävention** | Keine Runtime-Fehler durch Tippfehler |
| **Dokumentation** | Alle Schlüssel sind selbstdokumentierend |

---

## 📝 Geschätzter Aufwand

- **Entwicklung:** 2-3 Stunden
- **Testing:** 1 Stunde
- **Dokumentation:** 30 Minuten
- **Total:** ~4 Stunden

---

## 🔗 Abhängigkeiten

- Keine neuen Dependencies erforderlich
- Nutzt vorhandene: `i18next`, `react-i18next`

---

## 📚 Referenzen

- i18next Dokumentation: https://www.i18next.com/
- TypeScript `as const`: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions

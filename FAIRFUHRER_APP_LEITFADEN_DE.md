# FairFuhrer Mobile App
## Ein verständlicher Leitfaden für unser App-Konzept

---

## Einleitung: Warum eine Mobile App?

### Das Problem

Stellen Sie sich vor: Eine Familie aus München macht Urlaub am Bodensee. Sie stehen auf einem Wanderweg in den Bergen und wollen ein nachhaltiges Restaurant zum Mittagessen finden. Sie öffnen die FairFuhrer-Website auf dem Handy, aber...

❌ **Kein Internet** – in den Bergen gibt es oft keinen Empfang

❌ **Langsam** – die Website braucht gutes Internet

❌ **Umständlich** – jedes Mal die URL eingeben

### Die Lösung

Eine native Mobile App löst alle diese Probleme:

✅ **Funktioniert offline** – Karten und Infos sind auf dem Handy gespeichert

✅ **Schnell** – öffnet sich in 1 Sekunde

✅ **Immer griffbereit** – ein Icon auf dem Startbildschirm

**Fazit:** Die App ist kein Ersatz für die Website, sondern eine Erweiterung für unterwegs – genau dort, wo Touristen sie am meisten brauchen.

---

## Teil 1: Wie verdienen wir Geld?

### Das Freemium-Modell erklärt

**Was bedeutet "Freemium"?**

Das Wort setzt sich zusammen aus "Free" (kostenlos) und "Premium" (bezahlt). Die Idee:

- Die **Basisversion ist kostenlos** → viele Leute laden die App herunter
- **Erweiterte Funktionen kosten Geld** → ein Teil der Nutzer zahlt dafür

**Warum funktioniert das?**

Beispiel aus der Praxis: Die App "Komoot" (Outdoor-Navigation) nutzt genau dieses Modell. Sie haben über 30 Millionen Nutzer, weil die Basisversion kostenlos ist. Etwa 5% zahlen für Premium – aber 5% von 30 Millionen sind 1,5 Millionen zahlende Kunden.

---

### Was ist kostenlos? Was kostet Geld?

#### Kostenlose Version

| Was bekommt der Nutzer? | Warum ist das kostenlos? |
|-------------------------|--------------------------|
| **Karte mit allen Orten** | Damit der Nutzer sieht, was FairFuhrer bietet |
| **Grundinfos zu jedem Ort** | Name, Adresse, Kategorie, kurze Beschreibung |
| **3 Fotos pro Ort** | Genug, um neugierig zu machen |
| **5 Favoriten speichern** | Nützlich, aber begrenzt – motiviert zum Upgrade |
| **1 fertige Route** | Zeigt, wie toll die Routen-Funktion ist |

**Die Logik dahinter:** Der Nutzer soll die App ausprobieren und den Wert erkennen. Wenn er mehr will, zahlt er.

#### Premium Version (€7,99 einmalig oder €9,99/Jahr)

| Was bekommt der Nutzer? | Warum ist das Premium? |
|-------------------------|------------------------|
| **Offline-Karten** | Aufwendig in der Entwicklung, echter Mehrwert |
| **Audio-Guides** | Exklusiver Inhalt, der Arbeit kostet |
| **Alle Fotos in HD** | Mehr Speicherplatz = mehr Kosten |
| **Unbegrenzte Favoriten** | Kleiner Unterschied, aber psychologisch wichtig |
| **Alle Routen** | Inhalt, der redaktionelle Arbeit erfordert |
| **Eigene Routen erstellen** | Technisch aufwendige Funktion |

---

### Praktisches Beispiel: Der Weg eines Nutzers

```
Tag 1: Tourist lädt die kostenlose App herunter
       → Findet 3 tolle Orte am Bodensee
       → Speichert sie als Favoriten
       → "Super App!"

Tag 2: Will offline wandern gehen
       → Kein Internet in den Bergen
       → App zeigt: "Offline-Karten sind Premium"
       → Denkt: "7,99€ für den ganzen Urlaub? Okay!"
       → Kauft Premium

Tag 3: Erzählt Freunden davon
       → Freunde laden die kostenlose Version
       → Der Kreislauf beginnt von vorn
```

---

## Teil 2: Was bedeuten die einzelnen Funktionen?

### Offline-Karten

**Was ist das?**
Der Nutzer kann eine Region (z.B. "Bodensee") auf sein Handy herunterladen. Danach funktioniert die Karte ohne Internet.

**Wie sieht das in der Praxis aus?**
1. Nutzer öffnet die App (mit Internet)
2. Klickt auf "Region herunterladen"
3. Wählt "Bodensee" (ca. 45 MB)
4. Wartet 1-2 Minuten
5. Fertig! Jetzt funktioniert alles offline

**Warum ist das wichtig?**
- In den Bergen gibt es oft keinen Empfang
- Roaming im Ausland ist teuer
- Akku hält länger ohne ständige Datenverbindung

**Wer macht das auch so?**
Google Maps, Komoot, Maps.me – alle erfolgreichen Karten-Apps bieten Offline-Modus.

---

### Audio-Guides

**Was ist das?**
Zu jedem Ort gibt es eine Sprachaufnahme (1-3 Minuten), die die Geschichte und Besonderheiten erklärt.

**Wie sieht das in der Praxis aus?**
1. Nutzer steht vor dem "Öko-Bauernhof Müller"
2. Öffnet die App, tippt auf den Ort
3. Drückt auf "Audio abspielen"
4. Hört: *"Der Öko-Bauernhof Müller wurde 1952 gegründet und ist seit 2010 bio-zertifiziert. Die Familie Müller legt besonderen Wert auf..."*

**Warum ist das wichtig?**
- Nutzer muss nicht lesen (praktisch beim Wandern)
- Fühlt sich wie eine persönliche Führung an
- Höherer wahrgenommener Wert = Leute zahlen dafür

**Wer macht das auch so?**
Museen, Städte-Apps (z.B. "Reiseführer Berlin"), Audible

---

### Favoriten

**Was ist das?**
Der Nutzer kann Orte "liken" und in einer persönlichen Liste speichern.

**Kostenlose Version:** Maximal 5 Favoriten
**Premium:** Unbegrenzt

**Warum die Begrenzung?**
Psychologischer Trick: Wenn jemand 5 Favoriten hat und den 6. speichern will, denkt er: "Ich nutze die App so oft – 7,99€ sind es wert."

---

### Geolokalisierung

**Was ist das?**
Die App weiß, wo der Nutzer gerade ist, und zeigt nahegelegene Orte.

**Wie sieht das in der Praxis aus?**
1. Nutzer öffnet die App
2. App fragt: "Darf FairFuhrer deinen Standort verwenden?"
3. Nutzer erlaubt es
4. Karte zentriert sich automatisch auf seinen Standort
5. Zeigt: "3 nachhaltige Orte in deiner Nähe"

**Warum ist das wichtig?**
Niemand will manuell suchen. Die App soll sofort zeigen: "Das ist in deiner Nähe!"

---

### Geofencing (nur Premium)

**Was ist das?**
Die App schickt eine Benachrichtigung, wenn der Nutzer in die Nähe eines interessanten Ortes kommt – auch wenn die App geschlossen ist.

**Wie sieht das in der Praxis aus?**
1. Nutzer läuft durch Lindau
2. Sein Handy vibriert
3. Benachrichtigung: "📍 Du bist 200m vom Öko-Café entfernt! Geöffnet bis 18:00"
4. Nutzer denkt: "Oh, das schaue ich mir an!"

**Warum ist das Premium?**
- Technisch aufwendig
- Verbraucht etwas Akku
- Echter Mehrwert für aktive Nutzer

---

### Thematische Routen

**Was ist das?**
Fertig geplante Touren mit mehreren Stationen, z.B. "Nachhaltiger Tagesausflug am Bodensee".

**Wie sieht das in der Praxis aus?**

```
Route: "Öko-Genuss-Tour Allgäu"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station 1: Bio-Bäckerei zum Frühstück (9:00)
    ↓ 15 Min. Fahrt
Station 2: Naturpark Wanderung (10:00)
    ↓ 20 Min. Fahrt
Station 3: Nachhaltiges Restaurant (13:00)
    ↓ 10 Min. Fahrt
Station 4: Öko-Bauernhof Besuch (15:00)
```

**Kostenlose Version:** 1 Beispielroute
**Premium:** Alle Routen + eigene erstellen

**Warum ist das wertvoll?**
Touristen wollen nicht selbst planen. Eine fertige Route spart Zeit und gibt Sicherheit: "Das hat jemand für mich durchdacht."

---

### AR-Ansicht (Augmented Reality)

**Was ist das?**
Der Nutzer hält sein Handy hoch (wie beim Fotografieren), und die App zeigt auf dem Kamerabild, wo die Orte sind.

**Wie sieht das in der Praxis aus?**
1. Nutzer steht auf einem Aussichtspunkt
2. Öffnet die AR-Ansicht
3. Hält das Handy hoch
4. Auf dem Bildschirm sieht er die echte Landschaft + Markierungen:
   - "← Öko-Hotel (500m)"
   - "→ Bio-Restaurant (300m)"

**Warum ist das cool?**
- "Wow-Effekt" – beeindruckt Nutzer
- Praktisch in unbekannter Umgebung
- Unterscheidet uns von anderen Apps

---

### "Jetzt geöffnet" Filter

**Was ist das?**
Ein Knopf, der nur Orte zeigt, die gerade geöffnet sind.

**Wie sieht das in der Praxis aus?**
1. Es ist 19:00 Uhr
2. Nutzer sucht ein Restaurant
3. Aktiviert "Nur geöffnete anzeigen"
4. App filtert alle geschlossenen Orte aus
5. Bonus: "⚠️ Öko-Café schließt in 30 Min."

**Warum ist das wichtig?**
Nichts ist frustrierender, als zu einem Ort zu fahren, der geschlossen ist.

---

### Smart Suggestions (Wetter-basiert)

**Was ist das?**
Die App schlägt Orte vor, die zum aktuellen Wetter passen.

**Wie sieht das in der Praxis aus?**

**Bei Regen:**
```
☔ Regenwetter? Kein Problem!
Hier sind Indoor-Aktivitäten in deiner Nähe:
• Museum für Nachhaltigkeit (2 km)
• Bio-Café mit Leseecke (800 m)
• Öko-Brauerei mit Führung (5 km)
```

**Bei Sonne:**
```
☀️ Perfektes Wetter für draußen!
• Naturlehrpfad (3 km)
• Bio-Bauernhof mit Streichelzoo (4 km)
• Nachhaltige Bootstour (1 km)
```

**Warum ist das wertvoll?**
Die App "denkt mit" – das fühlt sich persönlich und hilfreich an.

---

### Home-Screen-Widget

**Was ist das?**
Ein kleines Fenster auf dem Startbildschirm des Handys, das Infos zeigt, ohne die App zu öffnen.

**Wie sieht das aus?**

```
┌─────────────────────────────┐
│ 🌿 FairFuhrer              │
│ ─────────────────────────── │
│ In deiner Nähe:            │
│ 📍 Öko-Café Lindau (200m)  │
│ ☀️ 22°C – Perfekt für      │
│    Outdoor-Aktivitäten     │
└─────────────────────────────┘
```

**Warum ist das Premium?**
- Exklusives Feature
- Erhöht die tägliche Nutzung
- Nutzer sieht die App, auch ohne sie zu öffnen

---

## Teil 3: Wie verdienen wir mit Partnern Geld?

### Das Partnermodell erklärt

**Die Idee:**
Unsere Partner (Restaurants, Hotels, Bauernhöfe) sind in der App gelistet. Sie können für erweiterte Funktionen bezahlen.

**Wichtig:** Der Basis-Eintrag bleibt **kostenlos** – wir wollen viele Orte in der App haben.

---

### Die vier Pakete

#### Basic (Kostenlos)

**Was bekommt der Partner?**
- Eintrag in der App mit Grundinfos
- Kann sein Profil selbst bearbeiten (nach unserer Freigabe)

**Für wen ist das?**
Kleine Betriebe, die erstmal testen wollen

---

#### Bronze (€99/Jahr)

**Was bekommt der Partner zusätzlich?**

| Funktion | Erklärung |
|----------|-----------|
| **Badge "Verifizierter Partner"** | Ein kleines Häkchen neben dem Namen, das Vertrauen schafft |
| **Statistik-Dashboard** | Der Partner sieht: Wie oft wurde sein Profil angeschaut? Wie viele Klicks auf "Anrufen"? |
| **50 Promo-Codes** | Der Partner kann seinen Kunden Codes geben, die 1 Monat Premium schenken |

**Praktisches Beispiel – Promo-Codes:**
```
Öko-Hotel "Seeblick" kauft Bronze-Paket.

Der Hotelier gibt jedem Gast beim Check-in eine Karte:
"Willkommen! Hier ist ein Code für FairFuhrer Premium:
 SEEBLICK-2024
 Entdecken Sie nachhaltige Orte in der Region!"

→ Der Gast freut sich über das Geschenk
→ Der Gast nutzt FairFuhrer und entdeckt andere Partner
→ Win-Win für alle
```

---

#### Silver (€249/Jahr)

**Was bekommt der Partner zusätzlich?**

| Funktion | Erklärung |
|----------|-----------|
| **Alles aus Bronze** | Badge, Statistiken, Promo-Codes |
| **200 Promo-Codes** | Mehr Codes für größere Betriebe |
| **3 Monate Premium** pro Code | Höherer Wert für den Kunden |
| **Hervorgehobener PIN** | Der Marker auf der Karte ist größer/bunter und fällt auf |

**Wie sieht der hervorgehobene PIN aus?**
```
Normale Pins: ● ● ●
Silver-Pin:   ★ (größer, mit Glanz-Effekt)
```

---

#### Gold (€499/Jahr)

**Was bekommt der Partner zusätzlich?**

| Funktion | Erklärung |
|----------|-----------|
| **Alles aus Silver** | Badge, Statistiken, Codes, hervorgehobener PIN |
| **Unbegrenzte Promo-Codes** | Für große Hotels, Restaurantketten |
| **1 Jahr Premium** pro Code | Maximaler Wert |
| **Push-Benachrichtigungen** | Der Partner kann Nachrichten an Nutzer in der Nähe schicken |
| **Wallet-Integration** | Kundenkarten und Gutscheine in Apple/Google Wallet |

**Praktisches Beispiel – Push-Benachrichtigungen:**
```
Das Restaurant "Grüne Küche" hat Gold-Paket.

Es ist Mittwoch, 11:30 Uhr.
Nutzer in 2 km Umkreis bekommen:

📱 Benachrichtigung:
"🍽️ Grüne Küche: Heute Bio-Mittagstisch für 12,90€!
 Nur 500m von dir entfernt."

→ Nutzer sieht es und geht hin
→ Restaurant hat messbaren Mehrwert von FairFuhrer
```

**Praktisches Beispiel – Wallet-Integration:**
```
Der Öko-Bauernhof "Müller" bietet an:

"Füge unsere Kundenkarte zu deinem Wallet hinzu!"

→ Nutzer speichert die Karte in Apple/Google Wallet
→ Bei jedem Einkauf: Karte scannen, Punkte sammeln
→ Nach 10 Einkäufen: 10% Rabatt

Der Bauernhof sieht im Dashboard:
"47 Nutzer haben die Karte gespeichert"
"23 Gutscheine wurden eingelöst"

→ Messbarer ROI (Return on Investment)
```

---

### Warum zahlen Partner?

**Das Kernargument:**

```
Partner: "Warum soll ich €99 zahlen?"

Antwort: "Weil Sie sehen können, dass 500 Leute Ihr Profil
          angeschaut haben und 50 auf 'Anrufen' geklickt haben.

          Wenn nur 10 davon bei Ihnen essen (50€ pro Person),
          sind das 500€ Umsatz – für 99€ Investition."
```

**Der Unterschied zu normaler Werbung:**
- Facebook-Anzeige: Man weiß nie genau, wer kommt
- FairFuhrer: Nutzer sind AKTIV auf der Suche nach nachhaltigen Orten
- Höhere Qualität der Besucher

---

## Teil 4: Wie verwalten Partner ihre Inhalte?

### Das Rollen-System erklärt

Wir nutzen Directus (unser bestehendes Content-Management-System) mit verschiedenen Berechtigungsstufen:

---

#### 👑 Admin (Wir – Seenergien)

**Was können wir?**
- Alles sehen und bearbeiten
- Neue Partner anlegen
- Partner-Inhalte freigeben oder ablehnen
- Statistiken für alle einsehen

---

#### ✏️ Editor (Unsere Redakteure)

**Was können sie?**
- Alle Orte bearbeiten
- Neue Orte hinzufügen
- Partner-Inhalte prüfen und freigeben

**Wofür brauchen wir das?**
Wenn wir wachsen, können wir Redakteure einstellen, die Inhalte pflegen.

---

#### 🏢 Partner

**Was können sie?**
- NUR ihre eigenen Orte bearbeiten
- Fotos hochladen (max. 10)
- Texte schreiben (max. 2000 Zeichen)
- Audio hochladen (max. 3 Minuten)

**Was können sie NICHT?**
- Andere Orte sehen oder bearbeiten
- Inhalte direkt veröffentlichen (muss von uns freigegeben werden)

**Warum die Einschränkungen?**

| Regel | Grund |
|-------|-------|
| Max. 10 Fotos | Speicherplatz kostet Geld |
| Max. 2000 Zeichen | Konsistente Qualität, Nutzer lesen nicht mehr |
| Max. 3 Min. Audio | Dateigröße, Konsistenz |
| Freigabe nötig | Wir prüfen Qualität, verhindern Spam/Fehler |

---

#### 👁️ Viewer (optional)

**Was können sie?**
- Nur lesen, nichts bearbeiten
- Statistiken ansehen

**Wofür brauchen wir das?**
Für Investoren, Berater oder Analysten, die Einblick brauchen, aber nichts ändern sollen.

---

### Der Ablauf: Vom Partner zur App

```
1. Partner loggt sich ein
   → Sieht nur sein eigenes Profil

2. Partner ändert etwas
   → "Neue Öffnungszeiten: Mo-Fr 9-18 Uhr"
   → Klickt "Speichern"

3. Status: "Wartet auf Freigabe"
   → Änderung ist NICHT sofort live

4. Unser Editor prüft
   → Ist alles korrekt?
   → Keine Rechtschreibfehler?
   → Fotos in guter Qualität?

5. Editor gibt frei
   → Status: "Veröffentlicht"
   → Änderung ist jetzt in der App sichtbar

(Falls Probleme)
5b. Editor lehnt ab
    → Partner bekommt Nachricht: "Bitte korrigieren Sie..."
    → Partner überarbeitet
    → Zurück zu Schritt 3
```

---

## Teil 5: Was wollen die verschiedenen Gruppen?

### Nutzer (Touristen)

**Was sie BRAUCHEN (ohne das funktioniert es nicht):**

| Bedürfnis | Warum? |
|-----------|--------|
| Schnelle App (<3 Sek.) | Niemand wartet gerne |
| Offline-Modus | Kein Internet in den Bergen |
| Genaue Standortbestimmung | Sonst sind die Entfernungen falsch |
| Aktuelle Infos | Nichts Schlimmeres als falsche Öffnungszeiten |

**Was sie WOLLEN (dafür zahlen sie):**

| Wunsch | Premium-Feature |
|--------|-----------------|
| Nicht lesen müssen | Audio-Guides |
| Schöne Fotos | HD-Galerie |
| Nicht selbst planen | Fertige Routen |
| "Meine" App | Favoriten, Notizen, Verlauf |

**Was sie NICHT wollen:**

| Ablehnung | Unsere Lösung |
|-----------|---------------|
| Werbung | Premium = werbefrei |
| Zwangsregistrierung | Kostenlose Version ohne Account |
| Zu viele Notifications | Nutzer stellt selbst ein, was er will |
| Komplizierte Bedienung | Einfaches, klares Design |

---

### Partner (Restaurants, Hotels, etc.)

**Was sie BRAUCHEN:**

| Bedürfnis | Wie wir es erfüllen |
|-----------|---------------------|
| Sichtbarkeit | Eintrag in der App |
| Einfache Pflege | Eigener Login, einfaches Dashboard |
| Messbare Ergebnisse | Statistiken (ab Bronze) |

**Was sie WOLLEN (dafür zahlen sie):**

| Wunsch | Paket |
|--------|-------|
| "Bin ich sichtbar?" wissen | Bronze (Statistiken) |
| Kunden etwas schenken | Bronze/Silver/Gold (Promo-Codes) |
| Mehr auffallen | Silver (hervorgehobener PIN) |
| Direkt werben | Gold (Push-Nachrichten) |
| Kundenbindung | Gold (Wallet-Karten) |

---

### Seenergien (Wir)

**Unsere Einnahmequellen:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   EINNAHMEN                                                 │
│                                                             │
│   B2C (von Nutzern):                                       │
│   └── Premium-Käufe: €7,99-9,99 pro Person                 │
│                                                             │
│   B2B (von Partnern):                                       │
│   └── Bronze: €99/Jahr                                      │
│   └── Silver: €249/Jahr                                     │
│   └── Gold: €499/Jahr                                       │
│                                                             │
│   Spenden (wie bisher):                                     │
│   └── PayPal-Spenden (ergänzend)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Teil 6: Wie setzen wir das um?

### Phase 1: Basis-App

**Was wir bauen:**
- Karte mit allen Orten
- Informationen zu jedem Ort
- Filter nach Kategorien
- Standort des Nutzers
- Favoriten speichern

**Was wir NICHT bauen (noch nicht):**
- Offline-Modus
- Premium-Funktionen
- Bezahlung

**Ziel dieser Phase:**
Testen, ob Menschen die App überhaupt wollen.

**Erfolg bedeutet:**
- 500 Downloads
- Nutzer öffnen die App mehrmals
- Gute Bewertungen im App Store

---

### Phase 2: Geld verdienen

**Was wir hinzufügen:**
- Offline-Karten (Premium)
- Audio-Guides (Premium)
- Mehr Fotos (Premium)
- In-App-Kauf (Bezahlen in der App)
- Promo-Codes für Partner

**Ziel dieser Phase:**
Erste Einnahmen generieren

**Erfolg bedeutet:**
- 3% der Nutzer kaufen Premium
- 10 Partner kaufen Bronze oder höher
- Einnahmen decken unsere Kosten

---

### Phase 3: Wachstum

**Was wir hinzufügen:**
- Partner-Dashboard mit Statistiken
- Mehr Routen
- Abzeichen und Ranglisten (Gamification)
- Push-Benachrichtigungen
- "Freund einladen" Programm
- Übersetzungen (Englisch, Französisch, Italienisch)
- Widget, Wallet, Wetter-Tipps

**Ziel dieser Phase:**
Viele Nutzer, viele Partner, neue Regionen

**Erfolg bedeutet:**
- 10.000 aktive Nutzer pro Monat
- 100 Partner
- Expansion über Bodensee/Allgäu hinaus

---

## Zusammenfassung

### Was ist FairFuhrer Mobile?

Eine App für Touristen, die nachhaltige Orte am Bodensee und im Allgäu suchen – besonders nützlich, weil sie **offline funktioniert**.

### Wie verdienen wir Geld?

| Quelle | Produkt | Preis |
|--------|---------|-------|
| Nutzer | Premium (alle Regionen) | €7,99 einmalig |
| Nutzer | Premium Abo | €9,99/Jahr |
| Partner | Bronze | €99/Jahr |
| Partner | Silver | €249/Jahr |
| Partner | Gold | €499/Jahr |

### Was macht uns besonders?

1. **Offline-Modus** – funktioniert ohne Internet
2. **Audio-Guides** – wie ein persönlicher Reiseführer
3. **Promo-Codes** – Partner können Kunden beschenken
4. **Statistiken** – Partner sehen den Erfolg
5. **Wallet-Integration** – Kundenkarten auf dem Handy

### Der nächste Schritt

Wir starten mit einer einfachen Basis-App, testen die Nachfrage, und erweitern dann Schritt für Schritt.

---

*Bei Fragen zu einzelnen Punkten stehe ich gerne zur Verfügung.*

*Dokument erstellt: Februar 2026*

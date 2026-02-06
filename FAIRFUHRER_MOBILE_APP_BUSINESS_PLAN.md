# FairFuhrer Mobile App
## Strategia Produktu i Plan Biznesowy

**Wersja:** 1.0
**Data:** Luty 2026
**Przygotował:** Zespół FairFuhrer

---

## Spis Treści

1. [Podsumowanie Wykonawcze](#1-podsumowanie-wykonawcze)
2. [Model Biznesowy](#2-model-biznesowy)
3. [Funkcjonalności Aplikacji](#3-funkcjonalności-aplikacji)
4. [Innowacyjne Funkcje](#4-innowacyjne-funkcje)
5. [System Zarządzania Treścią](#5-system-zarządzania-treścią)
6. [Wartość dla Interesariuszy](#6-wartość-dla-interesariuszy)
7. [Strategia Wdrożenia](#7-strategia-wdrożenia)
8. [Koszty i Przychody](#8-koszty-i-przychody)
9. [Następne Kroki](#9-następne-kroki)

---

## 1. Podsumowanie Wykonawcze

### Wizja
Aplikacja mobilna FairFuhrer na Android i iOS, która stanie się niezbędnym towarzyszem dla turystów szukających zrównoważonych i ekologicznych miejsc w regionie Bodensee i Allgäu.

### Kluczowe Założenia

| Aspekt | Decyzja |
|--------|---------|
| **Platformy** | Android + iOS (jeden kod źródłowy - Flutter) |
| **Model monetyzacji** | Freemium (darmowa wersja + Premium) |
| **Główna przewaga** | Tryb offline dla turystów bez zasięgu |
| **Strumienie przychodów** | B2C (użytkownicy) + B2B (partnerzy) |

### Dlaczego Aplikacja Mobilna?

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRZEWAGI NAD STRONĄ WWW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ Działa OFFLINE (kluczowe w górach i nad jeziorem!)         │
│  ✅ Push notifications (re-engagement)                          │
│  ✅ Geolokalizacja w tle                                        │
│  ✅ Widget na ekranie głównym                                   │
│  ✅ Szybszy dostęp (ikona na telefonie)                        │
│  ✅ Integracja z Wallet (kupony, karty)                        │
│  ✅ Możliwość monetyzacji przez App Store                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Model Biznesowy

### 2.1 Model dla Użytkowników (B2C)

#### Wersja Darmowa (FREE)

| Funkcja | Dostępność |
|---------|------------|
| Mapa online z wszystkimi markerami | ✅ |
| Podstawowe informacje o miejscach | ✅ |
| Filtrowanie po kategoriach | ✅ |
| Geolokalizacja | ✅ |
| 10 miejsc w pełnej wersji (rotujące co miesiąc) | ✅ |
| Zdjęcia (max 3 na miejsce) | ✅ |
| Ulubione (max 5 miejsc) | ✅ |
| 1 gotowa trasa tematyczna | ✅ |
| Odznaki za odwiedziny | ✅ |
| Powiadomienia o nowych miejscach | ✅ |
| Czytanie recenzji | ✅ |

#### Wersja Premium

**Opcja A: Pakiet Regionu (jednorazowa płatność)**

| Pakiet | Cena | Zawartość |
|--------|------|-----------|
| Bodensee | €4,99 | Wszystkie miejsca + offline + audio |
| Allgäu | €4,99 | Wszystkie miejsca + offline + audio |
| **Bundle (wszystkie regiony)** | **€7,99** | Pełny dostęp do wszystkich regionów |

**Opcja B: Subskrypcja Premium (roczna)**

| | Cena | Zawartość |
|--|------|-----------|
| **Premium** | €9,99/rok | Wszystkie regiony (obecne i przyszłe) |
| | | Ekskluzywne treści |
| | | Brak reklam |
| | | Wczesny dostęp do nowych funkcji |

#### Funkcje Premium

| Funkcja | Opis |
|---------|------|
| **Offline mapy** | Pobierz region i korzystaj bez internetu |
| **Audio przewodniki** | Profesjonalne nagrania o każdym miejscu |
| **Pełna galeria zdjęć** | Wszystkie zdjęcia w wysokiej rozdzielczości |
| **Nawigacja do miejsca** | Integracja z mapami |
| **AR Widok** | Rozszerzona rzeczywistość - zobacz miejsca przez kamerę |
| **Ulubione bez limitu** | Zapisuj dowolną liczbę miejsc |
| **Historia odwiedzonych** | Śledzenie odwiedzonych miejsc |
| **Własne notatki** | Dodawaj prywatne notatki do miejsc |
| **Synchronizacja** | Dane zsynchronizowane między urządzeniami |
| **Wszystkie trasy** | Dostęp do wszystkich tras tematycznych |
| **Własne trasy** | Twórz i udostępniaj własne trasy |
| **Eksport do Google Maps** | Eksportuj trasę jednym kliknięciem |
| **Rankingi** | Zobacz swoją pozycję wśród innych użytkowników |
| **Wyzwania sezonowe** | Specjalne wyzwania z nagrodami |
| **Geofencing** | Powiadomienie gdy jesteś blisko ciekawego miejsca |
| **Wydarzenia partnerów** | Informacje o wydarzeniach |
| **Pisanie recenzji** | Dodawaj własne recenzje miejsc |

---

### 2.2 Model dla Partnerów (B2B)

#### Pakiety Partnerskie

| Pakiet | Cena | Kody promocyjne | Wartość dla klienta |
|--------|------|-----------------|---------------------|
| **Basic** | Gratis | - | Wpis w aplikacji |
| **Bronze** | €99/rok | 50 kodów | 1 miesiąc Premium |
| **Silver** | €249/rok | 200 kodów | 3 miesiące Premium |
| **Gold** | €499/rok | Nieograniczone | 1 rok Premium |

#### Funkcje dla Partnerów

| Pakiet | Basic | Bronze | Silver | Gold |
|--------|-------|--------|--------|------|
| Wpis w aplikacji | ✅ | ✅ | ✅ | ✅ |
| Edycja własnego profilu | ✅ | ✅ | ✅ | ✅ |
| Badge "Zweryfikowany Partner" | ❌ | ✅ | ✅ | ✅ |
| Dashboard statystyk | ❌ | ✅ | ✅ | ✅ |
| Kody promocyjne | ❌ | ✅ | ✅ | ✅ |
| Wyróżniony PIN na mapie | ❌ | ❌ | ✅ | ✅ |
| Push do użytkowników | ❌ | ❌ | ❌ | ✅ |
| Integracja Apple/Google Wallet | ❌ | ❌ | ❌ | ✅ |

#### Korzyści dla Partnerów

```
┌─────────────────────────────────────────────────────────────────┐
│                    WARTOŚĆ DLA PARTNERA                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 STATYSTYKI                                                  │
│  • Ile osób zobaczyło profil miejsca                           │
│  • Ile kliknięć "Zadzwoń" i "Nawiguj"                         │
│  • Ile kodów promocyjnych wykorzystano                         │
│  • Porównanie z średnią (anonimowo)                           │
│                                                                  │
│  🎁 KODY PROMOCYJNE                                            │
│  Partner może oferować swoim klientom:                         │
│  "Odwiedź nas i otrzymaj kod na FairFuhrer Premium!"           │
│  → Buduje lojalność                                            │
│  → Mierzalny ROI                                               │
│                                                                  │
│  💳 WALLET INTEGRATION (Gold)                                   │
│  • Karta lojalnościowa w Apple/Google Wallet                   │
│  • Kupony rabatowe (-10% dla użytkowników FairFuhrer)          │
│  • Bilety wstępu (muzea, wydarzenia)                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Funkcjonalności Aplikacji

### Matryca Funkcji

| Funkcja | FREE | PREMIUM | Nakład |
|---------|------|---------|--------|
| **MAPA I NAWIGACJA** | | | |
| Mapa z markerami | ✅ | ✅ | MVP |
| Filtrowanie kategorii | ✅ | ✅ | MVP |
| Geolokalizacja | ✅ | ✅ | MVP |
| Offline mapy | ❌ | ✅ | 3 SP |
| Nawigacja do miejsca | ❌ | ✅ | 2 SP |
| AR Widok (kamera + overlay) | ❌ | ✅ | 8 SP |
| **TREŚCI MIEJSC** | | | |
| Podstawowe info | ✅ | ✅ | MVP |
| Zdjęcia (3 max) | ✅ | - | - |
| Zdjęcia (pełna galeria) | ❌ | ✅ | MVP |
| Audio przewodnik | ❌ | ✅ | MVP |
| Recenzje użytkowników | ✅ czytanie | ✅ pisanie | 5 SP |
| **PERSONALIZACJA** | | | |
| Ulubione (max 5) | ✅ | - | 2 SP |
| Ulubione (bez limitu) | ❌ | ✅ | - |
| Historia odwiedzonych | ❌ | ✅ | 3 SP |
| Własne notatki do miejsc | ❌ | ✅ | 2 SP |
| Synchronizacja między urządzeniami | ❌ | ✅ | 4 SP |
| **TRASY I PLANOWANIE** | | | |
| Gotowe trasy tematyczne | 1 trasa | ✅ wszystkie | 4 SP |
| Własne trasy | ❌ | ✅ | 6 SP |
| Eksport do Google Maps | ❌ | ✅ | 1 SP |
| Udostępnianie tras | ❌ | ✅ | 2 SP |
| **GAMIFIKACJA** | | | |
| Odznaki za odwiedziny | ✅ | ✅ | 4 SP |
| Rankingi (leaderboard) | ❌ | ✅ | 3 SP |
| Wyzwania sezonowe | ❌ | ✅ | 3 SP |
| **POWIADOMIENIA** | | | |
| Nowe miejsca w regionie | ✅ | ✅ | 2 SP |
| Geofencing (jesteś blisko) | ❌ | ✅ | 4 SP |
| Wydarzenia partnerów | ❌ | ✅ | 3 SP |
| **DLA PARTNERÓW (B2B)** | | | |
| Dashboard statystyk | - | ✅ | 5 SP |
| Kody promocyjne | - | ✅ | 4 SP |
| Wyróżniony PIN na mapie | - | ✅ | 2 SP |
| Push do użytkowników | - | ✅ | 3 SP |

**Legenda:** SP = Story Point (1 SP ≈ 1 dzień pracy developera)

---

## 4. Innowacyjne Funkcje

### 4.1 "Otwarte Teraz"

```
┌─────────────────────────────────────────────────────────────────┐
│  🕐 OTWARTE TERAZ                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Funkcjonalność:                                                │
│  • Automatyczne pobieranie godzin otwarcia                      │
│  • Filtr "Pokaż tylko otwarte"                                  │
│  • Powiadomienie "Zamyka się za 30 min"                        │
│                                                                  │
│  Implementacja:                                                 │
│  • Opcja A: Google Places API (~€17/1000 zapytań)              │
│  • Opcja B: Manualne dane w Directus (€0)                      │
│                                                                  │
│  Nakład pracy: 2-3 SP                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Wielojęzyczność

```
┌─────────────────────────────────────────────────────────────────┐
│  🌍 MULTI-LANGUAGE                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Języki docelowe: DE, EN, FR, IT                               │
│                                                                  │
│  Implementacja:                                                 │
│  • Opcja A: Ręczne tłumaczenia w Directus (€0, czas)           │
│  • Opcja B: DeepL API (500k znaków/miesiąc gratis)             │
│                                                                  │
│  Wartość: Turyści z innych krajów = większy rynek!             │
│                                                                  │
│  Nakład pracy: 4 SP                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Inteligentne Sugestie (Pogoda)

```
┌─────────────────────────────────────────────────────────────────┐
│  ☀️ SMART SUGGESTIONS                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Przykłady:                                                     │
│  • "Pada deszcz? Oto muzea i kawiarnie w pobliżu"              │
│  • "Słonecznie? Odkryj szlaki i plaże"                         │
│                                                                  │
│  API: OpenWeatherMap (1000 zapytań/dzień gratis)               │
│                                                                  │
│  PREMIUM: 7-dniowa prognoza + planowanie wycieczki             │
│                                                                  │
│  Koszt: €0                                                      │
│  Nakład pracy: 2 SP                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Integracja z Wallet

```
┌─────────────────────────────────────────────────────────────────┐
│  💳 APPLE/GOOGLE WALLET                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Partner (Gold) może oferować:                                  │
│  • Karta lojalnościowa w Wallet                                │
│  • Kupon rabatowy (-10% dla użytkowników FairFuhrer)           │
│  • Bilet wstępu (muzea, wydarzenia)                            │
│                                                                  │
│  Wartość dla partnera: MIERZALNY ROI z aplikacji!              │
│                                                                  │
│  Koszt API: €0                                                  │
│  Nakład pracy: 5 SP                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Share & Invite

```
┌─────────────────────────────────────────────────────────────────┐
│  📤 UDOSTĘPNIANIE I ZAPROSZENIA                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  "Udostępnij to miejsce znajomemu"                             │
│  → Generuje link: fairfuhrer.guide/place/123                   │
│  → Link otwiera APLIKACJĘ (jeśli zainstalowana)                │
│  → Lub stronę www (jeśli nie)                                  │
│                                                                  │
│  Program poleceń:                                               │
│  "Zaproś znajomego = 1 miesiąc Premium gratis"                 │
│                                                                  │
│  Koszt: €0 (Firebase Dynamic Links)                            │
│  Nakład pracy: 3 SP                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 Widget na Ekranie Głównym

```
┌─────────────────────────────────────────────────────────────────┐
│  📱 HOME SCREEN WIDGET                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Wygląd:                                                        │
│  ┌─────────────────────┐                                        │
│  │ 🌿 FairFuhrer      │                                        │
│  │ ─────────────────── │                                        │
│  │ Najbliżej Ciebie:  │                                        │
│  │ 📍 Öko-Café (200m) │                                        │
│  │ ☀️ Idealna pogoda  │                                        │
│  └─────────────────────┘                                        │
│                                                                  │
│  Dostępność: PREMIUM                                            │
│  Koszt: €0                                                      │
│  Nakład pracy: 4 SP                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. System Zarządzania Treścią

### Role w Systemie Directus

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM RÓL                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  👑 ADMIN (Seenergien)                                          │
│  ├── Pełny dostęp do wszystkich funkcji                        │
│  ├── Zatwierdzanie treści partnerów                            │
│  ├── Zarządzanie użytkownikami i rolami                        │
│  └── Konfiguracja systemu                                       │
│                                                                  │
│  ✏️ EDITOR (Redaktor Seenergien)                                │
│  ├── Edycja wszystkich miejsc                                   │
│  ├── Dodawanie nowych miejsc                                    │
│  ├── Moderacja treści partnerów                                │
│  └── Publikowanie treści                                        │
│                                                                  │
│  🏢 PARTNER                                                      │
│  ├── Edycja TYLKO swoich miejsc                                 │
│  ├── Ograniczenia jakościowe:                                  │
│  │   • Tekst: max 2000 znaków                                  │
│  │   • Audio: max 3 minuty, format MP3                         │
│  │   • Zdjęcia: max 10, min 800x600px                          │
│  └── Treści wymagają zatwierdzenia przez Editora               │
│                                                                  │
│  👁️ VIEWER (Analityk)                                          │
│  ├── Tylko podgląd treści                                       │
│  └── Dostęp do statystyk i raportów                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Proces Dodawania Treści przez Partnera

```
Partner → Dodaje/edytuje treść → Status: "Do zatwierdzenia"
                                         ↓
                              Editor sprawdza jakość
                                         ↓
                    ┌────────────────────┴────────────────────┐
                    ↓                                         ↓
              Zatwierdzenie                              Odrzucenie
                    ↓                                         ↓
           Status: "Opublikowane"               Feedback do partnera
                    ↓                                         ↓
           Widoczne w aplikacji                    Partner poprawia
```

---

## 6. Wartość dla Interesariuszy

### 6.1 Użytkownicy (Turyści)

```
┌─────────────────────────────────────────────────────────────────┐
│                    WARTOŚĆ DLA UŻYTKOWNIKÓW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 MUSZĄ MIEĆ (bez tego nie będą używać):                      │
│  • Szybkość ładowania (<3 sekundy)                             │
│  • Działa offline (w górach!)                                   │
│  • Dokładna lokalizacja                                         │
│  • Aktualne informacje (godziny, telefony)                     │
│                                                                  │
│  💎 CHCĄ MIEĆ (zachęci do Premium):                             │
│  • Audio przewodniki                                            │
│  • Piękne zdjęcia w wysokiej rozdzielczości                    │
│  • Gotowe trasy tematyczne                                      │
│  • Personalizacja (ulubione, historia)                         │
│                                                                  │
│  ❌ NIE CHCĄ:                                                   │
│  • Reklam                                                       │
│  • Wymuszonej rejestracji                                       │
│  • Zbyt wielu powiadomień                                       │
│  • Skomplikowanego interfejsu                                   │
│                                                                  │
│  💰 ZA CO ZAPŁACĄ:                                              │
│  • Tryb offline (absolutnie!)                                   │
│  • Audio (unikalna treść)                                       │
│  • Brak reklam                                                  │
│  • Ekskluzywne miejsca                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Partnerzy (Dostawcy PIN-ów)

```
┌─────────────────────────────────────────────────────────────────┐
│                    WARTOŚĆ DLA PARTNERÓW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 MUSZĄ MIEĆ:                                                 │
│  • Widoczność dla turystów                                      │
│  • Łatwy sposób aktualizacji treści                            │
│  • Statystyki (ile osób zobaczyło ich miejsce)                 │
│                                                                  │
│  💎 CHCĄ MIEĆ (za co dopłacą):                                  │
│  • Wyróżniony PIN na mapie                                      │
│  • Powiadomienia push do użytkowników                          │
│  • Kody promocyjne dla ich klientów                            │
│  • Kupony/karty lojalnościowe w Wallet                         │
│                                                                  │
│  📊 METRYKI KTÓRE CHCĄ WIDZIEĆ:                                │
│  • Wyświetlenia profilu                                        │
│  • Kliknięcia "Zadzwoń" / "Nawiguj"                           │
│  • Wykorzystane kody promocyjne                                │
│  • Porównanie z innymi (anonimowo)                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Seenergien (Firma)

```
┌─────────────────────────────────────────────────────────────────┐
│                    WARTOŚĆ DLA SEENERGIEN                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  💰 STRUMIENIE PRZYCHODÓW:                                      │
│                                                                  │
│  1. B2C (użytkownicy końcowi)                                  │
│     • Premium subskrypcje: €9.99/rok                           │
│     • Pakiety regionów: €4.99-7.99 jednorazowo                 │
│                                                                  │
│  2. B2B (partnerzy)                                            │
│     • Bronze/Silver/Gold: €99-499/rok                          │
│                                                                  │
│  3. Darowizny (obecny model - uzupełniający)                   │
│                                                                  │
│  📈 KPIs DO ŚLEDZENIA:                                         │
│  • MAU (Monthly Active Users)                                  │
│  • Retention (D1, D7, D30)                                     │
│  • Conversion rate (Free → Premium)                            │
│  • ARPU (Average Revenue Per User)                             │
│  • Partner satisfaction (NPS)                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Strategia Wdrożenia

### Faza 1: MVP (Minimum Viable Product)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FAZA 1: MVP                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ZAKRES:                                                        │
│  ✅ Mapa z wszystkimi miejscami                                 │
│  ✅ Panel informacji (zdjęcia, opis, kontakt)                  │
│  ✅ Filtrowanie po kategoriach                                  │
│  ✅ Geolokalizacja                                              │
│  ✅ Ulubione (local storage)                                    │
│  ❌ Bez premium (wszystko za darmo)                             │
│  ❌ Bez offline                                                  │
│                                                                  │
│  CEL:                                                           │
│  Zwalidować czy użytkownicy chcą aplikacji mobilnej            │
│                                                                  │
│  METRYKI SUKCESU:                                               │
│  • 500 pobrań w pierwszym miesiącu                             │
│  • 30% retention po 7 dniach (D7)                              │
│  • Pozytywne recenzje w sklepach (4+ gwiazdki)                 │
│                                                                  │
│  SZACOWANY NAKŁAD: ~40 SP (~2 miesiące dla 1 developera)       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Faza 2: Monetyzacja

```
┌─────────────────────────────────────────────────────────────────┐
│                    FAZA 2: MONETYZACJA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ZAKRES:                                                        │
│  ✅ Offline mapy (PREMIUM)                                      │
│  ✅ Audio przewodniki (PREMIUM)                                 │
│  ✅ Pełna galeria (PREMIUM)                                     │
│  ✅ In-App Purchase (iOS/Android)                               │
│  ✅ Kody promocyjne dla partnerów                              │
│                                                                  │
│  CEL:                                                           │
│  Pierwsze przychody z aplikacji                                │
│                                                                  │
│  METRYKI SUKCESU:                                               │
│  • 3% konwersja Free → Premium                                 │
│  • 10 partnerów z pakietem Bronze+                             │
│  • Break-even na kosztach infrastruktury                       │
│                                                                  │
│  SZACOWANY NAKŁAD: ~30 SP (~6 tygodni)                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Faza 3: Growth (Wzrost)

```
┌─────────────────────────────────────────────────────────────────┐
│                       FAZA 3: GROWTH                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ZAKRES:                                                        │
│  ✅ Partner Dashboard (statystyki)                              │
│  ✅ Trasy tematyczne                                            │
│  ✅ Gamifikacja (odznaki, rankingi)                            │
│  ✅ Push notifications                                          │
│  ✅ Referral program ("Zaproś znajomego")                       │
│  ✅ Tłumaczenia (EN, IT, FR)                                    │
│  ✅ Widget na ekranie głównym                                   │
│  ✅ Integracja Wallet                                           │
│  ✅ Smart Suggestions (pogoda)                                  │
│                                                                  │
│  CEL:                                                           │
│  Skalowanie użytkowników i partnerów                           │
│                                                                  │
│  METRYKI SUKCESU:                                               │
│  • 10,000 MAU (Monthly Active Users)                           │
│  • 100 partnerów                                                │
│  • Ekspansja na nowe regiony                                   │
│                                                                  │
│  SZACOWANY NAKŁAD: ~40 SP (ongoing)                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Wizualizacja Roadmapy

```
        FAZA 1              FAZA 2              FAZA 3
         MVP              MONETYZACJA           GROWTH
          │                   │                   │
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │   Mapa   │        │ Offline  │        │ Partner  │
    │  Panel   │───────►│  Audio   │───────►│Dashboard │
    │  Filtry  │        │ In-App   │        │ Trasy    │
    │  Ulub.   │        │ Purchase │        │ Gamifik. │
    └──────────┘        └──────────┘        └──────────┘
          │                   │                   │
    Walidacja            Pierwsze            Skalowanie
    rynkowa              przychody
```

---

## 8. Koszty i Przychody

### 8.1 Koszty Stałe (Miesięczne)

| Kategoria | Koszt min. | Koszt max. |
|-----------|------------|------------|
| **Hosting (już posiadane)** | | |
| Directus + PostgreSQL | €20 | €50 |
| Supabase Storage | €0 | €25 |
| Vercel (Next.js www) | €0 | €20 |
| **Nowe dla mobile** | | |
| Apple Developer (€99/rok) | €8 | €8 |
| Google Play (€25 jednorazowo) | €2* | €2* |
| Mapbox (50k loads free) | €0 | €50 |
| Firebase (Analytics, Push) | €0 | €0 |
| Sentry (monitoring błędów) | €0 | €26 |
| **RAZEM** | **~€30** | **~€180** |

*rozłożone na rok

### 8.2 Koszty Zmienne (zależne od ruchu)

| Użytkownicy/miesiąc | Mapbox | Supabase | Razem |
|---------------------|--------|----------|-------|
| 1,000 | €0 | €0 | ~€30 |
| 10,000 | €20 | €25 | ~€75 |
| 50,000 | €100 | €50 | ~€180 |

### 8.3 Projekcja Przychodów

| Scenariusz | MAU | Konwersja | Premium | Partnerzy | Przychód/rok |
|------------|-----|-----------|---------|-----------|--------------|
| **Pesymistyczny** | 1,000 | 2% | 20 × €8 | 10 × €99 | ~€1,150 |
| **Realistyczny** | 5,000 | 3% | 150 × €8 | 30 × €150 | ~€5,700 |
| **Optymistyczny** | 20,000 | 5% | 1,000 × €8 | 100 × €200 | ~€28,000 |

### 8.4 Break-Even Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUNKT BREAK-EVEN                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Koszty roczne (realistyczne): ~€1,200                         │
│                                                                  │
│  Break-even przy:                                               │
│  • 150 użytkowników Premium (€8 × 150 = €1,200)                │
│  • LUB 12 partnerów Bronze (€99 × 12 = €1,188)                 │
│  • LUB kombinacja powyższych                                   │
│                                                                  │
│  Wniosek: Bardzo niski próg rentowności!                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.5 Uwaga: Prowizje App Store

| Sklep | Prowizja | Po pierwszym roku* |
|-------|----------|-------------------|
| Apple App Store | 30% | 15% |
| Google Play | 30% | 15% |

*Small Business Program - dla przychodów <$1M/rok

**Przykład:** Sprzedaż €7.99 → Otrzymujesz ~€5.60 (po 30%) lub ~€6.80 (po 15%)

---

## 9. Następne Kroki

### Decyzje do Podjęcia

| # | Decyzja | Opcje | Rekomendacja |
|---|---------|-------|--------------|
| 1 | Technologia | Flutter / React Native | Flutter |
| 2 | Ceny Premium | Jak w dokumencie | €7.99 bundle na start |
| 3 | Ceny dla partnerów | Bronze/Silver/Gold | Zacznij od Bronze €99 |
| 4 | Priorytet językowy | DE only / Multi-lang | DE na start, EN w Fazie 3 |
| 5 | Design | Freelancer / Kit / Agencja | Design Kit (~€79) |

### Checklist Przed Startem

- [ ] Potwierdzenie budżetu na development
- [ ] Rejestracja Apple Developer Account (€99)
- [ ] Rejestracja Google Play Console (€25)
- [ ] Decyzja o designie (freelancer/kit)
- [ ] Przygotowanie materiałów marketingowych
- [ ] Plan beta testów (20-50 testerów)

### Harmonogram (Przykładowy)

| Miesiąc | Faza | Milestone |
|---------|------|-----------|
| 1-2 | MVP | Aplikacja działa, podstawowe funkcje |
| 3 | Beta | Testy z użytkownikami |
| 4 | Launch | Publikacja w App Store i Google Play |
| 5-6 | Monetyzacja | In-App Purchase, pakiety partnerskie |
| 7+ | Growth | Nowe funkcje, ekspansja |

---

## Podsumowanie

FairFuhrer Mobile App to strategiczna inwestycja, która:

1. **Zwiększa wartość dla użytkowników** - tryb offline, audio, personalizacja
2. **Tworzy nowy strumień przychodów** - Premium + pakiety partnerskie
3. **Wzmacnia pozycję partnerów** - statystyki, kody promo, Wallet
4. **Ma niski próg rentowności** - ~150 użytkowników Premium lub 12 partnerów Bronze

Rekomendujemy rozpoczęcie od **Fazy 1 (MVP)** w celu walidacji rynkowej, z planowaną monetyzacją w **Fazie 2** po potwierdzeniu zainteresowania użytkowników.

---

*Dokument przygotowany: Luty 2026*
*Wersja: 1.0*

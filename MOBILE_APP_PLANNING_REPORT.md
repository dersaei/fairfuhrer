# Raport: Budowa Aplikacji Mobilnej FairFuhrer (Android & iOS)

## Spis Treści
1. [Podsumowanie Wykonawcze](#1-podsumowanie-wykonawcze)
2. [Analiza Obecnego Stanu](#2-analiza-obecnego-stanu)
3. [Rekomendacja Technologii](#3-rekomendacja-technologii)
4. [Szacowanie Nakładu Pracy](#4-szacowanie-nakładu-pracy)
5. [Sekwencja Implementacji](#5-sekwencja-implementacji)
6. [Najlepsze Praktyki](#6-najlepsze-praktyki)
7. [O Czym Pamiętać](#7-o-czym-pamiętać)
8. [Ryzyka i Mitygacja](#8-ryzyka-i-mitygacja)
9. [Architektura Mobilna](#9-architektura-mobilna)
10. [Podsumowanie](#10-podsumowanie)

---

## 1. Podsumowanie Wykonawcze

### Obecny Stan Projektu
FairFuhrer to aplikacja turystyczna dla regionu Bodensee i Allgäu, zbudowana na:
- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Backend/CMS:** Directus 11.14.0 + PostgreSQL
- **Mapy:** Mapbox GL JS
- **Płatności:** PayPal
- **Storage:** Supabase

### Główne Funkcjonalności do Przeniesienia
| Funkcjonalność | Złożoność | Priorytet |
|----------------|-----------|-----------|
| Interaktywna mapa z POI | Wysoka | P0 |
| Panel informacji o miejscu | Średnia | P0 |
| Galeria zdjęć (fullscreen) | Średnia | P1 |
| Odtwarzacz audio | Średnia | P1 |
| Geolokalizacja użytkownika | Niska | P0 |
| Formularz partnerski | Średnia | P2 |
| System darowizn (PayPal) | Wysoka | P2 |
| Strony statyczne (Impressum, Datenschutz) | Niska | P3 |

---

## 2. Analiza Obecnego Stanu

### Mocne Strony (do Wykorzystania)
1. **API już istnieje** - wszystkie endpointy są gotowe:
   - `POST /api/paypal/create-order`
   - `POST /api/paypal/capture-payment`
   - `POST /api/contact`
   - `POST /api/partner-application`
   - Directus REST API dla Orte/Kategorie

2. **Typy TypeScript** - plik `types.ts` zawiera kompletne definicje:
   ```typescript
   Ort, Category, PayPalDonation, PartnerApplication, etc.
   ```

3. **Supabase CDN** - obrazy i pliki audio dostępne via URL

4. **Mobile-first CSS** - responsywność już zaprojektowana

### Elementy Wymagające Przeprojektowania
1. **Mapbox → Google Maps/MapLibre** (licencja mobilna)
2. **React Context → Redux/Riverpod** (state management)
3. **CSS Modules → StyleSheet/Styled Components** (natywne style)
4. **PayPal Web SDK → PayPal Mobile SDK**

---

## 3. Rekomendacja Technologii

### Opcja A: Flutter (REKOMENDOWANE)
| Aspekt | Ocena |
|--------|-------|
| Jeden codebase dla Android/iOS | ✅ |
| Wydajność | ✅ Natywna kompilacja |
| UI | ✅ Material/Cupertino widgets |
| Mapy | ✅ google_maps_flutter |
| Hot Reload | ✅ Szybki development |
| Krzywa uczenia | ⚠️ Dart (nowy język) |
| Społeczność | ✅ Duża i rosnąca |

**Rekomendowane pakiety Flutter:**
```yaml
dependencies:
  flutter_bloc: ^8.1.3        # State management
  google_maps_flutter: ^2.5.0 # Mapy Google
  dio: ^5.4.0                 # HTTP client
  flutter_secure_storage: ^9.0.0
  cached_network_image: ^3.3.0
  just_audio: ^0.9.36         # Audio player
  photo_view: ^0.14.0         # Galeria
  flutter_paypal_payment: ^1.0.6
  geolocator: ^10.1.0         # Geolokalizacja
  permission_handler: ^11.1.0
```

### Opcja B: React Native
| Aspekt | Ocena |
|--------|-------|
| Jeden codebase | ✅ |
| Ponowne użycie kodu React | ✅ Łatwiejsze dla React devs |
| Wydajność | ⚠️ Bridge overhead |
| Mapy | ✅ react-native-maps |
| Hot Reload | ✅ |
| Krzywa uczenia | ✅ Znasz już React |

**Rekomendowane pakiety React Native:**
```json
{
  "react-native-maps": "^1.8.0",
  "@react-navigation/native": "^6.1.9",
  "react-native-track-player": "^4.0.1",
  "react-native-fast-image": "^8.6.3",
  "react-native-image-viewing": "^0.2.2",
  "@react-native-community/geolocation": "^3.1.0",
  "react-native-paypal": "^2.0.0",
  "@tanstack/react-query": "^5.17.0"
}
```

### Opcja C: Natywne (Kotlin + Swift)
| Aspekt | Ocena |
|--------|-------|
| Wydajność | ✅ Najlepsza |
| Dostęp do API | ✅ Pełny |
| Rozmiar zespołu | ❌ x2 (osobne teamy) |
| Czas development | ❌ x1.5-2 |
| Koszt utrzymania | ❌ Wysoki |

### **WERDYKT: Flutter**
Dla projektu FairFuhrer rekomendujemy **Flutter** ze względu na:
1. Jeden codebase = niższy koszt utrzymania
2. Natywna wydajność (kompilacja AOT)
3. Bogaty ekosystem pakietów dla map, audio, płatności
4. Material Design idealnie pasuje do stylistyki projektu
5. Szybszy development (hot reload)

---

## 4. Szacowanie Nakładu Pracy

### Metodologia
Szacunki podane w **story points** (1 SP ≈ 1 dzień pracy doświadczonego developera)

### Breakdown Zadań

#### Faza 0: Setup & Infrastruktura
| Zadanie | Story Points | Opis |
|---------|-------------|------|
| Konfiguracja projektu Flutter | 2 SP | flutter create, struktura folderów |
| Setup CI/CD (GitHub Actions) | 3 SP | Build, testy, deploy do stores |
| Konfiguracja Firebase | 2 SP | Analytics, Crashlytics, Push |
| Konfiguracja środowisk | 1 SP | Dev, staging, production |
| **Suma Fazy 0** | **8 SP** | |

#### Faza 1: Core Features (MVP)
| Zadanie | Story Points | Opis |
|---------|-------------|------|
| Architektura aplikacji | 3 SP | BLoC, routing, DI |
| Klient API (Directus + custom) | 5 SP | Dio, interceptory, cache |
| Ekran mapy | 8 SP | Google Maps, markery, clustering |
| Panel informacji o miejscu | 5 SP | UI, animacje, nawigacja |
| Filtrowanie po kategoriach | 3 SP | State management, UI |
| Geolokalizacja użytkownika | 3 SP | Permissions, accuracy |
| Wyszukiwarka miejsc | 4 SP | Autocomplete, debounce |
| **Suma Fazy 1** | **31 SP** | |

#### Faza 2: Media & UX
| Zadanie | Story Points | Opis |
|---------|-------------|------|
| Galeria zdjęć (fullscreen) | 5 SP | Zoom, swipe, cache |
| Odtwarzacz audio | 5 SP | Background play, controls |
| Cache offline (obrazy) | 3 SP | Hive/SQLite, sync |
| Deep linking | 2 SP | Otwieranie miejsc z URL |
| Animacje i mikrointerakcje | 4 SP | Lottie, Hero, transitions |
| Dark mode | 2 SP | Theme switching |
| **Suma Fazy 2** | **21 SP** | |

#### Faza 3: Formularze & Płatności
| Zadanie | Story Points | Opis |
|---------|-------------|------|
| Formularz kontaktowy | 3 SP | Walidacja, wysyłka |
| Formularz partnerski | 5 SP | Multi-step, walidacja, upload |
| Integracja PayPal | 8 SP | SDK, flow, error handling |
| Ekran sukcesu/anulowania | 2 SP | Deep link callback |
| **Suma Fazy 3** | **18 SP** | |

#### Faza 4: Polish & Release
| Zadanie | Story Points | Opis |
|---------|-------------|------|
| Strony statyczne (Impressum, etc.) | 2 SP | WebView lub native |
| GDPR/Cookie consent | 3 SP | Preferences, storage |
| Testowanie (E2E, unit) | 8 SP | Flutter test, integration |
| Accessibility (a11y) | 4 SP | Screen readers, contrasts |
| Performance optimization | 4 SP | Profiling, lazy loading |
| App Store assets | 3 SP | Screenshots, opisy, ikony |
| Code signing & provisioning | 2 SP | iOS certs, Android keystore |
| Beta testing (TestFlight/Play Console) | 3 SP | Distribution, feedback |
| **Suma Fazy 4** | **29 SP** | |

### Podsumowanie Szacunków

| Faza | Story Points | % Całości |
|------|-------------|-----------|
| Faza 0: Setup | 8 SP | 7% |
| Faza 1: Core MVP | 31 SP | 29% |
| Faza 2: Media & UX | 21 SP | 20% |
| Faza 3: Formularze | 18 SP | 17% |
| Faza 4: Polish | 29 SP | 27% |
| **RAZEM** | **107 SP** | 100% |

### Konwersja na Czas

| Scenariusz | Zespół | Orientacyjny Nakład |
|------------|--------|---------------------|
| Solo developer | 1 osoba | ~107 dni roboczych |
| Mały zespół | 2 osoby | ~54 dni roboczych |
| Średni zespół | 3 osoby | ~36 dni roboczych |

**Uwaga:** Te szacunki nie uwzględniają:
- Czasu na review w App Store/Play Store (7-14 dni)
- Iteracji po feedbacku z beta testów
- Nieprzewidzianych blokerów (SDK bugs, policy changes)

---

## 5. Sekwencja Implementacji

### Rekomendowana Kolejność (Agile Sprints)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPRINT 1: Foundation                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Setup projektu Flutter                                        │
│ 2. Architektura (BLoC, routing, DI)                             │
│ 3. Klient API Directus                                           │
│ 4. Podstawowy ekran mapy z markerami                            │
│ → Deliverable: Mapa pokazuje miejsca z Directus                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SPRINT 2: Core UX                             │
├─────────────────────────────────────────────────────────────────┤
│ 1. Panel informacji o miejscu                                    │
│ 2. Filtrowanie po kategoriach                                    │
│ 3. Geolokalizacja użytkownika                                    │
│ 4. Wyszukiwarka miejsc                                           │
│ → Deliverable: Użytkownik może znaleźć i przeglądać miejsca     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SPRINT 3: Media                               │
├─────────────────────────────────────────────────────────────────┤
│ 1. Galeria zdjęć fullscreen                                      │
│ 2. Odtwarzacz audio (audio guide)                               │
│ 3. Cache obrazów offline                                         │
│ → Deliverable: Pełne doświadczenie multimedialnych miejsc       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SPRINT 4: Formularze                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Formularz kontaktowy                                          │
│ 2. Formularz partnerski (multi-step)                            │
│ 3. Strony statyczne (Impressum, Datenschutz)                    │
│ → Deliverable: Użytkownicy mogą kontaktować się i aplikować     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SPRINT 5: Płatności                           │
├─────────────────────────────────────────────────────────────────┤
│ 1. Integracja PayPal SDK                                         │
│ 2. Flow darowizn                                                 │
│ 3. Obsługa sukcesu/błędów                                       │
│ → Deliverable: Działający system darowizn                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SPRINT 6: Polish                              │
├─────────────────────────────────────────────────────────────────┤
│ 1. Dark mode                                                     │
│ 2. Animacje i mikrointerakcje                                   │
│ 3. Accessibility                                                 │
│ 4. Performance optimization                                      │
│ → Deliverable: Production-ready UX                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SPRINT 7: Release                             │
├─────────────────────────────────────────────────────────────────┤
│ 1. CI/CD pipeline                                                │
│ 2. App Store assets                                              │
│ 3. Beta testing                                                  │
│ 4. Code signing                                                  │
│ 5. Submission to stores                                          │
│ → Deliverable: Aplikacja w App Store i Google Play              │
└─────────────────────────────────────────────────────────────────┘
```

### Zależności Krytyczne

```
Directus API ──────┬──────► Mapa ──────► Panel miejsca ──────► Galeria
                   │                                           │
                   │                                           ▼
                   └──────► Formularze ──────► PayPal ──────► Audio
```

---

## 6. Najlepsze Praktyki

### Architektura

#### 1. Clean Architecture
```
lib/
├── core/                    # Współdzielone komponenty
│   ├── constants/
│   ├── errors/
│   ├── network/
│   └── utils/
├── features/
│   ├── map/
│   │   ├── data/           # Repositories, data sources
│   │   ├── domain/         # Entities, use cases
│   │   └── presentation/   # Screens, widgets, BLoC
│   ├── place_details/
│   ├── contact/
│   ├── partner/
│   └── donation/
└── injection_container.dart # Dependency injection
```

#### 2. State Management (BLoC Pattern)
```dart
// places_bloc.dart
class PlacesBloc extends Bloc<PlacesEvent, PlacesState> {
  final GetPlacesUseCase getPlaces;
  final FilterPlacesByCategoryUseCase filterByCategory;

  PlacesBloc({required this.getPlaces, required this.filterByCategory})
      : super(PlacesInitial()) {
    on<LoadPlaces>(_onLoadPlaces);
    on<FilterByCategory>(_onFilterByCategory);
    on<SearchPlaces>(_onSearchPlaces);
  }
}
```

#### 3. Repository Pattern
```dart
abstract class PlacesRepository {
  Future<Either<Failure, List<Place>>> getPlaces();
  Future<Either<Failure, Place>> getPlaceById(int id);
  Future<Either<Failure, List<Category>>> getCategories();
}

class PlacesRepositoryImpl implements PlacesRepository {
  final DirectusApiClient apiClient;
  final PlacesLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  // Implementacja z obsługą offline
}
```

### Bezpieczeństwo

#### 1. Przechowywanie Sekretów
```dart
// NIE RÓB TEGO:
const apiKey = "sk_live_xxxxx"; // ❌ Hardcoded

// RÓB TO:
// Użyj flutter_secure_storage lub --dart-define
final storage = FlutterSecureStorage();
final apiKey = await storage.read(key: 'api_key');
```

#### 2. Certificate Pinning
```dart
class ApiClient {
  Dio createDio() {
    final dio = Dio();
    (dio.httpClientAdapter as IOHttpClientAdapter).onHttpClientCreate = (client) {
      client.badCertificateCallback = (cert, host, port) {
        return cert.pem == expectedCertPem;
      };
      return client;
    };
    return dio;
  }
}
```

#### 3. Input Validation
```dart
class PaymentValidator {
  static bool isValidAmount(double amount) {
    return amount >= 1.0 && amount <= 10000.0;
  }

  static String? validateEmail(String? email) {
    if (email == null || email.isEmpty) return null; // opcjonalne
    final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return regex.hasMatch(email) ? null : 'Nieprawidłowy email';
  }
}
```

### Performance

#### 1. Lazy Loading
```dart
// Ładuj obrazy dopiero gdy widoczne
CachedNetworkImage(
  imageUrl: place.imageUrl,
  placeholder: (context, url) => Shimmer(),
  fadeInDuration: Duration(milliseconds: 300),
);
```

#### 2. Marker Clustering
```dart
// Dla 100+ markerów użyj clustering
FlutterMapMarkerCluster(
  markers: markers,
  builder: (context, markers) => Container(
    child: Text('${markers.length}'),
  ),
);
```

#### 3. Pagination
```dart
// Zamiast ładować wszystkie miejsca naraz
Future<List<Place>> getPlaces({int page = 1, int limit = 20}) async {
  final response = await dio.get('/items/Orte', queryParameters: {
    'page': page,
    'limit': limit,
    'sort': '-id',
  });
  return response.data.map((e) => Place.fromJson(e)).toList();
}
```

### Testowanie

#### 1. Unit Tests
```dart
// test/features/map/domain/usecases/get_places_test.dart
void main() {
  late GetPlacesUseCase useCase;
  late MockPlacesRepository mockRepository;

  setUp(() {
    mockRepository = MockPlacesRepository();
    useCase = GetPlacesUseCase(mockRepository);
  });

  test('should get places from repository', () async {
    when(mockRepository.getPlaces())
        .thenAnswer((_) async => Right(testPlaces));

    final result = await useCase();

    expect(result, Right(testPlaces));
    verify(mockRepository.getPlaces());
  });
}
```

#### 2. Widget Tests
```dart
void main() {
  testWidgets('PlaceInfoPanel displays place details', (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: PlaceInfoPanel(place: testPlace),
    ));

    expect(find.text('Test Place'), findsOneWidget);
    expect(find.byType(CachedNetworkImage), findsOneWidget);
  });
}
```

#### 3. Integration Tests
```dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Full user journey: browse places', (tester) async {
    app.main();
    await tester.pumpAndSettle();

    // Verify map loads
    expect(find.byType(GoogleMap), findsOneWidget);

    // Tap on marker
    await tester.tap(find.byKey(Key('marker_1')));
    await tester.pumpAndSettle();

    // Verify panel opens
    expect(find.byType(PlaceInfoPanel), findsOneWidget);
  });
}
```

---

## 7. O Czym Pamiętać

### Platform-Specific Considerations

#### iOS
| Aspekt | Wymaganie |
|--------|-----------|
| Minimum iOS | 14.0+ (dla SwiftUI widgets) |
| App Store Review | 7-14 dni, rygorystyczne guidelines |
| Privacy Labels | Wymagane w App Store Connect |
| Location Usage | NSLocationWhenInUseUsageDescription |
| Background Audio | UIBackgroundModes: audio |
| Push Notifications | APNs certificate |

#### Android
| Aspekt | Wymaganie |
|--------|-----------|
| Minimum SDK | 23 (Android 6.0) |
| Target SDK | 34 (Android 14) |
| Play Store Review | 1-7 dni |
| Location Permission | ACCESS_FINE_LOCATION |
| Background Limits | WorkManager dla background tasks |
| ProGuard Rules | Dla PayPal SDK |

### Regulacje i Compliance

#### GDPR/RODO
```dart
// Wymagane przed użyciem analytics/lokalizacji
class ConsentManager {
  static Future<bool> hasConsent(ConsentType type) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('consent_$type') ?? false;
  }

  static Future<void> setConsent(ConsentType type, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('consent_$type', value);
  }
}
```

#### App Store Guidelines
- **4.2 Minimum Functionality**: Aplikacja musi oferować więcej niż strona mobilna
- **5.1.1 Data Collection**: Jasne informowanie o zbieranych danych
- **3.1.1 In-App Purchase**: Darowizny dla non-profit są dozwolone poza IAP

#### Google Play Policies
- **User Data**: Privacy Policy wymagana
- **Payments**: Darowizny mogą używać external payment processors
- **Location**: Jasne uzasadnienie użycia lokalizacji

### Mapbox → Google Maps Migration

#### Kluczowe Różnice
| Mapbox (Web) | Google Maps (Mobile) |
|--------------|----------------------|
| mapboxgl.Marker | google_maps_flutter Marker |
| GeoJSON sources | MarkerId + Marker |
| Style layers | Custom markers/polylines |
| map.fitBounds() | controller.animateCamera() |

#### Styl Markerów
```dart
// Mapbox web: kolor z kategorii
// Google Maps mobile: BitmapDescriptor
BitmapDescriptor createMarker(Color color) {
  return BitmapDescriptor.defaultMarkerWithHue(
    HSLColor.fromColor(color).hue,
  );
}

// Lub custom marker z asset
final customIcon = await BitmapDescriptor.fromAssetImage(
  ImageConfiguration(size: Size(48, 48)),
  'assets/markers/kultur.png',
);
```

### PayPal Mobile Integration

#### Flow Mobilny vs Web
```
Web Flow:
1. Create Order (API) → 2. Redirect to PayPal → 3. Return URL → 4. Capture

Mobile Flow:
1. Create Order (API) → 2. PayPal SDK Checkout → 3. Callback → 4. Capture
```

#### Implementacja
```dart
// pubspec.yaml
dependencies:
  flutter_paypal_payment: ^1.0.6

// payment_screen.dart
PaypalCheckoutView(
  sandboxMode: true, // false dla production
  clientId: Env.paypalClientId,
  secretKey: Env.paypalSecretKey,
  transactions: [
    {
      "amount": {
        "total": amount.toString(),
        "currency": "EUR",
      },
      "description": "Darowizna FairFuhrer",
    }
  ],
  onSuccess: (data) => _handleSuccess(data),
  onError: (error) => _handleError(error),
  onCancel: () => _handleCancel(),
)
```

### Offline Support

#### Strategia Cache
```dart
// 1. Miejsca i kategorie - cache na 24h
// 2. Obrazy - cache permanentny (Hive)
// 3. Audio - opcjonalny download

class OfflineManager {
  final HiveBox placesBox;
  final HiveBox imagesBox;

  Future<void> syncPlaces() async {
    if (await hasNetwork()) {
      final places = await apiClient.getPlaces();
      await placesBox.put('places', places);
      await placesBox.put('lastSync', DateTime.now());
    }
  }

  List<Place> getPlacesOffline() {
    return placesBox.get('places', defaultValue: []);
  }
}
```

---

## 8. Ryzyka i Mitygacja

### Techniczne

| Ryzyko | Prawdopodobieństwo | Impact | Mitygacja |
|--------|-------------------|--------|-----------|
| Google Maps API limits | Średnie | Wysoki | Cache, rate limiting |
| PayPal SDK bugs | Niskie | Wysoki | Fallback do web checkout |
| Directus API downtime | Niskie | Wysoki | Offline mode, retry logic |
| iOS App Store rejection | Średnie | Średni | Compliance checklist |
| Performance na starszych urządzeniach | Średnie | Średni | Profiling, lazy loading |

### Biznesowe

| Ryzyko | Prawdopodobieństwo | Impact | Mitygacja |
|--------|-------------------|--------|-----------|
| Opóźnienia w development | Wysokie | Średni | Buffer 20%, MVP first |
| Zmiana wymagań w trakcie | Średnie | Wysoki | Agile, frequent demos |
| Niska adopcja użytkowników | Średnie | Wysoki | Beta testing, feedback |
| Koszty API (Google Maps) | Średnie | Średni | Monitoring, cache |

### Mitigation Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROAKTYWNE DZIAŁANIA                         │
├─────────────────────────────────────────────────────────────────┤
│ 1. Feature flags - wyłączanie problematycznych funkcji          │
│ 2. Analytics - monitoring usage i errors (Firebase Crashlytics) │
│ 3. A/B testing - testowanie zmian na części użytkowników        │
│ 4. Remote config - zmiany bez release                           │
│ 5. Force update - wymuszanie aktualizacji przy critical bugs    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Architektura Mobilna

### Diagram Architektury

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FLUTTER APP                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Map       │  │   Place     │  │   Forms     │  │   Payment   │    │
│  │   Feature   │  │   Details   │  │   Feature   │  │   Feature   │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │                │            │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐    │
│  │                        BLoC Layer                               │    │
│  │   PlacesBloc │ CategoriesBloc │ FormBloc │ PaymentBloc         │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│         │                │                │                │            │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐    │
│  │                     Repository Layer                            │    │
│  │   PlacesRepo │ CategoriesRepo │ ContactRepo │ PaymentRepo      │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│         │                │                │                │            │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐    │
│  │                    Data Source Layer                            │    │
│  │   ┌─────────────────┐         ┌─────────────────┐              │    │
│  │   │  Remote Source  │         │  Local Source   │              │    │
│  │   │  (Dio/HTTP)     │         │  (Hive/SQLite)  │              │    │
│  │   └────────┬────────┘         └────────┬────────┘              │    │
│  └────────────┼──────────────────────────┼──────────────────────────┘    │
└───────────────┼──────────────────────────┼──────────────────────────────┘
                │                          │
                ▼                          ▼
┌───────────────────────────┐    ┌───────────────────────────┐
│      EXTERNAL APIS        │    │      LOCAL STORAGE        │
├───────────────────────────┤    ├───────────────────────────┤
│  • Directus CMS           │    │  • Hive (places cache)    │
│  • Next.js API Routes     │    │  • Secure Storage         │
│  • PayPal API             │    │  • SharedPreferences      │
│  • Google Maps API        │    │  • Image Cache            │
│  • Supabase Storage       │    │                           │
└───────────────────────────┘    └───────────────────────────┘
```

### Folder Structure (Flutter)

```
lib/
├── main.dart
├── injection_container.dart
│
├── core/
│   ├── constants/
│   │   ├── api_constants.dart
│   │   ├── app_constants.dart
│   │   └── map_constants.dart
│   ├── errors/
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   ├── network/
│   │   ├── api_client.dart
│   │   ├── network_info.dart
│   │   └── interceptors.dart
│   ├── theme/
│   │   ├── app_theme.dart
│   │   ├── colors.dart
│   │   └── text_styles.dart
│   └── utils/
│       ├── validators.dart
│       └── formatters.dart
│
├── features/
│   ├── map/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   ├── places_remote_datasource.dart
│   │   │   │   └── places_local_datasource.dart
│   │   │   ├── models/
│   │   │   │   ├── place_model.dart
│   │   │   │   └── category_model.dart
│   │   │   └── repositories/
│   │   │       └── places_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── place.dart
│   │   │   │   └── category.dart
│   │   │   ├── repositories/
│   │   │   │   └── places_repository.dart
│   │   │   └── usecases/
│   │   │       ├── get_places.dart
│   │   │       ├── get_categories.dart
│   │   │       └── filter_places.dart
│   │   └── presentation/
│   │       ├── bloc/
│   │       │   ├── places_bloc.dart
│   │       │   ├── places_event.dart
│   │       │   └── places_state.dart
│   │       ├── pages/
│   │       │   └── map_page.dart
│   │       └── widgets/
│   │           ├── map_view.dart
│   │           ├── category_filter.dart
│   │           └── search_bar.dart
│   │
│   ├── place_details/
│   │   └── [similar structure]
│   │
│   ├── contact/
│   │   └── [similar structure]
│   │
│   ├── partner/
│   │   └── [similar structure]
│   │
│   └── donation/
│       └── [similar structure]
│
└── shared/
    ├── widgets/
    │   ├── loading_indicator.dart
    │   ├── error_widget.dart
    │   └── cached_image.dart
    └── services/
        ├── location_service.dart
        ├── analytics_service.dart
        └── consent_service.dart
```

---

## 10. Podsumowanie

### Kluczowe Decyzje

| Decyzja | Rekomendacja | Uzasadnienie |
|---------|--------------|--------------|
| Framework | Flutter | Jeden codebase, natywna wydajność |
| State Management | BLoC | Skalowalne, testowalne, Flutter-native |
| Mapy | Google Maps | Lepsza licencja mobilna, większe limity |
| HTTP Client | Dio | Interceptory, retry, cache |
| Local Storage | Hive + Secure Storage | Szybki, typowany, bezpieczny |
| DI | GetIt + Injectable | Prosty, code generation |
| Architecture | Clean Architecture | Separacja concerns, testowalność |

### Checklist Przed Startem

- [ ] Zarejestrować Google Maps API key (z ograniczeniami per-app)
- [ ] Utworzyć konta developerskie (Apple Developer, Google Play Console)
- [ ] Przygotować Firebase project (Analytics, Crashlytics)
- [ ] Skonfigurować PayPal Sandbox credentials
- [ ] Przygotować środowiska (dev, staging, prod)
- [ ] Ustalić minimalny zakres MVP
- [ ] Przygotować plan beta testów

### Następne Kroki

1. **Natychmiastowe:** Decyzja o technologii (Flutter vs React Native)
2. **Krótkoterminowe:** Setup projektu, architektura, CI/CD
3. **Średnioterminowe:** Implementacja MVP (mapa + miejsca)
4. **Długoterminowe:** Formularze, płatności, release

---

## Załączniki

### A. Koszty Szacunkowe (Miesięczne)

| Usługa | Tier Free | Szacowany Koszt |
|--------|-----------|-----------------|
| Google Maps Mobile | 28k loads/month | €0 (do limitu) |
| Firebase | Spark Plan | €0 |
| Supabase | Free tier | €0 |
| Apple Developer | - | €99/rok |
| Google Play Console | - | €25 jednorazowo |
| **RAZEM (rok 1)** | | **~€125** |

### B. Przydatne Linki

- [Flutter Documentation](https://docs.flutter.dev/)
- [Google Maps Flutter Package](https://pub.dev/packages/google_maps_flutter)
- [Flutter BLoC Library](https://bloclibrary.dev/)
- [PayPal Mobile SDK](https://developer.paypal.com/docs/checkout/mobile/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/console/policy-center/)

---

*Raport wygenerowany: 2026-01-13*
*Wersja: 1.0*

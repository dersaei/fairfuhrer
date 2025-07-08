"use client";
import React, { useRef, useEffect, useState } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { getPageAssetUrl } from "@/lib/supabase";
import Link from "next/link";
import type { StyleSpecification } from "mapbox-gl";
import styles from "./page.module.css";
import { Heart, Star, Users, Headphones, MapPin } from "lucide-react";

// Typ dla naszego stylu atmosfery
interface AtmosphereStyle extends StyleSpecification {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

// Hook do responsywnych ustawień mapy
const useResponsiveMapSettings = (
  baseZoom: number,
  basePitch: number,
  baseBearing: number
) => {
  const [settings, setSettings] = useState<{
    zoom: number;
    pitch: number;
    bearing: number;
  }>({
    zoom: baseZoom,
    pitch: basePitch,
    bearing: baseBearing,
  });

  useEffect(() => {
    // Nie uruchamiaj jeśli wartości to 0 (znaczy że dane się jeszcze nie załadowały)
    if (baseZoom === 0 && basePitch === 0 && baseBearing === 0) {
      return;
    }

    const updateSettings = () => {
      const width = window.innerWidth;

      const newSettings =
        width <= 950
          ? {
              zoom: baseZoom - 0.38,
              pitch: basePitch,
              bearing: baseBearing,
            }
          : {
              zoom: baseZoom,
              pitch: basePitch,
              bearing: baseBearing,
            };

      setSettings(newSettings);
    };

    updateSettings();

    const handleResize = () => {
      updateSettings();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [baseZoom, basePitch, baseBearing]);

  return settings;
};

export default function HomePage() {
  const mapRef = useRef<MapRef>(null);
  const [atmosphereStyle, setAtmosphereStyle] =
    useState<AtmosphereStyle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  // Responsywne ustawienia kamery - tylko gdy atmosphereStyle jest załadowany
  const responsiveSettings = useResponsiveMapSettings(
    atmosphereStyle?.zoom || 0,
    atmosphereStyle?.pitch || 0,
    atmosphereStyle?.bearing || 0
  );

  // Załaduj styl atmosphere z public/styles/
  useEffect(() => {
    const loadAtmosphereStyle = async () => {
      try {
        const response = await fetch("/styles/atmosphere-v2.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const style = (await response.json()) as AtmosphereStyle;
        setAtmosphereStyle(style);
      } catch (error) {
        console.error("Fehler beim Laden des Atmosphere-Stils:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAtmosphereStyle();
  }, []);

  // Obsługa załadowania mapy
  const handleMapLoad = () => {
    setMapLoaded(true);

    // Upewnij się, że mapa ma prawidłowe ustawienia po załadowaniu
    if (mapRef.current && atmosphereStyle) {
      const map = mapRef.current.getMap();

      // Daj mapie czas na pełne załadowanie przed ustawieniem widoku
      setTimeout(() => {
        map.jumpTo({
          center: atmosphereStyle.center,
          zoom: responsiveSettings.zoom,
          bearing: responsiveSettings.bearing,
          pitch: responsiveSettings.pitch,
        });

        // Wymuszaj ponowne renderowanie
        map.triggerRepaint();
      }, 100);
    }
  };

  // Efekt dla aktualizacji widoku na resize - tylko gdy mapa jest załadowana
  useEffect(() => {
    if (mapRef.current && atmosphereStyle && responsiveSettings && mapLoaded) {
      const map = mapRef.current.getMap();

      map.jumpTo({
        center: atmosphereStyle.center,
        zoom: responsiveSettings.zoom,
        bearing: responsiveSettings.bearing,
        pitch: responsiveSettings.pitch,
      });

      setTimeout(() => {
        map.triggerRepaint();
      }, 100);
    }
  }, [atmosphereStyle, responsiveSettings, mapLoaded]);

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div>Karte wird geladen...</div>
      </div>
    );
  }

  // Error state
  if (!atmosphereStyle) {
    return (
      <div className={styles.loadingContainer}>
        <div>Fehler beim Laden des Kartenstils</div>
      </div>
    );
  }

  return (
    <>
      <main className={styles.main}>
        {/* Przycisk Sparschwein - FIXED POSITION */}
        <Link href="/sparschwein" className={styles.sparschweineButton}>
          <div>
            <Image
              src={getPageAssetUrl("sparschwein-ff.png")}
              alt="Sparschwein"
              width={100}
              height={100}
              style={{ objectFit: "contain" }}
              unoptimized
            />
          </div>
          <div className={styles.sparschweineSubtitle}>Danke</div>
        </Link>

        {/* Sekcja 1: Mapa */}
        <div className={styles.container}>
          <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle={atmosphereStyle}
            projection="globe"
            interactive={false}
            cursor="default"
            onLoad={handleMapLoad}
            initialViewState={{
              longitude: atmosphereStyle.center[0],
              latitude: atmosphereStyle.center[1],
              zoom: responsiveSettings.zoom || atmosphereStyle.zoom,
              bearing: responsiveSettings.bearing || atmosphereStyle.bearing,
              pitch: responsiveSettings.pitch || atmosphereStyle.pitch,
            }}
            style={{ width: "100%", height: "100%" }}
          />

          {/* Napis po lewej stronie */}
          <div className={styles.leftText}>
            <h2 className={styles.section1Title}>
              Dein Reiseführer für Geschichte und gute Geschichten
            </h2>
            <h3 className={styles.section1Subtitle}>
              Rund um den Bodensee und im Allgäu
            </h3>
          </div>

          {/* Przycisk Play na środku globu - ZAMIENIONY NA LINK */}
          <Link href="/karte" className={styles.playButtonContainer}>
            <div className={styles.playButton}>
              <div className={styles.playTriangle} />
            </div>
            <div className={styles.mapText}>Zur Karte</div>
          </Link>
        </div>

        {/* SEKCJA 2: Gute Geschichten */}
        <section className={styles.section2}>
          <div className={styles.section2Content}>
            <h2 className={styles.section2Title}>
              Hunderte{" "}
              <span className={styles.section2TitleGradient}>
                Gute Geschichten
              </span>{" "}
              vom Bodensee, aus dem Allgäu und aus aller Welt
            </h2>

            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <MapPin size={24} />
                </div>
                <h3 className={styles.featureTitle}>Einzigartige Highlights</h3>
                <p className={styles.featureDescription}>
                  Jede Stecknadel erzählt über ein einzigartiges Highlight,
                  einen Insidertipp oder eine regionale Anekdote
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <Headphones size={24} />
                </div>
                <h3 className={styles.featureTitle}>
                  Über 10 Stunden Hörerlebnis
                </h3>
                <p className={styles.featureDescription}>
                  Spannend, interessant und unterhaltsam - ein umfassendes
                  Audioerlebnis für Ihre Entdeckungsreise
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <Star size={24} />
                </div>
                <h3 className={styles.featureTitle}>
                  Nachhaltigkeit & Innovation
                </h3>
                <p className={styles.featureDescription}>
                  Basierend auf dem Augenmerk für Nachhaltigkeit und Innovation
                  in unserer wunderschönen Region
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <Users size={24} />
                </div>
                <h3 className={styles.featureTitle}>Heimische Angebote</h3>
                <p className={styles.featureDescription}>
                  Entdecken Sie lokale Unternehmen und Initiativen, die unsere
                  Region zu etwas Besonderem machen
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEKCJA 3: Inspirierendes Entdecken */}
        <section className={styles.section3}>
          <div className={styles.section3Content}>
            <div className={styles.section3TextSide}>
              <h2 className={styles.section3Title}>
                Interessantes, Informatives, Inspirierendes Entdecken
              </h2>
              <p className={styles.section3Text}>
                Staunen Sie über die innovativen & nachhaltigen Angebote unserer
                Region! Hören Sie ihrer Geschichte zu und werden Sie zu ihrem
                Besucher. Entdecken Sie die verborgenen Schätze rund um den
                Bodensee und im Allgäu.
              </p>
            </div>

            <div className={styles.section3ImageSide}>
              {/* Tutaj możesz dodać obraz lub pozostawić jako placeholder */}
              <span>🎧 Audio-Guides</span>
            </div>
          </div>
        </section>

        {/* SEKCJA 4: Partner werden */}
        <section className={styles.section4}>
          <div className={styles.section4Content}>
            <div className={styles.section4Badge}>
              <Heart size={16} />
              Partner werden
            </div>

            <h2 className={styles.section4Title}>
              Lassen Sie Uns Gemeinsam Ihre Gute Geschichte Erzählen!
            </h2>

            <p className={styles.section4Text}>
              Ihr Betrieb, Ihr Verein o.ä. handelt im Sinne der 17 Ziele für
              nachhaltige Entwicklung (SDGs)? Ihr sinnstiftendes Tun und Ihr
              Beitrag zu einer besseren und gerechteren Welt hat mehr
              Aufmerksamkeit verdient? Dann freuen wir uns, wenn Sie Partner
              unseres Netzwerkes werden und der FAIRFÜHRER Ihr Angebot
              &quot;fairmarkten&quot; darf.
            </p>

            <Link href="/partner-werden" className={styles.partnerButton}>
              <Users size={20} />
              Partner werden
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

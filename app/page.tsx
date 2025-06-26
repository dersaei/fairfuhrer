"use client";
import React, { useRef, useEffect, useState } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";
import type { StyleSpecification } from "mapbox-gl";
import styles from "./page.module.css";

// Typ dla naszego stylu atmosfery
interface AtmosphereStyle extends StyleSpecification {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

export default function HomePage() {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const [atmosphereStyle, setAtmosphereStyle] =
    useState<AtmosphereStyle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

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
        console.error("Błąd podczas ładowania stylu atmosphere:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAtmosphereStyle();
  }, []);

  // Efekt dla ręcznej aktualizacji widoku (po załadowaniu stylu)
  useEffect(() => {
    if (mapRef.current && atmosphereStyle) {
      const map = mapRef.current.getMap();

      // Wymuś aktualizację parametrów kamery
      map.jumpTo({
        center: atmosphereStyle.center,
        zoom: atmosphereStyle.zoom,
        bearing: atmosphereStyle.bearing,
        pitch: atmosphereStyle.pitch,
      });

      // Dodaj opóźnienie dla pewności
      setTimeout(() => {
        map.triggerRepaint();
      }, 100);
    }
  }, [atmosphereStyle]);

  // Funkcja obsługi kliknięcia
  const handleMapClick = () => {
    router.push("/karte");
  };

  const handlePartnerClick = () => {
    router.push("/partner-werden");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div>Ładowanie mapy...</div>
      </div>
    );
  }

  // Error state
  if (!atmosphereStyle) {
    return (
      <div className={styles.loadingContainer}>
        <div>Błąd podczas ładowania stylu mapy</div>
      </div>
    );
  }

  return (
    <>
      <main className={styles.main}>
        {/* Sekcja 1: Mapa (oryginalny kod) */}
        <div className={styles.container}>
          {/* Mapa jako tło */}
          <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle={atmosphereStyle}
            projection="globe"
            interactive={false}
            cursor="pointer"
            onClick={handleMapClick}
            initialViewState={{
              longitude: atmosphereStyle.center[0],
              latitude: atmosphereStyle.center[1],
              zoom: atmosphereStyle.zoom,
              bearing: atmosphereStyle.bearing,
              pitch: atmosphereStyle.pitch,
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

          {/* Przycisk Play na środku globu */}
          <div onClick={handleMapClick} className={styles.playButtonContainer}>
            {/* Ikona Play */}
            <div className={styles.playButton}>
              {/* Trójkąt Play */}
              <div className={styles.playTriangle} />
            </div>

            {/* Tekst "Zur Karte" */}
            <div className={styles.mapText}>Zur Karte</div>
          </div>
        </div>

        {/* Sekcja 2: Was macht uns besonders? */}
        <section className={styles.section}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>
              Hunderte Gute Geschichten vom Bodensee, Aus Dem Allgäu Und Aus
              Aller Welt
            </h2>

            <ul className={styles.sectionText}>
              <li>
                jede Stecknadel erzählt über ein einzigartiges Highlight / einen
                Insidertipp / ein heimisches Angebot / eine regionale Anekdote
              </li>
              <li>über 10 Stunden Hörerlebnis</li>
              <li>spannend, interessant und unterhaltsam</li>
              <li>basierend auf dem Augenmerk Nachhaltigkeit und Innovation</li>
            </ul>
          </div>
        </section>

        {/* Sekcja 3: Unsere Mission */}
        <section className={styles.section}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>
              Interessantes, Informatives, Inspirierendes Entdecken
            </h2>
            <p className={styles.sectionText}>
              Staunen Sie über die innovativen & nachhaltigen Angebote unserer
              Region! Hören Sie ihrer Geschichte zu und werden Sie zu ihrem
              Besucher...
            </p>
          </div>
        </section>

        {/* Sekcja 4: Partner werden */}
        <section className={styles.section}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>
              Lassen Sie Uns Gemeinsam Ihre Gute Geschichte Erzählen!
            </h2>
            <p className={styles.sectionText}>
              Ihr Betrieb, Ihr Verein o.ä. handelt im Sinne der 17 Ziele für
              nachhaltige Entwicklung (SDGs)? Ihr sinnstiftendes Tun und Ihr
              Beitrag zu einer besseren und gerechteren Welt / Umwelt hat mehr
              Aufmerksamkeit verdient? Dann freuen wir uns, wenn Sie Partner
              unseres Netzwerkes werden und der FAIRFÜHRER Ihr Angebot
              &quot;fairmarkten&quot; darf.
            </p>
            <button
              type="button"
              onClick={handlePartnerClick}
              className={styles.partnerButton}
            >
              Partner werden
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

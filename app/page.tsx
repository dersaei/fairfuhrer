"use client";
import React, { useRef, useEffect, useState } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import Link from "next/link";
import type { StyleSpecification } from "mapbox-gl";
import styles from "./page.module.css";

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

  // Efekt dla aktualizacji widoku na resize
  useEffect(() => {
    if (mapRef.current && atmosphereStyle && responsiveSettings) {
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
  }, [atmosphereStyle, responsiveSettings]);

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
        {/* Sekcja 1: Mapa */}
        <div className={styles.container}>
          <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle={atmosphereStyle}
            projection="globe"
            interactive={false}
            cursor="default"
            initialViewState={{
              longitude: atmosphereStyle.center[0],
              latitude: atmosphereStyle.center[1],
              zoom: responsiveSettings.zoom,
              bearing: responsiveSettings.bearing,
              pitch: responsiveSettings.pitch,
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

        {/* Pozostałe sekcje bez zmian */}
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
            {/* PRZYCISK PARTNER ZAMIENIONY NA LINK */}
            <Link href="/partner-werden" className={styles.partnerButton}>
              Partner werden
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  lazy,
  Suspense,
  Activity,
} from "react";
import mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import "mapbox-gl/dist/mapbox-gl.css";
import DOMPurify from "dompurify";
import styles from "./MapBoxMap.module.css";
import MapSearch from "./MapSearch";
import type { Place } from "../types";

// LAZY LOADING komponentów
const PlaceInfoPanel = lazy(() => import("./PlaceInfoPanel"));
const FullscreenGallery = lazy(() => import("./FullscreenGallery"));

interface MapBoxMapProps {
  places: Place[];
}

export default function MapBoxMap({ places }: MapBoxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  // ✅ STYLE LAYERS: No longer need markersRef - layers are managed by Mapbox
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userLocationRequestedRef = useRef(false);
  const hasPerformedInitialFitRef = useRef(false); // ✅ Track if initial fitBounds was done
  const hoveredFeatureIdRef = useRef<string | number | null>(null); // ✅ Track hovered feature for feature-state
  const mapInitializingRef = useRef(false); // ✅ REACT STRICT MODE FIX: Guard against double initialization
  const hoverPopupRef = useRef<mapboxgl.Popup | null>(null); // ✅ Track hover popup for cleanup

  // Panel state
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  // Gallery state
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<
    string | null
  >(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Map state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [mapLoadingState, setMapLoadingState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // ========================================
  // BASIC UTILITIES
  // ========================================

  const isValidMapboxToken = () => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    return Boolean(token && token.startsWith("pk."));
  };

  // ========================================
  // GEOJSON CONVERSION (for Style Layers)
  // ========================================

  /**
   * Convert Places array to GeoJSON FeatureCollection
   * This enables using Style Layers instead of DOM Markers for better performance
   *
   * According to Mapbox documentation:
   * - Each feature MUST have an 'id' for feature-state support (hover, selection)
   * - Properties can include any JSON-serializable data
   * - Coordinates must be in [longitude, latitude] format
   *
   * @param placesData - Array of Place objects from database
   * @returns GeoJSON FeatureCollection compatible with Mapbox GL JS
   */
  const placesToGeoJSON = useCallback((placesData: Place[]) => {
    return {
      type: "FeatureCollection" as const,
      features: placesData
        .filter((place) => place.Breite && place.Lange)
        .map((place) => ({
          type: "Feature" as const,
          // ✅ CRITICAL: Explicit ID for feature-state support
          // Mapbox docs: "A property to use as a feature id (for feature state)"
          id: place.id,
          geometry: {
            type: "Point" as const,
            // ✅ Coordinates in [longitude, latitude] format (GeoJSON spec)
            coordinates: [place.Lange, place.Breite],
          },
          properties: {
            // ✅ Store all relevant data as properties for expressions
            id: place.id,
            name: place.Name,
            address: place.Adresse,
            phone: place.Telefon || "",
            description: place.Vollbeschreibung || "",
            mainImage: place.Hauptbild || "",
            audioFile: place.Audio_Datei || "",
            linkUrl: place.Link_URL || "",
            linkText: place.Link_Text || "",
            // Category data for data-driven styling
            categoryId: place.Kategorie[0]?.id || 0,
            categoryColor: place.Kategorie[0]?.color || "#3388ff",
            categoryName: place.Kategorie[0]?.name || "Uncategorized",
          },
        })),
    };
  }, []);

  // ========================================
  // CORE MAP FUNCTIONS
  // ========================================

  const animateToLocation = useCallback(
    (location: [number, number], zoom: number, duration = 1500) => {
      if (mapRef.current) {
        mapRef.current.easeTo({
          center: location,
          zoom: zoom,
          duration: duration,
          easing: (t) => 1 - Math.pow(1 - t, 3),
          essential: true,
        });
      }
    },
    []
  );

  const addUserLocationMarker = useCallback(
    (map: mapboxgl.Map, location: [number, number]) => {
      try {
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.remove();
          userLocationMarkerRef.current = null;
        }

        if (!map || !map.loaded()) {
          console.warn("⚠️ Map not loaded, skipping marker");
          return;
        }

        if (!document.head.querySelector("#user-location-styles")) {
          const style = document.createElement("style");
          style.id = "user-location-styles";
          style.textContent = `
            .user-location-marker {
              position: relative;
              width: 20px;
              height: 20px;
              cursor: pointer;
            }
            .user-location-marker .marker-dot {
              position: absolute;
              top: 0;
              left: 0;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #4285F4;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              z-index: 2;
            }
            .user-location-marker .marker-pulse {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: rgba(66, 133, 244, 0.4);
              transform: translate(-50%, -50%);
              animation: user-location-pulse 2s infinite;
              z-index: 1;
            }
            @keyframes user-location-pulse {
              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
            }
          `;
          document.head.appendChild(style);
        }

        const userMarkerElement = document.createElement("div");
        userMarkerElement.className = "user-location-marker";
        userMarkerElement.innerHTML = `
          <div class="marker-dot"></div>
          <div class="marker-pulse"></div>
        `;

        // ✅ XSS PROTECTION: Sanityzacja HTML (choć to statyczny tekst)
        const userPopupHTML = DOMPurify.sanitize(`
          <div>
            <h3>Ihre Position</h3>
            <p>Sie sind hier</p>
          </div>
        `);

        const popup = new mapboxgl.Popup({
          offset: [0, -15],
          closeButton: false,
          className: styles.popup,
        }).setHTML(userPopupHTML);

        const userMarker = new mapboxgl.Marker({ element: userMarkerElement })
          .setLngLat(location)
          .setPopup(popup)
          .addTo(map);

        userMarkerElement.addEventListener("mouseenter", () => {
          if (userMarker.getPopup()) userMarker.togglePopup();
        });

        userMarkerElement.addEventListener("mouseleave", () => {
          setTimeout(() => {
            if (userMarker.getPopup()?.isOpen()) userMarker.togglePopup();
          }, 300);
        });

        userLocationMarkerRef.current = userMarker;
      } catch (error) {
        console.error("❌ Błąd podczas dodawania markera użytkownika:", error);
      }
    },
    [] // Empty deps is OK - this function doesn't depend on external state
  );

  // ========================================
  // PANEL FUNCTIONS
  // ========================================

  const openPanel = useCallback(
    (place: Place) => {
      setSelectedPlace(place);
      setIsPanelOpen(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsPanelVisible(true);

          if (mapRef.current) {
            const currentZoom = mapRef.current.getZoom();
            setTimeout(() => {
              animateToLocation(
                [place.Lange, place.Breite],
                Math.max(currentZoom, 12),
                1200
              );
            }, 300);
          }
        });
      });
    },
    [animateToLocation]
  );

  const closePanel = useCallback(() => {
    setIsPanelVisible(false);
    setSelectedGalleryImage(null);
    setCurrentImageIndex(0);

    // ✅ Clear selected state from all features when closing panel
    if (mapRef.current && selectedPlace) {
      const source = mapRef.current.getSource(
        "places-source"
      ) as mapboxgl.GeoJSONSource;
      if (source) {
        mapRef.current.removeFeatureState({
          source: "places-source",
        });
      }
    }

    // ✅ Remove hover popup if exists
    if (hoverPopupRef.current) {
      hoverPopupRef.current.remove();
      hoverPopupRef.current = null;
    }

    setTimeout(() => {
      setIsPanelOpen(false);
    }, 600);
  }, [selectedPlace]);

  // ✅ POPRAWIONY HANDLER DLA WYSZUKIWARKI
  const handleSearchPlaceSelect = useCallback(
    (place: Place) => {
      // Najpierw otwórz panel
      openPanel(place);

      // Następnie animuj do miejsca (po krótkim opóźnieniu)
      setTimeout(() => {
        animateToLocation([place.Lange, place.Breite], 14, 1200);
      }, 100);
    },
    [openPanel, animateToLocation]
  );

  // ========================================
  // GALLERY FUNCTIONS
  // ========================================

  const handleImageClick = useCallback((imagePath: string, index: number) => {
    setCurrentImageIndex(index);
    setSelectedGalleryImage(imagePath);
  }, []);

  const handleNextImage = useCallback(() => {
    if (!selectedPlace?.Galerie_Bilder) return;
    setCurrentImageIndex(
      (prev) => (prev + 1) % selectedPlace.Galerie_Bilder!.length
    );
  }, [selectedPlace?.Galerie_Bilder]);

  const handlePrevImage = useCallback(() => {
    if (!selectedPlace?.Galerie_Bilder) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedPlace.Galerie_Bilder!.length - 1 : prev - 1
    );
  }, [selectedPlace?.Galerie_Bilder]);

  const closeGalleryOnly = useCallback(() => {
    setSelectedGalleryImage(null);
    setCurrentImageIndex(0);
  }, []);

  // ========================================
  // GEOLOCATION
  // ========================================

  const getUserLocation = useCallback(() => {
    userLocationRequestedRef.current = true;

    if (!navigator.geolocation) {
      console.warn("❌ Geolocation wird von diesem Browser nicht unterstützt");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [longitude, latitude];
        setUserLocation(newLocation);

        if (mapRef.current) {
          // Small delay to ensure smooth animation after location received
          setTimeout(() => {
            animateToLocation(newLocation, 14, 1800);
          }, 100);
        } else {
          console.warn("⚠️ Map not ready yet, location saved but not animated");
        }
      },
      (error) => {
        console.error("❌ Geolocation-Fehler:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.warn(
              "🚫 Benutzer hat den Zugriff auf die Position verweigert"
            );
            break;
          case error.POSITION_UNAVAILABLE:
            console.warn("📍 Positionsinformationen sind nicht verfügbar");
            break;
          case error.TIMEOUT:
            console.warn("⏱️ Zeitüberschreitung beim Abrufen der Position");
            break;
          default:
            console.warn(
              "❓ Ein unbekannter Fehler beim Abrufen der Position ist aufgetreten"
            );
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [animateToLocation]); // ✅ Include dependencies for React 19

  // ========================================
  // MAP INITIALIZATION
  // ========================================

  const initializeMap = useCallback(() => {
    // ✅ REACT STRICT MODE FIX: Multiple guards against double initialization
    // 1. Check if map instance exists
    // 2. Check if container is missing
    // 3. Check if initialization is in progress (flag)
    // 4. Check if container already has map elements (DOM check - most reliable!)
    if (mapRef.current) {
      return;
    }
    if (!containerRef.current) {
      return;
    }
    if (mapInitializingRef.current) {
      return;
    }
    // ✅ DOM CHECK: Most reliable guard - Mapbox adds canvas/elements to container
    if (containerRef.current.children.length > 0) {
      return;
    }

    // ✅ Set flag IMMEDIATELY before any async operations
    mapInitializingRef.current = true;

    if (!isValidMapboxToken()) {
      setMapLoadingState("error");
      mapInitializingRef.current = false; // Reset on error
      return;
    }

    try {
      setMapLoadingState("loading");
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        // ✅ Mapbox Standard Style - includes all required root properties:
        // - glyphs: Required for text-field (our cluster-count layer)
        // - sprite: Required for icon-image, patterns
        // - sources: Base map sources (streets, terrain, etc.)
        // - layers: Base map layers
        style: "mapbox://styles/mapbox/standard",
        center: userLocation || [9.0, 47.5],
        zoom: userLocation ? 12 : 6,
        // ✅ Projection: Supported by Mapbox for terrain, sky, and fog
        projection: "globe", // 3D globe projection for better visual experience
        // ✅ attributionControl removed - using default (required by Mapbox ToS)
      });

      map.on("load", () => {
        setMapLoadingState("success");

        // ✅ Set fog for atmospheric effect (Mapbox Standard best practice)
        map.setFog({});
        map.addControl(new MapboxLanguage({ defaultLanguage: "de" }));
        map.addControl(new mapboxgl.NavigationControl(), "top-left");

        // ✅ CRITICAL: Add style layers immediately after map loads
        // This ensures layers are added with initial places data
        const geojsonData = placesToGeoJSON(places);
        const sourceId = "places-source";

        map.addSource(sourceId, {
          type: "geojson",
          data: geojsonData as GeoJSON.FeatureCollection<GeoJSON.Point>,
          // ✅ Clustering configuration (Mapbox best practices)
          cluster: true,
          clusterMaxZoom: 14, // Stop clustering at zoom 15 (one less than maxzoom)
          clusterRadius: 50, // Radius in pixels for clustering
          clusterMinPoints: 2, // Minimum points to form a cluster (default: 2)
          // ✅ Performance optimization
          tolerance: 0.375, // Douglas-Peucker simplification (default, optimal for points)
          // ✅ Dynamic updates - enables updateData() for incremental updates
          promoteId: "id", // Use 'id' property as feature ID for dynamic updates
          // ✅ Feature ID generation - backup if manual ID is missing
          // Note: We already set IDs manually in placesToGeoJSON, but this provides fallback
          generateId: false, // We provide IDs explicitly for feature-state
          // ✅ Tile configuration
          buffer: 128, // Default buffer size - good balance between artifacts and performance
          maxzoom: 18, // Maximum zoom for vector tiles generation
        });

        // Add all three layers
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: sourceId,
          filter: ["has", "point_count"],
          slot: "middle",
          paint: {
            // ✅ interpolate for smooth color transitions in perceptually uniform color space
            "circle-color": [
              "interpolate",
              ["linear"],
              ["to-number", ["get", "point_count"], 0],
              0,
              "#51bbd6", // Light blue for small clusters
              10,
              "#f1f075", // Yellow for medium clusters
              30,
              "#f28cb1", // Pink for large clusters
            ],
            // ✅ Smooth transition for color changes
            "circle-color-transition": {
              duration: 400,
              delay: 0,
            },
            // ✅ Interpolate for cluster radius with smooth exponential growth
            "circle-radius": [
              "interpolate",
              ["exponential", 1.5],
              ["to-number", ["get", "point_count"], 0],
              0,
              24, // Base radius - increased for better visibility
              10,
              34, // Medium radius
              30,
              46, // Large radius
            ],
            // ✅ Smooth transition for radius changes
            "circle-radius-transition": {
              duration: 400,
              delay: 0,
            },
            // ✅ Enhanced opacity for better visibility
            "circle-opacity": 0.92, // Increased for better visibility
            "circle-opacity-transition": {
              duration: 300,
              delay: 0,
            },
            // ✅ BLACK stroke for much better contrast!
            "circle-stroke-width": 2.5, // Increased from 2
            "circle-stroke-color": "rgba(0, 0, 0, 0.75)", // Black stroke instead of white
            "circle-stroke-width-transition": {
              duration: 300,
              delay: 0,
            },
            // ✅ Add subtle blur for depth effect
            "circle-blur": 0.15,
          },
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: sourceId,
          filter: ["has", "point_count"],
          slot: "middle",
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            // ✅ Dynamic text size based on cluster size for better readability
            "text-size": [
              "interpolate",
              ["linear"],
              ["to-number", ["get", "point_count"], 0],
              0,
              13, // Smaller clusters
              10,
              14, // Medium clusters
              30,
              16, // Large clusters
            ],
          },
          paint: {
            "text-color": "#ffffff",
            // ✅ Add text halo for better contrast and visibility
            "text-halo-color": "rgba(0, 0, 0, 0.3)",
            "text-halo-width": 1.5,
            "text-halo-blur": 0.5,
            // ✅ Smooth opacity transition
            "text-opacity": 1.0,
            "text-opacity-transition": {
              duration: 300,
              delay: 0,
            },
          },
        });

        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: sourceId,
          filter: ["!", ["has", "point_count"]],
          slot: "middle",
          paint: {
            // ✅ Type-safe color with fallback (Mapbox best practice)
            "circle-color": [
              "coalesce",
              ["to-color", ["get", "categoryColor"]],
              "#3388ff", // Fallback color if categoryColor is invalid
            ],
            // ✅ Dynamic radius based on hover and selection state
            // Note: Smaller differences to minimize visual "jump" (feature-state transitions have limitations)
            "circle-radius": [
              "interpolate",
              ["exponential", 1.75],
              ["zoom"],
              6,
              [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                6.5, // Subtle increase on hover (20% larger)
                ["boolean", ["feature-state", "selected"], false],
                6, // Slightly larger when selected
                5.5, // Default - good base visibility
              ],
              10,
              [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                11.5, // Subtle increase
                ["boolean", ["feature-state", "selected"], false],
                11,
                10, // Default
              ],
              14,
              [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                15.5, // Subtle increase
                ["boolean", ["feature-state", "selected"], false],
                15,
                14, // Default
              ],
            ],
            // ⚠️ MAPBOX LIMITATION: Transitions don't work with feature-state changes
            // According to Mapbox documentation, transitions trigger only for:
            // ✅ Zoom level changes (camera expressions)
            // ✅ Source data updates
            // ✅ setPaintProperty() calls
            // ❌ setFeatureState() calls (our hover/select implementation)
            //
            // This transition property is kept because:
            // 1. It works for zoom-based radius changes
            // 2. Future Mapbox versions may support it
            // 3. It's the correct syntax per documentation
            "circle-radius-transition": {
              duration: 200,
              delay: 0,
            },
            // ✅ Dynamic stroke width - subtle changes for smoother feel
            "circle-stroke-width": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              3.5, // Modest increase on hover
              ["boolean", ["feature-state", "selected"], false],
              3.25, // Slightly thicker when selected
              3, // Default - good visibility with black stroke
            ],
            "circle-stroke-width-transition": {
              duration: 200,
              delay: 0,
            },
            // ✅ BLACK stroke for much better contrast and visibility!
            "circle-stroke-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              "#000000", // Solid black on hover
              ["boolean", ["feature-state", "selected"], false],
              "#1a1a1a", // Very dark gray when selected
              "rgba(0, 0, 0, 0.85)", // Almost black default - excellent contrast
            ],
            // ✅ Dynamic opacity for different states
            "circle-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              1.0, // Full opacity on hover
              ["boolean", ["feature-state", "selected"], false],
              0.98, // High opacity when selected
              0.96, // Slightly increased default opacity
            ],
            "circle-opacity-transition": {
              duration: 150, // Fast opacity changes
              delay: 0,
            },
            // ✅ Subtle shadow effect for depth - slightly stronger
            "circle-blur": 0.2,
          },
        });

        // Click interactions for clusters
        map.on("click", "clusters", (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });
          if (!features.length) return;

          const clusterId = features[0].properties?.cluster_id;
          const pointCount = features[0].properties?.point_count || 0;
          const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
          const geometry = features[0].geometry as GeoJSON.Point;

          // ✅ For small clusters (2-5 points), show list of places
          if (pointCount >= 2 && pointCount <= 5) {
            source.getClusterLeaves(
              clusterId,
              pointCount,
              0,
              (error, clusterFeatures) => {
                if (error || !clusterFeatures) {
                  console.error("Error getting cluster leaves:", error);
                  return;
                }

                // Build list of places in cluster
                const placesList = clusterFeatures
                  .map((feature) => {
                    const props = feature.properties;
                    return `
                    <li class="${styles.clusterListItem}" data-place-id="${props?.id || ""}">
                      <span class="${styles.clusterItemName}">${props?.name || "Unbekannt"}</span>
                      ${
                        props?.categoryName
                          ? `<div class="${styles.categoryBadge}" style="background-color: ${props.categoryColor || "#3388ff"};">${props.categoryName}</div>`
                          : ""
                      }
                    </li>
                  `;
                  })
                  .join("");

                const popupHTML = DOMPurify.sanitize(`
                  <div class="${styles.clusterListPopup}">
                    <h4 class="${styles.clusterListTitle}">Orte in diesem Bereich (${pointCount})</h4>
                    <ul class="${styles.clusterListItems}">
                      ${placesList}
                    </ul>
                  </div>
                `);

                // Create popup with list
                const clusterPopup = new mapboxgl.Popup({
                  closeButton: true,
                  closeOnClick: true,
                  offset: 25,
                  maxWidth: "300px",
                })
                  .setLngLat(geometry.coordinates as [number, number])
                  .setHTML(popupHTML)
                  .addTo(map);

                // Add click handlers to list items after popup is added to DOM
                setTimeout(() => {
                  const listItems = document.querySelectorAll(
                    `.${styles.clusterListItem}`
                  );
                  listItems.forEach((item) => {
                    item.addEventListener("click", () => {
                      const placeId = item.getAttribute("data-place-id");
                      const place = places.find(
                        (p) => p.id === Number(placeId)
                      );
                      if (place) {
                        clusterPopup.remove(); // Close popup
                        openPanel(place); // Open place panel
                      }
                    });
                  });
                }, 50);
              }
            );
          } else {
            // ✅ For larger clusters, zoom in (original behavior)
            source.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;
              map.easeTo({
                center: geometry.coordinates as [number, number],
                zoom: zoom || map.getZoom() + 2,
              });
            });
          }
        });

        map.on("click", "unclustered-point", (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["unclustered-point"],
          });
          if (!features.length) return;

          const feature = features[0];
          const placeId = feature.properties?.id;
          const place = places.find((p) => p.id === placeId);
          if (place) {
            // ✅ Set selected state for the clicked feature
            if (feature.id !== undefined) {
              map.setFeatureState(
                { source: sourceId, id: feature.id },
                { selected: true }
              );
            }
            openPanel(place);
          }
        });

        // ✅ Hover effect for unclustered points with tooltip
        map.on("mouseenter", "unclustered-point", (e) => {
          const features = e.features;
          if (!features || features.length === 0) return;

          const feature = features[0];
          if (feature.id === undefined) return;

          // Remove hover from previous feature
          if (hoveredFeatureIdRef.current !== null) {
            map.setFeatureState(
              { source: sourceId, id: hoveredFeatureIdRef.current },
              { hover: false }
            );
          }

          // Set hover on current feature
          hoveredFeatureIdRef.current = feature.id;
          map.setFeatureState(
            { source: sourceId, id: feature.id },
            { hover: true }
          );

          // ✅ Show hover popup/tooltip
          const { name, address, categoryName, categoryColor, description } =
            feature.properties || {};

          // Remove old popup if exists
          if (hoverPopupRef.current) {
            hoverPopupRef.current.remove();
            hoverPopupRef.current = null;
          }

          // Create popup HTML with DOMPurify sanitization
          // ✅ Category badge with dynamic background color from categoryColor property
          const popupHTML = DOMPurify.sanitize(`
            <div class="${styles.modernPopup}">
              <h3 class="${styles.popupTitle}">${name || "Unbekannt"}</h3>
              ${
                categoryName
                  ? `<div class="${
                      styles.categoryBadge
                    }" style="background-color: ${
                      categoryColor || "#3388ff"
                    };">${categoryName}</div>`
                  : ""
              }
              ${
                address
                  ? `<p class="${styles.popupAddress}">${address}</p>`
                  : ""
              }
              ${
                description
                  ? `<p class="${
                      styles.popupDescription
                    }">${description.substring(0, 100)}${
                      description.length > 100 ? "..." : ""
                    }</p>`
                  : ""
              }
            </div>
          `);

          // Create and show popup
          hoverPopupRef.current = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 15,
            className: styles.popup,
            maxWidth: "280px",
          })
            .setLngLat(e.lngLat)
            .setHTML(popupHTML)
            .addTo(map);
        });

        map.on("mouseleave", "unclustered-point", () => {
          // Remove hover state
          if (hoveredFeatureIdRef.current !== null) {
            map.setFeatureState(
              { source: sourceId, id: hoveredFeatureIdRef.current },
              { hover: false }
            );
            hoveredFeatureIdRef.current = null;
          }

          // ✅ Remove hover popup
          if (hoverPopupRef.current) {
            hoverPopupRef.current.remove();
            hoverPopupRef.current = null;
          }
        });

        // Cursor changes
        map.on("mouseenter", "clusters", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "clusters", () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("mouseenter", "unclustered-point", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "unclustered-point", () => {
          map.getCanvas().style.cursor = "";
        });

        // Initial fitBounds
        if (places.length > 0 && !isPanelOpen) {
          const bounds = new mapboxgl.LngLatBounds();
          places.forEach((p) => bounds.extend([p.Lange, p.Breite]));
          if (userLocation) bounds.extend(userLocation);
          map.fitBounds(bounds, { padding: 50, duration: 1000 });
          hasPerformedInitialFitRef.current = true;
        }

        const geolocateControl = new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: false, // ✅ Disable - using custom marker instead
          showUserLocation: false, // ✅ Disable - using custom pulsing marker
        });

        map.addControl(geolocateControl, "top-left");

        geolocateControl.on("geolocate", (e) => {
          userLocationRequestedRef.current = true;
          const { longitude, latitude } = e.coords;
          const location: [number, number] = [longitude, latitude];
          setUserLocation(location);

          // ✅ Marker będzie dodany przez osobny useEffect reagujący na userLocation
          // addUserLocationMarker(map, location); - PRZENIESIONE DO useEffect

          setTimeout(() => {
            animateToLocation(location, 14, 1800);
          }, 150);
        });

        // ✅ Usunięto - marker jest teraz dodawany przez osobny useEffect
        // if (userLocation) {
        //   addUserLocationMarker(map, userLocation);
        // }
      });

      map.on("error", (e) => {
        console.error("Błąd mapy:", e);
        setMapLoadingState("error");
        mapInitializingRef.current = false; // Reset on error
      });

      mapRef.current = map;
    } catch (error) {
      console.error("Błąd inicjalizacji mapy:", error);
      setMapLoadingState("error");
      mapInitializingRef.current = false; // Reset on error
    }
    // ✅ REACT 19.2: Closure ma dostęp do początkowej wartości userLocation
    // oraz do stabilnych referencji addUserLocationMarker i animateToLocation.
    // Mapa jest inicjalizowana tylko raz - kolejne zmiany userLocation
    // są obsługiwane przez geolocateControl.on("geolocate") i updateMarkers useEffect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Inicjalizuj tylko raz przy mount

  // ========================================
  // STYLE LAYERS MANAGEMENT (replaces old Markers Management)
  // ========================================
  // Note: popupContents removed - Style Layers use click events to open panel directly
  // No need for popup HTML generation since we open PlaceInfoPanel on click

  // ========================================
  // STYLE LAYERS MANAGEMENT (replaces DOM Markers)
  // ========================================

  /**
   * Update GeoJSON data when places change (e.g., filtering)
   * Layers are already added in map.on("load"), this only updates the data
   */
  const updatePlacesData = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    try {
      const sourceId = "places-source";
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;

      // Only update if source exists (it's created in map.on("load"))
      if (source) {
        const geojsonData = placesToGeoJSON(places);
        source.setData(geojsonData as GeoJSON.FeatureCollection<GeoJSON.Point>);
      }
    } catch (error) {
      console.error("❌ Error updating places data:", error);
    }
  }, [places, placesToGeoJSON]);

  // ========================================
  // EFFECTS
  // ========================================

  // ✅ Request user location automatically after map loads (React 19 compatible)
  useEffect(() => {
    if (mapLoadingState === "success" && !userLocationRequestedRef.current) {
      // Wait to ensure map is fully ready and loaded
      const timer = setTimeout(() => {
        getUserLocation();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [mapLoadingState, getUserLocation]);

  useEffect(() => {
    initializeMap();

    return () => {
      // ✅ STYLE LAYERS: Cleanup is handled by map.remove() - no need to remove individual markers
      if (hoverPopupRef.current) {
        hoverPopupRef.current.remove();
        hoverPopupRef.current = null;
      }
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      // ✅ REACT STRICT MODE FIX: Reset flag on unmount for re-initialization
      mapInitializingRef.current = false;
    };
    // ✅ REACT 19.2: initializeMap ma pustą deps array, więc jest stabilne.
    // Ten Effect uruchamia się tylko raz przy mount i sprząta przy unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Inicjalizuj tylko raz przy mount, cleanup przy unmount

  // ✅ STYLE LAYERS: Update data when places change (filtering, etc.)
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    if (map.loaded()) {
      updatePlacesData();
    }
    // Note: No 'else' branch needed - layers are added once in map.on("load")
  }, [updatePlacesData]);

  // ✅ REACT 19.2: Dodaj user location marker po każdej zmianie lokalizacji
  useEffect(() => {
    if (!mapRef.current || !userLocation) {
      return;
    }

    const map = mapRef.current;
    if (map.isStyleLoaded()) {
      addUserLocationMarker(map, userLocation);
    } else {
      map.once("idle", () => {
        addUserLocationMarker(map, userLocation);
      });
    }
  }, [userLocation, addUserLocationMarker]);

  // ✅ REACT 19.2: Usunięto ten useEffect - Activity zachowuje stan automatycznie
  // useEffect(() => {
  //   if (!isPanelOpen && selectedPlace) {
  //     setSelectedPlace(null);
  //   }
  // }, [isPanelOpen, selectedPlace]);

  // ========================================
  // RENDER
  // ========================================

  if (!isValidMapboxToken()) {
    return (
      <div className={styles.mapContainerWrapper}>
        <div className={styles.errorContainer}>
          <h3>Konfigurationsfehler</h3>
          <p>Mapbox-Token ist nicht konfiguriert oder ungültig.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mapContainerWrapper}>
      {mapLoadingState === "error" && (
        <div className={styles.errorOverlay}>
          <div className={styles.errorContainer}>
            <h3>Fehler beim Laden der Karte</h3>
            <p>Die Karte konnte nicht geladen werden.</p>
            <button
              type="button"
              onClick={initializeMap}
              className={styles.retryButton}
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      )}

      <div ref={containerRef} className={styles.mapContainer} />

      {/* ✅ WYSZUKIWARKA Z POPRAWNYM HANDLEREM */}
      <MapSearch
        places={places}
        onPlaceSelectAction={handleSearchPlaceSelect}
        disabled={mapLoadingState !== "success"}
      />

      {/* ✅ REACT 19.2: Użyj Activity zamiast warunkowego renderowania */}
      <Activity mode={isPanelOpen ? "visible" : "hidden"}>
        <Suspense
          fallback={
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner}>Panel wird geladen...</div>
            </div>
          }
        >
          <PlaceInfoPanel
            place={selectedPlace}
            isOpen={isPanelOpen}
            isVisible={isPanelVisible}
            onCloseAction={closePanel}
            onImageClickAction={handleImageClick}
          />
        </Suspense>
      </Activity>

      {selectedGalleryImage && selectedPlace?.Galerie_Bilder && (
        <Suspense
          fallback={
            <div className={styles.loadingOverlayGallery}>
              <div className={styles.loadingSpinner}>
                Galerie wird geladen...
              </div>
            </div>
          }
        >
          <FullscreenGallery
            place={selectedPlace}
            currentIndex={currentImageIndex}
            isOpen={!!selectedGalleryImage}
            onCloseAction={closeGalleryOnly}
            onNextAction={handleNextImage}
            onPrevAction={handlePrevImage}
          />
        </Suspense>
      )}
    </div>
  );
}

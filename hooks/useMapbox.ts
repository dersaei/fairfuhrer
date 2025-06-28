// hooks/useMapbox.ts - Custom hook dla Mapbox logic
import { useRef, useCallback, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { MapError } from "../utils/errorHandling";

interface UseMapboxOptions {
  initialCenter?: [number, number];
  initialZoom?: number;
  onMapLoad?: (map: mapboxgl.Map) => void;
  onMapError?: (error: MapError) => void;
}

export function useMapbox(
  containerRef: React.RefObject<HTMLDivElement>,
  options: UseMapboxOptions = {}
) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<MapError | null>(null);

  const initializeMap = useCallback(() => {
    if (mapRef.current || !containerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !token.startsWith("pk.")) {
      const mapError = new MapError("Invalid Mapbox token", "MAPBOX_TOKEN");
      setError(mapError);
      options.onMapError?.(mapError);
      return;
    }

    try {
      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: options.initialCenter || [9.0, 47.5],
        zoom: options.initialZoom || 6,
        attributionControl: false,
      });

      map.on("load", () => {
        setIsLoaded(true);
        setError(null);
        options.onMapLoad?.(map);
      });

      map.on("error", (e) => {
        const mapError = new MapError("Map loading error", "API_ERROR", e);
        setError(mapError);
        options.onMapError?.(mapError);
      });

      mapRef.current = map;
    } catch (err) {
      const mapError = new MapError(
        "Map initialization failed",
        "API_ERROR",
        err
      );
      setError(mapError);
      options.onMapError?.(mapError);
    }
  }, [containerRef, options]);

  useEffect(() => {
    initializeMap();

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (err) {
          console.warn("Error removing map:", err);
        } finally {
          mapRef.current = null;
          setIsLoaded(false);
        }
      }
    };
  }, [initializeMap]);

  return {
    map: mapRef.current,
    isLoaded,
    error,
    retry: initializeMap,
  };
}

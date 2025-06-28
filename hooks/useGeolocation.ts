// hooks/useGeolocation.ts - Custom hook dla geolocation
import { useState, useCallback } from "react";

export interface GeolocationState {
  location: [number, number] | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false,
  });

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation wird von diesem Browser nicht unterstützt",
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setState({
          location: [longitude, latitude],
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        const errorMessages: Record<number, string> = {
          1: "Benutzer hat den Zugriff auf die Position verweigert",
          2: "Positionsinformationen sind nicht verfügbar",
          3: "Zeitüberschreitung beim Abrufen der Position",
        };

        setState({
          location: null,
          error: errorMessages[error.code] || "Unbekannter Geolocation-Fehler",
          isLoading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  return {
    ...state,
    getCurrentLocation,
  };
}

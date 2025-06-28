// utils/errorHandling.ts - Centralne zarządzanie błędami
export class MapError extends Error {
  constructor(
    message: string,
    public code: "MAPBOX_TOKEN" | "GEOLOCATION" | "API_ERROR" | "INVALID_DATA",
    public originalError?: unknown
  ) {
    super(message);
    this.name = "MapError";
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof Response) {
    throw new MapError(
      `API Error: ${error.status} ${error.statusText}`,
      "API_ERROR",
      error
    );
  }

  if (error instanceof Error) {
    throw new MapError(error.message, "API_ERROR", error);
  }

  throw new MapError("Unknown API error", "API_ERROR", error);
}

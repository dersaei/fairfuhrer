import mapboxgl from "mapbox-gl";
import type { Place } from "../types";
import { getCategoryIconPaths, DEFAULT_ICON_PATHS } from "../lib/categoryIcons";

export const PIN_W = 40;
export const PIN_H = 56;

export function placesToGeoJSON(places: Place[]) {
  return {
    type: "FeatureCollection" as const,
    features: places
      .filter((p) => p.location?.coordinates)
      .map((p) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: p.location.coordinates,
        },
        properties: {
          placeId: p.id,
          categoryColor: p.Kategorie[0]?.color || "#3388ff",
          categoryId: p.Kategorie[0]?.id ?? 0,
        },
      })),
  };
}

export function buildPinSVG(
  color: string,
  iconPaths: string,
  selected = false,
): string {
  const stroke = selected ? ` stroke="rgba(0,0,0,0.75)" stroke-width="2"` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_W}" height="${PIN_H}" viewBox="0 0 40 56">` +
    `<path d="M20,2 C10.611,2 3,9.611 3,19 C3,31 20,54 20,54 C20,54 37,31 37,19 C37,9.611 29.389,2 20,2 Z" fill="${color}"${stroke}/>` +
    `<circle cx="20" cy="19" r="11" fill="white"/>` +
    `<g transform="translate(12,11) scale(0.667)" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">` +
    iconPaths +
    `</g>` +
    `</svg>`
  );
}

export function loadImageFromSVG(
  map: mapboxgl.Map,
  imageId: string,
  svg: string,
  w: number,
  h: number,
  onDone: () => void,
): void {
  if (map.hasImage(imageId)) {
    onDone();
    return;
  }
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image(w, h);
  img.onload = () => {
    if (!map.hasImage(imageId)) {
      map.addImage(imageId, img, { sdf: false });
    }
    URL.revokeObjectURL(url);
    onDone();
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    onDone();
  };
  img.src = url;
}

export function loadCategoryMarkerSDFs(
  map: mapboxgl.Map,
  categories: Array<{ id: number; color: string }>,
  onLoaded: () => void,
): void {
  const allCategories = [{ id: 0, color: "#3388ff" }, ...categories];
  let remaining = allCategories.length;

  const done = () => {
    remaining--;
    if (remaining === 0) onLoaded();
  };

  allCategories.forEach(({ id, color }) => {
    const paths = id === 0 ? DEFAULT_ICON_PATHS : getCategoryIconPaths(id);
    loadImageFromSVG(
      map,
      `pin-${id}`,
      buildPinSVG(color, paths),
      PIN_W,
      PIN_H,
      done,
    );
    remaining++;
    loadImageFromSVG(
      map,
      `pin-${id}-selected`,
      buildPinSVG(color, paths, true),
      PIN_W,
      PIN_H,
      done,
    );
  });
}
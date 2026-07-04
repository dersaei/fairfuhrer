// lib/sightsGating.ts
// Shared gating logic — must stay in sync with mobile stores/placesStore.ts
// (same algorithm: FNV-1a hash, Math.ceil(0.5 * N), deterministic sort with id tiebreak)

export const FREE_SIGHTS_VISIBLE_RATIO = 0.5;

function envSightsCategoryId(): number | null {
  const raw = process.env.NEXT_PUBLIC_SIGHTS_CATEGORY_ID;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function normalizeGerman(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .trim();
}

export function isSightsCategory(cat: { id: number; name: string }): boolean {
  const overrideId = envSightsCategoryId();
  if (overrideId !== null && cat.id === overrideId) return true;
  return normalizeGerman(cat.name).startsWith("sehen");
}

// FNV-1a 32-bit — identical to mobile implementation (key = `${id}:${Name}`)
function stableHash01(place: { id: number; Name: string }): number {
  const key = `${place.id}:${place.Name ?? ""}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0x100000000;
}

export function filterVisiblePlaces<
  T extends { id: number; Name: string; Kategorie: { id: number; name: string }[] },
>(places: T[], isPro: boolean): T[] {
  if (isPro) return places;

  const sights: T[] = [];
  const others: T[] = [];
  for (const p of places) {
    if (p.Kategorie.some(isSightsCategory)) sights.push(p);
    else others.push(p);
  }
  if (sights.length === 0) return others;

  const visibleCount = Math.ceil(FREE_SIGHTS_VISIBLE_RATIO * sights.length);
  const ranked = sights
    .map((p) => ({ p, h: stableHash01(p) }))
    .sort((a, b) => (a.h === b.h ? a.p.id - b.p.id : a.h - b.h))
    .slice(0, visibleCount)
    .map((x) => x.p);

  const visibleSightsIds = new Set(ranked.map((p) => p.id));
  return places.filter(
    (p) => !p.Kategorie.some(isSightsCategory) || visibleSightsIds.has(p.id),
  );
}

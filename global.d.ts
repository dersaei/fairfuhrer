// global.d.ts
declare module "*.json" {
  import type { StyleSpecification } from "mapbox-gl";
  const value: StyleSpecification;
  export default value;
}

interface Window {
  gtag: (command: string, ...args: unknown[]) => void;
  dataLayer: Record<string, unknown>[];
}

// global.d.ts
declare module "*.json" {
  import type { StyleSpecification } from "mapbox-gl";
  const value: StyleSpecification;
  export default value;
}

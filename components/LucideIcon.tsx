// components/LucideIcon.tsx
// Rendert ein Lucide-Icon anhand seines Namens (kebab-case, wie im Directus
// gespeichert, z.B. "map-pin"). Nur die tatsächlich verwendeten Icons werden
// importiert — kein dynamischer Import, voll RSC-kompatibel.

import {
  Binoculars,
  Send,
  Search,
  MapPin,
  Leaf,
  Users,
  Heart,
  Sparkles,
  type LucideIcon as LucideIconType,
} from "lucide-react";

// Directus liefert kebab-case Namen (lucide.dev/icons). Hier auf die
// PascalCase-Komponenten mappen. Neue Icons einfach oben importieren + eintragen.
const ICON_MAP: Record<string, LucideIconType> = {
  binoculars: Binoculars,
  send: Send,
  search: Search,
  "map-pin": MapPin,
  leaf: Leaf,
  users: Users,
  heart: Heart,
};

interface LucideIconProps {
  name?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
  "aria-hidden"?: boolean;
}

export default function LucideIcon({
  name,
  size = 24,
  strokeWidth = 1.75,
  color,
  className,
  "aria-hidden": ariaHidden = true,
}: LucideIconProps) {
  // Unbekannter/leerer Name → neutrales Fallback-Icon, damit das Layout hält.
  const Icon = (name && ICON_MAP[name]) || Sparkles;
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./KontoNav.module.css";

const links = [
  { href: "/konto/profil", label: "Mein Profil" },
  { href: "/konto/einstellungen", label: "Einstellungen" },
  { href: "/konto/ort-vorschlagen", label: "Neuen Ort vorschlagen" },
];

export default function KontoNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${styles.navItem} ${pathname === link.href ? styles.navItemActive : ""}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

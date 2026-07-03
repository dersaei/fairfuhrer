"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./KontoNav.module.css";

// UWAGA: "Neuen Ort vorschlagen" tymczasowo ukryte z nawigacji (2026-07-03).
// Powod: dublowanie z Redaktion + niejasna wartosc biznesowa (premium-gate
// vs open access). Strona /konto/reisender/ort-vorschlagen oraz endpoint
// /api/ort-vorschlagen ZOSTAJA w repo jako opcja na pozniej — mozna przywrocic
// dodajac link ponizej.
const links = [
  { href: "/konto/reisender/profil", label: "Mein Profil" },
  { href: "/konto/reisender/einstellungen", label: "Einstellungen" },
  { href: "/konto/reisender/redaktion", label: "Redaktion" },
  { href: "/konto/reisender/premium", label: "Premium" },
  { href: "/konto/reisender/hilfe", label: "Hilfe" },
];

export default function ReisenderNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          scroll={false}
          className={`${styles.navItem} ${pathname === link.href ? styles.navItemActive : ""}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

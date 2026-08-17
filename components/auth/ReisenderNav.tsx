"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./KontoNav.module.css";

const links = [
  { href: "/konto/reisender/profil", label: "Profil" },
  { href: "/konto/reisender/einstellungen", label: "Einstellungen" },
  { href: "/konto/reisender/redaktion", label: "PIN erstellen" },
  { href: "/konto/reisender/premium", label: "Fairführer+" },
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./KontoNav.module.css";

const links = [
  { href: "/konto/partner/profil", label: "Mein Profil" },
  { href: "/konto/partner/einstellungen", label: "Einstellungen" },
  { href: "/konto/partner/audiopin", label: "Mein Audiopin" },
];

export default function PartnerNav() {
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

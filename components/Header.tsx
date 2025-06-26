"use client";

import styles from "./Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { getAssetPath } from "../lib/supabase";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <Image
          src={getAssetPath("logo-fairfuehrer1.png")}
          alt="Fair Guide Logo"
          width={232}
          height={66}
          priority
        />
      </Link>

      {/* Desktop Navigation */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLink}>
          Home
        </Link>
        <Link href="/partner-werden" className={styles.navLink}>
          Partner werden
        </Link>
        <Link href="/kontakt" className={styles.navLink}>
          Kontakt
        </Link>
      </nav>

      {/* Social media - Desktop */}
      <div className={styles.social}>
        <a
          href="https://www.instagram.com/fairfuehrer.audioreisefuehrer?igsh=MWcyNjRmMjFuaXljYG"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialIcon}
          aria-label="Instagram"
        >
          <svg width="26" height="26" fill="currentColor" viewBox="0 0 448 512">
            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9 0 63.6 51.3 114.9 114.9 114.9s114.9-51.3 114.9-114.9c0-63.6-51.3-114.9-114.9-114.9zm0 186.6c-39.6 0-71.7-32.1-71.7-71.7 0-39.6 32.1-71.7 71.7-71.7 39.6 0 71.7 32.1 71.7 71.7 0 39.6-32.1 71.7-71.7 71.7zm146.4-194.3c0 14.9-12.1 27-27 27s-27-12.1-27-27 12.1-27 27-27 27 12.1 27 27zm76.1 27.2c-1.7-35.3-9.9-66.7-36.2-93.1s-57.8-34.5-93.1-36.2c-36.7-2.1-146.7-2.1-183.4 0-35.3 1.7-66.7 9.9-93.1 36.2S9.8 88.7 8.1 124c-2.1 36.7-2.1 146.7 0 183.4 1.7 35.3 9.9 66.7 36.2 93.1s57.8 34.5 93.1 36.2c36.7 2.1 146.7 2.1 183.4 0 35.3-1.7 66.7-9.9 93.1-36.2s34.5-57.8 36.2-93.1c2.1-36.7 2.1-146.7 0-183.4zm-48.6 232.4c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.9 9s-103.4 2.6-132.9-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.9s-2.6-103.4 9-132.9c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.9-9s103.4-2.6 132.9 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.9s2.6 103.4-9 132.9z" />
          </svg>
        </a>
        <a
          href="https://www.facebook.com/profile.php?id=61561084330676"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialIcon}
          aria-label="Facebook"
        >
          <svg width="26" height="26" fill="currentColor" viewBox="0 0 320 512">
            <path d="M279.14 288l14.22-92.66h-88.91V127.45c0-25.35 12.42-50.06 52.24-50.06H293V6.26S259.5 0 225.36 0c-73.22 0-121 44.38-121 124.72v70.62H22.89V288h81.47v224h100.2V288z" />
          </svg>
        </a>
      </div>

      {/* Hamburger Button */}
      <button
        className={`${styles.hamburger} ${
          isMenuOpen ? styles.hamburgerOpen : ""
        }`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {/* Mobile Menu */}
      <div
        className={`${styles.mobileMenu} ${
          isMenuOpen ? styles.mobileMenuOpen : ""
        }`}
      >
        <nav className={styles.mobileNav}>
          <Link href="/" className={styles.mobileNavLink} onClick={closeMenu}>
            Home
          </Link>
          <Link
            href="/partner-werden"
            className={styles.mobileNavLink}
            onClick={closeMenu}
          >
            Partner werden
          </Link>
          <Link
            href="/kontakt"
            className={styles.mobileNavLink}
            onClick={closeMenu}
          >
            Kontakt
          </Link>
        </nav>

        {/* Social media - Mobile */}
        <div className={styles.mobileSocial}>
          <a
            href="https://www.instagram.com/fairfuehrer.audioreisefuehrer?igsh=MWcyNjRmMjFuaXljYG"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIcon}
            aria-label="Instagram"
          >
            <svg
              width="26"
              height="26"
              fill="currentColor"
              viewBox="0 0 448 512"
            >
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9 0 63.6 51.3 114.9 114.9 114.9s114.9-51.3 114.9-114.9c0-63.6-51.3-114.9-114.9-114.9zm0 186.6c-39.6 0-71.7-32.1-71.7-71.7 0-39.6 32.1-71.7 71.7-71.7 39.6 0 71.7 32.1 71.7 71.7 0 39.6-32.1 71.7-71.7 71.7zm146.4-194.3c0 14.9-12.1 27-27 27s-27-12.1-27-27 12.1-27 27-27 27 12.1 27 27zm76.1 27.2c-1.7-35.3-9.9-66.7-36.2-93.1s-57.8-34.5-93.1-36.2c-36.7-2.1-146.7-2.1-183.4 0-35.3 1.7-66.7 9.9-93.1 36.2S9.8 88.7 8.1 124c-2.1 36.7-2.1 146.7 0 183.4 1.7 35.3 9.9 66.7 36.2 93.1s57.8 34.5 93.1 36.2c36.7 2.1 146.7 2.1 183.4 0 35.3-1.7 66.7-9.9 93.1-36.2s34.5-57.8 36.2-93.1c2.1-36.7 2.1-146.7 0-183.4zm-48.6 232.4c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.9 9s-103.4 2.6-132.9-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.9s-2.6-103.4 9-132.9c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.9-9s103.4-2.6 132.9 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.9s2.6 103.4-9 132.9z" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61561084330676"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIcon}
            aria-label="Facebook"
          >
            <svg
              width="26"
              height="26"
              fill="currentColor"
              viewBox="0 0 320 512"
            >
              <path d="M279.14 288l14.22-92.66h-88.91V127.45c0-25.35 12.42-50.06 52.24-50.06H293V6.26S259.5 0 225.36 0c-73.22 0-121 44.38-121 124.72v70.62H22.89V288h81.47v224h100.2V288z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}

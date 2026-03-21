"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./UserMenu.module.css";

export default function UserMenu() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return (
      <Link href="/login" className={styles.loginLink}>
        Anmelden
      </Link>
    );
  }

  const displayName =
    user.profile?.username ||
    [user.profile?.first_name, user.profile?.last_name]
      .filter(Boolean)
      .join(" ") ||
    user.email?.split("@")[0] ||
    "Konto";

  const avatarUrl = user.profile?.avatar_url;
  const isPartner = user.profile?.role === "partner";
  const base = isPartner ? "/konto/partner" : "/konto/reisender";

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName}
            className={styles.avatar}
            width={32}
            height={32}
          />
        ) : (
          <span className={styles.avatarFallback}>
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className={styles.name}>{displayName}</span>
        <span className={styles.chevron}>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <Link
            href={`${base}/profil`}
            className={styles.item}
            scroll={false}
            onClick={() => setIsOpen(false)}
          >
            Mein Profil
          </Link>
          <Link
            href={`${base}/einstellungen`}
            className={styles.item}
            scroll={false}
            onClick={() => setIsOpen(false)}
          >
            Einstellungen
          </Link>
          {isPartner ? (
            <Link
              href="/konto/partner/audiopin"
              className={styles.item}
              scroll={false}
              onClick={() => setIsOpen(false)}
            >
              Mein Audiopin
            </Link>
          ) : (
            <Link
              href="/konto/reisender/ort-vorschlagen"
              className={styles.item}
              scroll={false}
              onClick={() => setIsOpen(false)}
            >
              Neuen Ort vorschlagen
            </Link>
          )}
          <div className={styles.divider} />
          <button
            type="button"
            className={`${styles.item} ${styles.logout}`}
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
          >
            Abmelden
          </button>
        </div>
      )}
    </div>
  );
}

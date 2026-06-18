"use client";

import styles from "./hilfe.module.css";

export default function HilfeContactLink() {
  function scrollToContact() {
    document.getElementById("hilfe-kontakt")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <button type="button" className={styles.contactLink} onClick={scrollToContact}>
      Kontakt ↓
    </button>
  );
}

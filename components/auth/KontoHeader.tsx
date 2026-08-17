"use client";

import styles from "@/app/(protected)/konto/konto.module.css";

interface Props {
  isPartner: boolean;
  displayName: string;
}

export default function KontoHeader({ isPartner, displayName }: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.headerWelcome}>
        <span className={styles.role}>
          {isPartner ? "Partner*in" : "Reisende*r"}
        </span>
        <h1 className={styles.greeting}>Willkommen {displayName}!</h1>
      </div>
    </div>
  );
}

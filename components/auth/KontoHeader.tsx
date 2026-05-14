"use client";

import { useAuth } from "@/context/AuthContext";
import styles from "@/app/(protected)/konto/konto.module.css";

interface Props {
  isPartner: boolean;
  displayName: string;
}

export default function KontoHeader({ isPartner, displayName }: Props) {
  const { user } = useAuth();
  const avatarUrl = user?.profile?.avatar_url ?? null;

  return (
    <div className={styles.header}>
      <div className={styles.avatarWrapper}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder} />
        )}
      </div>
      <div className={styles.headerWelcome}>
        <span className={styles.role}>
          {isPartner ? "Partner" : "Reisender"}
        </span>
        <h1 className={styles.greeting}>Willkommen, {displayName}!</h1>
      </div>
    </div>
  );
}

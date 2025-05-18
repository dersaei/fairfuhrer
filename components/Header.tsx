import styles from "./Header.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <Image
          src="/images/fairfuehrer logo.avif"
          alt="Fair führer Logo"
          width={226}
          height={65}
          priority
        />
      </Link>
    </header>
  );
}

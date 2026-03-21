import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import KontoHeader from "@/components/auth/KontoHeader";
import ReisenderNav from "@/components/auth/ReisenderNav";
import styles from "../konto.module.css";

export default async function ReisenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.profile?.role === "partner") redirect("/konto/partner");

  const { profile } = user;
  const displayName =
    profile?.username ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email ||
    "Benutzer";

  return (
    <div className={styles.main}>
      <KontoHeader isPartner={false} displayName={displayName} />

      <div className={styles.divider} />

      <ReisenderNav />

      <div className={styles.content}>{children}</div>
    </div>
  );
}

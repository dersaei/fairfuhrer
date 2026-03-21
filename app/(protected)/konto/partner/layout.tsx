import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import KontoHeader from "@/components/auth/KontoHeader";
import PartnerNav from "@/components/auth/PartnerNav";
import styles from "../konto.module.css";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.profile?.role !== "partner") redirect("/konto/reisender");

  const displayName =
    user.partnerProfile?.company_name ||
    user.email ||
    "Partner";

  return (
    <div className={styles.main}>
      <KontoHeader isPartner={true} displayName={displayName} />

      <div className={styles.divider} />

      <PartnerNav />

      <div className={styles.content}>{children}</div>
    </div>
  );
}

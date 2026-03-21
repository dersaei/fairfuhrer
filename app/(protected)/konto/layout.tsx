import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";

export default async function KontoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <>{children}</>;
}

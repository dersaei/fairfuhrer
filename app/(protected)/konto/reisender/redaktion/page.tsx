import { getRedaktionPageContent } from "@/lib/directus";
import RedaktionForm from "./RedaktionForm";

export default async function RedaktionPage() {
  const content = await getRedaktionPageContent();
  return <RedaktionForm content={content} />;
}

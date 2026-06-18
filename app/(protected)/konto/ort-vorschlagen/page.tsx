import { getOrtVorschlagenContent } from "@/lib/directus";
import OrtVorschlagenForm from "./OrtVorschlagenForm";

export default async function OrtVorschlagenPage() {
  const content = await getOrtVorschlagenContent();

  return <OrtVorschlagenForm content={content} />;
}

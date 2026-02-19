/**
 * Czyści HTML z śmieci pochodzących z Word/Teams/PDF (klasy CSS, puste divy, &nbsp; itp.)
 */
export function cleanHtml(html: string): string {
  return html
    .replace(/class="[^"]*"/g, "")
    .replace(/style="[^"]*"/g, "")
    .replace(/<div[^>]*>\s*&nbsp;\s*<\/div>/g, "")
    .replace(/<div[^>]*>/g, "")
    .replace(/<\/div>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/<p[^>]*>\s*<\/p>/g, "")
    .replace(/<span[^>]*>\s*<\/span>/g, "")
    .replace(/(<br\s*\/?>\s*){3,}/g, "<br/><br/>")
    .replace(/^\s*(<br\s*\/?>)+/g, "")
    .trim();
}

/**
 * Konwertuje HTML na czysty tekst (bez tagów i z zdekodowanymi entities)
 */
export function htmlToPlainText(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, " ");

  if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = withoutTags;
    return textarea.value.replace(/\s+/g, " ").trim();
  }

  return withoutTags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß")
    .replace(/&#\d+;/g, (m) => String.fromCharCode(parseInt(m.slice(2, -1))))
    .replace(/\s+/g, " ")
    .trim();
}

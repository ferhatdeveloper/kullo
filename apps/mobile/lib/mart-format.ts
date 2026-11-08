export function formatIQD(n: number, lang = "tr") {
  const loc = lang === "en" ? "en-US" : lang === "tr" ? "tr-TR" : "ar-IQ";
  const num = Number(n).toLocaleString(loc);
  return lang === "ar" ? `${num} د.ع` : `${num} IQD`;
}

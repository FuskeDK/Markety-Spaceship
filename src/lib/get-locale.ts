import { headers } from "next/headers";
import { getT } from "@/i18n/site-translations";

export async function getLocale() {
  const h = await headers();
  return h.get("x-locale") ?? "en";
}

export async function getSiteT() {
  const locale = await getLocale();
  return getT(locale);
}

import { cookies } from "next/headers";

import { getLocale, getStrings } from "@/lib/i18n";

export async function getLocaleContext() {
  const store = await cookies();
  const locale = getLocale(store.get("ppip_locale")?.value);
  return { locale, strings: getStrings(locale) };
}

// Client-side i18n bootstrap. Načte locale z localStorage a swappuje
// data-i18n / data-i18n-aria texty napříč všemi prvky.
// Nezasahuje do URL ani SSR — pouze DOM overlay nad českým originálem.

import { LOCALES, isLocale, ui, type Locale, type UiKey } from "./ui";

const STORAGE_KEY = "pingupedia-locale";

export function getStoredLocale(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && isLocale(v)) return v;
  } catch {
    /* localStorage disabled */
  }
  return "cs";
}

export function setStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* localStorage disabled */
  }
}

function selectAll<T extends Element>(selector: string): T[] {
  return Array.from(document.querySelectorAll(selector)) as T[];
}

export function applyLocale(locale: Locale): void {
  const dict = ui[locale] ?? ui.cs;
  document.documentElement.setAttribute("lang", locale);
  selectAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n as UiKey | undefined;
    if (key && dict[key]) el.textContent = dict[key];
  });
  selectAll<HTMLElement>("[data-i18n-aria]").forEach((el) => {
    const key = el.dataset.i18nAria as UiKey | undefined;
    if (key && dict[key]) el.setAttribute("aria-label", dict[key]);
  });
  document.querySelectorAll("[data-lang-switcher] select").forEach((el) => {
    (el as unknown as HTMLSelectElement).value = locale;
  });
}

export function wireLangSwitcher(): void {
  document.querySelectorAll("[data-lang-switcher] select").forEach((el) => {
    const sel = el as unknown as HTMLSelectElement;
    if (sel.dataset.wired === "1") return;
    sel.dataset.wired = "1";
    sel.addEventListener("change", () => {
      const v = sel.value;
      if (isLocale(v)) {
        setStoredLocale(v);
        applyLocale(v);
      }
    });
  });
}

export function bootstrap(): void {
  applyLocale(getStoredLocale());
  wireLangSwitcher();
}

export { LOCALES };

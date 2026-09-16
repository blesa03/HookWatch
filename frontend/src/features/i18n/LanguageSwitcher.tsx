import {
  useTranslation,
} from "react-i18next";

import {
  normalizeLanguage,
} from "../../i18n";


export function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const {
    t,
    i18n,
  } = useTranslation();

  const language =
    normalizeLanguage(
      i18n.resolvedLanguage
      ?? i18n.language,
    );


  return (
    <select
      aria-label={
        t("common.language")
      }
      value={language}
      onChange={(event) => {
        void i18n.changeLanguage(
          event.target.value,
        );
      }}
      className={
        "rounded-lg border "
        + "border-zinc-800 "
        + "bg-zinc-900 "
        + "font-mono text-xs "
        + "text-zinc-400 "
        + "hover:border-zinc-700 "
        + "focus:border-cyan-700 "
        + (
          compact
            ? "h-9 px-2"
            : "px-3 py-2"
        )
      }
    >
      <option value="en">
        EN
      </option>

      <option value="es">
        ES
      </option>
    </select>
  );
}
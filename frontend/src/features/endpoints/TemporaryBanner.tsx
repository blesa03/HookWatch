import {
  Clock3,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useTranslation,
} from "react-i18next";
import {
  useNavigate,
} from "react-router-dom";


function remainingTime(
  expiresAt: string,
  expiredLabel: string,
): string {
  const remaining =
    new Date(
      expiresAt,
    ).getTime()
    - Date.now();

  if (remaining <= 0) {
    return expiredLabel;
  }

  const hours = Math.floor(
    remaining / 3_600_000,
  );

  const minutes = Math.floor(
    (
      remaining
      % 3_600_000
    ) / 60_000,
  );

  return `${hours}h ${minutes}m`;
}


export function TemporaryBanner({
  expiresAt,
}: {
  expiresAt: string;
}) {
  const navigate =
    useNavigate();

  const {
    t,
    i18n,
  } = useTranslation();

  const [
    remaining,
    setRemaining,
  ] = useState(
    () =>
      remainingTime(
        expiresAt,
        t("temporary.expired"),
      ),
  );


  useEffect(() => {
    const updateRemaining =
      () => {
        setRemaining(
          remainingTime(
            expiresAt,
            t(
              "temporary.expired",
            ),
          ),
        );
      };

    updateRemaining();

    const interval =
      window.setInterval(
        updateRemaining,
        30_000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [
    expiresAt,
    i18n.resolvedLanguage,
    t,
  ]);


  return (
    <div
      role="status"
      className={
        "flex shrink-0 "
        + "flex-wrap items-center "
        + "justify-center gap-x-4 "
        + "gap-y-1 border-b "
        + "border-amber-900/30 "
        + "bg-amber-950/20 "
        + "px-4 py-2 "
        + "text-xs text-amber-300"
      }
    >
      <span
        className={
          "inline-flex "
          + "items-center gap-2"
        }
      >
        <Clock3
          className="size-3.5"
        />

        {t("temporary.label")}
        {" · "}
        {remaining}
      </span>

      <button
        type="button"
        onClick={() =>
          navigate("/register")
        }
        className={
          "font-medium "
          + "underline "
          + "underline-offset-4 "
          + "hover:text-amber-200"
        }
      >
        {t("temporary.keep")}
      </button>
    </div>
  );
}
import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";


function remainingTime(
  expiresAt: string,
): string {
  const remaining =
    new Date(
      expiresAt
    ).getTime()
    - Date.now();

  if (remaining <= 0) {
    return "Expired";
  }

  const hours = Math.floor(
    remaining / 3_600_000
  );

  const minutes = Math.floor(
    (
      remaining
      % 3_600_000
    ) / 60_000
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

  const [
    remaining,
    setRemaining,
  ] = useState(
    () =>
      remainingTime(
        expiresAt
      ),
  );

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setRemaining(
            remainingTime(
              expiresAt
            ),
          );
        },
        30_000,
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [expiresAt]);


  return (
    <div
      className={
        "flex items-center "
        + "justify-center gap-4 "
        + "border-b border-amber-"
        + "900/30 bg-amber-950/20 "
        + "px-4 py-2 text-xs "
        + "text-amber-300"
      }
    >
      Temporary endpoint ·
      {` ${remaining}`}

      <button
        type="button"
        onClick={() =>
          navigate("/register")
        }
        className={
          "font-medium underline "
          + "underline-offset-4"
        }
      >
        Create account to keep it
      </button>
    </div>
  );
}
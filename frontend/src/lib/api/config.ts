function withoutTrailingSlash(
  value: string,
) {
  return value.replace(/\/+$/, "");
}


export const API_BASE_URL =
  withoutTrailingSlash(
    import.meta.env.VITE_API_BASE_URL
      ?? "http://localhost:8000",
  );


function apiToWebSocketUrl(
  value: string,
) {
  if (value.startsWith("https://")) {
    return value.replace(
      /^https:/,
      "wss:",
    );
  }

  return value.replace(
    /^http:/,
    "ws:",
  );
}


export const WS_BASE_URL =
  withoutTrailingSlash(
    import.meta.env.VITE_WS_BASE_URL
      ?? apiToWebSocketUrl(
        API_BASE_URL,
      ),
  );
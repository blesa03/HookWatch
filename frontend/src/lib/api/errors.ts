function firstMessage(
  value: unknown,
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstMessage(item);

      if (message) {
        return message;
      }
    }

    return null;
  }

  if (
    typeof value === "object"
    && value !== null
  ) {
    for (
      const item of Object.values(value)
    ) {
      const message = firstMessage(item);

      if (message) {
        return message;
      }
    }
  }

  return null;
}


export async function readApiError(
  response: Response,
): Promise<string> {
  const fallback =
    `Request failed (${response.status}).`;

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    return fallback;
  }

  if (
    typeof body !== "object"
    || body === null
    || Array.isArray(body)
  ) {
    return fallback;
  }

  const root =
    body as Record<string, unknown>;

  const error = root.error;

  if (
    typeof error === "object"
    && error !== null
    && !Array.isArray(error)
  ) {
    const apiError =
      error as Record<string, unknown>;

    const fieldMessage = firstMessage(
      apiError.fields
    );

    if (fieldMessage) {
      return fieldMessage;
    }

    if (
      typeof apiError.message
      === "string"
    ) {
      return apiError.message;
    }
  }

  return (
    firstMessage(root)
    ?? fallback
  );
}
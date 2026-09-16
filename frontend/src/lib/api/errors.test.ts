import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  readApiError,
} from "./errors";


function mockResponse(
  body: unknown,
  status = 400,
): Response {
  return {
    status,

    json: vi
      .fn()
      .mockResolvedValue(body),
  } as unknown as Response;
}


describe(
  "readApiError",
  () => {
    it(
      "reads the API message",
      async () => {
        const response =
          mockResponse({
            error: {
              code:
                "rate_limited",
              message:
                "Too many requests.",
            },
          }, 429);

        await expect(
          readApiError(response),
        ).resolves.toBe(
          "Too many requests.",
        );
      },
    );


    it(
      "prioritizes field errors",
      async () => {
        const response =
          mockResponse({
            error: {
              code:
                "validation_error",
              message:
                "Validation failed.",
              fields: {
                name: [
                  (
                    "This field "
                    + "is required."
                  ),
                ],
              },
            },
          });

        await expect(
          readApiError(response),
        ).resolves.toBe(
          "This field is required.",
        );
      },
    );


    it(
      "uses a fallback for invalid bodies",
      async () => {
        const response = {
          status: 502,

          json: vi
            .fn()
            .mockRejectedValue(
              new Error(
                "invalid json",
              ),
            ),
        } as unknown as Response;

        await expect(
          readApiError(response),
        ).resolves.toBe(
          "Request failed (502).",
        );
      },
    );
  },
);
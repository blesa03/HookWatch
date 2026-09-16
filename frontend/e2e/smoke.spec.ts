import {
  expect,
  test,
  type Page,
} from "@playwright/test";


const frontendOrigin =
  "http://127.0.0.1:4173";


const corsHeaders = {
  "Access-Control-Allow-Origin":
    frontendOrigin,

  "Access-Control-Allow-Credentials":
    "true",
};


async function mockLoggedOut(
  page: Page,
) {
  await page.route(
    "**/api/v1/auth/refresh/",
    async (route) => {
      await route.fulfill({
        status: 401,

        contentType:
          "application/json",

        headers:
          corsHeaders,

        body: JSON.stringify({
          error: {
            code:
              "not_authenticated",

            message:
              "Authentication required.",
          },
        }),
      });
    },
  );
}


test(
  "landing page opens sign in",
  async ({ page }) => {
    await mockLoggedOut(page);

    await page.goto("/");

    await expect(
      page.getByRole(
        "heading",
        {
          name:
            /See your webhooks/,
        },
      ),
    ).toBeVisible();

    await page.getByRole(
      "link",
      {
        name: "Sign in",
      },
    ).click();

    await expect(
      page,
    ).toHaveURL(
      /\/login$/,
    );

    await expect(
      page.getByRole(
        "heading",
        {
          name: "Sign in",
        },
      ),
    ).toBeVisible();
  },
);


test(
  "anonymous endpoint errors are visible",
  async ({ page }) => {
    await mockLoggedOut(page);

    await page.route(
      (
        "**/api/v1/"
        + "anonymous/endpoints/"
      ),
      async (route) => {
        if (
          route.request()
            .method()
          === "OPTIONS"
        ) {
          await route.fulfill({
            status: 204,

            headers: {
              ...corsHeaders,

              "Access-Control-Allow-Methods":
                "POST, OPTIONS",

              "Access-Control-Allow-Headers":
                "Content-Type",
            },
          });

          return;
        }

        await route.fulfill({
          status: 503,

          contentType:
            "application/json",

          headers:
            corsHeaders,

          body: JSON.stringify({
            error: {
              code:
                "service_unavailable",

              message:
                (
                  "Temporary endpoints "
                  + "are unavailable."
                ),
            },
          }),
        });
      },
    );

    await page.goto("/");

    await page.getByRole(
      "button",
      {
        name:
          "Try without an account",
      },
    ).click();

    await expect(
      page.getByText(
        (
          "Temporary endpoints "
          + "are unavailable."
        ),
      ),
    ).toBeVisible();
  },
);
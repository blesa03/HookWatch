import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

import i18n, {
  LANGUAGE_STORAGE_KEY,
} from "./i18n";


afterEach(async () => {
  await i18n.changeLanguage(
    "en",
  );
});


describe(
  "i18n",
  () => {
    it(
      "switches and persists Spanish",
      async () => {
        await i18n.changeLanguage(
          "es",
        );

        expect(
          i18n.t(
            "landing.signIn",
          ),
        ).toBe(
          "Iniciar sesión",
        );

        expect(
          window.localStorage
            .getItem(
              LANGUAGE_STORAGE_KEY,
            ),
        ).toBe("es");

        expect(
          document
            .documentElement
            .lang,
        ).toBe("es");
      },
    );


    it(
      "falls back to English",
      async () => {
        await i18n.changeLanguage(
          "fr",
        );

        expect(
          i18n.t(
            "landing.title",
          ),
        ).toBe(
          (
            "See your webhooks the "
            + "moment they happen."
          ),
        );
      },
    );
  },
);
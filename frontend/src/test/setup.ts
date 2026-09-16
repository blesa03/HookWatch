import {
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {
  afterEach,
  beforeEach,
  vi,
} from "vitest";

import i18n from "../i18n";


beforeEach(async () => {
  await i18n.changeLanguage(
    "en",
  );
});


afterEach(() => {
  cleanup();
});


Object.defineProperty(
  HTMLElement.prototype,
  "scrollIntoView",
  {
    configurable: true,
    value: vi.fn(),
  },
);


Object.defineProperty(
  window,
  "matchMedia",
  {
    writable: true,

    value:
      vi.fn()
        .mockImplementation(
          (query: string) => ({
            matches: false,
            media: query,
            onchange: null,

            addListener:
              vi.fn(),

            removeListener:
              vi.fn(),

            addEventListener:
              vi.fn(),

            removeEventListener:
              vi.fn(),

            dispatchEvent:
              vi.fn(),
          }),
        ),
  },
);
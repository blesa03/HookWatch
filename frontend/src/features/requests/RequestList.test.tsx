import {
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  RequestList,
} from "./RequestList";
import type {
  WebhookRequestSummary,
} from "./types";


const requests:
  WebhookRequestSummary[] = [
    {
      id: "request-1",
      method: "POST",
      path: "/github/push",
      content_type:
        "application/json",
      body_size: 2048,
      received_at:
        "2026-09-16T08:00:00Z",
    },
    {
      id: "request-2",
      method: "GET",
      path: "/ping",
      content_type: "",
      body_size: 0,
      received_at:
        "2026-09-16T08:01:00Z",
    },
  ];


function renderList(
  overrides: Partial<
    React.ComponentProps<
      typeof RequestList
    >
  > = {},
) {
  const props:
    React.ComponentProps<
      typeof RequestList
    > = {
      requests,
      selectedRequestId: null,
      isLoading: false,
      error: null,
      hasNextPage: false,
      isFetchingNextPage:
        false,
      onSelect: vi.fn(),
      onLoadMore: vi.fn(),
      ingestUrl:
        "http://localhost:8000/"
        + "hooks/test-token/",
      ...overrides,
    };

  render(
    <RequestList
      {...props}
    />,
  );

  return props;
}


describe(
  "RequestList",
  () => {
    it(
      "renders captured requests",
      () => {
        renderList();

        expect(
          screen.getByText(
            "/github/push",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "/ping",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "2.0 KB",
          ),
        ).toBeInTheDocument();
      },
    );


    it(
      "selects a request",
      async () => {
        const user =
          userEvent.setup();

        const props =
          renderList();

        await user.click(
          screen.getByText(
            "/github/push",
          ),
        );

        expect(
          props.onSelect,
        ).toHaveBeenCalledWith(
          "request-1",
        );
      },
    );


    it(
      "shows the empty state",
      () => {
        renderList({
          requests: [],
        });

        expect(
          screen.getByText(
            "Waiting for requests",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            /curl -X POST/,
          ),
        ).toBeInTheDocument();
      },
    );


    it(
      "loads older requests",
      async () => {
        const user =
          userEvent.setup();

        const props =
          renderList({
            hasNextPage: true,
          });

        await user.click(
          screen.getByRole(
            "button",
            {
              name:
                "Load older requests",
            },
          ),
        );

        expect(
          props.onLoadMore,
        ).toHaveBeenCalledOnce();
      },
    );
  },
);
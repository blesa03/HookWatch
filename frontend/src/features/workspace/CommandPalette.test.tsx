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
  CommandPalette,
  type CommandAction,
} from "./CommandPalette";


function buildActions() {
  const sendTest = vi.fn();
  const focusMode = vi.fn();
  const disabled = vi.fn();

  const actions:
    CommandAction[] = [
      {
        id: "send-test",
        label:
          "Send test request",
        shortcut: "T",
        keywords: [
          "webhook",
          "sender",
        ],
        run: sendTest,
      },
      {
        id: "focus",
        label:
          "Enter Focus Mode",
        shortcut: "F",
        keywords: [
          "focus",
          "fullscreen",
        ],
        run: focusMode,
      },
      {
        id: "disabled",
        label:
          "Delete selected request",
        disabled: true,
        run: disabled,
      },
    ];

  return {
    actions,
    sendTest,
    focusMode,
    disabled,
  };
}


describe(
  "CommandPalette",
  () => {
    it(
      "hides disabled actions",
      () => {
        const {
          actions,
        } = buildActions();

        render(
          <CommandPalette
            actions={actions}
            onClose={vi.fn()}
          />,
        );

        expect(
          screen.queryByText(
            "Delete selected request",
          ),
        ).not.toBeInTheDocument();

        expect(
          screen.getByText(
            "Send test request",
          ),
        ).toBeInTheDocument();
      },
    );


    it(
      "filters and executes a command",
      async () => {
        const user =
          userEvent.setup();

        const {
          actions,
          focusMode,
        } = buildActions();

        const onClose =
          vi.fn();

        render(
          <CommandPalette
            actions={actions}
            onClose={onClose}
          />,
        );

        const input =
          screen.getByPlaceholderText(
            "Type a command…",
          );

        await user.type(
          input,
          "focus",
        );

        expect(
          screen.getByText(
            "Enter Focus Mode",
          ),
        ).toBeInTheDocument();

        expect(
          screen.queryByText(
            "Send test request",
          ),
        ).not.toBeInTheDocument();

        await user.keyboard(
          "{Enter}",
        );

        expect(
          focusMode,
        ).toHaveBeenCalledOnce();

        expect(
          onClose,
        ).toHaveBeenCalledOnce();
      },
    );


    it(
      "supports keyboard navigation",
      async () => {
        const user =
          userEvent.setup();

        const {
          actions,
          focusMode,
        } = buildActions();

        render(
          <CommandPalette
            actions={actions}
            onClose={vi.fn()}
          />,
        );

        const input =
          screen.getByPlaceholderText(
            "Type a command…",
          );

        await user.click(input);

        await user.keyboard(
          "{ArrowDown}{Enter}",
        );

        expect(
          focusMode,
        ).toHaveBeenCalledOnce();
      },
    );


    it(
      "closes with Escape",
      async () => {
        const user =
          userEvent.setup();

        const {
          actions,
        } = buildActions();

        const onClose =
          vi.fn();

        render(
          <CommandPalette
            actions={actions}
            onClose={onClose}
          />,
        );

        const input =
          screen.getByPlaceholderText(
            "Type a command…",
          );

        await user.click(input);

        await user.keyboard(
          "{Escape}",
        );

        expect(
          onClose,
        ).toHaveBeenCalledOnce();
      },
    );
  },
);
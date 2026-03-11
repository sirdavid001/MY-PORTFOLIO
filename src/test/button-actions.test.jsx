import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderAppAt } from "./app-test-utils";

describe("Portfolio button actions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("downloads and emails the CV from the home page", async () => {
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderAppAt("/");

    fireEvent.click(await screen.findByRole("button", { name: /download cv \(pdf\)/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/cv-download?format=pdf"),
        expect.objectContaining({ cache: "no-store" })
      );
    });
    expect(anchorClickSpy).toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/email address to receive cv/i), {
      target: { value: "builder@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /email my pdf cv/i }));

    expect(await screen.findByText(/my pdf cv has been sent to builder@example.com/i)).toBeInTheDocument();

    anchorClickSpy.mockRestore();
  });
});

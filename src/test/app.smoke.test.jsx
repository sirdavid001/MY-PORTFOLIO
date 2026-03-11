import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFetchMock, renderAppAt } from "./app-test-utils";

describe("App smoke tests", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createFetchMock());
  });

  it("renders the portfolio home page", async () => {
    renderAppAt("/");

    expect(await screen.findByRole("heading", { name: /hi, i'm nwadialo david/i })).toBeInTheDocument();
  });

  it("renders the projects page", async () => {
    renderAppAt("/projects");

    expect(await screen.findByRole("heading", { name: /^projects$/i })).toBeInTheDocument();
    expect(screen.getByText(/current public work pulled from my real github repositories/i)).toBeInTheDocument();
  });

  it("renders the contact page", async () => {
    renderAppAt("/contact");

    expect(await screen.findByRole("heading", { name: /tell me about your project/i })).toBeInTheDocument();
    expect(screen.getByText(/project request form/i)).toBeInTheDocument();
  });
});

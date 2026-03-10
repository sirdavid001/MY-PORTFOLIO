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
    expect(screen.getByText(/real work and practical products from my github/i)).toBeInTheDocument();
  });

  it("renders the contact page", async () => {
    renderAppAt("/contact");

    expect(await screen.findByRole("heading", { name: /tell me about your project/i })).toBeInTheDocument();
    expect(screen.getByText(/project request form/i)).toBeInTheDocument();
  });

  it("renders the storefront on shop routes", async () => {
    renderAppAt("/shop");

    expect(await screen.findByText(/apple iphone xr/i)).toBeInTheDocument();
    expect(screen.getByText(/^SirDavid$/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^track order$/i })).toBeInTheDocument();
  });

  it("renders the tracking page on tracking routes", async () => {
    renderAppAt("/track-order");

    expect(await screen.findByRole("heading", { name: /track your order/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /track order/i }).length).toBeGreaterThan(0);
  });

  it("renders the admin login view when no admin session exists", async () => {
    renderAppAt("/secure-admin-portal-xyz");

    expect(await screen.findByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /admin portal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in to dashboard/i })).toBeInTheDocument();
  });
});

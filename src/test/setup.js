import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

beforeEach(() => {
  window.localStorage.clear();
  window.history.pushState({}, "", "/");
  window.alert = vi.fn();
});

afterEach(() => {
  cleanup();
});

if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
}

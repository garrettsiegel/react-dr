import { describe, expect, it, vi } from "vitest";
import { resolveGitBinaryPath } from "../src/utils/resolve-git-binary-path.js";

vi.mock("node:fs", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:fs")>();
  return {
    ...original,
    accessSync: vi.fn(),
  };
});

import { accessSync } from "node:fs";
const mockedAccessSync = vi.mocked(accessSync);

describe("resolveGitBinaryPath", () => {
  it("returns the first trusted path that is executable", () => {
    mockedAccessSync.mockImplementation((filePath) => {
      if (filePath === "/usr/bin/git") return;
      throw new Error("ENOENT");
    });

    expect(resolveGitBinaryPath()).toBe("/usr/bin/git");
  });

  it("falls back to later paths when earlier ones are not executable", () => {
    mockedAccessSync.mockImplementation((filePath) => {
      if (filePath === "/opt/homebrew/bin/git") return;
      throw new Error("ENOENT");
    });

    expect(resolveGitBinaryPath()).toBe("/opt/homebrew/bin/git");
  });

  it("returns /usr/local/bin/git as last fallback", () => {
    mockedAccessSync.mockImplementation((filePath) => {
      if (filePath === "/usr/local/bin/git") return;
      throw new Error("ENOENT");
    });

    expect(resolveGitBinaryPath()).toBe("/usr/local/bin/git");
  });

  it("returns null when no trusted path is executable", () => {
    mockedAccessSync.mockImplementation(() => {
      throw new Error("ENOENT");
    });

    expect(resolveGitBinaryPath()).toBeNull();
  });
});

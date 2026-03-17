import { describe, expect, it } from "vitest";
import { isSafeGitRefName } from "../src/utils/get-diff-files.js";

describe("isSafeGitRefName", () => {
  it("accepts simple branch names", () => {
    expect(isSafeGitRefName("main")).toBe(true);
    expect(isSafeGitRefName("develop")).toBe(true);
    expect(isSafeGitRefName("master")).toBe(true);
  });

  it("accepts branch names with slashes", () => {
    expect(isSafeGitRefName("feature/add-login")).toBe(true);
    expect(isSafeGitRefName("release/v1.0.0")).toBe(true);
    expect(isSafeGitRefName("refs/heads/main")).toBe(true);
  });

  it("accepts branch names with dots and hyphens", () => {
    expect(isSafeGitRefName("v1.0.0")).toBe(true);
    expect(isSafeGitRefName("feature-branch")).toBe(true);
    expect(isSafeGitRefName("release-1.2.3")).toBe(true);
  });

  it("accepts branch names with underscores", () => {
    expect(isSafeGitRefName("feature_branch")).toBe(true);
    expect(isSafeGitRefName("my_feature/sub_task")).toBe(true);
  });

  it("rejects names starting with a hyphen", () => {
    expect(isSafeGitRefName("-branch")).toBe(false);
    expect(isSafeGitRefName("--force")).toBe(false);
  });

  it("rejects names ending with a slash", () => {
    expect(isSafeGitRefName("feature/")).toBe(false);
  });

  it("rejects names ending with a dot", () => {
    expect(isSafeGitRefName("branch.")).toBe(false);
  });

  it("rejects names ending with .lock", () => {
    expect(isSafeGitRefName("branch.lock")).toBe(false);
    expect(isSafeGitRefName("refs/heads/main.lock")).toBe(false);
  });

  it("rejects names containing double dots", () => {
    expect(isSafeGitRefName("main..develop")).toBe(false);
    expect(isSafeGitRefName("feature/../main")).toBe(false);
  });

  it("rejects names containing double slashes", () => {
    expect(isSafeGitRefName("feature//branch")).toBe(false);
  });

  it("rejects names containing @{", () => {
    expect(isSafeGitRefName("branch@{0}")).toBe(false);
    expect(isSafeGitRefName("main@{upstream}")).toBe(false);
  });

  it("rejects names containing backslashes", () => {
    expect(isSafeGitRefName("feature\\branch")).toBe(false);
  });

  it("rejects names with spaces or special characters", () => {
    expect(isSafeGitRefName("feature branch")).toBe(false);
    expect(isSafeGitRefName("branch;echo pwned")).toBe(false);
    expect(isSafeGitRefName("branch$(whoami)")).toBe(false);
    expect(isSafeGitRefName("branch`id`")).toBe(false);
    expect(isSafeGitRefName("branch|cat /etc/passwd")).toBe(false);
  });

  it("rejects empty strings", () => {
    expect(isSafeGitRefName("")).toBe(false);
  });

  it("rejects names with newlines or control characters", () => {
    expect(isSafeGitRefName("branch\nname")).toBe(false);
    expect(isSafeGitRefName("branch\x00name")).toBe(false);
    expect(isSafeGitRefName("branch\tname")).toBe(false);
  });
});

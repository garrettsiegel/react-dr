import { execFileSync } from "node:child_process";
import { DEFAULT_BRANCH_CANDIDATES, SOURCE_FILE_PATTERN } from "../constants.js";
import type { DiffInfo } from "../types.js";
import { resolveGitBinaryPath } from "./resolve-git-binary-path.js";

const SAFE_GIT_REF_PATTERN = /^[A-Za-z0-9._/-]+$/;

const isSafeGitRefName = (refName: string): boolean => {
  if (!SAFE_GIT_REF_PATTERN.test(refName)) return false;
  if (refName.startsWith("-")) return false;
  if (refName.endsWith("/") || refName.endsWith(".")) return false;
  if (refName.endsWith(".lock")) return false;
  if (refName.includes("..") || refName.includes("//") || refName.includes("@{")) return false;
  return !refName.includes("\\");
};

const runGitCommand = (directory: string, args: string[]): string =>
  (() => {
    const gitBinaryPath = resolveGitBinaryPath();
    if (!gitBinaryPath) throw new Error("Git binary not found in trusted locations");

    return execFileSync(gitBinaryPath, args, {
      cwd: directory,
      stdio: "pipe",
      encoding: "utf-8",
    }).trim();
  })();

const getCurrentBranch = (directory: string): string | null => {
  try {
    const branch = runGitCommand(directory, ["rev-parse", "--abbrev-ref", "HEAD"]);
    return branch === "HEAD" ? null : branch;
  } catch {
    return null;
  }
};

const detectDefaultBranch = (directory: string): string | null => {
  try {
    const reference = runGitCommand(directory, ["symbolic-ref", "refs/remotes/origin/HEAD"]);
    return reference.replace("refs/remotes/origin/", "");
  } catch {
    for (const candidate of DEFAULT_BRANCH_CANDIDATES) {
      try {
        runGitCommand(directory, ["rev-parse", "--verify", candidate]);
        return candidate;
      } catch {}
    }
    return null;
  }
};

const getChangedFilesSinceBranch = (directory: string, baseBranch: string): string[] => {
  try {
    const mergeBase = runGitCommand(directory, ["merge-base", baseBranch, "HEAD"]);

    const output = runGitCommand(directory, [
      "diff",
      "--name-only",
      "--diff-filter=ACMR",
      "--relative",
      mergeBase,
    ]);

    if (!output) return [];
    return output.split("\n").filter(Boolean);
  } catch {
    return [];
  }
};

const getUncommittedChangedFiles = (directory: string): string[] => {
  try {
    const output = runGitCommand(directory, [
      "diff",
      "--name-only",
      "--diff-filter=ACMR",
      "--relative",
      "HEAD",
    ]);
    if (!output) return [];
    return output.split("\n").filter(Boolean);
  } catch {
    return [];
  }
};

export const getDiffInfo = (directory: string, explicitBaseBranch?: string): DiffInfo | null => {
  const currentBranch = getCurrentBranch(directory);
  if (!currentBranch) return null;

  if (explicitBaseBranch && !isSafeGitRefName(explicitBaseBranch)) return null;

  const baseBranch = explicitBaseBranch ?? detectDefaultBranch(directory);
  if (!baseBranch) return null;
  if (!isSafeGitRefName(baseBranch)) return null;

  if (currentBranch === baseBranch) {
    const uncommittedFiles = getUncommittedChangedFiles(directory);
    if (uncommittedFiles.length === 0) return null;
    return { currentBranch, baseBranch, changedFiles: uncommittedFiles, isCurrentChanges: true };
  }

  const changedFiles = getChangedFilesSinceBranch(directory, baseBranch);
  return { currentBranch, baseBranch, changedFiles };
};

export const filterSourceFiles = (filePaths: string[]): string[] =>
  filePaths.filter((filePath) => SOURCE_FILE_PATTERN.test(filePath));

export { isSafeGitRefName };

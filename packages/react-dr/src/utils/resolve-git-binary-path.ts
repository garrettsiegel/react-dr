import { accessSync, constants } from "node:fs";

const TRUSTED_GIT_BINARY_PATHS = ["/usr/bin/git", "/opt/homebrew/bin/git", "/usr/local/bin/git"];

const isExecutableFile = (filePath: string): boolean => {
  try {
    accessSync(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

export const resolveGitBinaryPath = (): string | null => {
  for (const gitBinaryPath of TRUSTED_GIT_BINARY_PATHS) {
    if (isExecutableFile(gitBinaryPath)) return gitBinaryPath;
  }

  return null;
};

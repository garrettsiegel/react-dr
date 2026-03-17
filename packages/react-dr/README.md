# react-dr-cli

[![version](https://img.shields.io/npm/v/react-dr-cli?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/react-dr-cli)
[![downloads](https://img.shields.io/npm/dt/react-dr-cli.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/react-dr-cli)

Let coding agents diagnose and fix your React code.

This project is a security-hardened fork of React Doctor, published as react-dr-cli.

The original react-doctor package was scanned with Sentinel: https://www.npmjs.com/package/create-sentinel-security

One command scans your codebase for security, performance, correctness, and architecture issues, then outputs a **0–100 score** with actionable diagnostics.

## How it works

react-dr-cli detects your framework (Next.js, Vite, Remix, etc.), React version, and compiler setup, then runs two analysis passes **in parallel**:

1. **Lint**: Checks 60+ rules across state & effects, performance, architecture, bundle size, security, correctness, accessibility, and framework-specific categories (Next.js, React Native). Rules are toggled automatically based on your project setup.
2. **Dead code**: Detects unused files, exports, types, and duplicates.

Diagnostics are filtered through your config, then scored by severity (errors weigh more than warnings) to produce a **0–100 health score** (75+ Great, 50–74 Needs work, <50 Critical).

## Install

Run this at your project root:

```bash
npx -y react-dr-cli@1.0.0 .
```

Use `--verbose` to see affected files and line numbers:

```bash
npx -y react-dr-cli@1.0.0 . --verbose
```

## Install for your coding agent

Use the local skill file and copy it to your agent's skills directory.

```bash
cp skills/react-dr/SKILL.md ~/.claude/skills/react-dr/SKILL.md
```

## GitHub Actions

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0 # required for --diff
- run: npx -y react-dr-cli@1.0.0 . --diff main --fail-on error
```

| Input       | Default | Description                                                   |
| ----------- | ------- | ------------------------------------------------------------- |
| `--verbose` | `false` | Show file details per rule                                    |
| `--project` |         | Workspace project(s) to scan (comma-separated)                |
| `--diff`    |         | Base branch for diff mode. Only changed files are scanned     |
| `--fail-on` | `none`  | Exit with error on diagnostics: `error`, `warning`, or `none` |

The command exits non-zero based on `--fail-on` and can gate CI directly.

## Options

```
Usage: react-dr-cli [directory] [options]

Options:
  -v, --version     display the version number
  --no-lint         skip linting
  --no-dead-code    skip dead code detection
  --verbose         show file details per rule
  --score           output only the score
  -y, --yes         skip prompts, scan all workspace projects
  --project <name>  select workspace project (comma-separated for multiple)
  --diff [base]     scan only files changed vs base branch
  --fail-on <level> exit with error code on diagnostics: error, warning, none
  -h, --help        display help for command
```

## Configuration

Create a `react-doctor.config.json` in your project root to customize behavior:

```json
{
  "ignore": {
    "rules": ["react/no-danger", "jsx-a11y/no-autofocus", "knip/exports"],
    "files": ["src/generated/**"]
  }
}
```

You can also use the `"reactDoctor"` key in your `package.json` instead:

```json
{
  "reactDoctor": {
    "ignore": {
      "rules": ["react/no-danger"]
    }
  }
}
```

If both exist, `react-doctor.config.json` takes precedence.

### Config options

| Key            | Type                | Default | Description                                                                                                                         |
| -------------- | ------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `ignore.rules` | `string[]`          | `[]`    | Rules to suppress, using the `plugin/rule` format shown in diagnostic output (e.g. `react/no-danger`, `knip/exports`, `knip/types`) |
| `ignore.files` | `string[]`          | `[]`    | File paths to exclude, supports glob patterns (`src/generated/**`, `**/*.test.tsx`)                                                 |
| `lint`         | `boolean`           | `true`  | Enable/disable lint checks (same as `--no-lint`)                                                                                    |
| `deadCode`     | `boolean`           | `true`  | Enable/disable dead code detection (same as `--no-dead-code`)                                                                       |
| `verbose`      | `boolean`           | `false` | Show file details per rule (same as `--verbose`)                                                                                    |
| `diff`         | `boolean \| string` | —       | Force diff mode (`true`) or pin a base branch (`"main"`). Set to `false` to disable auto-detection.                                 |

CLI flags always override config values.

## Node.js API

You can also use react-dr-cli programmatically:

```js
import { diagnose } from "react-dr-cli/api";

const result = await diagnose("./path/to/your/react-project");

console.log(result.score); // { score: 82, label: "Good" } or null
console.log(result.diagnostics); // Array of Diagnostic objects
console.log(result.project); // Detected framework, React version, etc.
```

The `diagnose` function accepts an optional second argument:

```js
const result = await diagnose(".", {
  lint: true, // run lint checks (default: true)
  deadCode: true, // run dead code detection (default: true)
});
```

Each diagnostic has the following shape:

```ts
interface Diagnostic {
  filePath: string;
  plugin: string;
  rule: string;
  severity: "error" | "warning";
  message: string;
  help: string;
  line: number;
  column: number;
  category: string;
}
```

## Contributing

```bash
git clone https://github.com/garrett/react-dr
cd react-dr
pnpm install
pnpm -r run build
```

Run locally:

```bash
node packages/react-dr/dist/cli.js /path/to/your/react-project
```

### License

react-dr-cli is MIT-licensed open-source software.

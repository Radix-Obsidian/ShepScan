<div align="center">
  <br />
  <img src="https://raw.githubusercontent.com/Radix-Obsidian/ShepScan/main/logo.svg" alt="ShepScan" width="120" height="120" />
  <h1>ShepScan</h1>
  <p><strong>AI-Native Secret Detection CLI</strong></p>
  <p>Stop secrets from leaking before they hit production</p>

  [![npm version](https://img.shields.io/npm/v/@goldensheepai/shepscan.svg?style=flat-square)](https://www.npmjs.com/package/@goldensheepai/shepscan)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
  [![Downloads](https://img.shields.io/npm/dm/@goldensheepai/shepscan.svg?style=flat-square)](https://www.npmjs.com/package/@goldensheepai/shepscan)
  [![GitHub Stars](https://img.shields.io/github/stars/Radix-Obsidian/ShepScan?style=flat-square)](https://github.com/Radix-Obsidian/ShepScan)

  [Quick Start](#-quick-start) • [Features](#-features) • [Documentation](https://github.com/Radix-Obsidian/ShepScan#readme) • [GitHub](https://github.com/Radix-Obsidian/ShepScan)
  
  <br />
</div>

---

## 🎯 Why ShepScan?

**$4.45 million** — the average cost of a data breach in 2023. Many start with a single leaked API key.

ShepScan catches secrets **before** they reach your repository. Built for developers who ship fast and need security that doesn't slow them down.

## ⚡ Quick Start

```bash
# Run instantly with npx (no install needed)
npx @goldensheepai/shepscan scan ./your-project

# Or install globally
npm install -g @goldensheepai/shepscan
shepscan scan ./your-project
```

## Usage

### Scan Current Directory

```bash
shepscan
```

### Scan a Specific Directory

```bash
shepscan scan ./my-project
```

### Scan a GitHub Repository

```bash
shepscan repo https://github.com/username/repo
```

### Options

```bash
shepscan [path] [options]

Options:
  -v, --verbose       Show detailed output with snippets
  -o, --output <file> Save results to JSON file
  -V, --version       Output version number
  -h, --help          Display help
```

### Examples

```bash
# Scan with verbose output
shepscan scan ./src --verbose

# Save results to JSON
shepscan scan ./src -o results.json

# Scan a public GitHub repo
shepscan repo https://github.com/streaak/keyhacks

# List all detection patterns
shepscan patterns
```

## ✨ Features

### 13+ Secret Patterns Detected

<table>
<tr>
<td>

**Critical**
- AWS Keys
- GitHub Tokens
- Stripe Keys
- Database URLs
- Private Keys (RSA, SSH)

</td>
<td>

**High**
- Google API Keys
- Slack Tokens
- Discord Tokens
- OpenAI Keys
- JWT Secrets

</td>
<td>

**Medium**
- Generic API Keys
- Passwords
- Environment Secrets

</td>
</tr>
</table>

### Smart Detection
- **Zero Config** — Works out of the box
- **Fast Scanning** — Processes thousands of files per second
- **Low False Positives** — Filters test/example patterns
- **Exit Codes** — Perfect for CI/CD pipelines

## 🔧 Programmatic Usage

```typescript
import { scanDirectory, scanSingleFile } from '@goldensheepai/shepscan';

// Scan a directory
const result = scanDirectory('./my-project');

console.log(`Found ${result.totalSecrets} secrets`);
console.log(`Overall severity: ${result.overallSeverity}`);

for (const secret of result.secrets) {
  console.log(`${secret.filePath}:${secret.lineNumber} - ${secret.secretType}`);
}

// Scan a single file
const fileResult = scanSingleFile('./config.js');
```

## Exit Codes

- `0` — No secrets found, or only low/medium severity
- `1` — Critical or high severity secrets found

Use in CI/CD:

```bash
shepscan scan . || echo "Secrets detected!"
```

---

## 🤝 Contributing

We welcome contributions! ShepScan is **open source** and community-driven.

- 🐛 [Report bugs](https://github.com/Radix-Obsidian/ShepScan/issues)
- 💡 [Request features](https://github.com/Radix-Obsidian/ShepScan/discussions)
- 🔀 [Submit PRs](https://github.com/Radix-Obsidian/ShepScan/pulls)

See [CONTRIBUTING.md](https://github.com/Radix-Obsidian/ShepScan/blob/main/CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License © [Golden Sheep AI](https://github.com/Radix-Obsidian)

---

<div align="center">
  <br />
  <p><strong>Part of the ShepScan Platform</strong></p>
  <p>
    <a href="https://github.com/Radix-Obsidian/ShepScan">Full Platform</a> •
    <a href="https://github.com/Radix-Obsidian/ShepScan#readme">Documentation</a> •
    <a href="https://github.com/Radix-Obsidian/ShepScan/discussions">Community</a>
  </p>
  <p><sub>Made with 🤍 by developers, for developers</sub></p>
  <br />
</div>

# 🛡️ ShepScan

**AI-native security platform that prevents sensitive secrets from leaking into code repositories.**

Unlike traditional scanners, ShepScan emphasizes:
- **Real-time prevention** over reactive scanning
- **AI-driven classification** to eliminate false positives
- **Founder-friendly UX** that avoids DevSecOps complexity

## Project Structure

```
apps/
  api/     → NestJS Backend (Scanning Engine, API)
  web/     → Next.js Frontend (Dashboard)
docker-compose.yml → Infrastructure (Postgres, Redis)
```

## Quick Start

### Prerequisites

- **Git** (for cloning repos to scan)
- **Node.js 20+**
- **Docker & Docker Compose** (optional, for database)

### 1. Start Infrastructure (Optional)

```bash
docker-compose up -d
```

### 2. Start Backend API

```bash
cd apps/api
npm install
npm run start:dev
```

API runs at: **http://localhost:3001**

### 3. Start Frontend

```bash
cd apps/web
npm install
npm run dev
```

Dashboard runs at: **http://localhost:3000**

## Usage

1. Open **http://localhost:3000**
2. Paste a public GitHub repository URL
3. Click **Scan Now**
4. View detected secrets with file paths, line numbers, and severity

## Secret Detection Patterns

ShepScan detects 13+ secret types including:

| Type | Severity | Example |
|------|----------|---------|
| AWS Access Key | Critical | `AKIA...` |
| AWS Secret Key | Critical | 40-char base64 |
| GitHub Token | Critical | `ghp_...`, `github_pat_...` |
| Stripe Secret | Critical | `sk_live_...`, `sk_test_...` |
| Database URL | Critical | `postgres://user:pass@...` |
| Google API Key | High | `AIza...` |
| Slack Token | High | `xoxb-...` |
| Discord Token | High | `M...` pattern |
| Private Keys | Critical | `-----BEGIN...PRIVATE KEY-----` |
| OpenAI Key | High | `sk-...` |
| JWT Secret | High | Variable assignment patterns |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/scan` | POST | Scan a repository by URL |
| `/scan/quick?url=...` | GET | Quick scan (for testing) |
| `/scan/health` | GET | Service health check |

### Example Request

```bash
curl -X POST http://localhost:3001/scan \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/username/repo"}'
```

## Testing

```bash
cd apps/api
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
```

## Documentation

- [PRD](./.agent/workflow/PRD.md) - Product Requirements
- [SDD](./.agent/workflow/SDD.md) - System Design
- [TDD](./.agent/workflow/TDD.md) - Technical Design

---

**Golden Sheep AI** — *Build narrow. Test deep. Ship confidently.*

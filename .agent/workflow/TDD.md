# ShepScan — Technical Design Document (TDD)

Version: 1.0  
Owner: Golden Sheep AI  

---

# 1. Technologies Selected

## Backend

- NestJS (TypeScript)
- PostgreSQL (via Prisma ORM)
- Redis + BullMQ
- Docker

## Frontend

- Next.js 15  
- TailwindCSS  
- ShadCN components  

## Agent

- Python 3.12  
- Watchdog file listener  
- Configurable via YAML  

## AI

- OpenAI GPT-4.1 Mini for classification  
- GPT-4.1 Turbo/Claude 3.5 Sonnet for explanations  

---

# 2. Backend Design

## 2.1 API Endpoints

### `/auth/github/callback`

Handles OAuth token exchange.

### `/repos/list`

Returns list of repos connected.

### `/repos/:id/scan`

Triggers full repo scan (async).

### `/scan/results/:repo_id`

Returns all detected secrets.

### `/alerts/subscribe`

Create user alert channels.

### `/agent/register`

Registers local agent with org.

---

# 3. Secret Detection Engine

## 3.1 Step 1 — Regex Detection

Use curated regex patterns:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- GOOGLE_CLOUD_KEY
- STRIPE_SECRET_KEY
- JWT_SECRET
- DB_CONNECTION_STRING
- OAuth tokens
- Slack/Discord tokens  
…and more.

If regex hit → move to AI verify stage.

---

## 3.2 Step 2 — AI Classification

Prompt example:

```

You are classifying whether a matched string is a REAL credential.
Return JSON with:
{
"is_secret": true/false,
"type": "AWS" | "JWT" | "DB" | ...,
"confidence": 0-1
}

````

Output stored in DB.

---

# 4. Worker Design

### job:scan-repo

- fetch repo files  
- batch them  
- run regex → AI classification  
- store results  

### job:scan-commit

- only diff files  
- faster processing  

Workers autoscale.

---

# 5. Agent Design

## 5.1 Local Workflow

- Pre-commit hook (installed automatically)
- Scans staged files (`git diff --cached`)
- If secret found:
  - block commit  
  - print message  
  - show file + line  
  - offer remediation  

## 5.2 Config

```yaml
ignore_paths:
  - "tests/"
severity_threshold: medium
````

---

# 6. Testing Strategy

## Unit Tests

- secret detection patterns
- AI classifier wrapper
- repo sync

## Integration Tests

- OAuth callbacks
- full scan pipeline
- webhook event handling

## Agent Tests

- mock repos with fake secrets
- test commit blocking logic

---

# 7. Logging & Monitoring

- Structured logs via Pino
- Sentry for error reporting
- Prometheus metrics (queue length, scan durations)
- Grafana dashboards

---

# 8. Deployment

- Docker containers
- Fly.io or Render for backend
- Vercel for frontend
- Railway for Postgres

---

# 9. Future Extensions

- Automated secret rotation
- Policy engine
- Enterprise SSO (Okta, Azure AD)
- On-prem deployment

---

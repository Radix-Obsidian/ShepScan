# ShepScan — System Design Document (SDD)

Version: 1.0  
Owner: Golden Sheep AI  

---

# 1. Architecture Overview

High-level architecture is composed of three major components:

1. **Web Application (Next.js)** – dashboard, onboarding, repo management
2. **API Backend (NestJS)** – scanning pipeline, authentication, storage, AI integration
3. **ShepScan Agent (Python)** – optional pre-commit real-time detector

Supporting systems:

- PostgreSQL – relational data store  
- Redis – job queue + rate limits  
- BullMQ – background scan workers  
- OpenAI/Anthropic – LLM classification and explanations  
- Git provider webhooks – commit/PR realtime events  

---

# 2. System Diagram (Text)

```

[Frontend] <--> [Backend API] <--> [PostgreSQL]
|
[Redis]
|
[Workers]
|
[AI Model]
|
[Git Providers]
|
[Local Agent]

```

---

# 3. Module Breakdown

## 3.1 Auth Module

- OAuth with GitHub/GitLab/Bitbucket
- JWT session tokens
- Role-based access (admin, member)

## 3.2 Repo Module

- List available repos
- Store metadata + webhook callbacks
- Trigger scans on demand

## 3.3 Scan Module

- File ingestion → parsing → detection
- Regex detection patterns
- AI model classification
- Generate severity score

## 3.4 Alerts Module

- Slack / Email / Discord sending
- Rate limiting per repo

## 3.5 AI Module

- Calls LLM with minimal prompt templates
- Generates explanations + severity context

## 3.6 Worker Module

- Background processing using BullMQ
- Handles long scans, retries, batching

---

# 4. Data Model (Simplified)

### `users`

- id  
- email  
- auth_provider  
- created_at  

### `repos`

- id  
- provider  
- name  
- url  
- user_id  

### `secrets`

- id  
- repo_id  
- file_path  
- line_number  
- secret_type  
- severity  
- ai_explanation  
- created_at  

### `alerts`

- id  
- user_id  
- secret_id  
- delivery_channel  

---

# 5. Sequence Flows

## Flow 1: Initial Scan

1. User connects GitHub  
2. API syncs repos  
3. User selects “Scan all”  
4. Worker reads files  
5. Detect + classify secrets  
6. Store results  
7. Dashboard displays issues  

## Flow 2: Realtime Monitoring

1. Commit pushed  
2. Git provider sends webhook  
3. Backend fetches changes  
4. Detector runs on diff  
5. If secret → alert user  

## Flow 3: Agent Prevention

1. Developer commits locally  
2. Agent scans staged files  
3. If secret found → block commit  
4. Provide fix suggestions  

---

# 6. Security Considerations

- No secret values stored in plain text  
- At-rest encryption (AES-256)  
- Transport: HTTPS everywhere  
- Access tokens stored encrypted with KMS  
- LLM data anonymized to remove PII and code context  

---

# 7. Scalability Planning

- Workers are horizontally scalable  
- Redis cluster for high throughput  
- Postgres read replicas for analytics  
- Event-driven architecture for rotation  

---

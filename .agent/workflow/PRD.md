# ShepScan — Product Requirements Document (PRD)

Version: 1.0  
Owner: Golden Sheep AI  
Status: Draft  

---

# 1. Product Overview

ShepScan is an AI-native security platform that prevents sensitive secrets from leaking into code repositories.  
Unlike traditional scanners (TruffleHog, Gitleaks, GitGuardian), ShepScan emphasizes:

- **Real-time prevention** over reactive scanning  
- **AI-driven classification** to eliminate noise  
- **Automated remediation** including secret rotation  
- **Founder-friendly UX** that avoids DevSecOps complexity  

The goal: **become the default protective layer for every repo in the world.**

---

# 2. Problem Statement

Developers unintentionally push secrets into repos every day.  
Existing tools fail because they:

- produce noisy, false-positive-heavy reports  
- don’t prevent leaks — only detect after the fact  
- require security engineering expertise  
- lack visibility for founders and non-technical stakeholders  

This results in:

- compromised infrastructure  
- loss of customer trust  
- costly incident response  
- compliance failures  

ShepScan eliminates this risk entirely.

---

# 3. Product Goals

### Primary Goals

1. Detect leaked secrets across connected repos.
2. Prevent future leaks via real-time monitoring.
3. Provide AI explanations, severity scoring, and remediation.
4. Offer a simple, modern, intuitive UI for non-technical users.

### Secondary Goals

1. Automate secret rotation with cloud providers.
2. Provide compliance-ready reporting for SOC2/ISO.
3. Become platform-agnostic across GitHub, GitLab, Bitbucket.

---

# 4. Success Metrics

| Category | Metric |
|---------|--------|
| Activation | 80% of users connect >1 repo within 5 minutes |
| Detection Accuracy | < 5% false positives, >95% real-secret detection |
| Engagement | Weekly monitoring retention > 60% |
| Prevention | > 90% of new leaks blocked pre-commit (agent) |
| Revenue | Conversion of 3% free → paid |

---

# 5. User Stories

### As a founder

- I want to know if my repos contain leaked secrets so I can sleep at night.
- I want plain-English explanations of risk.

### As a developer

- I want a tool that doesn’t break my workflow.
- I want real-time alerts when I accidentally commit a secret.

### As a security engineer

- I want detailed reporting, logs, and remediation flows.
- I want integrations with AWS/GCP/Azure for rotation.

---

# 6. Feature Requirements

## 6.1 Repo Connections (MVP)

- OAuth integration with GitHub, GitLab, Bitbucket
- List + sync all repos
- Toggle scanning per repo

## 6.2 Full Repo Scan (MVP)

- Hybrid detection engine (regex + AI)
- Classify by secret type (AWS, Stripe, DB creds, JWT, etc.)
- Provide file path, line number, code snippet

## 6.3 AI Intelligence Layer (MVP)

- “Explain this secret” (founder mode)
- “Explain remediation steps” (developer mode)
- Severity heat map

## 6.4 Monitoring & Alerts (MVP)

- Webhooks for new commits & PRs
- Slack, Email, Discord notifications

## 6.5 Remediation Flow (MVP)

- Mark as valid secret
- Mark as false positive
- Steps to rotate manually

## 6.6 Commit-Time Prevention Agent (Phase 2)

- Local Python agent blocks commits with secrets
- Inline code suggestions

## 6.7 Automated Secret Rotation (Phase 3)

- Integrations with AWS/GCP/Azure secret managers
- Auto-patch configs via PR

---

# 7. Non-Functional Requirements

- Response time for scans: < 5 seconds per file
- System uptime: 99.9%
- Encryption: All secrets encrypted at rest using AES-256
- Data retention: Logs stored 30 days unless enterprise

---

# 8. Release Plan

MVP → Beta → Public Launch → Enterprise  

1. **MVP**: scanning + dashboard + monitoring  
2. **Beta**: agent, rotation, role-based teams  
3. **Enterprise**: SSO, SOC2 reporting, audit logs  

---

# 9. Out of Scope (for MVP)

- Secret rotation automation  
- On-premise deployment  
- Mobile application  
- Policy-as-code engines  

---

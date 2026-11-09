# BountyPilot — Scope-Safe Bug Bounty Research System

**Status:** In progress — local-first MVP and scope-gated assessment/report workflow implemented; optional single passive HEAD helper added; no target checks or submissions started.  
**Goal:** Build our own researcher workspace and a carefully bounded workflow for finding, validating, and reporting eligible vulnerabilities in public bug bounty programs. Rewards are possible but never guaranteed.

**Portfolio priority:** BountyPilot is one possible revenue path, not the sole focus. Compare it daily with other credible opportunities by time-to-first-cash, effort, authorization, and evidence of demand. If another path starts earning first, shift more execution capacity there while keeping lightweight discovery active across the portfolio; increase bounty effort only when its results justify it.

## Product concept

A solo-researcher workbench that converts a program's published brief into a versioned, reviewable engagement: allowed assets, exclusions, testing methods, rate limits, prohibited actions, data handling, disclosure policy, and reward terms. It tracks research notes and evidence, flags likely duplicates, and creates a factual report draft. It is not an autonomous exploit bot and does not claim that assets are safe to test merely because they are publicly reachable.

## Operating loop (continuous, multi-program)

1. **Continuously discover programs (automated, passive):** Search across multiple public bounty and vulnerability-disclosure ecosystems, vendor security pages, and official program directories—not just HackerOne, Bugcrowd, or one candidate. Maintain a rolling candidate queue and deduplicate programs by organization and canonical policy URL. Rank by explicit authorization/safe harbor, clear scope, allowed testing methods, payout clarity, response history where verifiable, technical fit, and likely effort. Store source URLs, retrieval times, and observed changes; distinguish verified facts from estimates. Private/invitation-only programs are included only when Goutham has legitimate access and the engagement permits it.
2. **Monitor the whole active portfolio (automated, passive):** Revisit each selected program's canonical policy and scope on a regular cadence and before any research session. Alert on asset additions/removals, exclusions, changed automation/rate limits, disclosure rules, reward changes, or unavailable policy pages. A material or ambiguous change pauses the engagement until reviewed; never assume last month's authorization still applies.
3. **Intake and authorization gate (human review):** Import the complete program brief and normalize every in-scope asset, exclusion, rule, and automation limit. Require a human to accept the exact version before the engagement becomes testable. Unknown or conflicting scope means `PAUSED`, not guessed.
4. **Research preparation (automated):** Generate a checklist from the current program policy and select a narrow, low-risk test hypothesis. Passive sources can include public documentation, DNS/certificate-transparency records, and source maps only where permitted. No live probing until scope and methodology are confirmed.
5. **Testing (program-specific, researcher-led):** Only test accepted in-scope assets and permitted methods. The automation policy is configured per program—some programs may allow bounded automated checks, while others prohibit automation entirely. Honor rate limits and prohibited tests. Avoid destructive actions, persistence, social engineering, denial of service, bulk enumeration, accessing other users' data, and unnecessary data collection. Stop immediately on sensitive data or unexpected impact.
6. **Finding validation (human-in-loop):** Require reproducible evidence, minimal proof, impact tied to program criteria, and a duplicate check. AI may organize and critique evidence but cannot assert unobserved facts or automatically mark a finding valid.
7. **Report drafting:** Produce a private draft with exact affected asset, concise summary, minimal reproduction steps, impact, evidence references, remediation suggestion, source/policy citation, and disclosure caveats. Clearly mark assumptions and placeholders; severity/CVSS remain suggestions pending review.
8. **Submission and follow-up (human approval):** Researcher reviews and submits through the program's authorized channel. Track status, requests, resolution, and reward outcome. Never publish findings or discuss private program details outside the program's disclosure rules.
9. **Learning loop:** Record accepted/duplicate/out-of-scope outcomes and time spent to improve program selection; don't infer likely payouts from advertised maximums.

## Automation roadmap

### Stage 1 — BountyPilot MVP (build first)
- Local-first dashboard: multi-source candidate queue, Programs, scope snapshots, engagements, hypotheses, findings, evidence, drafts, and outcomes.
- Immutable, timestamped policy snapshot per engagement; scope diffs require re-acceptance.
- Asset allowlist and exclusions are explicit; wildcard/ambiguous entries are flagged for human interpretation.
- Workflow states: `DISCOVERED → POLICY_REVIEW → READY (accepted scope) → RESEARCHING → VALIDATING → DRAFT_REVIEW → SUBMITTED → RESOLVED / CLOSED`.
- Evidence is user-selected and redacted before persistence; no credentials, session cookies, or third-party personal data in AI prompts or routine logs.
- Export report drafts in Markdown and platform-neutral JSON; no submission API in MVP.

### Stage 2 — Continuous passive discovery and change monitoring
- Monitor multiple permitted public program directories and official vendor security pages; maintain a deduplicated, source-backed rolling queue rather than a one-time shortlist.
- Recheck active candidates regularly and immediately before research; detect material policy/scope changes and pause affected work pending review.
- Alert only with source-backed new candidates or differences. Respect platform/site terms, robots/access rules, and published rate limits; prefer official feeds/APIs where available.
- No authenticated scraping or bypass of platform controls. Prefer official feeds/APIs where available; otherwise use a user-provided program URL and conservative page checks subject to site terms.

### Stage 3 — Program-specific assisted research
- Generate program-specific test plans from allowed methods and public documentation.
- Optional passive enrichment and local source-code review for repositories explicitly provided or in scope.
- Any active tool invocation must be individually allowlisted by program, host, technique, request rate, and time window. A default-deny control blocks unknown hosts and prohibited techniques; if a program says no automated scanning, the active-automation switch remains disabled for that engagement.
- Human starts each active test session and can stop it; maintain an audit log of commands, target, time, and policy snapshot.

### Stage 4 — Report quality and outcome analytics
- Draft from observed evidence; validate required report fields and attach references.
- Researcher approval required before portal submission or any external message.
- Track response latency and reward outcomes without sharing confidential findings across programs.

## Non-negotiable safeguards

- No testing a website or app merely because it is online. Require a current, explicit program authorization and exact in-scope asset.
- A program's scope and rules override this plan; re-check them immediately before testing and before reporting.
- No autonomous exploitation, broad scanning, credential attacks, destructive testing, data exfiltration, or testing of third-party services.
- Never use private customer data or credentials from NDTVerify or other projects as test material.
- Keep findings private; follow coordinated disclosure and platform rules.
- No guaranteed reward; duplicate, informational, out-of-scope, and non-reproducible findings may receive no payout.

## First deliverable and acceptance criteria

Build the local-first BountyPilot MVP with a source-backed multi-program queue, policy intake, explicit scope acceptance, a findings/evidence notebook, and report-draft export. Do not connect active scanners or submission automation in the first release. Acceptance: an engagement cannot enter `READY` without a reviewed policy snapshot and at least one exact in-scope asset; a scope change invalidates readiness; every generated report separates observed facts from suggestions and placeholders.

### Implemented locally (2026-11-06)

- Static, no-build-step workspace with browser-local storage, program/policy intake, exact-host allowlists, explicit scope acceptance, private hypothesis/finding notes, report-draft export, status/reward tracking, and JSON backup.
- Four candidates are preloaded in `POLICY REVIEW`: Wordfence (local/white-box WordPress component research; exact component must be checked against thresholds/exclusions), Microsoft Open Source Bounty (narrow repository list, high service-impact threshold), GitLab (local GDK recommended; heavier setup), and Proton (broad multi-product, privacy-sensitive scope). None is accepted for testing; no targets have been tested.
- The hostname-only allowlist, no scanning, no submission APIs, and human report review are intentional first-release limits. Policy source review and candidate rationale are recorded in `RESEARCH.md`.

### Assessment workflow enhancement (2026-11-06)

- Added a URL-led assessment workspace gated by a ready program/policy record, exact-host match, and a written-authorization attestation. Query values and fragments are not persisted.
- Added ten evidence-led review areas covering scope, identity, authorization, sessions, input handling, business logic, APIs, files/integrations, configuration, and sensitive data. Every area supports review state, working severity, confidence, and analyst notes.
- Added reproduction/validation steps, impact assessment, and remediation guidance fields per review area; the report repeats these under each potential finding so a reviewer can distinguish evidence from impact claims and recommendations.
- Added an executive-ready Markdown draft with authorization snapshot, coverage, methodology, potential-findings section, untested areas, evidence cautions, report reference ID, and official WSTG/ASVS/API Security/NIST references.
- Added a corporate-style A4 PDF export using the browser Print → Save as PDF flow, with confidentiality marking, report metadata, page headers/footers where supported, section layout, and a clear independent-researcher/no-affiliation disclosure. No company branding is imitated. This is still a private draft, not an external submission.
- Added optional one-request passive HEAD check via `server.py`, a Python-standard-library helper bound to loopback. It requires a per-request browser confirmation, exact accepted hostname, public routable DNS answers pinned to the connection, standard ports, TLS verification, no redirects, no response body, no credentials/cookies, and per-host rate limiting. It reports selected headers/cookie attribute flags as review signals only.
- This is not deep automated testing: no endpoint discovery, spidering, authenticated testing, source review, fuzzing, exploitation, vulnerability validation, or security grade. Further active capability requires explicit, current program-level authorization and an independently reviewed design.
- Methodology is adapted as concise original prompts and linked to OWASP WSTG, OWASP ASVS, OWASP API Security, and NIST SP 800-115; third-party skill text or scanner repositories are not copied/bundled.

## Decisions still needed before live participation

- Which platform/account(s) to use and whether researcher accounts are already verified.
- Preferred technical focus (web/API, mobile, source-code review, or other).
- Which single eligible WordPress plugin/theme to evaluate against Wordfence's current threshold and exclusion rules; alternatively, whether GitLab GDK is feasible on available hardware.

## Expanded program search (2026-11-06)

Goutham asked us to stop considering TryHackMe and extend the search. The active shortlist now favors local/source-first research: Wordfence WordPress plugin/theme bounty as the first path to investigate; Microsoft Open Source Bounty as a focused, high-impact code-review opportunity; GitLab HackerOne as a higher-setup local-GDK candidate; and Proton as a broad/privacy-sensitive program. Wikimedia was excluded because its official page says it does not pay bounties. See `RESEARCH.md` for sources, rules, ranking, and next experiment. This is not permission to probe public assets: no researcher accounts, tests, reports, or contacts have happened.

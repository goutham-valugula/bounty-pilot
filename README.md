# BountyPilot

A local-first workbench for organizing authorized vulnerability-disclosure and bug-bounty research. It includes exact-host program intake, private assessment plans and evidence notes, findings, and audit/report-draft export.

## Run locally

Open `index.html` for the local notebook and report workflow. To enable the optional passive HEAD check, run `python3 server.py` and open `http://127.0.0.1:8765/`. It uses only the Python 3 standard library; no package installs or API keys. Stop it with Ctrl+C.

## Current capabilities

- Record a program's canonical policy URL, review date, exact hostnames, exclusions, permitted/prohibited methods, and reward notes.
- Start with four source-backed public-program candidates in `POLICY REVIEW`; none is accepted for testing until the current policy is re-read and scope is explicitly accepted.
- Require an explicit policy-review acknowledgement before a program is marked ready.
- Accept only exact hostnames (no wildcard, path, or port) for finding notes; asset must match a program's accepted hostname exactly.
- Keep observed behavior separate from potential-impact assessment.
- Generate a private Markdown report draft or export a polished A4 corporate-style PDF through the browser's Print → Save as PDF flow. The report includes a local report ID, confidentiality marking, scope/methodology, evidence coverage, potential findings, and submission-review caveats; it does not imitate or claim Microsoft authorship or affiliation.
- Create a web/API assessment plan from a URL only after selecting an accepted authorization record and attesting to written authorization for the exact host.
- Use a ten-area evidence-led review checklist informed by OWASP WSTG, ASVS, OWASP API Security, and NIST SP 800-115; track unassessed, observed, blocked, and not-applicable states without claiming that a checklist is a certification.
- Generate an executive-ready Markdown or print-ready PDF assessment draft with scope snapshot, methodology, coverage, untested areas, potential findings, evidence notes, reproduction/validation steps, impact assessment, remediation guidance, severity caveats, and references.
- Parse the submitted URL locally and discard its query string and fragment. No URL, page content, or assessment notes are sent to a third-party service.
- Optionally make one user-confirmed HTTP `HEAD` request to the exact URL/path in the accepted host record. The loopback-only helper resolves and pins public IP addresses, rejects private/reserved addresses and nonstandard ports, validates HTTPS certificates, follows no redirects, reads no response body, sends no cookies/credentials, and rate-limits checks. It records selected response headers and cookie attribute flags, never cookie values.
- Export a JSON backup of the local workspace.
- Track report status and confirmed rewards received.
- Store program, activity, assessment, and finding records in this browser's `localStorage`.

## Boundaries

- Except for the optional one-request HEAD check after explicit confirmation, this version does not contact a target. It does not discover endpoints, scan, crawl, authenticate, exploit, upload evidence, or submit reports. The assessment feature is a scope-gated checklist and report generator, not a full automated security scanner. A URL or response headers alone cannot establish security posture.
- The helper trusts a local researcher attestation and client-side policy record; it cannot verify legal authorization or whether an exact path/method is permitted. Review the live program rules before each check. A single HEAD request is low-impact by design but is still target traffic and must be explicitly permitted.
- The helper binds only to `127.0.0.1:8765`, serves only `index.html`, `app.js`, and `styles.css`, and accepts same-origin JSON POSTs only. Do not expose it on a public interface or tunnel its port.
- A ready status records the researcher's policy acknowledgement; it is not an independent authorization decision. Re-check the program's current policy and scope before every session.
- This initial version models hostname scopes; path-based, mobile-binary, source-code, and complex asset types remain manual-only and must not be represented as accepted hostname scope.
- Never test an asset or technique that the current program rules do not explicitly permit. Avoid destructive tests, denial of service, credential attacks, social engineering, unnecessary collection, and access to other people's data.
- Do not store credentials, session cookies, tokens, secrets, or unredacted third-party personal data in the notebook.
- Data stays in the browser profile. Clearing browser storage removes it; use the JSON backup to preserve records. No app data is sent to a service.
- A draft is not a validated finding or a submitted report. Verify reproduction, impact, duplicate status, severity, disclosure terms, and redactions yourself.

## Roadmap

1. Expand the source-backed public-program candidate queue across more official directories and vendors.
2. Policy-change comparisons that pause affected engagements for review.
3. Better evidence references and duplicate/outcome notes.
4. Any additional target-side checks only after a threat model, secure backend design, SSRF controls, source attribution, privacy review, and program-specific permissions are defined. No broad autonomous scanning.

## Assessment references and reuse

The review checklist is an original concise workflow informed by public methodology references, not copied skill packs or bundled scanner payloads. It links to the primary projects so researchers can consult the current source and applicable licenses:

- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) — testing methodology and evidence discipline.
- [OWASP ASVS](https://github.com/OWASP/ASVS) — application verification requirements (current released baseline: ASVS 5.0.0; check the project for updates).
- [OWASP API Security](https://github.com/OWASP/API-Security) — API risk categories and guidance.
- [NIST SP 800-115](https://csrc.nist.gov/pubs/sp/800/115/final) — assessment planning, execution, analysis, and mitigation.

These sources do not authorize testing. Apply the target program's rules first, use the referenced works under their own license terms, and do not assume that checking a control proves the whole application secure.

See [`RESEARCH.md`](RESEARCH.md) for the initial candidate comparison and current policy references.

Rewards are never guaranteed. Scope clarity, safe harbor, prohibited methods, payout terms, response behavior, and fit should be checked program by program.

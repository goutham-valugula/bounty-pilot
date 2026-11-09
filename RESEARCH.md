# Public program search — 2026-11-06

Goutham asked us to drop TryHackMe and broaden the search for viable paid security research. The candidates below are discovery leads, not authorization to test. Re-open the official rules and enter the exact accepted scope in BountyPilot before any research. No accounts were created, no targets were tested, and no organizations were contacted during this search.

## Recommended starting path: Wordfence WordPress Bug Bounty (white-box/local)

- **Official program/scope:** <https://www.wordfence.com/threat-intel/bug-bounty-program/>
- **Binding program terms:** <https://www.wordfence.com/bug-bounty-program-terms/>
- The program accepts eligible WordPress plugin/theme vulnerabilities, with install-count thresholds varying by issue category and researcher tier. It explicitly excludes WordPress core and named vendors/products, closed components, software with its own bounty, and vendor-hosted services associated with plugins/themes.
- This is the best fit for immediate low-risk investigation because source review and proof-of-concept work can be done against a local copy and researcher-controlled WordPress instance; it does not require probing random live websites. Choose one component at a time, establish its active installs, whether it is closed/excluded/has its own bounty, and the eligible vulnerability threshold before research.
- The current official page advertises rewards up to USD 31,200, but this is a ceiling, not an estimate of likely earnings. Eligibility, tier, issue category, impact, duplicates, validation, and the current reward schedule determine payout. The program requires a researcher account to participate at submission and prohibits bulk automated bounty hunting. Do not mass-scan/download-and-submit findings.
- **Status:** suitable to investigate locally after selecting one eligible component; no particular plugin/theme has yet been accepted into scope.

## Candidate: GitLab HackerOne Bug Bounty (local-first, higher setup cost)

- **Official program policy:** <https://hackerone.com/gitlab>
- **Official policy update (Jan 20, 2026):** <https://about.gitlab.com/blog/gitlab-bug-bounty-program-policy-updates/>
- GitLab now strongly recommends its GitLab Development Kit (GDK) local environment for most research. Production-architecture work has a special requirement for test accounts using the HackerOne alias. Its policy update states DoS is out of scope except for a narrow policy-defined exception, standalone prompt injection is out of scope, and general information gathering/metadata enumeration is out of scope.
- This is a potentially useful source/local reproduction path, but GDK is resource-heavy and exact asset, method, and payout rules must be reviewed on the live HackerOne policy before any target is chosen. No bounty ceiling or expected payout is inferred from the policy-update announcement.
- **Status:** policy review only; not ready for testing.

## Candidate: Microsoft Open Source Bounty (local source, high impact bar)

- **Official program and eligible-repository list:** <https://www.microsoft.com/en-us/msrc/opensourcebountyprogram>
- Microsoft lists selected first-party open-source repositories including Azure SDKs, Fluent UI, PowerShell 7, TypeScript, Visual Studio Code, Monaco Editor, MsQuic, and the Microsoft Agent Framework. The current page excludes several specific related projects, so use only the exact live list.
- The page lists awards from USD 300 to USD 15,000. For this program specifically, a qualifying issue must be Critical or Important, reproducible on the most recent actively maintained branch, not previously known/reported, and demonstrate a qualifying security impact on a specified Microsoft service. A code defect found only in a local library is not automatically bounty-eligible.
- Research can start from public source, but any service probing must follow the linked MSRC rules of engagement, terms, and test-account instructions. Avoid samples/tutorials/demo/prototype/local-testing-only code and all non-listed repos.
- **Status:** promising source-first candidate; select a repository and verify the impact path before investing significant time.

## Candidate: Proton Bug Bounty (real rewards, broad/privacy-sensitive scope)

- **Official VDP:** <https://proton.me/security/vulnerability-disclosure>
- **Official bounty and reward guidance:** <https://proton.me/security/bug-bounty>
- **Official safe harbor:** <https://proton.me/security/safe-harbor>
- Proton’s current VDP page lists specific web and app systems. Its rules prohibit testing unlisted systems, social engineering, DoS/resource exhaustion, service degradation, third-party integrations, altering/deleting/sharing/retaining data, exfiltration, persistence, and pivoting. Researchers must stop and notify Proton immediately after discovering a vulnerability or exposure of nonpublic data, and purge stored nonpublic data after reporting.
- Proton states rewards are assessed case-by-case based primarily on user-data impact. Its page publishes high maximums and standard bands; these are not expected cash outcomes. The breadth of products and strict privacy constraints make this a higher-complexity candidate than local code review.
- **Status:** current policy reviewed; exact scope still needs to be entered/accepted for any chosen asset. No testing authorized by this note.

## Excluded from active shortlist

- **TryHackMe:** removed at Goutham’s direction. Its policy is not an active target or recommendation for this work.
- **Wikimedia:** not suitable for a revenue-focused queue; its official security page explicitly says it does not pay bounties.
- **Atlassian:** discovery search did not yield enough readable primary policy detail to assess current scope/reward/rules confidently; do not add it until the full current engagement policy can be reviewed.

## Practical order and next experiment

1. Start with a single WordPress plugin/theme that satisfies the currently published Wordfence threshold and exclusions. Review its source locally and reproduce only in a local WordPress installation. Track time spent and any independently confirmed security impact; no finding means stop, learn, and reassess rather than multiplying low-quality submissions.
2. In parallel, shortlist one Microsoft-listed open-source repository with a plausible qualifying impact path. Avoid spending time on local-only defects that cannot affect a specified Microsoft service under the rules.
3. Inspect GitLab GDK resource requirements and read the current HackerOne policy; proceed only if the local setup is feasible and the exact eligible component/method is clear.
4. Keep Proton in the queue but defer it until a specific in-scope, low-impact research path is identified.

This ranking is based on setup burden and ability to research locally, not on advertised reward ceilings. Rewards are uncertain and not guaranteed. Every finding must be human-validated, evidence-backed, private, and submitted only through the program’s current process after Goutham’s review.

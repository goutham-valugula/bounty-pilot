(() => {
  const STORAGE_KEY = 'bountypilot.workspace.v1';
  const emptyState = { programs: [], findings: [], assessments: [], activity: [], seedVersion: 3 };
  let state = loadState();
  let activeDraftId = null;
  let toastTimer;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const safe = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => new Date().toISOString().slice(0, 10);
  const dateLabel = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not recorded';
  const timeAgo = (value) => {
    const hours = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 3600000));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  };

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!stored || typeof stored !== 'object') return { ...structuredClone(emptyState), programs: publicCandidates() };
      const result = {
        programs: Array.isArray(stored.programs) ? stored.programs : [],
        findings: Array.isArray(stored.findings) ? stored.findings : [],
        assessments: Array.isArray(stored.assessments) ? stored.assessments : [],
        activity: Array.isArray(stored.activity) ? stored.activity : [],
        seedVersion: stored.seedVersion || 0
      };
      if (result.seedVersion < 3) {
        // Remove only the retired, app-seeded TryHackMe row; preserve any manually added program.
        result.programs = result.programs.filter((p) => p.id !== 'candidate-tryhackme-2026-11');
        const existing = new Set(result.programs.map((p) => p.id));
        result.programs.push(...publicCandidates().filter((p) => !existing.has(p.id)));
        result.seedVersion = 3;
      }
      return result;
    } catch {
    return { ...structuredClone(emptyState), programs: publicCandidates() };
    }
  }

  function publicCandidates() {
    const checked = '2026-11-06';
    return [
      {
        id: 'candidate-proton-2026-11', name: 'Proton Bug Bounty', platform: 'Direct program',
        policyUrl: 'https://proton.me/security/vulnerability-disclosure', reviewedAt: checked,
        assets: ['proton.me', 'account.proton.me', 'calendar.proton.me', 'drive.proton.me', 'docs.proton.me', 'mail.proton.me', 'api.protonmail.ch', 'pass.proton.me', 'protonvpn.com', 'account.protonvpn.com', 'api.protonvpn.ch', 'wallet.proton.me', 'lumo.proton.me', 'simplelogin.io', 'app.simplelogin.io', 'standardnotes.com', 'app.standardnotes.com'],
        exclusions: ['Any service not explicitly listed in the VDP policy', 'Third-party services integrated with or linked from Proton', 'shop.proton.me', 'support/contact and Zendesk-hosted help domains', 'status.proton.me', 'partners.proton.me', 'localize.proton.me'],
        allowedMethods: 'Use only the systems explicitly listed in the VDP policy. If a testing method is uncertain or unaddressed, contact Proton before beginning. Stop testing and notify Proton immediately if a vulnerability or nonpublic data exposure is discovered; purge stored nonpublic data after reporting.',
        prohibitedMethods: 'No physical testing, social engineering, unsolicited email/phishing, DoS/resource exhaustion, malicious software, service degradation, testing third-party integrations, data deletion/alteration/sharing/retention, data exfiltration, persistence, or pivoting.',
        rewardNotes: 'Case-by-case; published maximum USD 100,000. Standard ranges: critical USD 25,000–50,000; high USD 2,500–25,000; medium USD 1,000–2,500; low usually no monetary reward. See https://proton.me/security/bug-bounty. No payout is assured.',
        researchNote: 'Broad multi-product scope and privacy-sensitive data make this higher-complexity than source-local research. Re-open current VDP, bounty rules, and safe-harbor before any work.',
        acceptedAt: '', status: 'review', sourceCheckedAt: checked, createdAt: `${checked}T00:00:00.000Z`, updatedAt: `${checked}T00:00:00.000Z`
      },
      {
        id: 'candidate-wordfence-2026-11', name: 'Wordfence WordPress Bug Bounty', platform: 'Direct program',
        policyUrl: 'https://www.wordfence.com/threat-intel/bug-bounty-program/', reviewedAt: checked,
        assets: [],
        exclusions: ['WordPress core', 'Automattic, Facebook, Google, SiteGround and Yoast products', 'Closed-to-download/sale components', 'Vendor-hosted web services related to plugins/themes', 'Components with their own bounty program'],
        allowedMethods: 'White-box research on eligible WordPress plugins/themes using local copies and a researcher-controlled WordPress test installation. Confirm the specific component, current active-install threshold, researcher tier and exclusions in the official estimator/policy before work.',
        prohibitedMethods: 'No bulk automated bounty hunting or out-of-scope submissions. Do not test a vendor-hosted service as if it were covered by a plugin/theme listing. Avoid components excluded by the official policy.',
        rewardNotes: 'Official page advertises per-vulnerability rewards up to USD 31,200, but eligibility and amount depend on issue class, active-install threshold, researcher tier, duplicate status, validation and current schedule; not an expected payout.',
        researchNote: 'Best initial fit for code-first review: research can be performed on source/local WordPress rather than production sites. Select individual components only after checking exclusions, install counts and any overlapping bounty. Researcher account is required at submission; policy and payout rules can change.',
        acceptedAt: '', status: 'review', sourceCheckedAt: checked, createdAt: `${checked}T00:00:00.000Z`, updatedAt: `${checked}T00:00:00.000Z`
      },
      {
        id: 'candidate-gitlab-2026-11', name: 'GitLab HackerOne Bug Bounty', platform: 'HackerOne',
        policyUrl: 'https://hackerone.com/gitlab', reviewedAt: checked,
        assets: [],
        exclusions: ['Denial of service except narrow policy-defined exceptions', 'Standalone prompt injection', 'General information gathering/metadata enumeration'],
        allowedMethods: 'GitLab recommends local GitLab Development Kit (GDK) testing for most research. Production-architecture research requires test accounts created with the HackerOne alias. Use the HackerOne policy for exact assets and rules.',
        prohibitedMethods: 'Do not perform DoS or production testing outside exact policy rules. Avoid customer-data access and disruptive actions; use local setup wherever possible.',
        rewardNotes: 'Reward amounts are governed by the current HackerOne policy; verify exact ranges and eligible assets there before allocating research time. No payout is guaranteed.',
        researchNote: 'Potentially good source/local-reproduction path, but GDK is resource-heavy and exact scope/reward details require reviewing the current HackerOne engagement policy. Do not begin until exact eligible assets and methods are entered and accepted.',
        acceptedAt: '', status: 'review', sourceCheckedAt: checked, createdAt: `${checked}T00:00:00.000Z`, updatedAt: `${checked}T00:00:00.000Z`
      },
      {
        id: 'candidate-msrc-oss-2026-11', name: 'Microsoft Open Source Bounty', platform: 'MSRC',
        policyUrl: 'https://www.microsoft.com/en-us/msrc/opensourcebountyprogram', reviewedAt: checked,
        assets: [],
        exclusions: ['Repositories not on the current MSRC eligible list', 'Findings without a demonstrable security impact on a specified Microsoft service', 'Previously known/disclosed issues', 'Samples, tutorials, demos, prototypes, and local-testing-only code', 'Issues that are not Critical or Important for this specific program'],
        allowedMethods: 'Review only the repositories explicitly listed on the current MSRC Open Source Bounty page. Reproduce locally; demonstrate qualifying impact on the specified Microsoft service and meet the active-branch and severity criteria.',
        prohibitedMethods: 'Follow Microsoft Bounty Terms, safe harbor and Rules of Engagement. No live probing without explicit scope and test-account requirements. Do not treat every bug in an in-scope repository as bounty-eligible.',
        rewardNotes: 'Official program lists USD 300–15,000; current table ties awards to vulnerability category, severity and report completeness. Submission eligibility requires Critical or Important severity, a qualifying Microsoft-service impact, a previously unknown issue, and reproducibility on the latest actively maintained branch. No payout guaranteed.',
        researchNote: 'Strong source-first opportunity with clearly enumerated repositories and rewards, but the qualifying impact bar is high: a local code defect alone is insufficient unless it meets program criteria. Verify current eligible repository and Microsoft engagement terms before research.',
        acceptedAt: '', status: 'review', sourceCheckedAt: checked, createdAt: `${checked}T00:00:00.000Z`, updatedAt: `${checked}T00:00:00.000Z`
      }
    ];
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      showToast('Could not save locally. Export a backup or free browser storage.');
      return false;
    }
  }

  function logActivity(title, detail = '') {
    state.activity.unshift({ id: crypto.randomUUID(), title, detail, at: new Date().toISOString() });
    state.activity = state.activity.slice(0, 30);
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function navigate(view) {
    if (!['overview', 'programs', 'assessment', 'findings'].includes(view)) return;
    $$('.view').forEach((el) => el.classList.toggle('active', el.id === `view-${view}`));
    $$('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.view === view));
    $('#breadcrumb-current').textContent = view[0].toUpperCase() + view.slice(1);
    $('#sidebar').classList.remove('open');
    window.location.hash = view;
  }

  function programStatus(program) {
    if (program.status === 'paused') return 'paused';
    if (program.acceptedAt && program.assets?.length && program.reviewedAt) return 'ready';
    if (program.policyUrl) return 'review';
    return 'candidate';
  }

  function normalizeAsset(raw) {
    const value = raw.trim();
    if (!value || value.includes('*') || /\s/.test(value)) return null;
    try {
      const url = new URL(value.includes('://') ? value : `https://${value}`);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return null;
      if (url.pathname !== '/' || url.search || url.hash) return null;
      return url.hostname.toLowerCase();
    } catch {
      return null;
    }
  }

  function normalizePolicyUrl(raw) {
    try {
      const url = new URL(raw);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }

  function hostList(raw) {
    const accepted = [];
    const rejected = [];
    for (const line of raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)) {
      const host = normalizeAsset(line);
      if (host) accepted.push(host);
      else rejected.push(line);
    }
    return { accepted: [...new Set(accepted)], rejected };
  }

  function platformInitial(program) {
    const label = (program.platform || program.name || 'P').replace(/[^a-z0-9]/gi, '');
    return (label.slice(0, 1) || 'P').toUpperCase();
  }

  function updateMetrics() {
    const ready = state.programs.filter((p) => programStatus(p) === 'ready').length;
    const open = state.findings.filter((f) => !['Resolved', 'Closed'].includes(f.status)).length;
    const rewards = state.findings.reduce((sum, f) => sum + (Number(f.reward) || 0), 0);
    $('#metric-programs').textContent = state.programs.length;
    $('#metric-ready').textContent = ready;
    $('#metric-findings').textContent = open;
    $('#metric-rewards').textContent = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(rewards);
    $('#program-nav-count').textContent = state.programs.length;
    $('#finding-nav-count').textContent = state.findings.length;
    $('#assessment-nav-count').textContent = state.assessments.length;
  }

  function renderOverview() {
    const container = $('#overview-programs');
    const programs = [...state.programs].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 5);
    container.innerHTML = programs.length ? programs.map((program) => {
      const status = programStatus(program);
      return `<div class="program-row"><div class="program-logo">${safe(platformInitial(program))}</div><div class="program-info"><strong>${safe(program.name)}</strong><small>${safe(program.platform || 'Program')} · ${program.assets?.length || 0} exact asset${program.assets?.length === 1 ? '' : 's'}</small></div><span class="status-pill ${status}">${status === 'ready' ? 'READY' : status === 'review' ? 'POLICY REVIEW' : status.toUpperCase()}</span></div>`;
    }).join('') : '<div class="empty-inline"><strong>No programs in your queue</strong>Add a public program to record its rules and scope.</div>';

    const activity = $('#overview-activity');
    activity.innerHTML = state.activity.length ? state.activity.slice(0, 5).map((event) => `<div class="activity-event"><span class="activity-marker">${event.title.includes('Finding') ? '⌁' : event.title.includes('accepted') ? '✓' : '◎'}</span><div><strong>${safe(event.title)}</strong><small>${safe(event.detail)}${event.detail ? ' · ' : ''}${safe(timeAgo(event.at))}</small></div></div>`).join('') : '<div class="empty-inline"><strong>Your activity will show here</strong>Programs, policy reviews, and private finding notes appear in this timeline.</div>';
  }

  function renderPrograms() {
    const container = $('#programs-list');
    const empty = $('#program-empty');
    if (!state.programs.length) {
      container.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    container.innerHTML = [...state.programs].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).map((program) => {
      const status = programStatus(program);
      const assets = program.assets?.length ? program.assets.map((asset) => `<span class="asset-chip">${safe(asset)}</span>`).join('') : '<span class="asset-chip">No exact assets recorded</span>';
      const reviewed = program.reviewedAt ? dateLabel(program.reviewedAt) : 'Not reviewed';
      const stateAction = status === 'paused' ? '<button class="small-button" data-action="resume-program" data-id="' + safe(program.id) + '">Resume review</button>' : status === 'ready' ? '<button class="small-button" data-action="pause-program" data-id="' + safe(program.id) + '">Pause research</button>' : '';
      const accept = status !== 'ready' && status !== 'paused' && program.assets?.length ? '<button class="small-button primary-small" data-action="accept-program" data-id="' + safe(program.id) + '">Accept reviewed scope</button>' : '';
      const policyUrl = normalizePolicyUrl(program.policyUrl || '');
      return `<article class="program-card"><div class="program-card-head"><div class="program-logo">${safe(platformInitial(program))}</div><div class="program-card-title"><h3>${safe(program.name)}</h3>${policyUrl ? `<a href="${safe(policyUrl)}" target="_blank" rel="noopener noreferrer">${safe(program.policyUrl)} ↗</a>` : '<span>Policy URL not added</span>'}</div><span class="status-pill ${status}">${status === 'ready' ? 'READY' : status === 'review' ? 'POLICY REVIEW' : status.toUpperCase()}</span></div><div class="program-meta"><div class="meta-cell"><span>PLATFORM</span><strong>${safe(program.platform || 'Direct program')}</strong></div><div class="meta-cell"><span>POLICY CHECKED</span><strong>${safe(reviewed)} · ${program.sourceCheckedAt ? 'source checked' : 'your review'}</strong></div><div class="meta-cell"><span>REWARD NOTES</span><strong>${safe(program.rewardNotes || 'See current policy')}</strong></div></div><div class="asset-chips">${assets}</div>${program.researchNote ? `<p class="program-note"><strong>Fit & notes</strong>${safe(program.researchNote)}</p>` : ''}${program.allowedMethods || program.prohibitedMethods ? `<div class="rules-grid">${program.allowedMethods ? `<div><span>PERMITTED / REQUIRED</span><p>${safe(program.allowedMethods)}</p></div>` : ''}${program.prohibitedMethods ? `<div class="rules-blocked"><span>PROHIBITED / EXCLUDED</span><p>${safe(program.prohibitedMethods)}</p></div>` : ''}</div>` : ''}${program.exclusions?.length ? `<div class="asset-chips">${program.exclusions.map((e) => `<span class="asset-chip" style="background:#fbefed;color:#9f625b">Excluded: ${safe(e)}</span>`).join('')}</div>` : ''}<div class="program-card-actions">${stateAction}<button class="small-button" data-action="edit-program" data-id="${safe(program.id)}">Edit policy snapshot</button>${accept}<button class="small-button danger" data-action="delete-program" data-id="${safe(program.id)}">Remove</button></div></article>`;
    }).join('');
  }

  function renderFindings() {
    const container = $('#findings-list');
    const empty = $('#finding-empty');
    if (!state.findings.length) {
      container.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    container.innerHTML = [...state.findings].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).map((finding) => {
      const program = state.programs.find((p) => p.id === finding.programId);
      return `<article class="finding-card"><div class="finding-card-head"><span class="severity-dot ${safe(finding.severity)}"></span><div><h3>${safe(finding.title)}</h3><div class="finding-asset">${safe(program?.name || 'Removed program')} · ${safe(finding.asset)}</div></div><span class="status-pill ${finding.status === 'Resolved' ? 'ready' : finding.status === 'Closed' ? 'paused' : 'review'}">${safe((finding.status || 'Draft').toUpperCase())}</span></div>${finding.hypothesis ? `<p class="finding-hypothesis"><strong>Hypothesis</strong>${safe(finding.hypothesis)}</p>` : ''}<p>${safe(finding.observed.slice(0, 260))}${finding.observed.length > 260 ? '…' : ''}</p><div class="finding-card-foot"><span>${safe(finding.severity)} · Updated ${safe(timeAgo(finding.updatedAt))}${Number(finding.reward) > 0 ? ` · $${safe(finding.reward)} received` : ''}</span><div class="finding-actions"><button class="small-button" data-action="outcome-finding" data-id="${safe(finding.id)}">Update status</button><button class="small-button" data-action="draft-finding" data-id="${safe(finding.id)}">Report draft</button><button class="small-button danger" data-action="delete-finding" data-id="${safe(finding.id)}">Delete</button></div></div></article>`;
    }).join('');
  }

  function render() {
    updateMetrics();
    renderOverview();
    renderPrograms();
    renderAssessmentOptions();
    renderAssessments();
    renderFindings();
  }

  const assessmentChecks = [
    { id: 'surface', area: 'Scope & attack surface', prompt: 'Are all application hosts, routes, API versions, and third-party dependencies inside the accepted scope?', lens: 'Record the policy source and any exclusions. Do not enumerate hosts or paths from this page.', ref: 'WSTG-INFO' },
    { id: 'identity', area: 'Identity & authentication', prompt: 'Are registration, login, recovery, MFA, and account lifecycle controls consistent with the stated threat model?', lens: 'Use only researcher-controlled accounts and permitted flows. Record the exact role and safe reproduction conditions.', ref: 'ASVS V6 · WSTG-ATHN' },
    { id: 'access', area: 'Authorization & tenant isolation', prompt: 'Are role, object, and tenant boundaries enforced server-side for the reviewed workflows?', lens: 'Use only accounts and records you control. Stop before accessing another person’s data.', ref: 'ASVS V8 · API1/API5' },
    { id: 'session', area: 'Sessions & browser security', prompt: 'Are session lifecycle, cookie attributes, CSRF defenses, and browser security policies appropriate?', lens: 'Record observed cookie/header values with tokens and identifiers redacted.', ref: 'ASVS V7 · WSTG-SESS' },
    { id: 'input', area: 'Input handling & output encoding', prompt: 'Are untrusted inputs validated and safely encoded at relevant boundaries?', lens: 'Review source or use benign, policy-permitted inputs. Do not use destructive payloads or affect other users.', ref: 'ASVS V1/V5 · WSTG-INPV' },
    { id: 'workflow', area: 'Business logic & abuse controls', prompt: 'Can a user skip required steps, replay a one-time action, or exceed intended workflow limits?', lens: 'Keep tests low-volume and confined to your own test data; respect published rate limits.', ref: 'WSTG-BUSL · API4' },
    { id: 'api', area: 'API authorization & data exposure', prompt: 'Do API responses expose only necessary fields, and are object/function/property permissions checked on the server?', lens: 'Review authorized API calls made with your own account. Redact identifiers, secrets, and personal data.', ref: 'OWASP API1/API3/API5' },
    { id: 'files', area: 'Uploads, downloads & integrations', prompt: 'Are file types, storage access, and server-side integrations constrained to the intended use?', lens: 'Use benign test files and controlled destinations only when explicitly allowed. No SSRF payloads or access to internal services.', ref: 'ASVS V12 · WSTG-BUSL' },
    { id: 'config', area: 'Transport, configuration & errors', prompt: 'Are transport, security headers, CORS, cache behavior, and error responses appropriate for sensitive flows?', lens: 'Record exact response evidence from an authorized session; a missing header alone is not automatically a vulnerability.', ref: 'ASVS V14 · WSTG-CONF' },
    { id: 'data', area: 'Sensitive data & privacy boundaries', prompt: 'Does the application minimize sensitive data in responses, logs, URLs, and user-visible error paths?', lens: 'Do not collect, retain, or paste real user data, credentials, or session material into this workspace.', ref: 'ASVS V8/V16 · NIST 800-115' }
  ];

  function renderAssessmentOptions() {
    const select = $('#assessment-program');
    if (!select) return;
    const prior = select.value;
    const ready = state.programs.filter((p) => programStatus(p) === 'ready');
    select.innerHTML = '<option value="">Choose an accepted program</option>' + ready.map((p) => `<option value="${safe(p.id)}">${safe(p.name)} · ${safe(p.assets.join(', '))}</option>`).join('');
    if (ready.some((p) => p.id === prior)) select.value = prior;
    updateAssessmentScopeReadout();
  }

  function updateAssessmentScopeReadout() {
    const p = state.programs.find((item) => item.id === $('#assessment-program')?.value);
    const el = $('#assessment-scope-readout');
    if (!el) return;
    el.textContent = p ? `Accepted exact hosts: ${p.assets.join(' · ')}. Any path-level exclusions still apply.` : 'Select a program to see its accepted exact hosts. No active authorization record? Add and review it under Programs first.';
  }

  function renderAssessments() {
    const list = $('#assessments-list');
    const empty = $('#assessment-empty');
    if (!list || !empty) return;
    empty.classList.toggle('hidden', state.assessments.length > 0);
    list.innerHTML = [...state.assessments].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).map((assessment) => {
      const program = state.programs.find((p) => p.id === assessment.programId);
      const done = assessment.checks.filter((c) => c.status !== 'Not assessed').length;
      const flagged = assessment.checks.filter((c) => c.status === 'Finding observed').length;
      const items = assessment.checks.map((check) => `<details class="assessment-check"><summary><span class="check-area">${safe(check.area)}</span><span class="check-state ${check.status === 'Finding observed' ? 'check-finding' : check.status === 'No issue observed' ? 'check-clear' : ''}">${safe(check.status)}</span><span class="check-ref">${safe(check.ref)}</span></summary><p>${safe(check.prompt)}</p><small>${safe(check.lens)}</small><div class="form-grid"><label>Review state<select data-check-field="status" data-assessment="${safe(assessment.id)}" data-check="${safe(check.id)}"><option${check.status === 'Not assessed' ? ' selected' : ''}>Not assessed</option><option${check.status === 'No issue observed' ? ' selected' : ''}>No issue observed</option><option${check.status === 'Finding observed' ? ' selected' : ''}>Finding observed</option><option${check.status === 'Not applicable' ? ' selected' : ''}>Not applicable</option><option${check.status === 'Blocked / not permitted' ? ' selected' : ''}>Blocked / not permitted</option></select></label><label>Working severity<select data-check-field="severity" data-assessment="${safe(assessment.id)}" data-check="${safe(check.id)}"><option${check.severity === 'Not rated' ? ' selected' : ''}>Not rated</option><option${check.severity === 'Informational' ? ' selected' : ''}>Informational</option><option${check.severity === 'Low' ? ' selected' : ''}>Low</option><option${check.severity === 'Medium' ? ' selected' : ''}>Medium</option><option${check.severity === 'High' ? ' selected' : ''}>High</option><option${check.severity === 'Critical' ? ' selected' : ''}>Critical</option></select></label><label>Evidence confidence<select data-check-field="confidence" data-assessment="${safe(assessment.id)}" data-check="${safe(check.id)}"><option${check.confidence === 'Unrated' ? ' selected' : ''}>Unrated</option><option${check.confidence === 'Low' ? ' selected' : ''}>Low</option><option${check.confidence === 'Moderate' ? ' selected' : ''}>Moderate</option><option${check.confidence === 'High' ? ' selected' : ''}>High</option></select></label></div><label>Evidence / analyst notes<textarea data-check-field="notes" data-assessment="${safe(assessment.id)}" data-check="${safe(check.id)}" rows="2" maxlength="1800" placeholder="Observed facts and redacted evidence reference.">${safe(check.notes || '')}</textarea></label><label>Reproduction / validation steps<textarea data-check-field="reproduction" data-assessment="${safe(assessment.id)}" data-check="${safe(check.id)}" rows="2" maxlength="1800" placeholder="Minimal, repeatable steps using only authorized test data.">${safe(check.reproduction || '')}</textarea></label><label>Impact assessment<textarea data-check-field="impact" data-assessment="${safe(assessment.id)}" data-check="${safe(check.id)}" rows="2" maxlength="1800" placeholder="Separate demonstrated impact from assumptions.">${safe(check.impact || '')}</textarea></label><label>Remediation guidance<textarea data-check-field="remediation" data-assessment="${safe(assessment.id)}" data-check="${safe(check.id)}" rows="2" maxlength="1800" placeholder="Specific, proportionate fix or defense-in-depth recommendation.">${safe(check.remediation || '')}</textarea></label></details>`).join('');
      const passive = assessment.passiveCheck;
      const passiveSummary = passive ? `<div class="passive-result"><div class="passive-result-head"><strong>Passive HTTP response</strong><span>${safe(passive.checkedAt)} · ${safe(passive.status)} ${safe(passive.reason || '')}</span></div><div class="passive-result-grid"><span>HTTPS / TLS: <b>${passive.checks.https ? 'HTTPS, certificate verified' : 'HTTP — no TLS'}</b></span>${passive.tlsExpiresAt ? `<span>Certificate expiry: <b>${safe(passive.tlsExpiresAt)} (${safe(passive.tlsDaysRemaining)} days remaining)</b></span>` : ''}<span>HSTS: <b>${passive.checks.hstsPresent ? 'present' : 'not seen'}</b></span><span>CSP: <b>${passive.checks.cspPresent ? 'present' : 'not seen'}</b></span><span>Content-type protection: <b>${passive.checks.nosniffPresent ? 'nosniff present' : 'not seen'}</b></span><span>Frame protection: <b>${passive.checks.frameProtectionPresent ? 'present' : 'not seen'}</b></span><span>Referrer policy: <b>${passive.checks.referrerPolicyPresent ? 'present' : 'not seen'}</b></span><span>Permissions policy: <b>${passive.checks.permissionsPolicyPresent ? 'present' : 'not seen'}</b></span><span>Wildcard CORS: <b>${passive.checks.corsWildcard ? 'observed — review context' : 'not observed'}</b></span><span>Cookies: <b>${passive.setCookieCount} Set-Cookie header(s); values discarded</b></span>${passive.checks.redirectHost ? `<span>Redirect response: <b>not followed · destination host ${safe(passive.checks.redirectHost)}</b></span>` : ''}</div><small>One HEAD response only. Redirects not followed; no body, credentials, or cookies sent. Missing headers are review prompts, not findings.</small></div>` : '';
      return `<article class="assessment-card"><div class="assessment-card-head"><div><span class="assessment-badge">${safe(assessment.type)}</span><h3>${safe(assessment.targetUrl)}</h3><p>${safe(assessment.programName)} · Created ${safe(dateLabel(assessment.createdAt.slice(0, 10)))}</p></div><div class="assessment-progress"><strong>${done}/${assessment.checks.length}</strong><small>areas reviewed</small></div></div><div class="assessment-summary"><span>${flagged} potential finding${flagged === 1 ? '' : 's'} recorded</span><span>Authorization snapshot: ${safe(assessment.policyReviewedAt || 'not recorded')}</span></div><div class="assessment-context"><strong>Review objective</strong><p>${safe(assessment.context || 'No system context supplied yet.')}</p></div>${passiveSummary}<details class="assessment-work"><summary>Review checklist &amp; evidence (${assessment.checks.length} areas)</summary>${items}</details><div class="program-card-actions"><button class="small-button" data-action="passive-head" data-id="${safe(assessment.id)}">${passive ? 'Re-run passive HEAD check' : 'Run one passive HEAD check'}</button><button class="small-button primary-small" data-action="assessment-report" data-id="${safe(assessment.id)}">Generate audit report</button><button class="small-button danger" data-action="delete-assessment" data-id="${safe(assessment.id)}">Delete record</button></div><p class="assessment-footnote">${program && programStatus(program) === 'ready' ? 'Current program record remains accepted; re-check its live policy before each session.' : 'Authorization is no longer ready. Pause this review and re-accept the exact current policy before continuing.'} The HEAD check runs only after your confirmation and only through the loopback helper.</p></article>`;
    }).join('');
  }

  function assessmentFormSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const program = state.programs.find((p) => p.id === data.get('programId'));
    let url;
    try { url = new URL(String(data.get('url') || '').trim()); } catch { showToast('Enter a valid HTTP or HTTPS URL.'); return; }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) { showToast('Use an HTTP(S) URL without credentials or a nonstandard port.'); return; }
    if (!program || programStatus(program) !== 'ready' || !program.assets.includes(url.hostname.toLowerCase())) { showToast('This exact hostname is not in a currently accepted scope record.'); return; }
    const safeUrl = `${url.origin}${url.pathname || '/'}`;
    const assessment = {
      id: crypto.randomUUID(), programId: program.id, programName: program.name, policyUrl: program.policyUrl,
      policyReviewedAt: program.reviewedAt, policySnapshot: program.policySnapshot || JSON.stringify({ policyUrl: program.policyUrl, assets: program.assets, exclusions: program.exclusions }),
      targetUrl: safeUrl, hostname: url.hostname.toLowerCase(), type: String(data.get('type') || 'Web application'),
      authContext: String(data.get('authContext') || 'Not established'), window: String(data.get('window') || '').trim(),
      context: String(data.get('context') || '').trim(), authorizationAttestedAt: new Date().toISOString(),
      queryValuesOmitted: Boolean(url.search), checks: assessmentChecks.map((item) => ({ ...item, status: 'Not assessed', severity: 'Not rated', confidence: 'Unrated', notes: '', reproduction: '', impact: '', remediation: '' })),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    state.assessments.unshift(assessment);
    logActivity('Scoped assessment plan created', `${program.name} · ${assessment.hostname}`);
    persist(); render(); form.reset(); updateAssessmentScopeReadout();
    showToast(url.search ? 'Plan created. Query values were discarded; no network requests were made.' : 'Plan created locally. No network requests were made.');
    $('#assessment-empty')?.scrollIntoView({ block: 'nearest' });
  }

  function assessmentReportMarkdown(assessment) {
    const reviewed = assessment.checks.filter((c) => c.status !== 'Not assessed');
    const findings = assessment.checks.filter((c) => c.status === 'Finding observed');
    const severityOrder = ['Critical', 'High', 'Medium', 'Low', 'Informational', 'Not rated'];
    const highest = severityOrder.find((s) => findings.some((f) => f.severity === s)) || 'None assigned';
    const checklist = assessment.checks.map((c) => `### ${c.area}\n- **Status:** ${c.status}\n- **Working severity:** ${c.severity}\n- **Evidence confidence:** ${c.confidence || 'Unrated'}\n- **Evidence / analyst notes:** ${c.notes || '_Not recorded._'}\n- **Reproduction / validation:** ${c.reproduction || '_Not recorded._'}\n- **Impact assessment:** ${c.impact || '_Not recorded._'}\n- **Remediation guidance:** ${c.remediation || '_Not recorded._'}\n- **Reference:** ${c.ref}`).join('\n\n');
    const passive = assessment.passiveCheck;
    const passiveReport = passive ? `## Passive HTTP observations\n- **Timestamp:** ${passive.checkedAt}\n- **Request:** ${passive.method} ${passive.url}\n- **Response:** ${passive.status} ${passive.reason}\n- **TLS:** ${passive.tlsVerified ? `HTTPS certificate chain validated by the local runtime during connection${passive.tlsExpiresAt ? `; certificate expiry ${passive.tlsExpiresAt} (${passive.tlsDaysRemaining} days remaining)` : ''}.` : 'The request used HTTP; transport was not encrypted.'}\n- **Headers recorded:**\n${Object.entries(passive.headers).map(([name, value]) => `  - \`${name}\`: ${value}`).join('\n') || '  - No selected response headers were present.'}\n- **Header observations:** HSTS ${passive.checks.hstsPresent ? 'present' : 'not seen'}; CSP ${passive.checks.cspPresent ? 'present' : 'not seen'}; nosniff ${passive.checks.nosniffPresent ? 'present' : 'not seen'}; frame protection ${passive.checks.frameProtectionPresent ? 'present' : 'not seen'}; wildcard CORS ${passive.checks.corsWildcard ? 'observed (review context)' : 'not observed'}.\n- **Redirect:** ${passive.checks.redirectHost ? `HTTP redirect response observed; not followed (destination host: ${passive.checks.redirectHost}).` : 'No redirect destination reported in this response.'}\n- **Set-Cookie:** ${passive.setCookieCount} header(s); cookie values were discarded. Attribute flags: ${passive.cookieFlags.map((c, i) => `cookie ${i + 1} Secure=${c.secure}, HttpOnly=${c.httpOnly}, SameSite=${c.sameSite}`).join('; ') || 'none observed'}.\n- **Limits:** ${passive.limitations.join(' ')} These are response observations, not confirmed vulnerabilities.\n\n` : '';
    const executionDisclosure = passive ? 'One user-confirmed, single HEAD request was made by the loopback helper to the accepted exact host/path; no body, cookies, credentials, or redirects were sent/followed. All other checklist statuses and notes are researcher-entered.' : 'The URL was parsed locally and a checklist was generated. No DNS, HTTP, browser, API, or target requests were made. All checklist statuses and notes are researcher-entered.';
    return `# Application Security Assessment — ${assessment.hostname}\n\n> **CONFIDENTIAL — PRIVATE DRAFT.** Not a certification, penetration-test attestation, or proof that the system is secure. The application has not independently verified authorization or findings. Validate every statement, remove secrets and personal data, and follow the program's disclosure rules before sharing.\n\n## 1. Executive summary\n- **Target:** ${assessment.targetUrl}\n- **Assessment type:** ${assessment.type}\n- **Authorization record:** ${assessment.programName}\n- **Policy:** ${assessment.policyUrl}\n- **Policy review date recorded:** ${assessment.policyReviewedAt || 'Not recorded'}\n- **Assessment window:** ${assessment.window || 'Not recorded'}\n- **Authentication context:** ${assessment.authContext}\n- **Checklist coverage:** ${reviewed.length}/${assessment.checks.length} areas have a recorded status; ${findings.length} area${findings.length === 1 ? '' : 's'} marked “Finding observed.”\n- **Highest working severity:** ${highest} (researcher-assigned; not independently validated or CVSS-scored).\n- **Report reference:** BP-${assessment.id.replace(/-/g, '').slice(0, 10).toUpperCase()} · generated ${new Date().toISOString()}\n\n${findings.length ? `Potential findings are listed in Section 5 and require reproduction, impact validation, duplicate review, and program eligibility checks.` : 'No issue is represented as confirmed in this draft. An empty finding list is not evidence that the application is secure; untested areas are explicitly listed below.'}\n\n## 2. Scope and authorization\n- **In-scope URL provided:** ${assessment.targetUrl}\n- **Exact host accepted in local policy record:** ${assessment.hostname}\n- **Program / authorization:** ${assessment.programName}\n- **Policy source:** ${assessment.policyUrl}\n- **Policy reviewed:** ${assessment.policyReviewedAt || 'Not recorded'}\n- **Authorization attested by researcher at:** ${assessment.authorizationAttestedAt}\n- **Scope snapshot:** ${assessment.policySnapshot}\n- **Objective / system context:** ${assessment.context || 'Not provided.'}\n- **Excluded URL query values:** ${assessment.queryValuesOmitted ? 'Yes; query string was omitted from this record.' : 'No query string was provided.'}\n\nThe researcher must independently verify that the exact path, role, test method, and assessment window are allowed. Hostname matching alone does not override path exclusions or program rules.\n\n## 3. Methodology and limitations\nThis report structure is informed by the OWASP Web Security Testing Guide, OWASP Application Security Verification Standard, OWASP API Security project, and NIST SP 800-115. These are references for analyst-led verification, not a claim of complete standards conformance.\n\n**BountyPilot execution disclosure:** ${executionDisclosure}\n\n**Coverage:** ${reviewed.length} of ${assessment.checks.length} areas reviewed or dispositioned. The remaining ${assessment.checks.length - reviewed.length} areas are unassessed. No independent source-code, infrastructure, dependency, mobile-binary, or authenticated runtime review is implied unless explicitly documented by the researcher.\n\n## 4. Assessment results\n${checklist}\n\n${passiveReport}## 5. Potential findings requiring validation\n${findings.length ? findings.map((c, i) => `### Potential finding ${i + 1}: ${c.area}\n- **Working severity:** ${c.severity}\n- **Analyst notes / evidence:** ${c.notes || '_No evidence notes recorded; do not submit until completed._'}\n- **Reproduction / validation:** ${c.reproduction || '_Not recorded._'}\n- **Impact assessment:** ${c.impact || '_Not recorded; do not infer impact from the checklist state._'}\n- **Remediation guidance:** ${c.remediation || '_Not recorded._'}\n- **Validation required:** Reproduce minimally on the authorized scope; describe preconditions and attacker capability; demonstrate concrete impact using only controlled data; check duplicates and program eligibility.\n- **CWE / CVSS:** Not assigned. Map only after the behavior and impact are verified.`).join('\n\n') : '_No checklist area is currently marked as a potential finding._'}\n\n## 6. Risk interpretation and executive actions\n1. Validate any potential findings and working severity with reproducible evidence before making risk claims.\n2. Prioritize confirmed issues by demonstrated impact, affected assets, exploit preconditions, and business context—not by checklist count.\n3. Record remediation owners and target dates outside this private draft only after the system owner confirms them.\n4. Reassess any areas marked “Blocked / not permitted” only if written authorization and program rules change.\n\n## 7. Untested areas, assumptions, and evidence handling\n- **Assumptions:** ${assessment.context || 'No system context supplied; business impact and threat model are unknown.'}\n- **Authentication:** ${assessment.authContext}\n- **Assessment constraints:** ${assessment.window || 'Not recorded.'}\n- **Untested / blocked areas:** ${assessment.checks.filter((c) => ['Not assessed', 'Blocked / not permitted'].includes(c.status)).map((c) => `${c.area} (${c.status})`).join('; ') || 'None recorded.'}\n- **Evidence:** Add redacted references only. Do not include credentials, tokens, session cookies, or third-party personal data.\n\n## 8. References\n- OWASP Web Security Testing Guide: https://owasp.org/www-project-web-security-testing-guide/\n- OWASP Application Security Verification Standard: https://github.com/OWASP/ASVS\n- OWASP API Security Project: https://github.com/OWASP/API-Security\n- NIST SP 800-115: https://csrc.nist.gov/pubs/sp/800/115/final\n\n---\n**Prepared locally:** ${new Date().toISOString()} · **Status:** Researcher review required · **External submission:** Not performed\n`;
  }

  function openAssessmentReport(id) {
    const assessment = state.assessments.find((a) => a.id === id);
    if (!assessment) return;
    $('#assessment-report-title').textContent = `Audit draft · ${assessment.hostname}`;
    $('#assessment-report-output').value = assessmentReportMarkdown(assessment);
    $('#assessment-report-dialog').dataset.assessmentId = id;
    $('#assessment-report-dialog').showModal();
  }

  function markdownToReportHtml(markdown) {
    const inline = (text) => safe(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|\s)_([^_]+)_(?=\s|$)/g, '$1<em>$2</em>');
    const output = [];
    let listType = '';
    const closeList = () => { if (listType) { output.push(`</${listType}>`); listType = ''; } };
    for (const raw of markdown.split(/\r?\n/)) {
      const line = raw.trimEnd();
      if (!line.trim()) { closeList(); continue; }
      if (/^---+$/.test(line.trim())) { closeList(); output.push('<hr>'); continue; }
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) { closeList(); const level = heading[1].length; output.push(`<h${level}>${inline(heading[2])}</h${level}>`); continue; }
      const quote = line.match(/^>\s?(.*)$/);
      if (quote) { closeList(); output.push(`<blockquote>${inline(quote[1])}</blockquote>`); continue; }
      const item = line.match(/^\s*-\s+(.+)$/);
      const orderedItem = line.match(/^\s*\d+\.\s+(.+)$/);
      const listItem = item || orderedItem;
      if (listItem) {
        const nextType = orderedItem ? 'ol' : 'ul';
        if (listType && listType !== nextType) closeList();
        if (!listType) { output.push(`<${nextType}>`); listType = nextType; }
        output.push(`<li>${inline(listItem[1])}</li>`); continue;
      }
      closeList();
      output.push(`<p>${inline(line)}</p>`);
    }
    closeList();
    return output.join('\n');
  }

  function exportAssessmentPdf() {
    const dialog = $('#assessment-report-dialog');
    const assessment = state.assessments.find((item) => item.id === dialog.dataset.assessmentId);
    if (!assessment) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) { showToast('Allow pop-ups for this local app to export the PDF.'); return; }
    const reportId = `BP-${assessment.id.replace(/-/g, '').slice(0, 10).toUpperCase()}`;
    const reportHtml = markdownToReportHtml(assessmentReportMarkdown(assessment));
    const doc = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safe(`Security Assessment ${assessment.hostname}`)}</title><style>
      @page{size:A4;margin:19mm 18mm 20mm;@top-left{content:"BOUNTYPILOT  /  SECURITY ASSESSMENT";font:700 8pt Arial,sans-serif;color:#53677d;letter-spacing:1.2px}@top-right{content:"${reportId}";font:8pt Arial,sans-serif;color:#718096}@bottom-left{content:"CONFIDENTIAL · PRIVATE RESEARCH DRAFT";font:7pt Arial,sans-serif;color:#7c8795;letter-spacing:.7px}@bottom-right{content:counter(page);font:8pt Arial,sans-serif;color:#718096}}
      *{box-sizing:border-box}body{font:10pt/1.58 Arial,Helvetica,sans-serif;color:#26364a;margin:0}header{border-bottom:3px solid #147b78;padding:0 0 18px;margin-bottom:22px}.brand{font-size:8pt;letter-spacing:1.7px;font-weight:700;color:#147b78}.classification{display:inline-block;margin-top:14px;padding:5px 8px;border:1px solid #ead9ab;background:#fff9e9;color:#886a22;font-size:7pt;letter-spacing:1px;font-weight:700}.report-title{font-size:26pt;line-height:1.12;letter-spacing:-.7px;color:#172a40;margin:12px 0 8px}.subtitle{font-size:11pt;color:#607186;margin:0}.meta{display:flex;gap:28px;margin-top:18px;padding-top:12px;border-top:1px solid #dce4eb;color:#68798c;font-size:8pt}.meta b{display:block;color:#2c4055;font-size:7pt;letter-spacing:.6px;margin-bottom:3px}.report-body h1{font-size:18pt;line-height:1.2;color:#172a40;letter-spacing:-.3px;margin:24px 0 10px}.report-body h2{font-size:13pt;color:#174f63;border-bottom:1px solid #dce6e9;padding-bottom:6px;margin:25px 0 10px;break-after:avoid}.report-body h2:not(:first-of-type){break-before:page}.report-body h3{font-size:10.5pt;color:#284d65;margin:17px 0 6px;break-after:avoid}.report-body p{margin:5px 0 8px;overflow-wrap:anywhere}.report-body ul{margin:5px 0 11px;padding-left:19px}.report-body li{padding-left:2px;margin:3px 0;overflow-wrap:anywhere}.report-body strong{color:#233e55}.report-body blockquote{margin:12px 0;padding:10px 13px;border-left:3px solid #d2a94f;background:#fff9e9;color:#6c5c35;font-size:8.5pt}.report-body code{font:8.5pt Consolas,monospace;background:#f0f3f6;padding:1px 3px;overflow-wrap:anywhere}.report-body hr{border:0;border-top:1px solid #dce4eb;margin:20px 0}.signature{margin-top:25px;padding-top:12px;border-top:1px solid #dce4eb;font-size:8pt;color:#718096}.signature strong{color:#42566b}@media screen{body{max-width:850px;margin:32px auto;padding:0 36px}header{margin-top:24px}}@media print{a{color:inherit;text-decoration:none}}
      </style></head><body><header><div class="brand">BOUNTYPILOT&nbsp; / &nbsp;SECURITY REVIEW</div><span class="classification">CONFIDENTIAL · PRIVATE DRAFT</span><h1 class="report-title">Application Security Assessment</h1><p class="subtitle">${safe(assessment.hostname)} · ${safe(assessment.type)}</p><div class="meta"><div><b>REPORT ID</b>${reportId}</div><div><b>PROGRAM RECORD</b>${safe(assessment.programName)}</div><div><b>GENERATED</b>${safe(new Date().toLocaleDateString(undefined, {year:'numeric',month:'long',day:'numeric'}))}</div><div><b>STATUS</b>Analyst review required</div></div></header><main class="report-body">${reportHtml}</main><div class="signature"><strong>Prepared locally in BountyPilot.</strong> Independent researcher draft; no Microsoft affiliation or endorsement is implied. Validate findings, scope, severity, and redactions before any external submission.</div><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));window.addEventListener('afterprint',()=>window.close());</script></body></html>`;
    printWindow.document.open();
    printWindow.document.write(doc);
    printWindow.document.close();
  }

  async function runPassiveHead(id) {
    const assessment = state.assessments.find((item) => item.id === id);
    const program = assessment && state.programs.find((item) => item.id === assessment.programId);
    if (!assessment || !program || programStatus(program) !== 'ready' || !program.assets.includes(assessment.hostname)) {
      showToast('Authorization record is no longer ready for this exact host. Re-review scope first.'); return;
    }
    const consent = confirm(`Send exactly one HEAD request to:\n\n${assessment.targetUrl}\n\nNo body, credentials, cookies, or redirects. The local helper will reject private/reserved IPs. Confirm this exact method and path are allowed by the current policy.`);
    if (!consent) return;
    try {
      const response = await fetch('/api/passive-head', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: assessment.targetUrl, exactHost: assessment.hostname, authorized: Boolean(assessment.authorizationAttestedAt) })
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || `Local helper returned HTTP ${response.status}`);
      assessment.passiveCheck = payload.result;
      assessment.updatedAt = new Date().toISOString();
      logActivity('Passive HEAD metadata recorded', assessment.hostname);
      persist(); render();
      showToast('One passive response recorded. Review findings in context; headers alone are not vulnerabilities.');
    } catch (error) {
      showToast(error instanceof TypeError ? 'Local helper unavailable. Open BountyPilot with python3 server.py first.' : String(error.message || 'Passive check failed.'));
    }
  }

  function openProgramDialog(program = null) {
    const dialog = $('#program-dialog');
    const form = $('#program-form');
    form.reset();
    form.dataset.editId = program?.id || '';
    $('#program-dialog-title').textContent = program ? 'Update policy snapshot' : 'Add a program';
    const fields = ['name', 'platform', 'policyUrl', 'reviewedAt', 'assets', 'exclusions', 'allowedMethods', 'prohibitedMethods', 'rewardNotes', 'researchNote'];
    for (const field of fields) {
      const el = form.elements.namedItem(field);
      if (!el) continue;
      if (field === 'assets' || field === 'exclusions') el.value = (program?.[field] || []).join('\n');
      else el.value = program?.[field] || (field === 'reviewedAt' ? today() : '');
    }
    // Every saved policy edit requires an explicit fresh scope acceptance.
    form.elements.acceptPolicy.checked = false;
    if (!dialog.open) dialog.showModal();
  }

  function updateFindingAssetHint() {
    const form = $('#finding-form');
    const program = state.programs.find((p) => p.id === form.elements.programId.value);
    const input = form.elements.asset;
    input.placeholder = program?.assets?.length ? `Exact host: ${program.assets.join(', ')}` : 'No accepted scope available';
    input.setAttribute('list', 'finding-asset-list');
    let list = $('#finding-asset-list');
    if (!list) {
      list = document.createElement('datalist');
      list.id = 'finding-asset-list';
      input.after(list);
    }
    list.innerHTML = (program?.assets || []).map((asset) => `<option value="${safe(asset)}"></option>`).join('');
  }

  function openFindingDialog() {
    const ready = state.programs.filter((p) => programStatus(p) === 'ready');
    if (!ready.length) {
      showToast('Add a program and explicitly accept its current exact scope first.');
      navigate('programs');
      return;
    }
    const form = $('#finding-form');
    form.reset();
    $('#finding-program').innerHTML = ready.map((p) => `<option value="${safe(p.id)}">${safe(p.name)}</option>`).join('');
    updateFindingAssetHint();
    $('#finding-dialog').showModal();
  }

  function programFormSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const parsedAssets = hostList(String(data.get('assets') || ''));
    const canonicalPolicyUrl = normalizePolicyUrl(String(data.get('policyUrl') || '').trim());
    if (!canonicalPolicyUrl) {
      showToast('Policy URL must use http:// or https://.');
      return;
    }
    if (parsedAssets.rejected.length) {
      showToast(`Not accepted as exact host(s): ${parsedAssets.rejected.slice(0, 2).join(', ')}`);
      return;
    }
    const id = form.dataset.editId || crypto.randomUUID();
    const prior = state.programs.find((p) => p.id === id);
    const accepted = data.get('acceptPolicy') === 'on' && parsedAssets.accepted.length > 0;
    const program = {
      id,
      name: String(data.get('name') || '').trim(),
      platform: String(data.get('platform') || 'Direct program'),
      policyUrl: canonicalPolicyUrl,
      reviewedAt: String(data.get('reviewedAt') || ''),
      assets: parsedAssets.accepted,
      exclusions: String(data.get('exclusions') || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
      allowedMethods: String(data.get('allowedMethods') || '').trim(),
      prohibitedMethods: String(data.get('prohibitedMethods') || '').trim(),
      rewardNotes: String(data.get('rewardNotes') || '').trim(),
      researchNote: String(data.get('researchNote') || '').trim(),
      acceptedAt: accepted ? new Date().toISOString() : '',
      policySnapshot: JSON.stringify({ policyUrl: String(data.get('policyUrl') || '').trim(), reviewedAt: String(data.get('reviewedAt') || ''), assets: parsedAssets.accepted, exclusions: String(data.get('exclusions') || '').trim(), allowedMethods: String(data.get('allowedMethods') || '').trim(), prohibitedMethods: String(data.get('prohibitedMethods') || '').trim() }),
      createdAt: prior?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: prior?.status === 'paused' ? 'paused' : 'review'
    };
    if (prior) state.programs = state.programs.map((p) => p.id === id ? program : p);
    else state.programs.unshift(program);
    logActivity(accepted ? 'Program scope accepted' : prior ? 'Policy snapshot updated' : 'Program added', program.name);
    persist(); render(); $('#program-dialog').close();
    showToast(accepted ? 'Scope accepted. Re-check it before every research session.' : 'Saved for policy review. Research is not enabled yet.');
  }

  function findingFormSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const program = state.programs.find((p) => p.id === data.get('programId'));
    const host = normalizeAsset(String(data.get('asset') || ''));
    if (!program || programStatus(program) !== 'ready') {
      showToast('This program is not ready. Re-accept its current scope first.');
      return;
    }
    if (!host || !program.assets.includes(host)) {
      showToast('The asset must exactly match a hostname accepted for this program.');
      return;
    }
    const finding = {
      id: crypto.randomUUID(),
      programId: program.id,
      asset: host,
      severity: String(data.get('severity') || 'Unassessed'),
      title: String(data.get('title') || '').trim(),
      hypothesis: String(data.get('hypothesis') || '').trim(),
      observed: String(data.get('observed') || '').trim(),
      impact: String(data.get('impact') || '').trim(),
      steps: String(data.get('steps') || '').trim(),
      evidence: String(data.get('evidence') || '').trim(),
      status: 'Draft',
      reward: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.findings.unshift(finding);
    logActivity('Finding note saved', `${program.name} · ${host}`);
    persist(); render(); $('#finding-dialog').close();
    showToast('Private finding note saved locally.');
  }

  function reportMarkdown(finding) {
    const program = state.programs.find((p) => p.id === finding.programId);
    const blank = '_Not provided — researcher review required._';
    return `# ${finding.title}\n\n> **Private draft — not submitted.** Verify current program rules and redact evidence before sharing. Severity and impact are researcher assessments, not program decisions.\n\n## Program and scope\n- **Program:** ${program?.name || 'Program removed'}\n- **Policy:** ${program?.policyUrl || 'Not recorded'}\n- **Policy reviewed:** ${program?.reviewedAt || 'Not recorded'}\n- **In-scope asset recorded:** \`${finding.asset}\`\n- **Working severity:** ${finding.severity}\n\n## Summary\n${finding.title}\n\n## Observed behavior\n${finding.observed || blank}\n\n## Potential impact (assessment)\n${finding.impact || blank}\n\n## Steps to reproduce\n${finding.steps || blank}\n\n## Evidence references\n${finding.evidence || blank}\n\n## Suggested remediation\n_Researcher to provide a specific, technically grounded recommendation._\n\n## Researcher checks before submission\n- [ ] Reproduce safely on the exact in-scope asset and re-check the current policy.\n- [ ] Confirm the program permits this testing method and report type.\n- [ ] Remove secrets, credentials, tokens, and third-party personal data from evidence.\n- [ ] Check for duplicates and confirm all impact claims are supported by observed evidence.\n- [ ] Review severity, disclosure terms, and the program's reporting channel.\n`;
  }

  function openDraft(id) {
    const finding = state.findings.find((f) => f.id === id);
    if (!finding) return;
    activeDraftId = id;
    $('#draft-title').textContent = finding.title;
    $('#draft-output').value = reportMarkdown(finding);
    $('#draft-dialog').showModal();
  }

  function openOutcomeDialog(id) {
    const finding = state.findings.find((f) => f.id === id);
    if (!finding) return;
    const form = $('#outcome-form');
    form.elements.findingId.value = finding.id;
    form.elements.status.value = finding.status || 'Draft';
    form.elements.reward.value = finding.reward || 0;
    $('#outcome-dialog').showModal();
  }

  function outcomeFormSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const finding = state.findings.find((f) => f.id === data.get('findingId'));
    if (!finding) return;
    finding.status = String(data.get('status') || 'Draft');
    finding.reward = Math.max(0, Number(data.get('reward')) || 0);
    finding.updatedAt = new Date().toISOString();
    logActivity(finding.reward > 0 ? 'Finding outcome and reward updated' : `Finding marked ${finding.status.toLowerCase()}`, finding.title);
    persist(); render(); $('#outcome-dialog').close(); showToast('Finding outcome saved locally.');
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function exportBackup() {
    const backup = { schema: 1, exportedAt: new Date().toISOString(), note: 'Contains private program notes and findings. Store securely.', ...state };
    download(`bountypilot-backup-${today()}.json`, JSON.stringify(backup, null, 2), 'application/json');
    logActivity('Local backup exported', 'JSON workspace file');
    persist(); render();
    showToast('Local workspace backup downloaded.');
  }

  function acceptProgram(id) {
    const program = state.programs.find((p) => p.id === id);
    if (!program || !program.assets?.length || !program.reviewedAt || !program.policyUrl) return;
    program.acceptedAt = new Date().toISOString();
    program.updatedAt = new Date().toISOString();
    program.status = 'ready';
    logActivity('Program scope accepted', program.name);
    persist(); render();
    showToast('Scope accepted. Confirm current rules before each session.');
  }

  function bindEvents() {
    document.addEventListener('click', (event) => {
      const viewButton = event.target.closest('[data-view]');
      if (viewButton) { navigate(viewButton.dataset.view); return; }
      const actionButton = event.target.closest('[data-action]');
      if (actionButton) {
        const { action, id } = actionButton.dataset;
        if (action === 'new-program') openProgramDialog();
        if (action === 'new-finding') openFindingDialog();
        if (action === 'assessment-report') openAssessmentReport(id);
        if (action === 'passive-head') runPassiveHead(id);
        if (action === 'delete-assessment') {
          if (!confirm('Delete this local assessment record and its analyst notes? Export a backup first if you need to keep it.')) return;
          state.assessments = state.assessments.filter((item) => item.id !== id);
          logActivity('Assessment record deleted'); persist(); render(); showToast('Assessment record deleted locally.');
        }
        if (action === 'edit-program') { const p = state.programs.find((item) => item.id === id); if (p) openProgramDialog(p); }
        if (action === 'accept-program') acceptProgram(id);
        if (action === 'pause-program' || action === 'resume-program') {
          const p = state.programs.find((item) => item.id === id); if (!p) return;
          p.status = action === 'pause-program' ? 'paused' : 'review';
          if (action === 'resume-program') p.acceptedAt = '';
          p.updatedAt = new Date().toISOString(); logActivity(action === 'pause-program' ? 'Research paused' : 'Program returned to review', p.name);
          persist(); render(); showToast(action === 'pause-program' ? 'Program paused.' : 'Re-review and accept the policy before research.');
        }
        if (action === 'delete-program') {
          if (!confirm('Remove this program and its scope snapshot? Existing findings will remain but be unlinked.')) return;
          state.programs = state.programs.filter((p) => p.id !== id);
          logActivity('Program removed', 'Scope record deleted'); persist(); render(); showToast('Program record removed.');
        }
        if (action === 'draft-finding') openDraft(id);
        if (action === 'outcome-finding') openOutcomeDialog(id);
        if (action === 'delete-finding') {
          if (!confirm('Delete this private finding note? This cannot be undone unless you have a backup.')) return;
          state.findings = state.findings.filter((f) => f.id !== id); logActivity('Finding note deleted'); persist(); render(); showToast('Finding note deleted.');
        }
      }
      const close = event.target.closest('[data-close]');
      if (close) $(`#${close.dataset.close}`).close();
    });

    $('#program-form').addEventListener('submit', programFormSubmit);
    $('#assessment-form').addEventListener('submit', assessmentFormSubmit);
    $('#assessment-program').addEventListener('change', updateAssessmentScopeReadout);
    $('#assessments-list').addEventListener('change', (event) => {
      const field = event.target.closest('[data-check-field]');
      if (!field) return;
      const assessment = state.assessments.find((item) => item.id === field.dataset.assessment);
      const check = assessment?.checks.find((item) => item.id === field.dataset.check);
      if (!check) return;
      check[field.dataset.checkField] = field.value;
      assessment.updatedAt = new Date().toISOString(); persist(); render();
    });
    $('#assessments-list').addEventListener('input', (event) => {
      const field = event.target.closest('textarea[data-check-field]');
      if (!field) return;
      const assessment = state.assessments.find((item) => item.id === field.dataset.assessment);
      const check = assessment?.checks.find((item) => item.id === field.dataset.check);
      if (!check) return;
      check[field.dataset.checkField] = field.value;
      assessment.updatedAt = new Date().toISOString(); persist();
    });
    $('#finding-form').addEventListener('submit', findingFormSubmit);
    $('#outcome-form').addEventListener('submit', outcomeFormSubmit);
    $('#finding-program').addEventListener('change', updateFindingAssetHint);
    $('#export-backup').addEventListener('click', exportBackup);
    $('#mobile-menu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
    $('#copy-draft').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText($('#draft-output').value); showToast('Markdown copied.'); }
      catch { $('#draft-output').select(); document.execCommand('copy'); showToast('Markdown copied.'); }
    });
    $('#download-draft').addEventListener('click', () => {
      const finding = state.findings.find((f) => f.id === activeDraftId);
      if (finding) download(`bountypilot-${finding.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'report-draft'}.md`, $('#draft-output').value, 'text/markdown');
    });
    $('#copy-assessment-report').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText($('#assessment-report-output').value); showToast('Audit draft copied.'); }
      catch { $('#assessment-report-output').select(); document.execCommand('copy'); showToast('Audit draft copied.'); }
    });
    $('#download-assessment-report').addEventListener('click', () => {
      const dialog = $('#assessment-report-dialog');
      const assessment = state.assessments.find((item) => item.id === dialog.dataset.assessmentId);
      if (assessment) download(`bountypilot-audit-${assessment.hostname}-${today()}.md`, $('#assessment-report-output').value, 'text/markdown');
    });
    $('#print-assessment-pdf').addEventListener('click', exportAssessmentPdf);
    window.addEventListener('hashchange', () => navigate(location.hash.slice(1) || 'overview'));
    for (const dialog of $$('dialog')) dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  }

  bindEvents();
  navigate(location.hash.slice(1) || 'overview');
  render();
})();

// Traceability metadata for checklist items
// Key format: `${frameworkName}-${flatItemIndex}`
// Each entry: { risk, framework }

export const TRACEABILITY = {
  // ── HIPAA ──────────────────────────────────────────────────────────────────
  // Administrative Safeguards (0-6)
  'HIPAA-0':  { risk: 'Unmanaged security risk',          framework: 'HIPAA §164.308(a)(1)' },
  'HIPAA-1':  { risk: 'Unmitigated vulnerabilities',      framework: 'HIPAA §164.308(a)(1)(ii)(B)' },
  'HIPAA-2':  { risk: 'No accountability for security',   framework: 'HIPAA §164.308(a)(2)' },
  'HIPAA-3':  { risk: 'Insider misuse',                   framework: 'HIPAA §164.308(a)(3)' },
  'HIPAA-4':  { risk: 'Staff awareness gaps',             framework: 'HIPAA §164.308(a)(5)' },
  'HIPAA-5':  { risk: 'Undetected breaches',              framework: 'HIPAA §164.308(a)(6)' },
  'HIPAA-6':  { risk: 'Privilege escalation',             framework: 'HIPAA §164.308(a)(4)' },
  // Physical Safeguards (7-9)
  'HIPAA-7':  { risk: 'Unauthorized physical access',     framework: 'HIPAA §164.310(a)' },
  'HIPAA-8':  { risk: 'Device theft / data exposure',     framework: 'HIPAA §164.310(b)' },
  'HIPAA-9':  { risk: 'Data on disposed media',           framework: 'HIPAA §164.310(d)' },
  // Technical Safeguards (10-16)
  'HIPAA-10': { risk: 'Unauthorized ePHI access',         framework: 'HIPAA §164.312(a)(2)(i)' },
  'HIPAA-11': { risk: 'Credential compromise',            framework: 'HIPAA §164.312(d) · NIST AC-17' },
  'HIPAA-12': { risk: 'Audit trail gaps',                 framework: 'HIPAA §164.312(b) · NIST AU-2' },
  'HIPAA-13': { risk: 'Data-at-rest exposure',            framework: 'HIPAA §164.312(a)(2)(iv) · NIST SC-28' },
  'HIPAA-14': { risk: 'Data-in-transit interception',     framework: 'HIPAA §164.312(e)(2)(ii) · NIST SC-8' },
  'HIPAA-15': { risk: 'Session hijacking',                framework: 'HIPAA §164.312(a)(2)(iii)' },
  'HIPAA-16': { risk: 'Unauthorized data modification',   framework: 'HIPAA §164.312(c) · NIST SI-7' },
  // Business Associates (17-19)
  'HIPAA-17': { risk: 'Vendor HIPAA liability',           framework: 'HIPAA §164.308(b)(1)' },
  'HIPAA-18': { risk: 'Third-party risk exposure',        framework: 'HIPAA §164.308(b)(2)' },
  'HIPAA-19': { risk: 'Ongoing vendor non-compliance',    framework: 'HIPAA §164.308(b)(4)' },

  // ── HITECH ─────────────────────────────────────────────────────────────────
  // Breach Notification (0-3)
  'HITECH-0': { risk: 'Delayed breach detection',         framework: 'HITECH §13402' },
  'HITECH-1': { risk: 'Uncoordinated breach response',    framework: 'HITECH §13402' },
  'HITECH-2': { risk: 'Non-compliant notification',       framework: 'HITECH §13402' },
  'HITECH-3': { risk: 'Late patient/HHS notification',    framework: 'HITECH §13402(d)' },
  // EHR (4-6)
  'HITECH-4': { risk: 'Undetected unauthorized access',   framework: 'HITECH §13405' },
  'HITECH-5': { risk: 'Patient rights violation',         framework: 'HITECH §13405(e)' },
  'HITECH-6': { risk: 'Missing audit evidence',           framework: 'HITECH §13405' },
  // Enforcement (7-9)
  'HITECH-7': { risk: 'Undetected compliance drift',      framework: 'HITECH §13410' },
  'HITECH-8': { risk: 'Penalty exposure',                 framework: 'HITECH §13410(d)' },
  'HITECH-9': { risk: 'Repeated violations',              framework: 'HITECH §13410' },

  // ── GDPR ───────────────────────────────────────────────────────────────────
  // Data Protection & Governance (0-4)
  'GDPR-0':   { risk: 'No DPO oversight',                 framework: 'GDPR Art. 37' },
  'GDPR-1':   { risk: 'Undocumented processing',          framework: 'GDPR Art. 30' },
  'GDPR-2':   { risk: 'Unlawful data processing',         framework: 'GDPR Art. 5 · Art. 6' },
  'GDPR-3':   { risk: 'High-risk processing unassessed',  framework: 'GDPR Art. 35' },
  'GDPR-4':   { risk: 'Privacy not by design',            framework: 'GDPR Art. 25' },
  // Security & Integrity (5-9)
  'GDPR-5':   { risk: 'Inadequate security measures',     framework: 'GDPR Art. 32' },
  'GDPR-6':   { risk: 'Data-at-rest/transit exposure',    framework: 'GDPR Art. 32 · NIST SC-28' },
  'GDPR-7':   { risk: 'Unauthorized personal data access',framework: 'GDPR Art. 32 · NIST AC-3' },
  'GDPR-8':   { risk: 'Re-identification of subjects',    framework: 'GDPR Art. 32(1)(a)' },
  'GDPR-9':   { risk: 'Undetected breach / late report',  framework: 'GDPR Art. 33' },
  // Accuracy & Accountability (10-14)
  'GDPR-10':  { risk: 'Inaccurate health data used',      framework: 'GDPR Art. 5(1)(d)' },
  'GDPR-11':  { risk: 'Excessive data collection',        framework: 'GDPR Art. 5(1)(c)' },
  'GDPR-12':  { risk: 'Data retained beyond purpose',     framework: 'GDPR Art. 5(1)(e)' },
  'GDPR-13':  { risk: 'Non-auditable AI decisions',       framework: 'GDPR Art. 5(2) · ISO/IEC 42001' },
  'GDPR-14':  { risk: 'Staff non-compliance',             framework: 'GDPR Art. 5 · Art. 29' },
  // User Rights (15-19)
  'GDPR-15':  { risk: 'Access request non-compliance',    framework: 'GDPR Art. 15' },
  'GDPR-16':  { risk: 'Inaccurate data uncorrected',      framework: 'GDPR Art. 16' },
  'GDPR-17':  { risk: 'Unlawful retention',               framework: 'GDPR Art. 17' },
  'GDPR-18':  { risk: 'Data lock-in / portability gap',   framework: 'GDPR Art. 20' },
  'GDPR-19':  { risk: 'Automated profiling harm',         framework: 'GDPR Art. 22' },
  // Monitoring & Review (20-24)
  'GDPR-20':  { risk: 'Compliance drift',                 framework: 'GDPR Art. 5(2)' },
  'GDPR-21':  { risk: 'Vendor GDPR non-compliance',       framework: 'GDPR Art. 28' },
  'GDPR-22':  { risk: 'Unlawful cross-border transfer',   framework: 'GDPR Art. 44-49' },
  'GDPR-23':  { risk: 'No DPA contact on file',           framework: 'GDPR Art. 77' },
  'GDPR-24':  { risk: 'Late breach notification',         framework: 'GDPR Art. 33' },

  // ── NIST CSF 2.0 ───────────────────────────────────────────────────────────
  // GOVERN (0-3)
  'NIST CSF 2.0-0':  { risk: 'No cyber governance structure',   framework: 'NIST CSF GV.OC' },
  'NIST CSF 2.0-1':  { risk: 'Unclear security ownership',      framework: 'NIST CSF GV.RR' },
  'NIST CSF 2.0-2':  { risk: 'Uncontrolled risk appetite',      framework: 'NIST CSF GV.RM' },
  'NIST CSF 2.0-3':  { risk: 'Unmanaged third-party risk',      framework: 'NIST CSF GV.SC' },
  // IDENTIFY (4-7)
  'NIST CSF 2.0-4':  { risk: 'Unknown attack surface',          framework: 'NIST CSF ID.AM · NIST RA-2' },
  'NIST CSF 2.0-5':  { risk: 'Unprotected sensitive data',      framework: 'NIST CSF ID.AM-5' },
  'NIST CSF 2.0-6':  { risk: 'Critical service disruption',     framework: 'NIST CSF ID.BE' },
  'NIST CSF 2.0-7':  { risk: 'Undetected vulnerabilities',      framework: 'NIST CSF ID.RA · NIST RA-3' },
  // PROTECT (8-11)
  'NIST CSF 2.0-8':  { risk: 'Unauthorized system access',      framework: 'NIST CSF PR.AA · NIST AC-2' },
  'NIST CSF 2.0-9':  { risk: 'Credential compromise',           framework: 'NIST CSF PR.AA · NIST IA-2' },
  'NIST CSF 2.0-10': { risk: 'Data exposure in transit/rest',   framework: 'NIST CSF PR.DS · NIST SC-8' },
  'NIST CSF 2.0-11': { risk: 'Human error / phishing',          framework: 'NIST CSF PR.AT' },
  // DETECT (12-14)
  'NIST CSF 2.0-12': { risk: 'Undetected anomalies',            framework: 'NIST CSF DE.CM · NIST CA-7' },
  'NIST CSF 2.0-13': { risk: 'Fragmented security logs',        framework: 'NIST CSF DE.CM · NIST AU-6' },
  'NIST CSF 2.0-14': { risk: 'Missed threat indicators',        framework: 'NIST CSF DE.AE' },
  // RESPOND (15-17)
  'NIST CSF 2.0-15': { risk: 'Uncoordinated incident response', framework: 'NIST CSF RS.MA' },
  'NIST CSF 2.0-16': { risk: 'Poor incident communication',     framework: 'NIST CSF RS.CO' },
  'NIST CSF 2.0-17': { risk: 'Untested IR procedures',          framework: 'NIST CSF RS.MA' },
  // RECOVER (18-20)
  'NIST CSF 2.0-18': { risk: 'Data loss from failed backup',    framework: 'NIST CSF RC.RP · NIST CP-9' },
  'NIST CSF 2.0-19': { risk: 'Extended downtime after incident',framework: 'NIST CSF RC.RP' },
  'NIST CSF 2.0-20': { risk: 'Missed RTO/RPO targets',          framework: 'NIST CSF RC.RP · NIST CP-2' },

  // ── ISO/IEC 27005:2022 ─────────────────────────────────────────────────────
  // Risk Context (0-2)
  'ISO/IEC 27005:2022-0': { risk: 'Out-of-scope risk analysis',   framework: 'ISO 27005 §6.2' },
  'ISO/IEC 27005:2022-1': { risk: 'Unengaged stakeholders',       framework: 'ISO 27005 §6.3' },
  'ISO/IEC 27005:2022-2': { risk: 'Inconsistent risk decisions',  framework: 'ISO 27005 §6.4' },
  // Risk Identification (3-6)
  'ISO/IEC 27005:2022-3': { risk: 'Unknown assets at risk',       framework: 'ISO 27005 §7.2' },
  'ISO/IEC 27005:2022-4': { risk: 'Unrecognized threat actors',   framework: 'ISO 27005 §7.2' },
  'ISO/IEC 27005:2022-5': { risk: 'Unexploited but known vulns',  framework: 'ISO 27005 §7.2' },
  'ISO/IEC 27005:2022-6': { risk: 'Duplicate or conflicting controls', framework: 'ISO 27005 §7.2' },
  // Risk Analysis (7-9)
  'ISO/IEC 27005:2022-7': { risk: 'Inaccurate likelihood scoring',framework: 'ISO 27005 §7.3' },
  'ISO/IEC 27005:2022-8': { risk: 'Underestimated impact',        framework: 'ISO 27005 §7.3' },
  'ISO/IEC 27005:2022-9': { risk: 'Mispriotized risks',          framework: 'ISO 27005 §7.3' },
  // Risk Evaluation (10-11)
  'ISO/IEC 27005:2022-10': { risk: 'High risks left unaddressed', framework: 'ISO 27005 §7.4' },
  'ISO/IEC 27005:2022-11': { risk: 'Accepted risk beyond tolerance', framework: 'ISO 27005 §7.4' },
  // Risk Treatment (12-14)
  'ISO/IEC 27005:2022-12': { risk: 'Unplanned risk mitigation',   framework: 'ISO 27005 §8' },
  'ISO/IEC 27005:2022-13': { risk: 'No accountable risk owner',   framework: 'ISO 27005 §8' },
  'ISO/IEC 27005:2022-14': { risk: 'Residual risk unchecked',     framework: 'ISO 27005 §8' },
  // Monitoring (15-17)
  'ISO/IEC 27005:2022-15': { risk: 'Stale risk register',         framework: 'ISO 27005 §9' },
  'ISO/IEC 27005:2022-16': { risk: 'No risk performance data',    framework: 'ISO 27005 §9' },
  'ISO/IEC 27005:2022-17': { risk: 'Recurring unresolved risks',  framework: 'ISO 27005 §9' },

  // ── ISO/IEC 27001 ──────────────────────────────────────────────────────────
  // ISMS (0-4)
  'ISO/IEC 27001-0': { risk: 'Undefined security boundaries',    framework: 'ISO 27001 §4.3' },
  'ISO/IEC 27001-1': { risk: 'No approved security policy',      framework: 'ISO 27001 §5.2' },
  'ISO/IEC 27001-2': { risk: 'Lack of leadership buy-in',        framework: 'ISO 27001 §5.1' },
  'ISO/IEC 27001-3': { risk: 'Undetected control failures',      framework: 'ISO 27001 §9.2' },
  'ISO/IEC 27001-4': { risk: 'ISMS not kept current',            framework: 'ISO 27001 §9.3' },
  // Annex A (5-9)
  'ISO/IEC 27001-5': { risk: 'Unauthorized access',              framework: 'ISO 27001 A.5.15 · NIST AC' },
  'ISO/IEC 27001-6': { risk: 'Weak or absent encryption',        framework: 'ISO 27001 A.8.24 · NIST SC-28' },
  'ISO/IEC 27001-7': { risk: 'Supplier security breach',         framework: 'ISO 27001 A.5.19' },
  'ISO/IEC 27001-8': { risk: 'Insecure software development',    framework: 'ISO 27001 A.8.25' },
  'ISO/IEC 27001-9': { risk: 'Undetected security events',       framework: 'ISO 27001 A.8.15 · NIST AU-6' },

  // ── NIST RMF ───────────────────────────────────────────────────────────────
  // Categorize (0-4)
  'NIST RMF-0':  { risk: 'Incomplete asset inventory',           framework: 'NIST RMF Categorize · NIST RA-2' },
  'NIST RMF-1':  { risk: 'Miscategorized system impact',         framework: 'NIST RMF Categorize · FIPS 199' },
  'NIST RMF-2':  { risk: 'Undocumented system functions',        framework: 'NIST RMF Categorize · NIST SP 800-60' },
  'NIST RMF-3':  { risk: 'Unclassified ePHI in AI pipeline',     framework: 'NIST RMF Categorize · HIPAA §164.514' },
  'NIST RMF-4':  { risk: 'System not in risk inventory',         framework: 'NIST RMF Categorize · NIST RA-2' },
  // Select (5-9)
  'NIST RMF-5':  { risk: 'Under-controlled high-impact system',  framework: 'NIST RMF Select · NIST SP 800-53' },
  'NIST RMF-6':  { risk: 'Misaligned security controls',         framework: 'NIST RMF Select · NIST SP 800-53B' },
  'NIST RMF-7':  { risk: 'Regulatory compliance gaps',           framework: 'NIST RMF Select · HIPAA · GDPR' },
  'NIST RMF-8':  { risk: 'Undocumented control rationale',       framework: 'NIST RMF Select · CA-5' },
  'NIST RMF-9':  { risk: 'Redundant or missing inherited controls', framework: 'NIST RMF Select · PM-9' },
  // Implement (10-14)
  'NIST RMF-10': { risk: 'Unencrypted data / no access logging', framework: 'NIST RMF Implement · NIST SC · AU' },
  'NIST RMF-11': { risk: 'Unenforced policies',                  framework: 'NIST RMF Implement · NIST PL-4' },
  'NIST RMF-12': { risk: 'Controls not in CI/CD pipeline',       framework: 'NIST RMF Implement · SA-15' },
  'NIST RMF-13': { risk: 'Undocumented control implementation',  framework: 'NIST RMF Implement · CA-7' },
  'NIST RMF-14': { risk: 'AI outputs unchecked by humans',       framework: 'NIST RMF Implement · SI-10 · ISO 42001' },
  // Assess (15-19)
  'NIST RMF-15': { risk: 'Controls not validated',               framework: 'NIST RMF Assess · CA-2' },
  'NIST RMF-16': { risk: 'Unexploited vulnerabilities in prod',  framework: 'NIST RMF Assess · RA-5' },
  'NIST RMF-17': { risk: 'AI model behaving unexpectedly',       framework: 'NIST RMF Assess · SI-4 · ISO 42001' },
  'NIST RMF-18': { risk: 'Unresolved control deficiencies',      framework: 'NIST RMF Assess · CA-5' },
  'NIST RMF-19': { risk: 'No formal security assessment report', framework: 'NIST RMF Assess · CA-2' },
  // Authorize (20-24)
  'NIST RMF-20': { risk: 'Unacceptable residual risk in prod',   framework: 'NIST RMF Authorize · CA-6' },
  'NIST RMF-21': { risk: 'POA&M gaps unaddressed',               framework: 'NIST RMF Authorize · CA-5' },
  'NIST RMF-22': { risk: 'ATO documentation incomplete',         framework: 'NIST RMF Authorize · CA-6' },
  'NIST RMF-23': { risk: 'System operating without ATO',         framework: 'NIST RMF Authorize · CA-6' },
  'NIST RMF-24': { risk: 'Authorization rationale undocumented', framework: 'NIST RMF Authorize · CA-6' },
  // Monitor (25-30)
  'NIST RMF-25': { risk: 'Control degradation undetected',       framework: 'NIST RMF Monitor · CA-7' },
  'NIST RMF-26': { risk: 'Model drift / emerging threats missed', framework: 'NIST RMF Monitor · SI-4 · ISO 42001' },
  'NIST RMF-27': { risk: 'POA&M items overdue',                  framework: 'NIST RMF Monitor · CA-5' },
  'NIST RMF-28': { risk: 'AO not informed of security status',   framework: 'NIST RMF Monitor · CA-7' },
  'NIST RMF-29': { risk: 'Outdated SSP after system changes',    framework: 'NIST RMF Monitor · PL-2' },
  'NIST RMF-30': { risk: 'Controls not periodically validated',  framework: 'NIST RMF Monitor · CA-2' },

  // ── NIST AI RMF ────────────────────────────────────────────────────────────
  // GOVERN (0-2)
  'NIST AI RMF-0': { risk: 'No AI governance structure',         framework: 'NIST AI RMF GOVERN · ISO/IEC 42001' },
  'NIST AI RMF-1': { risk: 'No AI risk accountability',          framework: 'NIST AI RMF GOVERN' },
  'NIST AI RMF-2': { risk: 'Unapproved AI use policies',         framework: 'NIST AI RMF GOVERN' },
  // MAP (3-6)
  'NIST AI RMF-3': { risk: 'Undocumented AI use cases',          framework: 'NIST AI RMF MAP' },
  'NIST AI RMF-4': { risk: 'Stakeholder impacts not considered', framework: 'NIST AI RMF MAP' },
  'NIST AI RMF-5': { risk: 'AI misuse or scope creep',           framework: 'NIST AI RMF MAP' },
  'NIST AI RMF-6': { risk: 'Unassessed AI harms',                framework: 'NIST AI RMF MAP' },
  // MEASURE (7-11)
  'NIST AI RMF-7':  { risk: 'Algorithmic bias in AI outputs',    framework: 'NIST AI RMF MEASURE · ISO 42001' },
  'NIST AI RMF-8':  { risk: 'Model failure under adversarial input', framework: 'NIST AI RMF MEASURE' },
  'NIST AI RMF-9':  { risk: 'Personal data privacy breach',      framework: 'NIST AI RMF MEASURE · GDPR Art. 35' },
  'NIST AI RMF-10': { risk: 'Adversarial attack surface',        framework: 'NIST AI RMF MEASURE · NIST SI' },
  'NIST AI RMF-11': { risk: 'Unexplainable AI decisions',        framework: 'NIST AI RMF MEASURE · GDPR Art. 22' },
  // MANAGE (12-15)
  'NIST AI RMF-12': { risk: 'High risks not acted upon',         framework: 'NIST AI RMF MANAGE' },
  'NIST AI RMF-13': { risk: 'Mitigations not implemented',       framework: 'NIST AI RMF MANAGE' },
  'NIST AI RMF-14': { risk: 'No human override for AI errors',   framework: 'NIST AI RMF MANAGE · ISO 42001' },
  'NIST AI RMF-15': { risk: 'AI behavior unmonitored post-deploy', framework: 'NIST AI RMF MANAGE · NIST CA-7' },

  // ── ISO/IEC 42001 ──────────────────────────────────────────────────────────
  // Governance (0-2)
  'ISO/IEC 42001-0': { risk: 'No formal AI policy',              framework: 'ISO/IEC 42001 §5.2' },
  'ISO/IEC 42001-1': { risk: 'Unclear AI accountability',        framework: 'ISO/IEC 42001 §5.3' },
  'ISO/IEC 42001-2': { risk: 'Shadow AI / ungoverned systems',   framework: 'ISO/IEC 42001 §8.4' },
  // Risk Management (3-6)
  'ISO/IEC 42001-3': { risk: 'Unassessed AI-specific risks',     framework: 'ISO/IEC 42001 §6.1 · NIST AI RMF' },
  'ISO/IEC 42001-4': { risk: 'Biased AI outcomes',               framework: 'ISO/IEC 42001 §6.1.2 · NIST AI RMF' },
  'ISO/IEC 42001-5': { risk: 'AI safety failure',                framework: 'ISO/IEC 42001 §6.1' },
  'ISO/IEC 42001-6': { risk: 'Cybersecurity vulnerability in AI',framework: 'ISO/IEC 42001 §6.1 · NIST SI' },
  // Lifecycle (7-10)
  'ISO/IEC 42001-7':  { risk: 'Poor-quality training data',      framework: 'ISO/IEC 42001 §8.5 · GDPR Art. 5' },
  'ISO/IEC 42001-8':  { risk: 'Unvalidated model in production', framework: 'ISO/IEC 42001 §8.6' },
  'ISO/IEC 42001-9':  { risk: 'Uncontrolled model changes',      framework: 'ISO/IEC 42001 §8.7' },
  'ISO/IEC 42001-10': { risk: 'Model drift undetected',          framework: 'ISO/IEC 42001 §9.1 · NIST CA-7' },

  // ── FDA AI/ML SaMD ─────────────────────────────────────────────────────────
  // Clinical Safety (0-3)
  'FDA AI/ML SaMD-0': { risk: 'Off-label AI use',                framework: 'FDA AI/ML SaMD · 21 CFR §820' },
  'FDA AI/ML SaMD-1': { risk: 'Unidentified clinical harm',      framework: 'FDA AI/ML SaMD' },
  'FDA AI/ML SaMD-2': { risk: 'Unmitigated failure modes',       framework: 'FDA AI/ML SaMD · ISO 14971' },
  'FDA AI/ML SaMD-3': { risk: 'Usability / human factors risk',  framework: 'FDA AI/ML SaMD · IEC 62366' },
  // Validation (4-6)
  'FDA AI/ML SaMD-4': { risk: 'Analytically unvalidated outputs',framework: 'FDA AI/ML SaMD' },
  'FDA AI/ML SaMD-5': { risk: 'No clinical efficacy evidence',   framework: 'FDA AI/ML SaMD' },
  'FDA AI/ML SaMD-6': { risk: 'Undocumented performance',        framework: 'FDA AI/ML SaMD' },
  // Post-Market (7-9)
  'FDA AI/ML SaMD-7': { risk: 'Undetected real-world degradation', framework: 'FDA AI/ML SaMD PCCP' },
  'FDA AI/ML SaMD-8': { risk: 'Unreported adverse AI events',    framework: 'FDA AI/ML SaMD · MDR' },
  'FDA AI/ML SaMD-9': { risk: 'Uncontrolled model updates',      framework: 'FDA AI/ML SaMD PCCP' },

  // ── EU AI Act ──────────────────────────────────────────────────────────────
  // Risk Classification (0-1)
  'EU AI Act-0': { risk: 'Wrong risk tier → wrong controls',     framework: 'EU AI Act Art. 6' },
  'EU AI Act-1': { risk: 'High-risk AI not documented',          framework: 'EU AI Act Art. 9' },
  // Data Governance (2-3)
  'EU AI Act-2': { risk: 'Low-quality or biased training data',  framework: 'EU AI Act Art. 10' },
  'EU AI Act-3': { risk: 'Discriminatory AI outputs',            framework: 'EU AI Act Art. 10' },
  // Transparency (4-5)
  'EU AI Act-4': { risk: 'Users unaware of AI involvement',      framework: 'EU AI Act Art. 13' },
  'EU AI Act-5': { risk: 'No human override capability',         framework: 'EU AI Act Art. 14' },
  // Monitoring (6-7)
  'EU AI Act-6': { risk: 'Performance degradation undetected',   framework: 'EU AI Act Art. 9' },
  'EU AI Act-7': { risk: 'Unreported serious incidents',         framework: 'EU AI Act Art. 73' },
};
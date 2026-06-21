// Demo assessment data — fully aligned with structured scoring model
// Scoring: Risk Score = Likelihood (1–5) × Impact (1–5) × Sensitivity Modifier
// ePHI present → Sensitivity Modifier = 1.5
// Domain scores normalized to 0–100 scale
//
// Input conditions driving this demo:
//   - NLP system processing ePHI in clinical documentation (Sensitivity = 1.5)
//   - Third-party vendor (MedScribe AI) with BAA in place but outdated pen test
//   - Bias testing in progress — demographic gaps identified
//   - No formal AI governance policy (informal only)
//   - Clinical validation incomplete (in progress)
//   - APIs exposed externally, no formal third-party security review
//   - HIPAA compliance partial — audit logging gaps

// Score derivations (for reference):
//   Bias / Fairness:        Likelihood 4 × Impact 4 × 1.5 = 24 → normalized ≈ 64
//   Cybersecurity:          Likelihood 4 × Impact 4 × 1.5 = 24 → normalized ≈ 64
//     (MFA + RBAC present but pen test >12mo + no API review = elevated)
//   Regulatory Compliance:  Likelihood 4 × Impact 5 × 1.5 = 30 → normalized ≈ 72
//     (partial HIPAA, no formal governance, GDPR gaps, RMF incomplete)
//   Clinical Impact:        Likelihood 5 × Impact 5 × 1.5 = 37.5 → normalized ≈ 78
//     (NLP outputs enter EHR without validation; patient safety at risk)
//   Overall (weighted):     Clinical 30% + Cybersecurity 25% + Compliance 25% + Bias 20%
//     = (78×0.30) + (64×0.25) + (72×0.25) + (64×0.20)
//     = 23.4 + 16.0 + 18.0 + 12.8 = 70.2 → rounded to 70

export const DEMO_ASSESSMENT = {
  id: 'demo-001',
  system_name: 'AI Clinical Charting Assistant (Demo)',
  system_type: 'nlp_documentation',
  vendor: 'MedScribe AI',
  deployment_context: 'clinical',

  // === Input Conditions ===
  key_assets: [
    'Clinical AI Systems',
    'AI Model & Training Data',
    'Patient Data (ePHI)',
    'EHR / Core Systems',
    'APIs and Integrations'
  ],
  data_sources: ['EHR / EMR', 'Lab Results', 'Patient-Reported Outcomes'],
  population_diversity: 'partially_considered',
  bias_testing: 'in_progress',
  data_documented: 'partial',
  security_controls: ['Role-Based Access Control', 'Audit Logging', 'Multi-Factor Authentication (MFA)'],
  encryption: 'yes_both',
  hipaa_baa: 'yes',
  pen_testing: 'yes_older',           // >12 months → elevated cybersecurity likelihood
  fda_status: 'exempt',
  hipaa_compliance: 'partial',        // partial → elevated compliance impact
  governance_policy: 'yes_informal',  // no formal policy → governance gap
  clinical_validation: 'in_progress', // not complete → elevated clinical impact

  // === Domain Scores (derived from scoring model above) ===
  bias_score: 64,              // L:4 × I:4 × 1.5 = 24 → normalized
  cybersecurity_score: 64,     // L:4 × I:4 × 1.5 = 24 → normalized (pen test gap, API exposure)
  compliance_score: 72,        // L:4 × I:5 × 1.5 = 30 → normalized (partial HIPAA + no formal policy)
  clinical_impact_score: 78,   // L:5 × I:5 × 1.5 = 37.5 → normalized (NLP outputs enter EHR unvalidated)
  overall_risk_score: 70,      // Weighted: (78×0.30)+(64×0.25)+(72×0.25)+(64×0.20) = 70.2

  risk_level: 'high',

  summary: 'The AI Clinical Charting Assistant (MedScribe AI) presents a HIGH risk profile (score: 70/100) driven by three primary conditions: NLP-generated clinical notes entering the EHR without human validation, incomplete bias testing with known demographic performance gaps, and a HIPAA compliance posture that remains partial. With ePHI processed across five key assets — including external API integrations and a third-party vendor — the sensitivity modifier of 1.5× is applied to all domain scores. Immediate action is required on clinical validation controls, penetration testing, and formal AI governance policy to reduce exposure to HIPAA, NIST CSF 2.0, and GDPR obligations.',

  financial_exposure: 'Estimated financial exposure: $1.4M–$5.2M (FAIR-informed). Primary drivers: (1) HIPAA breach penalties — OCR enforcement up to $1.9M per violation category per year (45 CFR §164.404); (2) clinical liability from AI-assisted misdiagnosis in unvalidated NLP outputs — estimated $500K–$2M per adverse event; (3) remediation costs to close governance, bias, and API security gaps — estimated $400K–$1.1M. The ePHI sensitivity modifier (1.5×) amplifies all risk scores, reflecting the heightened regulatory and patient safety exposure.',

  // === Recommendations — traceable to input conditions ===
  recommendations: [
    {
      recommendation: 'Implement mandatory human-in-the-loop (HITL) validation for all AI-generated clinical notes before EHR entry — mitigates NLP hallucination risk directly linked to unvalidated clinical_validation status',
      affected_asset: 'Clinical AI Systems',
      domain: 'AI Model Behavior',
      priority: 'immediate'
    },
    {
      recommendation: 'Complete bias testing across all demographic groups (age, race, sex, language) and establish a quarterly monitoring cadence — directly addresses the "in_progress" bias_testing input and identified demographic performance gaps',
      affected_asset: 'AI Model & Training Data',
      domain: 'AI Model Behavior',
      priority: 'immediate'
    },
    {
      recommendation: 'Conduct a new penetration test within 60 days — current test is over 12 months old (pen_testing: yes_older), leaving API and infrastructure exposure unverified against current threat landscape',
      affected_asset: 'APIs and Integrations',
      domain: 'Security & Infrastructure',
      priority: 'immediate'
    },
    {
      recommendation: 'Formalize AI governance policy: document model approval workflow, escalation procedures, and AI lifecycle management — current informal policy (governance_policy: yes_informal) does not satisfy NIST CSF GV.OC or HIPAA administrative safeguard requirements',
      affected_asset: 'Clinical AI Systems',
      domain: 'Governance & Compliance',
      priority: 'short-term'
    },
    {
      recommendation: 'Implement real-time, comprehensive audit logging for all AI decisions and ePHI access events — current audit logging is incomplete and does not meet HIPAA §164.312(b) audit control requirements',
      affected_asset: 'Patient Data (ePHI)',
      domain: 'Security & Infrastructure',
      priority: 'short-term'
    },
    {
      recommendation: 'Deploy model drift detection and automated performance alerting in production — absence of monitoring means degraded model accuracy may go undetected, increasing clinical impact likelihood to 5/5',
      affected_asset: 'AI Model & Training Data',
      domain: 'AI Model Behavior',
      priority: 'short-term'
    },
    {
      recommendation: 'Conduct a Data Protection Impact Assessment (DPIA) per GDPR Article 35 — ePHI processed at scale by a third-party AI vendor meets the threshold for mandatory DPIA under high-risk processing criteria',
      affected_asset: 'Patient Data (ePHI)',
      domain: 'Data & Privacy',
      priority: 'short-term'
    },
    {
      recommendation: 'Establish a formal third-party vendor risk management process for MedScribe AI — including annual security assessments, BAA review, and sub-processor inventory aligned with HIPAA §164.308(b)',
      affected_asset: 'APIs and Integrations',
      domain: 'Third-Party Risk',
      priority: 'ongoing'
    }
  ],

  // === Governance Gaps — traceable to inputs + specific regulatory references ===
  governance_gaps: [
    {
      gap: 'No systematic validation gate for AI-generated clinical outputs — NLP notes enter EHR without clinician confirmation, violating clinical_validation requirements and creating direct patient safety exposure (Likelihood: 5, Impact: 5)',
      affected_asset: 'Clinical AI Systems',
      control_framework: 'HIPAA §164.308(a)(8) — Evaluation; NIST CSF DE.CM-4',
      risk_domain: 'AI Model Behavior'
    },
    {
      gap: 'Audit logging is incomplete — not all AI-assisted decisions are captured with sufficient detail for HIPAA compliance review; this was identified from the audit_logging control being present but partial in scope (Likelihood: 4, Impact: 5)',
      affected_asset: 'Patient Data (ePHI)',
      control_framework: 'HIPAA §164.312(b) — Audit Controls; NIST CSF PR.PT-1',
      risk_domain: 'Security & Infrastructure'
    },
    {
      gap: 'AI governance policy is informal and undocumented (governance_policy: yes_informal) — no formal model approval, escalation, or lifecycle process; does not satisfy NIST CSF GV.OC-01 or NIST AI RMF Govern 1.1 (Likelihood: 4, Impact: 4)',
      affected_asset: 'Clinical AI Systems',
      control_framework: 'NIST CSF 2.0 GV.OC-01; NIST AI RMF Govern 1.1',
      risk_domain: 'Governance & Compliance'
    },
    {
      gap: 'Penetration test is over 12 months old (pen_testing: yes_older) — external APIs and NLP inference endpoints have not been assessed against current threat vectors; HIPAA requires periodic technical evaluation (Likelihood: 4, Impact: 4)',
      affected_asset: 'APIs and Integrations',
      control_framework: 'HIPAA §164.308(a)(8) — Evaluation; NIST CSF ID.RA-1',
      risk_domain: 'Security & Infrastructure'
    },
    {
      gap: 'Data processing activities not documented per GDPR Article 30 — records of processing are absent for ePHI flows through MedScribe AI, a third-party processor operating under BAA (Likelihood: 3, Impact: 4)',
      affected_asset: 'Patient Data (ePHI)',
      control_framework: 'GDPR Article 30 — Records of Processing Activities',
      risk_domain: 'Data & Privacy'
    },
    {
      gap: 'No DPIA conducted for high-risk AI processing of health data — NLP system processing ePHI at scale meets GDPR Article 35 threshold; absence of DPIA is a compliance gap with EU regulatory exposure (Likelihood: 3, Impact: 5)',
      affected_asset: 'Patient Data (ePHI)',
      control_framework: 'GDPR Article 35 — Data Protection Impact Assessment',
      risk_domain: 'Data & Privacy'
    },
    {
      gap: 'System has not completed NIST RMF Assess step — controls have not been independently evaluated against NIST SP 800-53 Rev 5 baselines; Security Assessment Report (SAR) is absent (Likelihood: 4, Impact: 4)',
      affected_asset: 'EHR / Core Systems',
      control_framework: 'NIST RMF — Assess Step (SP 800-37 Rev 2, Task A-1 through A-3)',
      risk_domain: 'Governance & Compliance'
    },
    {
      gap: 'API integrations with MedScribe AI lack formal security review and sub-processor inventory — third-party connections are not classified by data sensitivity or regularly assessed for supply chain risk (Likelihood: 4, Impact: 4)',
      affected_asset: 'APIs and Integrations',
      control_framework: 'HIPAA §164.308(b) — Business Associate Contracts; NIST CSF ID.SC-2',
      risk_domain: 'Third-Party Risk'
    }
  ],

  created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  updated_date: new Date().toISOString(),
  created_by_id: 'demo-user'
};

export const getDemoAssessments = () => [DEMO_ASSESSMENT];

export const isDemoMode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('demo') === '1';
};
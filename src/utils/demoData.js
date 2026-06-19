// Demo assessment data for trying the platform without authentication
// This is fully prebuilt — no API calls needed
export const DEMO_ASSESSMENT = {
  id: 'demo-001',
  system_name: 'AI Clinical Charting Assistant (Demo)',
  system_type: 'nlp_documentation',
  vendor: 'MedScribe AI',
  deployment_context: 'clinical',
  key_assets: ['Clinical AI Systems', 'AI Model & Training Data', 'Patient Data (ePHI)', 'EHR / Core Systems', 'APIs and Integrations'],
  data_sources: ['EHR / EMR', 'Lab Results', 'Patient-Reported Outcomes'],
  population_diversity: 'Partially considered — primarily US populations with limited demographic diversity',
  bias_testing: 'Bias testing in progress — initial results show performance gaps across demographic groups',
  data_documented: 'Training data partially documented — full lineage and version history pending',
  security_controls: ['Role-Based Access Control', 'Audit Logging', 'Multi-Factor Authentication (MFA)'],
  encryption: 'yes_both',
  hipaa_baa: 'yes',
  pen_testing: 'yes_older',
  fda_status: 'exempt',
  hipaa_compliance: 'partial',
  governance_policy: 'yes_informal',
  clinical_validation: 'in_progress',
  bias_score: 64,
  cybersecurity_score: 47,
  compliance_score: 58,
  clinical_impact_score: 74,
  overall_risk_score: 61,
  risk_level: 'high',
  summary: 'The AI Clinical Charting Assistant presents a HIGH risk profile driven by incomplete bias testing, an outdated penetration test, and a clinical validation study that remains in progress. While HIPAA technical safeguards are partially in place, governance gaps — including no formal AI policy and limited audit logging — increase exposure across HIPAA, NIST CSF 2.0, and GDPR. Immediate action is required to implement human-in-the-loop validation, strengthen access controls, and establish continuous model monitoring.',
  financial_exposure: 'Estimated financial exposure ranges from $1.2M to $4.8M based on FAIR-informed modeling. Primary cost drivers include potential HIPAA breach penalties ($100K–$1.9M per violation category), clinical liability from AI-assisted misdiagnosis, and estimated remediation costs of $800K–$2.1M to close identified governance gaps.',
  recommendations: [
    { recommendation: 'Implement mandatory human-in-the-loop validation for all AI-generated clinical notes before entry into EHR', affected_asset: 'Clinical AI Systems' },
    { recommendation: 'Complete bias testing across all demographic groups and establish ongoing monitoring cadence', affected_asset: 'AI Model & Training Data' },
    { recommendation: 'Conduct a new penetration test within 60 days — current test is over 12 months old', affected_asset: 'APIs and Integrations' },
    { recommendation: 'Finalize and publish a formal AI governance policy including model approval and escalation procedures', affected_asset: 'Clinical AI Systems' },
    { recommendation: 'Implement real-time audit logging for all AI decisions and patient data access events', affected_asset: 'Patient Data (ePHI)' },
    { recommendation: 'Deploy model drift detection and alerting to identify performance degradation in production', affected_asset: 'AI Model & Training Data' },
    { recommendation: 'Establish a DPIA process for high-risk AI processing of ePHI per GDPR Article 35', affected_asset: 'Patient Data (ePHI)' },
    { recommendation: 'Complete the NIST RMF Assess phase — conduct independent control evaluation and prepare a Security Assessment Report', affected_asset: 'EHR / Core Systems' },
  ],
  governance_gaps: [
    { gap: 'No systematic validation process for AI-generated clinical outputs — outputs enter EHR without clinician confirmation', affected_asset: 'Clinical AI Systems', control_framework: 'HIPAA' },
    { gap: 'Limited monitoring infrastructure — model drift and performance degradation are not tracked in production', affected_asset: 'AI Model & Training Data', control_framework: 'NIST CSF' },
    { gap: 'Audit logging is incomplete — not all AI-assisted decisions are captured with sufficient detail for compliance review', affected_asset: 'Patient Data (ePHI)', control_framework: 'HIPAA' },
    { gap: 'AI governance policy is informal and undocumented — no formal approval, escalation, or model lifecycle process exists', affected_asset: 'Clinical AI Systems', control_framework: 'NIST CSF' },
    { gap: 'Data processing activities not documented per GDPR Article 30 — records of processing are absent for ePHI flows', affected_asset: 'Patient Data (ePHI)', control_framework: 'GDPR' },
    { gap: 'System has not completed the NIST RMF Assess phase — controls have not been independently evaluated against SP 800-53 baselines', affected_asset: 'EHR / Core Systems', control_framework: 'NIST RMF' },
    { gap: 'API integrations lack formal security review — third-party connections are not inventoried or regularly assessed', affected_asset: 'APIs and Integrations', control_framework: 'NIST CSF' },
    { gap: 'No DPIA conducted for high-risk AI processing of health data as required by GDPR Article 35', affected_asset: 'Patient Data (ePHI)', control_framework: 'GDPR' },
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
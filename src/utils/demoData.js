// Demo assessment data for trying the platform without authentication
export const DEMO_ASSESSMENT = {
  id: 'demo-001',
  system_name: 'Clinical Decision Support AI (Demo)',
  system_type: 'clinical_decision_support',
  vendor: 'Acme Health AI Inc.',
  deployment_context: 'clinical',
  key_assets: ['AI Model', 'ePHI', 'EHR System'],
  data_sources: ['Patient demographics', 'Lab results', 'Clinical notes'],
  population_diversity: 'Limited diversity in training data — primarily US populations',
  bias_testing: 'Initial bias testing completed, ongoing monitoring needed',
  data_documented: 'Training data documentation in progress',
  security_controls: ['Encryption at rest', 'RBAC', 'Audit logging'],
  encryption: 'AES-256 encryption implemented',
  hipaa_baa: 'BAA executed with vendor',
  pen_testing: 'Annual penetration testing planned',
  fda_status: 'Not yet submitted',
  hipaa_compliance: 'Partial compliance — ongoing remediation',
  governance_policy: 'AI governance policy in development',
  clinical_validation: 'Retrospective validation study planned',
  bias_score: 62,
  cybersecurity_score: 48,
  compliance_score: 55,
  clinical_impact_score: 72,
  overall_risk_score: 59,
  risk_level: 'high',
  summary: 'This clinical decision support system demonstrates the critical importance of structured AI risk governance in healthcare. The system shows moderate-to-high risk across multiple dimensions, particularly in clinical impact and bias assessment. While security controls are in place, compliance and governance frameworks require strengthening to meet HIPAA and NIST CSF 2.0 standards.',
  recommendations: [
    'Implement mandatory human-in-the-loop validation for all clinical recommendations',
    'Expand bias testing to include diverse demographic populations',
    'Complete HIPAA compliance gap remediation within 90 days',
    'Establish continuous model monitoring and drift detection',
    'Conduct annual security assessments and penetration testing',
    'Document all training data sources and limitations'
  ],
  governance_gaps: [
    'No systematic validation process for AI-generated clinical outputs',
    'Limited monitoring infrastructure for model performance and drift',
    'Incomplete audit logging for all AI-driven decisions',
    'Governance policy framework not yet finalized',
    'Clinical validation study not yet initiated'
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
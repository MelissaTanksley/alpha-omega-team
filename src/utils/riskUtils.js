/**
 * Parse assessment data into Risk Register format
 * Produces structured, healthcare-grade risk records with professional titles,
 * descriptions, impact statements, traceability, and framework alignment.
 */

// Extract numeric likelihood from gap text (e.g. "Likelihood: 5")
const extractLikelihood = (text) => {
  const match = text?.match(/Likelihood[:\s]+(\d)/i);
  return match ? parseInt(match[1]) : 3;
};

// Extract numeric impact from gap text (e.g. "Impact: 5")
const extractImpact = (text) => {
  const match = text?.match(/Impact[:\s]+(\d)/i);
  return match ? parseInt(match[1]) : 3;
};

// Score to qualitative label
const scoreToLabel = (n) => {
  if (n >= 5) return 'Critical';
  if (n >= 4) return 'High';
  if (n >= 3) return 'Medium';
  return 'Low';
};

// Derive risk level from likelihood × impact
const deriveRiskLevel = (l, i) => {
  const score = l * i;
  if (score >= 20) return 'critical';
  if (score >= 12) return 'high';
  if (score >= 6) return 'medium';
  return 'low';
};

// Strip embedded "(Likelihood: X, Impact: Y)" from gap text for cleaner display
const cleanGapText = (text) => text?.replace(/\s*\(Likelihood:\s*\d,\s*Impact:\s*\d\)/gi, '').trim() || '';

// Map gap/domain keywords to a professional clinical risk title
const buildTitle = (text, domain) => {
  const lower = text?.toLowerCase() || '';

  // Pattern-match for known risk types to assign clear professional titles
  if (lower.includes('validation') && (lower.includes('clinical') || lower.includes('nlp') || lower.includes('output')))
    return 'Unvalidated AI-Generated Clinical Outputs';
  if (lower.includes('hallucination') || lower.includes('inaccurate') || lower.includes('incorrect output'))
    return 'Inaccurate AI-Generated Clinical Documentation';
  if (lower.includes('audit log') || lower.includes('audit logging') || lower.includes('audit control'))
    return 'Incomplete Audit Logging for AI-Assisted Decisions';
  if (lower.includes('governance') && lower.includes('informal'))
    return 'Absence of Formal AI Governance Policy';
  if (lower.includes('governance') || lower.includes('policy') || lower.includes('lifecycle'))
    return 'Inadequate AI Governance and Policy Controls';
  if (lower.includes('penetration test') || lower.includes('pen test'))
    return 'Outdated Penetration Testing — Unverified Security Posture';
  if (lower.includes('gdpr') && lower.includes('article 30'))
    return 'Undocumented Data Processing Activities (GDPR Article 30)';
  if (lower.includes('dpia') || lower.includes('article 35'))
    return 'Missing Data Protection Impact Assessment (DPIA)';
  if (lower.includes('nist rmf') || lower.includes('assess step') || lower.includes('sar'))
    return 'NIST RMF Assessment Step Not Completed';
  if (lower.includes('api') && (lower.includes('third-party') || lower.includes('vendor') || lower.includes('supply chain')))
    return 'Unsecured Third-Party API Integrations';
  if (lower.includes('bias') || lower.includes('demographic') || lower.includes('fairness'))
    return 'Model Bias Affecting Clinical Decision-Making';
  if (lower.includes('unauthorized access') || lower.includes('access control') || lower.includes('rbac'))
    return 'Unauthorized Access to Patient Data (ePHI)';
  if (lower.includes('encryption'))
    return 'Insufficient Data Encryption for ePHI';
  if (lower.includes('drift') || lower.includes('monitor') || lower.includes('performance'))
    return 'Lack of AI Model Performance Monitoring';
  if (lower.includes('baa') || lower.includes('business associate') || lower.includes('vendor risk'))
    return 'Third-Party Vendor Risk — Inadequate Oversight';
  if (lower.includes('hipaa') || lower.includes('compliance'))
    return 'Partial HIPAA Compliance — Regulatory Exposure';
  if (lower.includes('clinical validation'))
    return 'Incomplete Clinical Validation of AI System';
  if (lower.includes('ephi') || lower.includes('patient data') || lower.includes('phi'))
    return 'ePHI Exposure Through AI System Operations';

  // Domain-level fallbacks
  const domainTitles = {
    'AI Model Behavior': 'AI Model Output Risk',
    'Security & Infrastructure': 'Security Control Deficiency',
    'Governance & Compliance': 'Governance and Compliance Gap',
    'Data & Privacy': 'Data Privacy Risk',
    'Third-Party Risk': 'Third-Party Vendor Risk',
  };
  return domainTitles[domain] || 'Identified Risk';
};

// Build a professional, structured risk description
const buildDescription = (rawText, asset, domain) => {
  const clean = cleanGapText(rawText);

  // Prefix with domain-appropriate clinical framing if the text doesn't already start cleanly
  const prefixes = {
    'AI Model Behavior': 'This AI system introduces a clinical safety risk:',
    'Security & Infrastructure': 'A security control gap has been identified:',
    'Governance & Compliance': 'A governance or compliance deficiency exists:',
    'Data & Privacy': 'A data protection gap has been identified:',
    'Third-Party Risk': 'Third-party risk exposure has been identified:',
  };

  const prefix = prefixes[domain];
  // If the text starts with "No " or "System has not" etc., frame it more professionally
  const startsWeak = /^(no |system has|there is|the system|it |this system)/i.test(clean);
  if (prefix && startsWeak) {
    return `${prefix} ${clean.charAt(0).toLowerCase()}${clean.slice(1)}`;
  }
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

// Build clinical impact statement per domain
const buildImpact = (domain) => {
  const impacts = {
    'AI Model Behavior': 'Incorrect or unvalidated AI outputs may lead to inappropriate clinical decisions, delayed care, adverse patient outcomes, and potential liability under HIPAA and clinical negligence standards.',
    'Security & Infrastructure': 'Unresolved security gaps may leave ePHI and AI infrastructure exposed to unauthorized access, ransomware, or data exfiltration — triggering HIPAA breach notification obligations and OCR enforcement action.',
    'Governance & Compliance': 'Absence of formal governance controls creates audit risk, regulatory non-compliance, and an inability to demonstrate due diligence to regulators, auditors, or oversight bodies.',
    'Data & Privacy': 'Gaps in data processing documentation or privacy impact assessments increase exposure to GDPR enforcement, HIPAA Privacy Rule violations, and unauthorized use of protected health information.',
    'Third-Party Risk': 'Unreviewed third-party integrations introduce supply chain risk — including vendor compromise, ePHI disclosure through inadequately secured connections, or use of non-compliant sub-processors.',
  };
  return impacts[domain] || 'This risk introduces potential compliance violations, operational disruption, or patient safety exposure if left unaddressed.';
};

// Build "Based on:" traceability bullets from gap text
const buildTraceability = (rawText, asset, domain) => {
  const lower = rawText?.toLowerCase() || '';
  const bullets = [];

  if (asset && asset !== 'Unknown System') bullets.push(`Affected asset: ${asset}`);
  if (lower.includes('ephi') || lower.includes('patient data') || lower.includes('phi')) bullets.push('Processes ePHI');
  if (lower.includes('no formal') || lower.includes('informal') || lower.includes('undocumented')) bullets.push('No formal controls documented');
  if (lower.includes('external') || lower.includes('api') || lower.includes('third-party') || lower.includes('vendor')) bullets.push('External system or vendor exposure');
  if (lower.includes('partial') || lower.includes('incomplete') || lower.includes('in_progress') || lower.includes('in progress')) bullets.push('Control or process not yet completed');
  if (lower.includes('no validation') || lower.includes('without validation') || lower.includes('unvalidated')) bullets.push('No output validation controls in place');
  if (lower.includes('pen test') || lower.includes('penetration') || lower.includes('older') || lower.includes('>12')) bullets.push('Security testing overdue or not conducted');
  if (lower.includes('audit log') || lower.includes('logging') || lower.includes('audit control')) bullets.push('Audit logging incomplete or absent');
  if (lower.includes('gdpr') || lower.includes('eu ') || lower.includes('cross-border')) bullets.push('EU personal data in scope (GDPR applicable)');
  if (lower.includes('nist rmf') || lower.includes('assess step') || lower.includes('sar')) bullets.push('NIST RMF assessment step not completed');

  return bullets.length > 0 ? bullets : [`Risk domain: ${domain || 'General'}`];
};

// Build recommended control per domain
const buildRecommendedControl = (domain) => {
  const controls = {
    'AI Model Behavior': 'Implement human-in-the-loop (HITL) validation to review AI-generated outputs before entry into clinical workflows. Establish model drift detection and automated performance alerting in production.',
    'Security & Infrastructure': 'Conduct an updated penetration test within 60 days. Remediate identified vulnerabilities and implement continuous security monitoring aligned with NIST CSF DE.CM.',
    'Governance & Compliance': 'Formalize the AI governance policy with documented model approval workflows, accountability assignments, and lifecycle management procedures aligned with NIST AI RMF and ISO/IEC 42001.',
    'Data & Privacy': 'Complete a Data Protection Impact Assessment (DPIA) per GDPR Article 35. Document all data processing activities per GDPR Article 30 and ensure ePHI handling aligns with HIPAA Privacy Rule requirements.',
    'Third-Party Risk': 'Establish a formal third-party risk management program including annual vendor security assessments, BAA review cycles, and a sub-processor inventory aligned with HIPAA §164.308(b).',
  };
  return controls[domain] || 'Implement appropriate corrective controls aligned with applicable compliance frameworks and document remediation for audit evidence.';
};

// Extract framework alignment from control_framework field or apply domain defaults
const buildFrameworks = (controlFramework, domain) => {
  if (controlFramework) return controlFramework;
  const defaults = {
    'AI Model Behavior': 'HIPAA §164.308(a)(8) — Evaluation; NIST CSF DE.CM-4; ISO/IEC 27005',
    'Security & Infrastructure': 'HIPAA §164.312 — Technical Safeguards; NIST CSF PR.PT / DE.CM; ISO/IEC 27005',
    'Governance & Compliance': 'NIST CSF 2.0 GV.OC-01; NIST AI RMF Govern 1.1; ISO/IEC 42001',
    'Data & Privacy': 'GDPR Article 30 / 35; HIPAA Privacy Rule §164.502; ISO/IEC 27005',
    'Third-Party Risk': 'HIPAA §164.308(b) — Business Associate Contracts; NIST CSF ID.SC-2; ISO/IEC 27005',
  };
  return defaults[domain] || 'HIPAA Security Rule; NIST CSF 2.0; ISO/IEC 27005';
};

export const parseAssessmentToRiskRegister = (assessment) => {
  if (!assessment) return [];

  const systemName = assessment.system_name || 'Unknown System';
  const overallRiskLevel = assessment.risk_level || 'medium';

  // Map governance gaps as primary identified risks
  const gapRisks = (assessment.governance_gaps || []).map((gap, idx) => {
    const rawText = typeof gap === 'string' ? gap : (gap?.gap || '');
    const asset = (typeof gap === 'object' && gap?.affected_asset) ? gap.affected_asset : systemName;
    const domain = (typeof gap === 'object' && gap?.risk_domain) ? gap.risk_domain : null;
    const controlFramework = (typeof gap === 'object' && gap?.control_framework) ? gap.control_framework : null;

    const likelihoodNum = extractLikelihood(rawText);
    const impactNum = extractImpact(rawText);
    const riskLevel = deriveRiskLevel(likelihoodNum, impactNum);

    return {
      id: `gap-${idx}`,
      title: buildTitle(rawText, domain),
      description: buildDescription(rawText, asset, domain),
      impactStatement: buildImpact(domain),
      traceability: buildTraceability(rawText, asset, domain),
      asset,
      domain,
      likelihood: scoreToLabel(likelihoodNum),
      likelihoodNum,
      impact_score: scoreToLabel(impactNum),
      impactNum,
      riskLevel,
      control: buildRecommendedControl(domain),
      frameworks: buildFrameworks(controlFramework, domain),
      owner: 'Risk Owner (TBD)',
      dueDate: '',
      status: 'Open',
      type: 'gap',
    };
  });

  // Map recommendations as action items — deduplicate titles from gaps
  const recommendationRisks = (assessment.recommendations || []).map((rec, idx) => {
    const rawText = typeof rec === 'string' ? rec : (rec?.recommendation || '');
    const asset = (typeof rec === 'object' && rec?.affected_asset) ? rec.affected_asset : systemName;
    const domain = (typeof rec === 'object' && rec?.domain) ? rec.domain : null;
    const priority = (typeof rec === 'object' && rec?.priority) ? rec.priority : 'short-term';

    return {
      id: `rec-${idx}`,
      title: buildTitle(rawText, domain),
      description: rawText,
      impactStatement: buildImpact(domain),
      traceability: buildTraceability(rawText, asset, domain),
      asset,
      domain,
      likelihood: 'Medium',
      likelihoodNum: 3,
      impact_score: 'High',
      impactNum: 4,
      riskLevel: overallRiskLevel,
      control: rawText,
      frameworks: buildFrameworks(null, domain),
      owner: 'Risk Owner (TBD)',
      dueDate: '',
      status: 'Open',
      type: 'recommendation',
      priority,
    };
  });

  return [...gapRisks, ...recommendationRisks];
};

export const getRiskLevelColor = (level) => {
  const colors = {
    low: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    medium: 'bg-amber-50 border-amber-200 text-amber-700',
    high: 'bg-orange-50 border-orange-200 text-orange-700',
    critical: 'bg-red-50 border-red-200 text-red-700'
  };
  return colors[level?.toLowerCase()] || colors.medium;
};

export const getRiskBadgeClass = (level) => {
  const badges = {
    low: 'bg-emerald-100 text-emerald-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };
  return badges[level?.toLowerCase()] || badges.medium;
};
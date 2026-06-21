/**
 * Parse assessment data into Risk Register format
 * Produces structured, healthcare-grade risk records with traceability,
 * impact explanations, likelihood/impact scores, and framework alignment.
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

// Build a clean, professional risk title from gap/recommendation text
const buildTitle = (text, domain) => {
  // If it already starts with a proper noun phrase, use first sentence
  const firstSentence = text?.split('—')[0]?.split('–')[0]?.trim();
  if (firstSentence && firstSentence.length < 80) return firstSentence;
  const domainTitles = {
    'AI Model Behavior': 'Unvalidated AI Clinical Output',
    'Security & Infrastructure': 'Security Control Gap',
    'Governance & Compliance': 'Governance Policy Deficiency',
    'Data & Privacy': 'Data Privacy Compliance Gap',
    'Third-Party Risk': 'Third-Party Vendor Risk',
  };
  return domainTitles[domain] || 'Identified Risk';
};

// Build structured description from gap/recommendation text
const buildDescription = (text, asset) => {
  const clean = cleanGapText(text);
  // Already detailed — return as-is but ensure it reads as a complete sentence
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

// Build impact explanation
const buildImpact = (domain, riskLevel) => {
  const impacts = {
    'AI Model Behavior': 'Incorrect or unvalidated AI outputs may lead to inappropriate clinical decisions, delayed care, adverse patient outcomes, and potential liability under HIPAA and clinical negligence standards.',
    'Security & Infrastructure': 'Security gaps in infrastructure or testing may leave ePHI and AI systems exposed to unauthorized access, ransomware, or data exfiltration — resulting in HIPAA breach notification obligations and OCR enforcement.',
    'Governance & Compliance': 'Absence of formal governance documentation creates audit risk, regulatory non-compliance, and inability to demonstrate due diligence to regulators, auditors, or oversight bodies.',
    'Data & Privacy': 'Gaps in data processing documentation or impact assessments increase exposure to GDPR enforcement, HIPAA Privacy Rule violations, and unauthorized use of protected health information.',
    'Third-Party Risk': 'Unreviewed third-party integrations introduce supply chain risk — vendor compromise, ePHI disclosure through inadequately secured connections, or non-compliant sub-processors.',
  };
  return impacts[domain] || 'This risk introduces potential compliance violations, operational disruption, or patient safety exposure if left unaddressed.';
};

// Extract framework alignment from control_framework field
const buildFrameworks = (controlFramework, domain) => {
  if (controlFramework) return controlFramework;
  const defaults = {
    'AI Model Behavior': 'HIPAA §164.308(a)(8); NIST CSF DE.CM-4; ISO/IEC 27005',
    'Security & Infrastructure': 'HIPAA §164.312; NIST CSF PR.PT / DE.CM; ISO/IEC 27005',
    'Governance & Compliance': 'NIST CSF 2.0 GV.OC; NIST AI RMF Govern; ISO/IEC 42001',
    'Data & Privacy': 'GDPR Article 30 / 35; HIPAA Privacy Rule; ISO/IEC 27005',
    'Third-Party Risk': 'HIPAA §164.308(b); NIST CSF ID.SC-2; ISO/IEC 27005',
  };
  return defaults[domain] || 'HIPAA; NIST CSF 2.0; ISO/IEC 27005';
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
      description: buildDescription(rawText, asset),
      impact: buildImpact(domain, riskLevel),
      asset,
      domain,
      likelihood: scoreToLabel(likelihoodNum),
      likelihoodNum,
      impact_score: scoreToLabel(impactNum),
      impactNum,
      riskLevel,
      control: buildRecommendedControl(domain, rawText),
      frameworks: buildFrameworks(controlFramework, domain),
      owner: 'Risk Owner (TBD)',
      dueDate: '',
      status: 'Open',
      type: 'gap',
    };
  });

  // Map recommendations as action-oriented risks
  const recommendationRisks = (assessment.recommendations || []).map((rec, idx) => {
    const rawText = typeof rec === 'string' ? rec : (rec?.recommendation || '');
    const asset = (typeof rec === 'object' && rec?.affected_asset) ? rec.affected_asset : systemName;
    const domain = (typeof rec === 'object' && rec?.domain) ? rec.domain : null;
    const priority = (typeof rec === 'object' && rec?.priority) ? rec.priority : 'short-term';

    return {
      id: `rec-${idx}`,
      title: buildTitle(rawText, domain),
      description: rawText,
      impact: buildImpact(domain, overallRiskLevel),
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

// Build a clear, action-oriented recommended control
const buildRecommendedControl = (domain, rawText) => {
  // Extract the action from the gap text if it implies a fix
  const controls = {
    'AI Model Behavior': 'Implement human-in-the-loop (HITL) validation to review AI-generated outputs before entry into clinical workflows. Establish output monitoring and model drift alerting.',
    'Security & Infrastructure': 'Conduct updated penetration testing and security assessment. Remediate identified vulnerabilities and implement continuous monitoring aligned with NIST CSF DE.CM.',
    'Governance & Compliance': 'Formalize AI governance policy with documented approval workflows, accountability assignments, and lifecycle management procedures aligned with NIST AI RMF and ISO/IEC 42001.',
    'Data & Privacy': 'Complete a Data Protection Impact Assessment (DPIA) per GDPR Article 35. Document all data processing activities and ensure records of processing align with GDPR Article 30.',
    'Third-Party Risk': 'Establish a formal third-party risk management process including annual vendor security assessments, BAA review cycles, and sub-processor inventory per HIPAA §164.308(b).',
  };
  return controls[domain] || 'Implement appropriate corrective controls aligned with applicable compliance frameworks and document remediation for audit purposes.';
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
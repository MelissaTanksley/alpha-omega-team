/**
 * Parse assessment data into Risk Register format
 * Used by both GRCReport and RiskRegister pages to ensure consistency
 */
export const parseAssessmentToRiskRegister = (assessment) => {
  if (!assessment) return [];

  const systemName = assessment.system_name || 'Unknown System';
  const riskLevel = assessment.risk_level || 'medium';

  // Map governance gaps as identified risks
  const gapRisks = (assessment.governance_gaps || []).map((gap, idx) => {
    const gapText = typeof gap === 'string' ? gap : (gap?.gap || '');
    const gapAsset = (typeof gap === 'object' && gap?.affected_asset) ? gap.affected_asset : systemName;
    return {
      id: `gap-${idx}`,
      description: gapText,
      asset: gapAsset,
      likelihood: 'Medium',
      impact: 'High',
      riskLevel: riskLevel,
      control: 'Implement corrective action',
      owner: 'TBD',
      dueDate: '',
      status: 'Open'
    };
  });

  // Map recommendations as action items
  const recommendationRisks = (assessment.recommendations || []).map((rec, idx) => {
    const recText = typeof rec === 'string' ? rec : (rec?.recommendation || '');
    const recAsset = (typeof rec === 'object' && rec?.affected_asset) ? rec.affected_asset : systemName;
    return {
      id: `rec-${idx}`,
      description: recText,
      asset: recAsset,
      likelihood: 'Medium',
      impact: 'Medium',
      riskLevel: riskLevel,
      control: recText,
      owner: 'TBD',
      dueDate: '',
      status: 'Open'
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
import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function RiskSummaryDashboard({ assessment }) {
  const getRiskColor = (level) => {
    const colors = {
      low: { bg: 'bg-emerald-500', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      medium: { bg: 'bg-amber-500', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      high: { bg: 'bg-orange-500', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
      critical: { bg: 'bg-red-500', badge: 'bg-red-500/20 text-red-400 border-red-500/30' }
    };
    return colors[level?.toLowerCase()] || colors.medium;
  };

  const riskLevel = assessment?.risk_level || 'medium';
  const riskColors = getRiskColor(riskLevel);

  const categoryScores = [
    { label: 'Algorithmic Bias', score: assessment?.bias_score || 0, color: 'bg-amber-500' },
    { label: 'Cybersecurity', score: assessment?.cybersecurity_score || 0, color: 'bg-red-500' },
    { label: 'Regulatory Compliance', score: assessment?.compliance_score || 0, color: 'bg-emerald-500' },
    { label: 'Clinical Impact', score: assessment?.clinical_impact_score || 0, color: 'bg-blue-500' }
  ];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
      <div className="border-b border-slate-700 px-6 py-4">
        <p className="text-slate-300 text-xs mb-2.5">Risk Summary Dashboard</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-full px-3 py-1">Qualitative & Quantitative</span>
          <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-full px-3 py-1">ISO 27005 Risk Scoring</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-5">
          {assessment?.system_name}
        </div>
        
        {/* Overall Risk Score */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Overall Risk Score</div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold" style={{ color: riskColors.bg.replace('bg-', '#').split('-')[0] === '#emerald' ? '#10b981' : riskColors.bg.replace('bg-', '#').split('-')[0] === '#amber' ? '#f59e0b' : riskColors.bg.replace('bg-', '#').split('-')[0] === '#orange' ? '#f97316' : '#ef4444' }}>
                {Math.round(assessment?.overall_risk_score || 0)}
              </span>
              <span className="text-slate-400 text-sm mb-1">/ 100</span>
            </div>
          </div>
          <Badge className={`text-sm font-bold px-4 py-2 border ${riskColors.badge}`}>
            {riskLevel.toUpperCase()}
          </Badge>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3.5">
          {categoryScores.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-400 text-xs">{item.label}</span>
                <span className="text-white font-semibold text-xs">{item.score}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full`}
                  style={{ width: `${Math.min(item.score, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-5 pt-5 border-t border-slate-700 text-xs text-slate-400">
          ⚠ {(assessment?.governance_gaps?.length || 0)} governance gaps surfaced · {(assessment?.recommendations?.length || 0)} control recommendations generated
        </div>
      </div>
    </div>
  );
}
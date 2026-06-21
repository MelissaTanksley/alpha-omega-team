import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getRiskBadgeClass } from '@/utils/riskUtils';

const levelOrder = { critical: 0, high: 1, medium: 2, low: 3 };

const leftBorderClass = {
  critical: 'border-l-4 border-l-red-500',
  high: 'border-l-4 border-l-orange-500',
  medium: 'border-l-4 border-l-amber-400',
  low: 'border-l-4 border-l-emerald-500',
};

const borderClass = {
  critical: 'border-red-200',
  high: 'border-orange-200',
  medium: 'border-amber-200',
  low: 'border-emerald-200',
};

export default function RiskRegisterTable({ risks = [], compact = false }) {
  const [filterLevel, setFilterLevel] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const filtered = filterLevel
    ? risks.filter(r => r.riskLevel?.toLowerCase() === filterLevel)
    : risks;

  const sorted = [...filtered].sort(
    (a, b) => (levelOrder[a.riskLevel?.toLowerCase()] ?? 2) - (levelOrder[b.riskLevel?.toLowerCase()] ?? 2)
  );

  if (!sorted.length) {
    return <div className="text-center py-8 text-slate-500 text-sm">No risks to display.</div>;
  }

  return (
    <div className="space-y-3">
      {/* Filter Controls */}
      {!compact && (
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Filter:</span>
          {[null, 'critical', 'high', 'medium', 'low'].map(level => (
            <button
              key={level ?? 'all'}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize ${
                filterLevel === level
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {level ?? 'All'}
            </button>
          ))}
        </div>
      )}

      {/* Risk Cards */}
      <div className="space-y-2">
        {sorted.map((risk, idx) => {
          const isExpanded = expandedId === (risk.id || idx);
          const badge = getRiskBadgeClass(risk.riskLevel);
          const border = borderClass[risk.riskLevel?.toLowerCase()] || 'border-slate-200';
          const leftBorder = leftBorderClass[risk.riskLevel?.toLowerCase()] || 'border-l-4 border-l-slate-300';

          return (
            <div key={risk.id || idx} className={`border ${border} ${leftBorder} rounded-lg bg-white overflow-hidden shadow-sm`}>

              {/* Collapsed Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : (risk.id || idx))}
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Badge className={`text-xs font-bold flex-shrink-0 ${badge}`}>
                    {risk.riskLevel?.toUpperCase()}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {risk.title || risk.description?.slice(0, 80)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{risk.asset} {risk.domain ? `· ${risk.domain}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {risk.likelihoodNum && (
                    <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                      <span>L: <strong className="text-slate-700">{risk.likelihoodNum}/5</strong></span>
                      <span>I: <strong className="text-slate-700">{risk.impactNum}/5</strong></span>
                    </div>
                  )}
                  <Badge variant="outline" className="text-xs border-slate-300 text-slate-500 hidden sm:inline-flex">
                    {risk.status || 'Open'}
                  </Badge>
                  {isExpanded
                    ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  }
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">

                  {/* Description */}
                  <div className="px-4 py-3 bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Risk Description</p>
                    <p className="text-sm text-slate-800 leading-relaxed">{risk.description}</p>
                  </div>

                  {/* Impact Statement */}
                  {risk.impactStatement && (
                    <div className="px-4 py-3 bg-orange-50">
                      <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1.5">Impact</p>
                      <p className="text-sm text-orange-900 leading-relaxed">{risk.impactStatement}</p>
                    </div>
                  )}

                  {/* Traceability + Scores */}
                  <div className="px-4 py-3 bg-white">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Based On</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ul className="space-y-1">
                        {(risk.traceability || []).map((item, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="text-slate-400 flex-shrink-0 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-slate-500 mb-0.5">Likelihood</p>
                          <p className="text-sm font-bold text-slate-900">{risk.likelihoodNum}/5</p>
                          <p className="text-xs text-slate-500">{risk.likelihood}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-slate-500 mb-0.5">Impact</p>
                          <p className="text-sm font-bold text-slate-900">{risk.impactNum}/5</p>
                          <p className="text-xs text-slate-500">{risk.impact_score}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Control */}
                  <div className="px-4 py-3 bg-emerald-50">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">Recommended Control</p>
                    <p className="text-sm text-emerald-900 leading-relaxed">{risk.control}</p>
                  </div>

                  {/* Framework Alignment */}
                  {risk.frameworks && (
                    <div className="px-4 py-3 bg-blue-50">
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5">Framework Alignment</p>
                      <p className="text-xs text-blue-900 leading-relaxed font-mono">{risk.frameworks}</p>
                    </div>
                  )}

                  {/* Footer: Owner / Status */}
                  <div className="px-4 py-2.5 bg-white flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span><span className="font-semibold text-slate-600">Owner:</span> {risk.owner || 'Risk Owner (TBD)'}</span>
                    <span><span className="font-semibold text-slate-600">Status:</span> {risk.status || 'Open'}</span>
                    {risk.dueDate && <span><span className="font-semibold text-slate-600">Due:</span> {risk.dueDate}</span>}
                    {risk.domain && <span><span className="font-semibold text-slate-600">Domain:</span> {risk.domain}</span>}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-400 pt-1">
        Showing {sorted.length} of {risks.length} risk{risks.length !== 1 ? 's' : ''}
        {filterLevel ? ` · Filtered: ${filterLevel}` : ''}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getRiskBadgeClass } from '@/utils/riskUtils';

const levelOrder = { critical: 0, high: 1, medium: 2, low: 3 };

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
          const badgeClass = getRiskBadgeClass(risk.riskLevel);
          const borderClass = {
            critical: 'border-red-200',
            high: 'border-orange-200',
            medium: 'border-amber-200',
            low: 'border-emerald-200',
          }[risk.riskLevel?.toLowerCase()] || 'border-slate-200';

          return (
            <div key={risk.id || idx} className={`border ${borderClass} rounded-lg bg-white overflow-hidden`}>
              {/* Row Header — always visible */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : (risk.id || idx))}
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Badge className={`text-xs font-bold flex-shrink-0 ${badgeClass}`}>
                    {risk.riskLevel?.toUpperCase()}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {risk.title || risk.description?.slice(0, 80)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{risk.asset}</p>
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
                <div className="border-t border-slate-100 px-4 py-4 space-y-4 bg-slate-50">

                  {/* Description */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Risk Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{risk.description}</p>
                  </div>

                  {/* Impact */}
                  {risk.impact && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Impact</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{risk.impact}</p>
                    </div>
                  )}

                  {/* Traceability Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Affected Asset</p>
                      <p className="text-xs font-medium text-slate-800">{risk.asset}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Likelihood</p>
                      <p className="text-xs font-bold text-slate-800">{risk.likelihoodNum}/5 — {risk.likelihood}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Impact</p>
                      <p className="text-xs font-bold text-slate-800">{risk.impactNum}/5 — {risk.impact_score}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Status</p>
                      <p className="text-xs font-medium text-slate-800">{risk.status || 'Open'}</p>
                    </div>
                  </div>

                  {/* Recommended Control */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Recommended Control</p>
                    <p className="text-sm text-emerald-900 leading-relaxed">{risk.control}</p>
                  </div>

                  {/* Framework Alignment */}
                  {risk.frameworks && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Framework Alignment</p>
                      <p className="text-xs text-blue-900 leading-relaxed">{risk.frameworks}</p>
                    </div>
                  )}

                  {/* Owner */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold">Owner:</span>
                    <span>{risk.owner || 'Risk Owner (TBD)'}</span>
                    {risk.dueDate && <><span className="font-semibold ml-3">Due:</span><span>{risk.dueDate}</span></>}
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
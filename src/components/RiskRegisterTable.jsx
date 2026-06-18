import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getRiskBadgeClass } from '@/utils/riskUtils';

export default function RiskRegisterTable({ risks = [], compact = false }) {
  const [sortBy, setSortBy] = useState(null);
  const [filterLevel, setFilterLevel] = useState(null);

  const filteredRisks = filterLevel
    ? risks.filter(r => r.riskLevel?.toLowerCase() === filterLevel.toLowerCase())
    : risks;

  const sortedRisks = sortBy
    ? [...filteredRisks].sort((a, b) => {
        const aVal = a[sortBy]?.toString().toLowerCase() || '';
        const bVal = b[sortBy]?.toString().toLowerCase() || '';
        return aVal.localeCompare(bVal);
      })
    : filteredRisks;

  if (!sortedRisks.length) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No risks to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      {!compact && (
        <div className="flex gap-2 items-center mb-4">
          <span className="text-sm font-semibold text-slate-700">Filter by Risk Level:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterLevel(null)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filterLevel === null
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              All
            </button>
            {['critical', 'high', 'medium', 'low'].map(level => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize ${
                  filterLevel === level
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
                  onClick={() => setSortBy(sortBy === 'description' ? null : 'description')}>
                  Risk Description
                  {sortBy === 'description' && <ChevronUp className="h-4 w-4" />}
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Affected Asset</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Likelihood</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Impact</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Risk Level</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Recommended Control</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Owner</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Due Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedRisks.map((risk, idx) => (
              <tr key={risk.id || idx} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700 max-w-xs">{risk.description}</td>
                <td className="px-4 py-3 text-slate-700">{risk.asset}</td>
                <td className="px-4 py-3 text-slate-700">{risk.likelihood}</td>
                <td className="px-4 py-3 text-slate-700">{risk.impact}</td>
                <td className="px-4 py-3">
                  <Badge className={`text-xs font-semibold ${getRiskBadgeClass(risk.riskLevel)}`}>
                    {risk.riskLevel?.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-700 max-w-xs text-xs">{risk.control}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{risk.owner || '—'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{risk.dueDate || '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">
                    {risk.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-500">
        Showing {sortedRisks.length} of {risks.length} risks
      </div>
    </div>
  );
}
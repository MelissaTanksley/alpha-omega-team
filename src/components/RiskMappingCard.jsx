import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Target, Zap } from 'lucide-react';

export default function RiskMappingCard({ 
  asset, 
  threat, 
  risk, 
  control,
  riskLevel = 'medium',
  compact = false 
}) {
  const riskColors = {
    low: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  };

  const colors = riskColors[riskLevel] || riskColors.medium;

  if (compact) {
    return (
      <div className={`border ${colors.border} ${colors.bg} rounded-lg p-3 space-y-2`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Asset → Threat → Risk → Control</p>
          <Badge className={colors.badge} variant="outline">{riskLevel}</Badge>
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="bg-white rounded px-2 py-1.5">
            <p className="text-slate-500 font-semibold mb-0.5">Asset</p>
            <p className={`${colors.text} font-medium`}>{asset}</p>
          </div>
          <div className="bg-white rounded px-2 py-1.5">
            <p className="text-slate-500 font-semibold mb-0.5">Threat</p>
            <p className={`${colors.text} font-medium`}>{threat}</p>
          </div>
          <div className="bg-white rounded px-2 py-1.5">
            <p className="text-slate-500 font-semibold mb-0.5">Risk</p>
            <p className={`${colors.text} font-medium`}>{risk}</p>
          </div>
          <div className="bg-white rounded px-2 py-1.5">
            <p className="text-slate-500 font-semibold mb-0.5">Control</p>
            <p className={`${colors.text} font-medium`}>{control}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border ${colors.border} ${colors.bg}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Asset → Threat → Risk → Control</h3>
          <Badge className={colors.badge} variant="outline">{riskLevel}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Asset */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Asset</p>
            </div>
            <p className={`text-sm font-semibold ${colors.text}`}>{asset}</p>
          </div>

          {/* Threat */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Threat</p>
            </div>
            <p className={`text-sm font-semibold ${colors.text}`}>{threat}</p>
          </div>

          {/* Risk */}
          <div className="bg-white rounded-lg p-3 border border-slate-200 sm:col-span-2">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Resulting Risk</p>
            </div>
            <p className={`text-sm font-semibold ${colors.text}`}>{risk}</p>
          </div>

          {/* Control */}
          <div className="bg-white rounded-lg p-3 border border-slate-200 sm:col-span-2">
            <div className="flex items-center gap-2 mb-1.5">
              <Target className="h-4 w-4 text-emerald-600" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Recommended Control</p>
            </div>
            <p className={`text-sm font-semibold ${colors.text}`}>{control}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
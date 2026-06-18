import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Zap, Target, CheckCircle, Layers } from 'lucide-react';

export default function ComprehensiveRiskCard({ 
  asset, 
  threat, 
  risk, 
  control,
  nistFunctions = [],
  hipaaType = '',
  riskLevel = 'medium',
  compact = false
}) {
  const riskColors = {
    low: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  };

  const nistFunctionColors = {
    'Govern': 'bg-slate-100 text-slate-700',
    'Identify': 'bg-blue-100 text-blue-700',
    'Protect': 'bg-emerald-100 text-emerald-700',
    'Detect': 'bg-orange-100 text-orange-700',
    'Respond': 'bg-red-100 text-red-700',
    'Recover': 'bg-indigo-100 text-indigo-700',
  };

  const colors = riskColors[riskLevel] || riskColors.medium;

  if (compact) {
    return (
      <div className={`border-2 ${colors.border} ${colors.bg} rounded-lg p-4 space-y-3`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Complete Risk Assessment</p>
          <Badge className={colors.badge}>{riskLevel}</Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-0.5">Asset</p>
            <p className={`font-medium ${colors.text}`}>{asset}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-0.5">Threat</p>
            <p className={`font-medium ${colors.text}`}>{threat}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-0.5">Risk</p>
            <p className={`font-medium ${colors.text}`}>{risk}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-0.5">Control</p>
            <p className={`font-medium ${colors.text}`}>{control}</p>
          </div>
          {nistFunctions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">NIST CSF</p>
              <div className="flex flex-wrap gap-1">
                {nistFunctions.map((fn, i) => (
                  <Badge key={i} className={`${nistFunctionColors[fn]} text-xs`}>{fn}</Badge>
                ))}
              </div>
            </div>
          )}
          {hipaaType && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-0.5">HIPAA</p>
              <p className={`font-medium ${colors.text}`}>{hipaaType}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-2 ${colors.border} ${colors.bg}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: colors.border }}>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Complete Risk Assessment
          </h3>
          <Badge className={colors.badge} variant="outline">{riskLevel}</Badge>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Asset, Threat, Risk, Control */}
          <div className="space-y-4">
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
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Risk</p>
              </div>
              <p className={`text-sm font-semibold ${colors.text}`}>{risk}</p>
            </div>

            {/* Control */}
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Control</p>
              </div>
              <p className={`text-sm font-semibold ${colors.text}`}>{control}</p>
            </div>
          </div>

          {/* Right Column: Compliance Mappings */}
          <div className="space-y-4">
            {/* NIST CSF Functions */}
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-2.5">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">NIST CSF 2.0</p>
              </div>
              {nistFunctions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {nistFunctions.map((fn, i) => (
                    <Badge key={i} className={`${nistFunctionColors[fn]} text-xs font-semibold`}>
                      {fn}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No functions mapped</p>
              )}
            </div>

            {/* HIPAA Safeguards */}
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 mb-2.5">
                <Shield className="h-4 w-4 text-indigo-600" />
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">HIPAA Safeguard</p>
              </div>
              {hipaaType ? (
                <div>
                  <Badge className="bg-indigo-100 text-indigo-800 text-xs font-semibold mb-2">{hipaaType}</Badge>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {hipaaType === 'Technical Safeguards' && 'Access controls, encryption, audit logs, integrity verification'}
                    {hipaaType === 'Administrative Safeguards' && 'Workforce security, authorization, policies, training'}
                    {hipaaType === 'Physical Safeguards' && 'Facility access, equipment management, workstation security'}
                    {!['Technical Safeguards', 'Administrative Safeguards', 'Physical Safeguards'].includes(hipaaType) && hipaaType}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No safeguard type specified</p>
              )}
            </div>

            {/* Summary Box */}
            <div className={`${colors.bg} rounded-lg p-3 border ${colors.border}`}>
              <p className="text-xs font-semibold text-slate-700 mb-1.5">Assessment Summary</p>
              <p className={`text-xs leading-relaxed ${colors.text}`}>
                This {riskLevel} risk involves the {asset}. The mapped NIST and HIPAA controls provide structured mitigation pathways aligned with regulatory requirements.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
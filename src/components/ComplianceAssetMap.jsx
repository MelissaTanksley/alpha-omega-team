import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Building2, Zap } from 'lucide-react';

export default function ComplianceAssetMap({ 
  asset, 
  hipaaType = 'Technical',
  hipaaDescription = 'Data encryption, access controls',
  nistFunctions = ['Protect', 'Detect'],
  justification = 'Asset handles sensitive patient data requiring compliance controls.',
  compact = false 
}) {
  const hipaaTypeColors = {
    'Administrative': { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', icon: Shield },
    'Technical': { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', icon: Lock },
    'Physical': { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', icon: Building2 },
  };

  const nistFunctionColors = {
    'Govern': 'bg-slate-100 text-slate-700',
    'Identify': 'bg-blue-100 text-blue-700',
    'Protect': 'bg-emerald-100 text-emerald-700',
    'Detect': 'bg-orange-100 text-orange-700',
    'Respond': 'bg-red-100 text-red-700',
    'Recover': 'bg-indigo-100 text-indigo-700',
  };

  const colors = hipaaTypeColors[hipaaType] || hipaaTypeColors['Technical'];
  const HipaaIcon = colors.icon;

  if (compact) {
    return (
      <div className={`border ${colors.border} ${colors.bg} rounded-lg p-3 space-y-2`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Asset → Compliance Map</p>
          <Badge className={colors.badge} variant="outline">{hipaaType}</Badge>
        </div>
        <div className="bg-white rounded px-2 py-1.5">
          <p className="text-xs text-slate-600 font-semibold mb-1">Asset</p>
          <p className="text-sm font-bold text-slate-800">{asset}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded px-2 py-1.5">
            <p className="text-xs text-slate-600 font-semibold mb-1">HIPAA</p>
            <p className="text-xs font-medium text-slate-700">{hipaaType}</p>
          </div>
          <div className="bg-white rounded px-2 py-1.5">
            <p className="text-xs text-slate-600 font-semibold mb-1">NIST CSF</p>
            <div className="flex flex-wrap gap-1">
              {nistFunctions.slice(0, 2).map((fn, i) => (
                <span key={i} className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded">{fn}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-600 italic bg-white rounded px-2 py-1.5">{justification}</p>
      </div>
    );
  }

  return (
    <Card className={`border-2 ${colors.border} ${colors.bg}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
           <div>
             <CardTitle className="text-base flex items-center gap-2">
               <HipaaIcon className="h-5 w-5" />
               {asset}
             </CardTitle>
             <p className="text-xs text-slate-600 mt-1">Map protected assets to HIPAA safeguard types and<br/>NIST CSF functions with detailed justifications.</p>
          </div>
          <Badge className={colors.badge}>{hipaaType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* HIPAA Safeguard */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            HIPAA Safeguard
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">{hipaaType}</span>
              <Badge variant="outline" className={colors.badge}>{hipaaType}</Badge>
            </div>
            <p className="text-xs text-slate-600">{hipaaDescription}</p>
          </div>
        </div>

        {/* NIST CSF Functions */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            NIST CSF 2.0 Functions
          </p>
          <div className="flex flex-wrap gap-2">
            {nistFunctions.map((fn, i) => (
              <Badge key={i} className={`${nistFunctionColors[fn]} text-xs font-semibold`}>
                {fn}
              </Badge>
            ))}
          </div>
        </div>

        {/* Justification */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Compliance Justification</p>
          <p className="text-sm text-slate-700 leading-relaxed">{justification}</p>
        </div>
      </CardContent>
    </Card>
  );
}
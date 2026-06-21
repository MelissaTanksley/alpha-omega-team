import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from 'lucide-react';

export default function NISTExampleCard() {
  const example = {
    risk: 'AI hallucination in clinical charting',
    assets: ['AI Model', 'ePHI'],
    identify: {
      risk: 'AI hallucination in clinical charting',
      assets: ['AI Model', 'ePHI'],
    },
    protect: {
      control: 'Implement human review workflow',
    },
    detect: {
      monitor: 'Monitor for abnormal AI-generated outputs',
    },
    respond: {
      action: 'Escalate incorrect entries to clinician',
    },
    recover: {
      action: 'Validate corrected patient record and restore integrity',
    },
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3 justify-between">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              NIST CSF 2.0 Aligned Risk Example
            </CardTitle>
            <p className="text-xs text-slate-500 mt-2">Healthcare AI clinical documentation system</p>
          </div>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">Example</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* IDENTIFY */}
        <div className="border-l-4 border-l-blue-600 bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">🔍 Identify</p>
          <div className="space-y-1.5">
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1">Risk Identified</p>
              <p className="text-sm text-slate-800 font-medium">{example.identify.risk}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1">Assets Involved</p>
              <div className="flex flex-wrap gap-1.5">
                {example.identify.assets.map(asset => (
                  <span key={asset} className="text-xs bg-white text-blue-700 border border-blue-200 rounded-full px-2.5 py-1 font-medium">
                    {asset}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PROTECT */}
        <div className="border-l-4 border-l-emerald-600 bg-emerald-50 rounded-lg p-3">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">🛡️ Protect</p>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold">Recommended Control</p>
            <p className="text-sm text-slate-800">{example.protect.control}</p>
          </div>
        </div>

        {/* DETECT & RESPOND (Side by side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border-l-4 border-l-orange-600 bg-orange-50 rounded-lg p-3">
            <p className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-2">⚠️ Detect</p>
            <p className="text-sm text-slate-800">{example.detect.monitor}</p>
          </div>

          <div className="border-l-4 border-l-red-600 bg-red-50 rounded-lg p-3">
            <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">🚨 Respond</p>
            <p className="text-sm text-slate-800">{example.respond.action}</p>
          </div>
        </div>

        {/* RECOVER */}
        <div className="border-l-4 border-l-purple-600 bg-purple-50 rounded-lg p-3">
          <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">↩️ Recover</p>
          <p className="text-sm text-slate-800">{example.recover.action}</p>
        </div>

        {/* Summary Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600">
            This example shows how a single risk — assessed through structured questions, scored for likelihood and impact, and mapped to standards — is traced across all six NIST CSF 2.0 functions, from initial identification through recovery.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
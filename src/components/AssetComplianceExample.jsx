import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Shield, Lock, Eye } from 'lucide-react';

export default function AssetComplianceExample() {
  return (
    <Card className="border-2 border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              Example: ePHI in AI-Generated Clinical Notes
            </CardTitle>
            <p className="text-xs text-slate-600 mt-1">Real-world asset compliance mapping</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Asset */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Asset
          </p>
          <p className="text-sm font-semibold text-slate-800">ePHI stored in AI-generated clinical notes</p>
          <p className="text-xs text-slate-600 mt-1">Protected health information embedded in AI system output</p>
        </div>

        {/* HIPAA Safeguards */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            HIPAA Technical Safeguards
          </p>
          <div className="space-y-2">
            <div className="bg-purple-50 rounded px-2.5 py-1.5">
              <p className="text-sm font-semibold text-purple-900">Access Control (AC)</p>
              <p className="text-xs text-purple-700 mt-0.5">Role-based access to clinical notes, unique user identification, emergency access procedures</p>
            </div>
            <div className="bg-purple-50 rounded px-2.5 py-1.5">
              <p className="text-sm font-semibold text-purple-900">Integrity (IA)</p>
              <p className="text-xs text-purple-700 mt-0.5">Cryptographic mechanisms to ensure AI-generated content has not been altered, audit trail of modifications</p>
            </div>
          </div>
        </div>

        {/* NIST CSF Functions */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            NIST CSF 2.0 Functions
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-100 text-emerald-800 text-xs font-semibold">Protect (PR)</Badge>
            <Badge className="bg-orange-100 text-orange-800 text-xs font-semibold">Detect (DE)</Badge>
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-slate-700">
            <div>
              <strong className="text-emerald-700">Protect (PR):</strong> Implement encryption at rest/transit, access controls, enforce authentication for note access
            </div>
            <div>
              <strong className="text-orange-700">Detect (DE):</strong> Monitor unauthorized access attempts, audit logs of clinical note retrieval and modifications, anomaly detection in AI outputs
            </div>
          </div>
        </div>

        {/* Compliance Justification */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Compliance Justification</p>
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <strong>Why this asset is critical:</strong> Clinical notes containing ePHI are among the highest-value targets for breaches and are subject to strict HIPAA protections.
            </p>
            <p>
              <strong>AI-specific risk:</strong> AI-generated content introduces unique risks—hallucinations, prompt injection, or data leakage through model outputs. The system must ensure generated notes maintain data integrity and cannot expose unauthorized information.
            </p>
            <p>
              <strong>Control mapping:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 ml-2">
              <li><strong>Technical Safeguards</strong> (AC, IA) protect the asset from unauthorized access and tampering</li>
              <li><strong>Protect function</strong> establishes the baseline security controls</li>
              <li><strong>Detect function</strong> enables rapid identification of breaches or anomalies in AI outputs</li>
            </ul>
          </div>
        </div>

        {/* Control Recommendations */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Recommended Controls</p>
          <ul className="space-y-1 text-xs text-slate-700">
            <li>✓ Encrypt clinical notes at rest using AES-256 and in transit using TLS 1.2+</li>
            <li>✓ Implement role-based access control (RBAC) with principle of least privilege</li>
            <li>✓ Maintain comprehensive audit logs of all AI note generation and clinical staff access</li>
            <li>✓ Deploy AI output validation with human-in-the-loop review before notes are finalized</li>
            <li>✓ Conduct regular penetration testing and vulnerability assessments</li>
            <li>✓ Establish incident response procedures specific to AI-generated content tampering</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Shield, Play, Copy, RotateCcw, CheckCircle, AlertTriangle, ChevronDown, ChevronRight, Target, Zap, Loader2, Flame, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import RiskMappingCard from '@/components/RiskMappingCard';
import ComplianceAssetMap from '@/components/ComplianceAssetMap';
import ComprehensiveRiskCard from '@/components/ComprehensiveRiskCard';
import GRCReportGenerator from '@/components/GRCReportGenerator';

const EXAMPLE_INPUT = `System: AI clinical charting assistant in a hospital

Functions:
- Converts doctor-patient conversations to medical notes
- Integrates with EHR

Environment:
- HIPAA-regulated
- Low risk tolerance

Concerns:
- Hallucinated diagnoses
- ePHI leakage
- Unauthorized access`;

const VALIDATION_PROMPT = (input) => `You are a strict input validator for a healthcare AI GRC system.

Determine if the following input describes a real system (AI or non-AI) in a healthcare or regulated environment.

A VALID input must include at least:
- Some description of a system, tool, or technology
- Some indication of context, environment, or use case

An INVALID input is one that is:
- Random text, gibberish, or lorem ipsum
- A single word with no context
- Completely unrelated to any real system (e.g. "banana", "hello", "???")
- Too vague to derive any system type or environment

Respond with ONLY valid JSON, no prose:
{"valid": true} or {"valid": false, "reason": "brief explanation of what is missing"}

Input:
${input}`;

const GRC_PROMPT = (input) => `Act as a healthcare Governance, Risk, and Compliance (GRC) system.

Perform the following steps in order:

STEP 1 — RISK ANALYSIS (ISO 27005)
- Identify risks, threats, and vulnerabilities
- INCLUDE: Which asset is affected (e.g. AI Model, ePHI, EHR System, APIs, Third-Party Vendors)
- Include likelihood and impact (clinical, operational, legal)

STEP 2 — COMPLIANCE MAPPING
Map each risk to:
- HIPAA (Administrative, Technical, Physical Safeguards)
- HITECH
- NIST CSF 2.0 functions/categories
IMPORTANT: For each mapping, indicate which asset it protects

STEP 3 — CONTROL DESIGN
Recommend controls:
- Administrative
- Technical
- Physical
Include AI-specific protections (human oversight, monitoring, validation)
IMPORTANT: Link each control to the affected asset

STEP 4 — AUDIT CHECK
Validate:
- Every risk has an affected_asset specified
- Every risk has mappings
- Every mapping has controls
- Residual risk is included
- Flag any gaps (especially asset-to-control mappings missing)

STRICT RULES:
- Treat AI systems as high-risk
- Focus on healthcare (ePHI protection)
- No free-form text — output valid JSON only
- Use the exact structured output format below
- Every risk MUST include affected_asset field

OUTPUT FORMAT (return ONLY this JSON array, no prose, no markdown):
[
  {
    "risk": "",
    "affected_asset": "AI Model | ePHI | EHR System | APIs | Third-Party Vendors | (other asset name)",
    "impact": {
      "clinical": "",
      "operational": "",
      "legal": ""
    },
    "likelihood": "",
    "hipaa_mapping": ["HIPAA control mapped to this asset"],
    "hitech_mapping": ["HITECH mapping"],
    "nist_csf_mapping": ["NIST CSF function/category affecting this asset"],
    "controls": {
      "administrative": ["control description → [asset_affected]"],
      "technical": ["control description → [asset_affected]"],
      "physical": ["control description → [asset_affected]"]
    },
    "ai_safeguards": [],
    "residual_risk": "",
    "audit_notes": ""
  }
]

Input:
${input}`;

const RISK_MEASUREMENT_PROMPT = (input) => `You are a healthcare AI GRC analyst specializing in internal and external cyber risk measurement for AI systems in regulated healthcare environments.

Analyze the following system and generate a structured list of internal and external risk indicators based on:
- Internal: Access control weaknesses, insider misuse, misconfigured ePHI systems, AI model issues (hallucination, drift, incorrect outputs)
- External: Threat actors targeting healthcare, MITRE ATT&CK patterns, ransomware threats, third-party/vendor AI risks

For each risk, map to either NIST CSF 2.0 or HIPAA (whichever is most relevant).

IMPORTANT: Output ONLY a valid JSON object. No prose, no markdown. Use this exact structure:
{
  "internal_trend": "A one-sentence analytical statement starting with 'Internal risk exposure is...' based on the system's profile",
  "external_trend": "A one-sentence analytical statement starting with 'External threat exposure is...' based on the system's profile",
  "risks": [
    {
      "category": "Internal",
      "indicator": "",
      "risk_level": "Low|Medium|High",
      "description": "",
      "likelihood": "Low|Medium|High",
      "clinical_impact": "",
      "compliance_impact": "",
      "framework": "NIST CSF 2.0|HIPAA"
    }
  ]
}

Generate at least 3 internal risks and 3 external risks (6+ total). Be specific to the system described.

System Description:
${input}`;

const THREAT_PROMPT = (input) => `You are a healthcare AI security expert applying STRIDE threat modeling and MITRE ATT&CK concepts to AI systems in regulated healthcare environments.

Given the system description below, generate structured threat scenarios covering all STRIDE categories plus AI-specific threats.

STRIDE Categories to cover:
- Spoofing
- Tampering
- Repudiation
- Information Disclosure
- Denial of Service
- Elevation of Privilege

Also include AI-specific threats:
- Prompt Injection
- Model Hallucination
- Training Data Leakage
- Unauthorized AI Access

Output ONLY a valid JSON array. No prose, no markdown fences:
[
  {
    "threat_category": "",
    "scenario": "",
    "affected_asset": "",
    "impact": "",
    "related_frameworks": ["NIST CSF", "HIPAA"]
  }
]

System Description:
${input}`;

const STRIDE_COLORS = {
  'Spoofing': { bg: 'bg-purple-50', text: 'text-purple-800', badge: 'bg-purple-100 text-purple-700' },
  'Tampering': { bg: 'bg-red-50', text: 'text-red-800', badge: 'bg-red-100 text-red-700' },
  'Repudiation': { bg: 'bg-slate-50', text: 'text-slate-800', badge: 'bg-slate-100 text-slate-700' },
  'Information Disclosure': { bg: 'bg-amber-50', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-700' },
  'Denial of Service': { bg: 'bg-orange-50', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-700' },
  'Elevation of Privilege': { bg: 'bg-rose-50', text: 'text-rose-800', badge: 'bg-rose-100 text-rose-700' },
  'Prompt Injection': { bg: 'bg-blue-50', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-700' },
  'Model Hallucination': { bg: 'bg-indigo-50', text: 'text-indigo-800', badge: 'bg-indigo-100 text-indigo-700' },
  'Training Data Leakage': { bg: 'bg-teal-50', text: 'text-teal-800', badge: 'bg-teal-100 text-teal-700' },
  'Unauthorized AI Access': { bg: 'bg-pink-50', text: 'text-pink-800', badge: 'bg-pink-100 text-pink-700' },
};

// Score a threat by keywords in impact text — higher = more critical
function scoreThreat(item) {
  const text = (item.impact + ' ' + item.scenario).toLowerCase();
  let score = 0;
  if (/critical|severe|life.threat|fatality|death|irreversible/.test(text)) score += 4;
  if (/high|major|significant|serious/.test(text)) score += 3;
  if (/medium|moderate|potential/.test(text)) score += 2;
  if (/low|minor|limited/.test(text)) score += 1;
  // Boost AI-specific & high-impact categories
  const highPriority = ['Prompt Injection', 'Model Hallucination', 'Information Disclosure', 'Elevation of Privilege', 'Tampering'];
  if (highPriority.includes(item.threat_category)) score += 2;
  return score;
}

function Top3Threats({ threats }) {
  const top3 = [...threats].sort((a, b) => scoreThreat(b) - scoreThreat(a)).slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className="bg-red-950 border border-red-800 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-5 w-5 text-red-400" />
        <h3 className="text-white font-bold text-base">Top 3 Critical Threats</h3>
        <span className="text-xs text-red-400 ml-1">Ranked by impact & likelihood</span>
      </div>
      <div className="space-y-3">
        {top3.map((item, i) => {
          const colors = STRIDE_COLORS[item.threat_category] || { badge: 'bg-slate-100 text-slate-700' };
          return (
            <div key={i} className="bg-red-900/50 border border-red-800/60 rounded-lg p-3 flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{medals[i]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>{item.threat_category}</span>
                </div>
                <p className="text-red-100 text-sm font-medium leading-snug mb-1">{item.scenario}</p>
                <div className="flex flex-wrap gap-3 text-xs text-red-300">
                  <span><span className="text-red-500">Asset:</span> {item.affected_asset}</span>
                  <span><span className="text-red-500">Impact:</span> {item.impact}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ThreatCard({ item, index }) {
  const colors = STRIDE_COLORS[item.threat_category] || { bg: 'bg-slate-50', text: 'text-slate-800', badge: 'bg-slate-100 text-slate-700' };
  return (
    <div className={`border border-slate-200 rounded-xl p-4 ${colors.bg}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>{item.threat_category}</span>
            {(item.related_frameworks || []).map((f, i) => (
              <span key={i} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{f}</span>
            ))}
          </div>
          <p className={`text-sm font-medium mb-2 ${colors.text}`}>{item.scenario}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div className="bg-white/70 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400 mb-0.5">Affected Asset</p>
              <p className="text-xs text-slate-700 font-medium">{item.affected_asset}</p>
            </div>
            <div className="bg-white/70 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400 mb-0.5">Impact</p>
              <p className="text-xs text-slate-700 font-medium">{item.impact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const RISK_LEVEL_STYLES = {
  High: { badge: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
  Medium: { badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  Low: { badge: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
};

function RiskMeasurementResults({ data }) {
  const risks = data.risks || [];
  const internal = risks.filter(r => r.category === 'Internal');
  const external = risks.filter(r => r.category === 'External');

  // Rank top 3 by risk_level + likelihood combined score
  const levelScore = { High: 3, Medium: 2, Low: 1 };
  const ranked = [...risks].sort((a, b) =>
    (levelScore[b.risk_level] || 0) + (levelScore[b.likelihood] || 0) -
    ((levelScore[a.risk_level] || 0) + (levelScore[a.likelihood] || 0))
  ).slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];

  const RiskRow = ({ item }) => {
    const style = RISK_LEVEL_STYLES[item.risk_level] || RISK_LEVEL_STYLES.Low;
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${style.dot}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>{item.risk_level} Risk</span>
              <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{item.framework}</span>
              <span className="text-xs text-slate-400">Likelihood: {item.likelihood}</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">{item.indicator}</p>
            <p className="text-xs text-slate-600 mb-2">{item.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-400 mb-0.5">Clinical Impact</p>
                <p className="text-xs text-slate-700 font-medium">{item.clinical_impact}</p>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-400 mb-0.5">Compliance Impact</p>
                <p className="text-xs text-slate-700 font-medium">{item.compliance_impact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-blue-500 flex-shrink-0" />
        <p className="text-xs text-blue-800 font-medium">Near Real-Time Risk Insight (AI-generated) — This analysis is AI-driven analytical estimation, not live threat intelligence or real-time monitoring.</p>
      </div>

      {/* Trend Messages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <TrendingUp className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-900">{data.internal_trend}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <TrendingDown className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-900">{data.external_trend}</p>
        </div>
      </div>

      {/* Top 3 Highest Risks */}
      {ranked.length >= 3 && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-red-400" />
            <h3 className="text-white font-bold text-base">Top 3 Highest Risks</h3>
            <span className="text-xs text-slate-400 ml-1">Ranked by likelihood & impact</span>
          </div>
          <div className="space-y-3">
            {ranked.map((item, i) => {
              const style = RISK_LEVEL_STYLES[item.risk_level] || RISK_LEVEL_STYLES.Low;
              return (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{medals[i]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>{item.risk_level} · {item.category}</span>
                      <span className="text-xs text-slate-400">{item.framework}</span>
                    </div>
                    <p className="text-slate-100 text-sm font-medium leading-snug mb-1">{item.indicator}</p>
                    <p className="text-slate-400 text-xs">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Internal Risks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Internal Risk Indicators ({internal.length})</h3>
        </div>
        <div className="space-y-3">
          {internal.map((item, i) => <RiskRow key={i} item={item} />)}
        </div>
      </div>

      {/* External Risks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">External Risk Indicators ({external.length})</h3>
        </div>
        <div className="space-y-3">
          {external.map((item, i) => <RiskRow key={i} item={item} />)}
        </div>
      </div>
    </div>
  );
}

function RiskCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);

  const likelihoodColor = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }[item.likelihood?.toLowerCase()] || 'bg-slate-100 text-slate-700';

  const residualColor = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  }[item.residual_risk?.toLowerCase()] || 'text-slate-500';

  const assetColor = {
    'AI Model': 'bg-blue-100 text-blue-800',
    'ePHI': 'bg-red-100 text-red-800',
    'EHR System': 'bg-emerald-100 text-emerald-800',
    'APIs': 'bg-purple-100 text-purple-800',
    'Third-Party Vendors': 'bg-amber-100 text-amber-800',
  };
  const assetBg = Object.entries(assetColor).find(([key]) => item.affected_asset?.includes(key))?.[1] || 'bg-slate-100 text-slate-800';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{item.risk}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {item.affected_asset && <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${assetBg}`}>📍 {item.affected_asset}</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${likelihoodColor}`}>
              {item.likelihood}
            </span>
            <span className={`text-xs font-medium ${residualColor}`}>
              Residual: {item.residual_risk}
            </span>
          </div>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-4">
          {/* Comprehensive Risk Assessment */}
          <ComprehensiveRiskCard
            asset={item.affected_asset || 'Healthcare AI System'}
            threat={item.threat || item.risk}
            risk={item.risk}
            control={item.recommended_control || (item.controls?.administrative?.[0] || 'Review and implement controls')}
            nistFunctions={['Identify', 'Protect', 'Detect']}
            hipaaType={item.controls?.technical?.length > 0 ? 'Technical Safeguards' : item.controls?.administrative?.length > 0 ? 'Administrative Safeguards' : 'Physical Safeguards'}
            riskLevel={item.likelihood?.toLowerCase() || 'medium'}
            compact={false}
          />

          {/* Impact */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Impact</p>
            <div className="grid grid-cols-3 gap-2">
              {['clinical', 'operational', 'legal'].map(k => (
                <div key={k} className="bg-slate-50 rounded-lg p-2">
                  <p className="text-xs text-slate-400 capitalize mb-1">{k}</p>
                  <p className="text-xs text-slate-700">{item.impact?.[k] || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mappings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'HIPAA', key: 'hipaa_mapping', color: 'blue' },
              { label: 'HITECH', key: 'hitech_mapping', color: 'purple' },
              { label: 'NIST CSF 2.0', key: 'nist_csf_mapping', color: 'indigo' },
            ].map(({ label, key, color }) => (
              <div key={key}>
                <p className={`text-xs font-semibold text-${color}-700 mb-1`}>{label}</p>
                <ul className="space-y-0.5">
                  {(item[key] || []).map((m, i) => (
                    <li key={i} className={`text-xs bg-${color}-50 text-${color}-800 rounded px-2 py-1`}>{m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Controls (NIST CSF 2.0 Alignment) */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Controls (Protect & Detect Functions)</p>
            <div className="space-y-2">
              <div className="bg-emerald-50 rounded-lg p-3 border-l-4 border-l-emerald-600">
                <p className="text-xs font-semibold text-emerald-700 mb-1">🛡️ Protect Controls</p>
                <p className="text-xs text-slate-500 mb-2">Preventive measures aligned to NIST CSF Protect function</p>
                <ul className="space-y-0.5">
                  {(item.controls?.administrative || []).map((c, i) => (
                    <li key={i} className="text-xs bg-white text-emerald-800 rounded px-2 py-1 border border-emerald-200">• {c}</li>
                  ))}
                  {(item.controls?.technical || []).map((c, i) => (
                    <li key={i} className="text-xs bg-white text-emerald-800 rounded px-2 py-1 border border-emerald-200">• {c}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-l-orange-600">
                <p className="text-xs font-semibold text-orange-700 mb-1">⚠️ Detect Controls</p>
                <p className="text-xs text-slate-500 mb-2">Detective measures for monitoring & event logging</p>
                {(item.controls?.physical || []).length > 0 ? (
                  <ul className="space-y-0.5">
                    {(item.controls?.physical || []).map((c, i) => (
                      <li key={i} className="text-xs bg-white text-orange-800 rounded px-2 py-1 border border-orange-200">• {c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-orange-700">Consider adding monitoring, audit logging, and anomaly detection controls.</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Safeguards (Protect Function) */}
          {item.ai_safeguards?.length > 0 && (
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">🛡️ Protect: AI Safeguards</p>
              <div className="flex flex-wrap gap-1">
                {item.ai_safeguards.map((s, i) => (
                  <span key={i} className="text-xs bg-white text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Response & Recovery Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">🚨 Respond</p>
              <p className="text-xs text-red-700">If {item.risk?.toLowerCase()} is detected, escalate to incident management and clinician review immediately.</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">↩️ Recover</p>
              <p className="text-xs text-purple-700">Restore system to trusted state, validate outputs, and re-enable only after full investigation.</p>
            </div>
          </div>

          {/* Audit Notes */}
          {item.audit_notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">{item.audit_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GRCWorkspace() {
  const [input, setInput] = useState(EXAMPLE_INPUT);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [error, setError] = useState(null);
  const [rawJson, setRawJson] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('grc');
  const [threatLoading, setThreatLoading] = useState(false);
  const [threatResults, setThreatResults] = useState(null);
  const [threatError, setThreatError] = useState(null);
  const [riskMeasureLoading, setRiskMeasureLoading] = useState(false);
  const [riskMeasureResults, setRiskMeasureResults] = useState(null);
  const [riskMeasureError, setRiskMeasureError] = useState(null);

  const run = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    setValidationError(null);
    setRawJson(null);
    try {
      // Step 0: Validate input first
      const validationRaw = await base44.integrations.Core.InvokeLLM({ prompt: VALIDATION_PROMPT(input) });
      const validationCleaned = (typeof validationRaw === 'string' ? validationRaw : JSON.stringify(validationRaw))
        .replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      const validation = JSON.parse(validationCleaned);
      if (!validation.valid) {
        setValidationError(validation.reason || 'Input does not describe a valid system.');
        setLoading(false);
        return;
      }

      const raw = await base44.integrations.Core.InvokeLLM({ prompt: GRC_PROMPT(input) });
      // Strip markdown code fences if present
      const cleaned = (typeof raw === 'string' ? raw : JSON.stringify(raw))
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();
      setRawJson(cleaned);
      const parsed = JSON.parse(cleaned);
      setResults(parsed);
    } catch (e) {
      setError('Failed to parse GRC output. Try again or check the raw output below.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const runRiskMeasurement = async () => {
    setRiskMeasureLoading(true);
    setRiskMeasureResults(null);
    setRiskMeasureError(null);
    try {
      const validationRaw = await base44.integrations.Core.InvokeLLM({ prompt: VALIDATION_PROMPT(input) });
      const validationCleaned = (typeof validationRaw === 'string' ? validationRaw : JSON.stringify(validationRaw))
        .replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      const validation = JSON.parse(validationCleaned);
      if (!validation.valid) {
        setRiskMeasureError(validation.reason || 'Input does not describe a valid system.');
        setRiskMeasureLoading(false);
        return;
      }
      const raw = await base44.integrations.Core.InvokeLLM({ prompt: RISK_MEASUREMENT_PROMPT(input) });
      const cleaned = (typeof raw === 'string' ? raw : JSON.stringify(raw))
        .replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      setRiskMeasureResults(JSON.parse(cleaned));
    } catch (e) {
      setRiskMeasureError('Failed to generate risk measurement. Please try again.');
    } finally {
      setRiskMeasureLoading(false);
    }
  };

  const runThreatScenarios = async () => {
    setThreatLoading(true);
    setThreatResults(null);
    setThreatError(null);
    try {
      const validationRaw = await base44.integrations.Core.InvokeLLM({ prompt: VALIDATION_PROMPT(input) });
      const validationCleaned = (typeof validationRaw === 'string' ? validationRaw : JSON.stringify(validationRaw))
        .replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      const validation = JSON.parse(validationCleaned);
      if (!validation.valid) {
        setThreatError(validation.reason || 'Input does not describe a valid system.');
        setThreatLoading(false);
        return;
      }
      const raw = await base44.integrations.Core.InvokeLLM({ prompt: THREAT_PROMPT(input) });
      const cleaned = (typeof raw === 'string' ? raw : JSON.stringify(raw))
        .replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      setThreatResults(JSON.parse(cleaned));
    } catch (e) {
      setThreatError('Failed to generate threat scenarios. Please try again.');
    } finally {
      setThreatLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="p-2.5 bg-slate-900 rounded-xl flex-shrink-0">
          <Shield className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Healthcare Risk Analyzer</h1>
          <p className="text-slate-500 text-sm mt-0.5">ISO 27005 · HIPAA · HITECH · NIST CSF 2.0 — Structured AI Risk Analysis</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {['Risk Analysis', 'Compliance Mapping', 'Control Design', 'Audit Check'].map((s, i) => (
              <span key={s} className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                Step {i + 1}: {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Input Validation Callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-900">
        <p className="font-semibold">✓ Built-in input validation prevents invalid or unsafe risk assessments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('grc')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'grc' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Shield className="h-4 w-4" />
          GRC Analysis
        </button>
        <button
          onClick={() => setActiveTab('threats')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'threats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Target className="h-4 w-4" />
          Threat Scenarios
        </button>
        <button
          onClick={() => setActiveTab('riskmeasure')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'riskmeasure' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Activity className="h-4 w-4" />
          Risk Measurement
        </button>
      </div>

      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-700">System Description</label>
          <button onClick={() => setInput(EXAMPLE_INPUT)} className="text-xs text-blue-600 hover:underline">Load example</button>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={9}
          disabled={loading || threatLoading}
          placeholder="Describe your AI system, functions, environment, and concerns…"
          className="w-full text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 disabled:opacity-60"
        />
        <div className="flex items-center gap-3 mt-3">
          {activeTab === 'grc' ? (
            <>
              <Button onClick={run} disabled={loading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Play className="h-4 w-4" />
                {loading ? 'Analyzing…' : 'Run GRC Analysis'}
              </Button>
              {(results || validationError) && (
                <Button variant="ghost" onClick={() => { setResults(null); setRawJson(null); setError(null); setValidationError(null); }} disabled={loading} className="gap-2 text-slate-500">
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              )}
            </>
          ) : activeTab === 'threats' ? (
            <>
              <Button onClick={runThreatScenarios} disabled={threatLoading || !input.trim()} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <Zap className="h-4 w-4" />
                {threatLoading ? 'Generating…' : 'Generate Threat Scenarios'}
              </Button>
              {(threatResults || threatError) && (
                <Button variant="ghost" onClick={() => { setThreatResults(null); setThreatError(null); }} disabled={threatLoading} className="gap-2 text-slate-500">
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              )}
            </>
          ) : (
            <>
              <Button onClick={runRiskMeasurement} disabled={riskMeasureLoading || !input.trim()} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                <Activity className="h-4 w-4" />
                {riskMeasureLoading ? 'Analyzing…' : 'Analyze Internal & External Risks'}
              </Button>
              {(riskMeasureResults || riskMeasureError) && (
                <Button variant="ghost" onClick={() => { setRiskMeasureResults(null); setRiskMeasureError(null); }} disabled={riskMeasureLoading} className="gap-2 text-slate-500">
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── THREAT SCENARIOS TAB ── */}
      {activeTab === 'threats' && (
        <div className="space-y-4">
          {threatLoading && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
              <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Generating STRIDE + AI-specific threat scenarios…
            </div>
          )}
          {threatError && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 text-sm text-amber-800">
              <p className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> {threatError}
              </p>
            </div>
          )}
          {threatResults && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <p className="font-semibold text-slate-800">{threatResults.length} Threat Scenario{threatResults.length !== 1 ? 's' : ''} Generated</p>
                <span className="text-xs text-slate-400 ml-1">STRIDE + AI-specific</span>
              </div>
              {threatResults.length >= 3 && <Top3Threats threats={threatResults} />}
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-1">All Threat Scenarios</p>
              {threatResults.map((item, i) => <ThreatCard key={i} item={item} index={i} />)}
            </div>
          )}
          {!threatLoading && !threatResults && !threatError && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
              <Target className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="font-medium mb-1">No threat scenarios yet</p>
              <p className="text-xs text-slate-400">Enter a system description above and click "Generate Threat Scenarios"</p>
            </div>
          )}
        </div>
      )}

      {/* ── RISK MEASUREMENT TAB ── */}
      {activeTab === 'riskmeasure' && (
        <div className="space-y-4">
          {riskMeasureLoading && (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-5 text-orange-700 text-sm">
              <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Analyzing internal and external risk indicators…
            </div>
          )}
          {riskMeasureError && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 text-sm text-amber-800">
              <p className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> {riskMeasureError}
              </p>
            </div>
          )}
          {riskMeasureResults && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <p className="font-semibold text-slate-800">{(riskMeasureResults.risks || []).length} Risk Indicators Identified</p>
                <span className="text-xs text-slate-400 ml-1">Internal & External</span>
              </div>
              <RiskMeasurementResults data={riskMeasureResults} />
            </div>
          )}
          {!riskMeasureLoading && !riskMeasureResults && !riskMeasureError && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
              <Activity className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="font-medium mb-1">No risk measurement yet</p>
              <p className="text-xs text-slate-400">Enter a system description above and click "Analyze Internal & External Risks"</p>
            </div>
          )}
        </div>
      )}

      {/* ── GRC ANALYSIS TAB ── */}
      {activeTab === 'grc' && (
        <div className="space-y-4">
          {/* Validation Error */}
          {validationError && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 text-sm text-amber-800">
              <p className="font-semibold mb-1 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Input Validation Failed
              </p>
              <p className="mb-3">{validationError}</p>
              <p className="font-medium text-amber-700 mb-1">Please provide:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700 mb-3">
                <li>A description of the system or tool</li>
                <li>The environment (e.g. hospital, clinic, payer)</li>
                <li>AI functionality or use case (if applicable)</li>
              </ul>
              <p className="text-xs text-amber-600 italic">Example: "AI clinical charting assistant used in a hospital to convert conversations to medical notes"</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-5 text-blue-700 text-sm">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Validating input, then running 4-step GRC analysis — Risk → Compliance → Controls → Audit…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              <p className="font-semibold mb-1">Parse Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <p className="font-semibold text-slate-800">{results.length} Risk{results.length !== 1 ? 's' : ''} Identified</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowRaw(!showRaw)} className="text-xs text-slate-500 hover:text-slate-700 underline">
                    {showRaw ? 'Hide' : 'Show'} raw JSON
                  </button>
                  <button onClick={handleCopy} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <Copy className="h-3 w-3" /> {copied ? 'Copied!' : 'Copy JSON'}
                  </button>
                </div>
              </div>

              {showRaw && (
                <pre className="bg-slate-900 text-green-300 text-xs p-4 rounded-xl overflow-auto max-h-72 font-mono border border-slate-700">
                  {rawJson}
                </pre>
              )}

              {/* NIST CSF 2.0 Lifecycle Summary */}
              <div className="bg-slate-100 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Aligned to NIST CSF 2.0 Lifecycle</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    { name: 'Govern', icon: '⚙️', color: 'bg-slate-200' },
                    { name: 'Identify', icon: '🔍', color: 'bg-blue-200' },
                    { name: 'Protect', icon: '🛡️', color: 'bg-emerald-200' },
                    { name: 'Detect', icon: '⚠️', color: 'bg-orange-200' },
                    { name: 'Respond', icon: '🚨', color: 'bg-red-200' },
                    { name: 'Recover', icon: '↩️', color: 'bg-purple-200' },
                  ].map(fn => (
                    <div key={fn.name} className={`${fn.color} rounded-lg p-2 text-center text-xs font-semibold text-slate-700`}>
                      <div className="text-lg">{fn.icon}</div>
                      <div>{fn.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {results.map((item, i) => <RiskCard key={i} item={item} index={i} />)}
              </div>

              {/* Report Generator */}
              <GRCReportGenerator results={results} systemDescription={input} />

              {/* Next steps after GRC results */}
              <div className="mt-6 border-t border-slate-200 pt-6 space-y-3">
                {/* Risk Measurement CTA */}
                <div className="bg-slate-900 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Activity className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Risk Measurement & Monitoring</p>
                      <p className="text-slate-400 text-xs mt-0.5">Internal & external risk indicators — where risks come from and how they evolve</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => { setActiveTab('riskmeasure'); runRiskMeasurement(); }}
                    disabled={riskMeasureLoading}
                    className="bg-orange-600 hover:bg-orange-700 text-white gap-2 flex-shrink-0"
                  >
                    {riskMeasureLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <><Activity className="h-4 w-4" /> Analyze Internal & External Risks</>}
                  </Button>
                </div>
                {/* Threat Scenarios CTA */}
                <div className="bg-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Generate Threat Scenarios</p>
                      <p className="text-slate-400 text-xs mt-0.5">STRIDE categories + AI-specific risks based on this system</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => { setActiveTab('threats'); runThreatScenarios(); }}
                    disabled={threatLoading}
                    className="bg-red-600 hover:bg-red-700 text-white gap-2 flex-shrink-0"
                  >
                    {threatLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Zap className="h-4 w-4" /> Generate Threat Scenarios</>}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Raw fallback when parse fails */}
          {error && rawJson && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Raw Output</p>
              <pre className="bg-slate-900 text-green-300 text-xs p-4 rounded-xl overflow-auto max-h-72 font-mono border border-slate-700">
                {rawJson}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
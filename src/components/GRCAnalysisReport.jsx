import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Shield, AlertTriangle, CheckCircle, FileText, Copy } from 'lucide-react';

const RISK_LEVEL_MAP = {
  low: { label: 'Low', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  medium: { label: 'Medium', badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  high: { label: 'High', badge: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  critical: { label: 'Critical', badge: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
};

const ASSET_COLORS = {
  'AI Model': 'bg-blue-100 text-blue-800',
  'ePHI': 'bg-red-100 text-red-800',
  'EHR System': 'bg-emerald-100 text-emerald-800',
  'APIs': 'bg-purple-100 text-purple-800',
  'Third-Party Vendors': 'bg-amber-100 text-amber-800',
};

function getAssetColor(asset) {
  return Object.entries(ASSET_COLORS).find(([k]) => asset?.includes(k))?.[1] || 'bg-slate-100 text-slate-700';
}

function getRiskStyle(likelihood) {
  return RISK_LEVEL_MAP[likelihood?.toLowerCase()] || RISK_LEVEL_MAP.medium;
}

function SectionHeader({ icon, title, subtitle, color = 'blue' }) {
  return (
    <div className={`flex items-center gap-3 pb-3 border-b border-slate-200 mb-4`}>
      <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center text-sm`}>{icon}</div>
      <div>
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function RiskRow({ item, index }) {
  const [open, setOpen] = useState(false);
  const style = getRiskStyle(item.likelihood);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <span className="flex-shrink-0 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-snug mb-1.5">{item.risk}</p>
          <div className="flex flex-wrap items-center gap-2">
            {item.affected_asset && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getAssetColor(item.affected_asset)}`}>
                {item.affected_asset}
              </span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${style.badge}`}>
              {item.likelihood} likelihood
            </span>
            <span className="text-xs text-slate-400">Residual: <span className="font-medium text-slate-600">{item.residual_risk}</span></span>
          </div>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-4">
          {/* Impact */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Impact</p>
            <div className="grid grid-cols-3 gap-2">
              {['clinical', 'operational', 'legal'].map(k => (
                <div key={k} className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <p className="text-xs text-slate-400 capitalize mb-1">{k}</p>
                  <p className="text-xs text-slate-700 font-medium leading-snug">{item.impact?.[k] || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Mappings */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Compliance Mapping</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {[
                { label: 'HIPAA', key: 'hipaa_mapping', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-100' },
                { label: 'HITECH', key: 'hitech_mapping', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-100' },
                { label: 'NIST CSF 2.0', key: 'nist_csf_mapping', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-100' },
              ].map(({ label, key, bg, text, border }) => (
                <div key={key} className={`${bg} border ${border} rounded-lg p-3`}>
                  <p className={`text-xs font-bold ${text} mb-2`}>{label}</p>
                  <ul className="space-y-1">
                    {(item[key] || []).map((m, i) => (
                      <li key={i} className={`text-xs ${text} leading-snug`}>• {m}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Controls</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {[
                { label: '🛡️ Administrative', key: 'administrative', color: 'emerald' },
                { label: '⚙️ Technical', key: 'technical', color: 'cyan' },
                { label: '🏢 Physical', key: 'physical', color: 'slate' },
              ].map(({ label, key, color }) => (
                <div key={key} className={`bg-${color}-50 border border-${color}-100 rounded-lg p-3`}>
                  <p className={`text-xs font-bold text-${color}-700 mb-1.5`}>{label}</p>
                  <ul className="space-y-1">
                    {(item.controls?.[key] || []).map((c, i) => (
                      <li key={i} className={`text-xs text-${color}-800 leading-snug`}>• {c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* AI Safeguards */}
          {item.ai_safeguards?.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs font-bold text-blue-700 mb-2">🤖 AI-Specific Safeguards</p>
              <div className="flex flex-wrap gap-1.5">
                {item.ai_safeguards.map((s, i) => (
                  <span key={i} className="text-xs bg-white text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Audit Note */}
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

export default function GRCAnalysisReport({ results, rawJson, onCopy, copied }) {
  const [showRaw, setShowRaw] = useState(false);

  if (!results || results.length === 0) return null;

  const highCount = results.filter(r => ['high', 'critical'].includes(r.likelihood?.toLowerCase())).length;
  const medCount = results.filter(r => r.likelihood?.toLowerCase() === 'medium').length;
  const lowCount = results.filter(r => r.likelihood?.toLowerCase() === 'low').length;

  const allNist = [...new Set(results.flatMap(r => r.nist_csf_mapping || []))];
  const allHipaa = [...new Set(results.flatMap(r => r.hipaa_mapping || []))];

  const topControls = results.flatMap(r => [
    ...(r.controls?.administrative || []),
    ...(r.controls?.technical || []),
  ]).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* ── REPORT HEADER ── */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <p className="text-emerald-400 text-sm font-semibold">Analysis Complete</p>
            </div>
            <h2 className="text-xl font-bold mb-1">GRC Risk Analysis Report</h2>
            <p className="text-slate-400 text-sm">ISO 27005 · HIPAA · HITECH · NIST CSF 2.0</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold text-white">{results.length}</div>
            <div className="text-slate-400 text-xs">Risks Identified</div>
          </div>
        </div>

        {/* Risk Summary Bar */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-300">{highCount}</div>
            <div className="text-xs text-red-400 mt-0.5">High / Critical</div>
          </div>
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-300">{medCount}</div>
            <div className="text-xs text-amber-400 mt-0.5">Medium</div>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-300">{lowCount}</div>
            <div className="text-xs text-emerald-400 mt-0.5">Low</div>
          </div>
        </div>
      </div>

      {/* ── NIST CSF LIFECYCLE ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <SectionHeader icon="🔄" title="NIST CSF 2.0 Lifecycle Alignment" subtitle="All identified risks are mapped across the full governance lifecycle" />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { name: 'Govern', icon: '⚙️', color: 'bg-slate-100 text-slate-700' },
            { name: 'Identify', icon: '🔍', color: 'bg-blue-100 text-blue-700' },
            { name: 'Protect', icon: '🛡️', color: 'bg-emerald-100 text-emerald-700' },
            { name: 'Detect', icon: '⚠️', color: 'bg-orange-100 text-orange-700' },
            { name: 'Respond', icon: '🚨', color: 'bg-red-100 text-red-700' },
            { name: 'Recover', icon: '↩️', color: 'bg-purple-100 text-purple-700' },
          ].map(fn => (
            <div key={fn.name} className={`${fn.color} rounded-xl p-2.5 text-center`}>
              <div className="text-xl mb-1">{fn.icon}</div>
              <div className="text-xs font-semibold">{fn.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMPLIANCE COVERAGE SUMMARY ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <SectionHeader icon="📜" title="HIPAA Safeguards Mapped" color="blue" />
          <ul className="space-y-1.5">
            {allHipaa.slice(0, 6).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                {item}
              </li>
            ))}
            {allHipaa.length > 6 && <li className="text-xs text-slate-400">+{allHipaa.length - 6} more…</li>}
          </ul>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <SectionHeader icon="🔐" title="NIST CSF Controls Identified" color="indigo" />
          <ul className="space-y-1.5">
            {allNist.slice(0, 6).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-indigo-500 mt-0.5 flex-shrink-0">•</span>
                {item}
              </li>
            ))}
            {allNist.length > 6 && <li className="text-xs text-slate-400">+{allNist.length - 6} more…</li>}
          </ul>
        </div>
      </div>

      {/* ── TOP RECOMMENDATIONS ── */}
      {topControls.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <SectionHeader icon="✅" title="Top Priority Controls" subtitle="Key administrative and technical controls identified across all risks" color="emerald" />
          <div className="space-y-2">
            {topControls.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 leading-snug">{c}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DETAILED RISK REGISTER ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <SectionHeader icon="📋" title="Risk Register" subtitle="Click any risk to expand full details, controls, and compliance mapping" color="orange" />
        <div className="space-y-2">
          {results.map((item, i) => <RiskRow key={i} item={item} index={i} />)}
        </div>
      </div>

      {/* ── RAW JSON TOGGLE ── */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setShowRaw(!showRaw)} className="text-xs text-slate-400 hover:text-slate-600 underline">
          {showRaw ? 'Hide' : 'Show'} raw JSON
        </button>
        <button onClick={onCopy} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
          <Copy className="h-3 w-3" /> {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>
      {showRaw && (
        <pre className="bg-slate-900 text-green-300 text-xs p-4 rounded-xl overflow-auto max-h-72 font-mono border border-slate-700">
          {rawJson}
        </pre>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Shield, AlertTriangle, Copy, FileText, Download, RotateCcw, ClipboardList } from 'lucide-react';

const LIKELIHOOD_CONFIG = {
  critical: { label: 'Critical', bar: 'bg-red-600', text: 'text-red-700', badge: 'bg-red-100 text-red-800 border border-red-200' },
  high:     { label: 'High',     bar: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800 border border-orange-200' },
  medium:   { label: 'Medium',   bar: 'bg-amber-400',  text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800 border border-amber-200' },
  low:      { label: 'Low',      bar: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
};

function getLikelihood(val) {
  return LIKELIHOOD_CONFIG[val?.toLowerCase()] || LIKELIHOOD_CONFIG.medium;
}

const ASSET_BADGE = {
  'AI Model': 'bg-blue-100 text-blue-800',
  'ePHI': 'bg-red-100 text-red-800',
  'EHR System': 'bg-emerald-100 text-emerald-800',
  'APIs': 'bg-purple-100 text-purple-800',
  'Third-Party Vendors': 'bg-amber-100 text-amber-800',
};
function assetBadge(asset) {
  return Object.entries(ASSET_BADGE).find(([k]) => asset?.includes(k))?.[1] || 'bg-slate-100 text-slate-700';
}

// Derive overall risk from distribution
function overallRisk(results) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  results.forEach(r => { const k = r.likelihood?.toLowerCase(); if (k in counts) counts[k]++; });
  if (counts.critical > 0) return 'Critical';
  if (counts.high >= 2) return 'High';
  if (counts.high === 1) return 'Elevated';
  if (counts.medium >= 2) return 'Medium';
  return 'Low';
}

const OVERALL_STYLE = {
  Critical: { bg: 'bg-red-600', text: 'text-white', label: 'CRITICAL' },
  High:     { bg: 'bg-orange-500', text: 'text-white', label: 'HIGH' },
  Elevated: { bg: 'bg-orange-400', text: 'text-white', label: 'ELEVATED' },
  Medium:   { bg: 'bg-amber-400',  text: 'text-white', label: 'MEDIUM' },
  Low:      { bg: 'bg-emerald-500', text: 'text-white', label: 'LOW' },
};

function SectionLabel({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </span>
      <h3 className="text-base font-bold text-slate-900 tracking-tight uppercase">{title}</h3>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function RiskRow({ item, index }) {
  const [open, setOpen] = useState(false);
  const lc = getLikelihood(item.likelihood);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <span className="w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500 flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-snug">{item.risk}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {item.affected_asset && (
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${assetBadge(item.affected_asset)}`}>
                {item.affected_asset}
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${lc.badge}`}>
              {lc.label}
            </span>
            {item.residual_risk && (
              <span className="text-xs text-slate-400">Residual risk: <span className="font-medium text-slate-600 capitalize">{item.residual_risk}</span></span>
            )}
          </div>
        </div>
        {open
          ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
          : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 space-y-4">
          {/* Impact */}
          <div className="grid grid-cols-3 gap-3">
            {['clinical', 'operational', 'legal'].map(k => (
              <div key={k} className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 capitalize">{k} Impact</p>
                <p className="text-xs text-slate-700 leading-snug">{item.impact?.[k] || '—'}</p>
              </div>
            ))}
          </div>

          {/* Compliance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'HIPAA', key: 'hipaa_mapping', cls: 'border-l-blue-500' },
              { label: 'HITECH', key: 'hitech_mapping', cls: 'border-l-purple-500' },
              { label: 'NIST CSF 2.0', key: 'nist_csf_mapping', cls: 'border-l-indigo-500' },
            ].map(({ label, key, cls }) => (
              <div key={key} className={`bg-white border border-slate-200 border-l-4 ${cls} rounded-lg p-3`}>
                <p className="text-xs font-bold text-slate-600 mb-2">{label}</p>
                <ul className="space-y-1">
                  {(item[key] || []).map((m, i) => (
                    <li key={i} className="text-xs text-slate-600 leading-snug">• {m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Administrative', key: 'administrative', dot: 'bg-emerald-500' },
              { label: 'Technical', key: 'technical', dot: 'bg-cyan-500' },
              { label: 'Physical', key: 'physical', dot: 'bg-slate-400' },
            ].map(({ label, key, dot }) => (
              <div key={key} className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                  <p className="text-xs font-bold text-slate-600">{label} Controls</p>
                </div>
                <ul className="space-y-1">
                  {(item.controls?.[key] || []).map((c, i) => (
                    <li key={i} className="text-xs text-slate-600 leading-snug">• {c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* AI Safeguards */}
          {item.ai_safeguards?.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs font-bold text-blue-700 mb-2">AI-Specific Safeguards</p>
              <div className="flex flex-wrap gap-1.5">
                {item.ai_safeguards.map((s, i) => (
                  <span key={i} className="text-xs bg-white text-blue-700 border border-blue-200 rounded px-2 py-0.5">{s}</span>
                ))}
              </div>
            </div>
          )}

          {item.audit_notes && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">{item.audit_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GRCAnalysisReport({ results, rawJson, onCopy, copied, onReset }) {
  const [showRaw, setShowRaw] = useState(false);

  if (!results || results.length === 0) return null;

  const overall = overallRisk(results);
  const overallStyle = OVERALL_STYLE[overall];

  const highCount = results.filter(r => ['high', 'critical'].includes(r.likelihood?.toLowerCase())).length;
  const medCount  = results.filter(r => r.likelihood?.toLowerCase() === 'medium').length;
  const lowCount  = results.filter(r => r.likelihood?.toLowerCase() === 'low').length;

  const topRisks = [...results]
    .sort((a, b) => {
      const order = { critical: 4, high: 3, medium: 2, low: 1 };
      return (order[b.likelihood?.toLowerCase()] || 0) - (order[a.likelihood?.toLowerCase()] || 0);
    })
    .slice(0, 3);

  const topControls = results.flatMap(r => [
    ...(r.controls?.administrative || []),
    ...(r.controls?.technical || []),
  ]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);

  const allHipaa = [...new Set(results.flatMap(r => r.hipaa_mapping || []))];
  const allNist  = [...new Set(results.flatMap(r => r.nist_csf_mapping || []))];

  const downloadBrief = () => {
    const overall = overallRisk(results);
    const lines = [
      'GRC RISK ASSESSMENT — EXECUTIVE BRIEF',
      '======================================',
      `Overall Risk Level: ${overall.toUpperCase()}`,
      `Total Risks Identified: ${results.length}`,
      '',
      'TOP 3 RISKS',
      '-----------',
      ...topRisks.map((r, i) => `${i + 1}. [${r.likelihood?.toUpperCase()}] ${r.risk} (Asset: ${r.affected_asset || 'N/A'})`),
      '',
      'CONTROL PRIORITIES',
      '------------------',
      ...topControls.map((c, i) => `${i + 1}. ${c}`),
      '',
      `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      'AI Risk Navigator for Healthcare | Confidential',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GRC_Executive_Brief.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyReport = () => {
    const overall = overallRisk(results);
    const text = [
      `GRC Risk Assessment Report — Overall Risk: ${overall}`,
      `${results.length} risks identified.`,
      '',
      'Top Risks:',
      ...topRisks.map((r, i) => `  ${i + 1}. ${r.risk} [${r.likelihood}]`),
      '',
      'Control Priorities:',
      ...topControls.map((c, i) => `  ${i + 1}. ${c}`),
    ].join('\n');
    navigator.clipboard.writeText(text);
    onCopy();
  };

  return (
    <div className="space-y-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

      {/* ── COVER / HEADER ── */}
      <div className="bg-slate-900 px-8 py-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-blue-400" />
              <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Confidential — For Internal Use</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
              GRC Risk Assessment Report
            </h2>
            <p className="text-slate-400 text-sm">ISO 27005 · HIPAA · HITECH · NIST CSF 2.0</p>
          </div>
          <FileText className="h-8 w-8 text-slate-600 flex-shrink-0 mt-1" />
        </div>

        {/* Overall Risk Level — prominent */}
        <div className="mt-6 flex items-center gap-4">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">Overall Risk Level</p>
            <span className={`inline-block px-5 py-2 rounded-lg text-lg font-bold tracking-wide ${overallStyle.bg} ${overallStyle.text}`}>
              {overallStyle.label}
            </span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-3 ml-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{highCount}</div>
              <div className="text-xs text-slate-500 mt-0.5">High / Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{medCount}</div>
              <div className="text-xs text-slate-500 mt-0.5">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{lowCount}</div>
              <div className="text-xs text-slate-500 mt-0.5">Low</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTION BAR ── */}
      <div className="border-b border-slate-200 bg-slate-50 px-8 py-3 flex flex-wrap items-center gap-2">
        <button
          onClick={downloadBrief}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Executive Brief
        </button>
        <button
          onClick={copyReport}
          className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 transition-colors"
        >
          <ClipboardList className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy Report'}
        </button>
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-500 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 transition-colors ml-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Run New Analysis
          </button>
        )}
      </div>

      <div className="px-8 py-8 space-y-10">

        {/* ── EXECUTIVE SUMMARY ── */}
        <section className="bg-blue-950 border border-blue-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-400">Executive Summary</span>
            <div className="flex-1 h-px bg-blue-800" />
          </div>

          {/* Risk Level + Recommendation row */}
          <div className="flex flex-col sm:flex-row gap-5 mb-5">
            <div className="flex-shrink-0">
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1.5">Overall Risk Level</p>
              <span className={`inline-block px-6 py-2.5 rounded-lg text-xl font-extrabold tracking-wide ${overallStyle.bg} ${overallStyle.text}`}>
                {overallStyle.label}
              </span>
            </div>
            <div className="flex-1 border-l border-blue-800 pl-5">
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1.5">Key Recommendation</p>
              <p className="text-sm text-blue-100 leading-relaxed">
                {topControls[0]
                  ? `Immediate action required: ${topControls[0]}${topControls[1] ? ` Additionally, prioritize: ${topControls[1]}` : ''}`
                  : 'Implement identified controls in priority order, focusing on high-likelihood risks with clinical impact.'}
              </p>
            </div>
          </div>

          {/* Top 3 Risks inline */}
          <div>
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-3">Top 3 Risks</p>
            <div className="space-y-2">
              {topRisks.map((item, i) => {
                const lc = getLikelihood(item.likelihood);
                return (
                  <div key={i} className="flex items-start gap-3 bg-blue-900/50 border border-blue-800/60 rounded-lg px-4 py-3">
                    <span className="text-blue-500 font-bold text-sm flex-shrink-0 w-4">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${lc.badge}`}>{lc.label}</span>
                        {item.affected_asset && (
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${assetBadge(item.affected_asset)}`}>
                            {item.affected_asset}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-blue-100 font-medium leading-snug">{item.risk}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECTION 1: TOP RISKS ── */}
        <section>
          <SectionLabel number="1" title="Top Risks" />
          <div className="space-y-3">
            {topRisks.map((item, i) => {
              const lc = getLikelihood(item.likelihood);
              return (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${lc.bar}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${lc.badge}`}>{lc.label}</span>
                      {item.affected_asset && (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${assetBadge(item.affected_asset)}`}>
                          {item.affected_asset}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{item.risk}</p>
                    {item.impact?.clinical && (
                      <p className="text-xs text-slate-500 mt-1">Clinical: {item.impact.clinical}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 2: CONTROL PRIORITIES ── */}
        {topControls.length > 0 && (
          <section>
            <SectionLabel number="2" title="Control Priorities" />
            <div className="space-y-2">
              {topControls.map((c, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-b-0">
                  <span className="w-6 h-6 rounded-full border-2 border-slate-900 text-slate-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed">{c}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SECTION 3: COMPLIANCE COVERAGE ── */}
        <section>
          <SectionLabel number="3" title="Compliance Coverage" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">HIPAA Safeguards</p>
              <ul className="space-y-2">
                {allHipaa.slice(0, 6).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-blue-500 font-bold mt-0.5 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
                {allHipaa.length > 6 && <li className="text-xs text-slate-400 italic">+{allHipaa.length - 6} additional controls identified</li>}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">NIST CSF 2.0</p>
              <ul className="space-y-2">
                {allNist.slice(0, 6).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-indigo-500 font-bold mt-0.5 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
                {allNist.length > 6 && <li className="text-xs text-slate-400 italic">+{allNist.length - 6} additional mappings identified</li>}
              </ul>
            </div>
          </div>

          {/* NIST Lifecycle Bar */}
          <div className="mt-6 flex items-center gap-0 rounded-xl overflow-hidden border border-slate-200">
            {[
              { name: 'Govern', color: 'bg-slate-700' },
              { name: 'Identify', color: 'bg-blue-600' },
              { name: 'Protect', color: 'bg-emerald-600' },
              { name: 'Detect', color: 'bg-orange-500' },
              { name: 'Respond', color: 'bg-red-600' },
              { name: 'Recover', color: 'bg-purple-600' },
            ].map((fn, i, arr) => (
              <div
                key={fn.name}
                className={`flex-1 ${fn.color} text-white text-center py-2.5 ${i < arr.length - 1 ? 'border-r border-white/20' : ''}`}
              >
                <p className="text-xs font-bold">{fn.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 4: FULL RISK REGISTER ── */}
        <section>
          <SectionLabel number="4" title={`Risk Register — ${results.length} Risks Identified`} />
          <div className="space-y-2">
            {results.map((item, i) => <RiskRow key={i} item={item} index={i} />)}
          </div>
        </section>

        {/* ── FOOTER / RAW JSON ── */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
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
    </div>
  );
}
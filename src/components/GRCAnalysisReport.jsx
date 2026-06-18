import React, { useState } from 'react';
import { Shield, AlertTriangle, Copy, FileText, Download, RotateCcw, ClipboardList, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────

const RISK_STYLE = {
  critical: { label: 'Critical', bar: 'bg-red-600',     badge: 'bg-red-100 text-red-800 border border-red-200',       dot: 'bg-red-600' },
  high:     { label: 'High',     bar: 'bg-orange-500',  badge: 'bg-orange-100 text-orange-800 border border-orange-200', dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   bar: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-800 border border-amber-200',   dot: 'bg-amber-400' },
  low:      { label: 'Low',      bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200', dot: 'bg-emerald-500' },
};
function riskStyle(val) { return RISK_STYLE[val?.toLowerCase()] || RISK_STYLE.medium; }

const OVERALL_STYLE = {
  Critical: { bg: 'bg-red-600',     text: 'text-white', ring: 'ring-red-500',     glow: 'shadow-red-900/40' },
  High:     { bg: 'bg-orange-500',  text: 'text-white', ring: 'ring-orange-500',  glow: 'shadow-orange-900/40' },
  Elevated: { bg: 'bg-orange-400',  text: 'text-white', ring: 'ring-orange-400',  glow: 'shadow-orange-900/30' },
  Medium:   { bg: 'bg-amber-400',   text: 'text-white', ring: 'ring-amber-400',   glow: 'shadow-amber-900/30' },
  Low:      { bg: 'bg-emerald-500', text: 'text-white', ring: 'ring-emerald-500', glow: 'shadow-emerald-900/30' },
};

function overallRisk(results) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  results.forEach(r => { const k = r.likelihood?.toLowerCase(); if (k in counts) counts[k]++; });
  if (counts.critical > 0) return 'Critical';
  if (counts.high >= 2)    return 'High';
  if (counts.high === 1)   return 'Elevated';
  if (counts.medium >= 2)  return 'Medium';
  return 'Low';
}

const ASSET_BADGE = {
  'AI Model': 'bg-blue-50 text-blue-700 border border-blue-200',
  'ePHI':     'bg-red-50 text-red-700 border border-red-200',
  'EHR':      'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'APIs':     'bg-purple-50 text-purple-700 border border-purple-200',
  'Third-Party': 'bg-amber-50 text-amber-700 border border-amber-200',
};
function assetBadge(asset) {
  return Object.entries(ASSET_BADGE).find(([k]) => asset?.includes(k))?.[1] || 'bg-slate-100 text-slate-600 border border-slate-200';
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeading({ number, title, subtitle, dark }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </div>
      <div>
        <h3 className={`text-sm font-bold uppercase tracking-widest leading-none ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        {subtitle && <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{subtitle}</p>}
      </div>
      <div className={`flex-1 h-px ml-2 ${dark ? 'bg-teal-800' : 'bg-teal-100'}`} />
    </div>
  );
}

function RiskEntry({ item, index }) {
  const [open, setOpen] = useState(false);
  const rs = riskStyle(item.likelihood);
  const primaryControl = item.controls?.administrative?.[0] || item.controls?.technical?.[0] || null;
  const hipaa = (item.hipaa_mapping || []).slice(0, 3).join(' · ') || '—';
  const nist  = (item.nist_csf_mapping || []).slice(0, 3).join(' · ') || '—';

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Header row */}
      <div className={`h-1 w-full ${rs.bar}`} />
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 w-5">{index + 1}.</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${rs.badge}`}>{rs.label} Risk</span>
            {item.affected_asset && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${assetBadge(item.affected_asset)}`}>
                {item.affected_asset}
              </span>
            )}
          </div>
          <button onClick={() => setOpen(!open)} className="text-slate-300 hover:text-slate-600 flex-shrink-0 mt-0.5">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-sm font-semibold text-slate-900 mt-2 ml-7 leading-snug">{item.risk}</p>
        {item.threat && item.threat !== item.risk && (
          <p className="text-xs text-slate-500 mt-1 ml-7">Threat vector: {item.threat}</p>
        )}
      </div>

      {/* Always-visible control + compliance strip */}
      <div className="mx-5 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {primaryControl && (
          <div className="sm:col-span-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Primary Control</p>
            <p className="text-xs text-slate-700 leading-snug">{primaryControl}</p>
          </div>
        )}
        <div className={`${primaryControl ? 'sm:col-span-1' : 'sm:col-span-2'} bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5`}>
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">HIPAA</p>
          <p className="text-xs text-blue-800 leading-snug">{hipaa}</p>
        </div>
        <div className="sm:col-span-1 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2.5">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">NIST CSF</p>
          <p className="text-xs text-indigo-800 leading-snug">{nist}</p>
        </div>
      </div>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 space-y-4">
          {/* Impact */}
          <div className="grid grid-cols-3 gap-3">
            {['clinical', 'operational', 'legal'].map(k => (
              <div key={k} className="bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 capitalize">{k} Impact</p>
                <p className="text-xs text-slate-700 leading-snug">{item.impact?.[k] || '—'}</p>
              </div>
            ))}
          </div>
          {/* All controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Administrative', key: 'administrative', dot: 'bg-emerald-500' },
              { label: 'Technical',      key: 'technical',      dot: 'bg-cyan-500' },
              { label: 'Physical',       key: 'physical',       dot: 'bg-slate-400' },
            ].map(({ label, key, dot }) => (
              <div key={key} className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <p className="text-xs font-bold text-slate-600">{label}</p>
                </div>
                <ul className="space-y-1">
                  {(item.controls?.[key] || []).map((c, i) => (
                    <li key={i} className="text-xs text-slate-600">• {c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {item.residual_risk && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Residual risk after controls:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${riskStyle(item.residual_risk).badge}`}>
                {item.residual_risk}
              </span>
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

// ── Main Report ────────────────────────────────────────────────────────────

export default function GRCAnalysisReport({ results, rawJson, onCopy, copied, onReset }) {
  const [showRaw, setShowRaw] = useState(false);

  if (!results || results.length === 0) return null;

  const overall     = overallRisk(results);
  const overallSt   = OVERALL_STYLE[overall];
  const today       = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const sortedByRisk = [...results].sort((a, b) => {
    const ord = { critical: 4, high: 3, medium: 2, low: 1 };
    return (ord[b.likelihood?.toLowerCase()] || 0) - (ord[a.likelihood?.toLowerCase()] || 0);
  });
  const topRisks = sortedByRisk.slice(0, 3);

  const allAssets    = [...new Set(results.map(r => r.affected_asset).filter(Boolean))];
  const allControls  = [...new Set(results.flatMap(r => [
    ...(r.controls?.administrative || []),
    ...(r.controls?.technical || []),
  ]))].slice(0, 5);
  const allHipaa     = [...new Set(results.flatMap(r => r.hipaa_mapping || []))];
  const allNist      = [...new Set(results.flatMap(r => r.nist_csf_mapping || []))];

  const highCount    = results.filter(r => ['high','critical'].includes(r.likelihood?.toLowerCase())).length;
  const medCount     = results.filter(r => r.likelihood?.toLowerCase() === 'medium').length;
  const lowCount     = results.filter(r => r.likelihood?.toLowerCase() === 'low').length;

  const residualCounts = results.reduce((acc, r) => {
    const lvl = r.residual_risk?.toLowerCase();
    if (lvl) acc[lvl] = (acc[lvl] || 0) + 1;
    return acc;
  }, {});
  const residualLevel = ['critical','high','medium','low'].find(l => residualCounts[l]) || overall.toLowerCase();

  // ── Download ────────────────────────────────────────────────────────────
  const downloadBrief = () => {
    const lines = [
      'AI RISK NAVIGATOR FOR HEALTHCARE',
      'GRC RISK ASSESSMENT — EXECUTIVE BRIEF',
      '═══════════════════════════════════════════════════════════',
      `Date Generated: ${today}`,
      `Classification: Confidential — For Internal Use Only`,
      '',
      `OVERALL RISK LEVEL: ${overall.toUpperCase()}`,
      `Total Risks Identified: ${results.length}  |  High/Critical: ${highCount}  |  Medium: ${medCount}  |  Low: ${lowCount}`,
      '',
      '───────────────────────────────────────────────────────────',
      'TOP RISKS',
      '───────────────────────────────────────────────────────────',
      ...topRisks.map((r, i) => `  ${i + 1}. [${(r.likelihood || '').toUpperCase()}] ${r.risk}\n     Asset: ${r.affected_asset || 'N/A'}`),
      '',
      '───────────────────────────────────────────────────────────',
      'KEY ASSETS',
      '───────────────────────────────────────────────────────────',
      ...allAssets.map(a => `  • ${a}`),
      '',
      '───────────────────────────────────────────────────────────',
      'CONTROL PRIORITIES',
      '───────────────────────────────────────────────────────────',
      ...allControls.map((c, i) => `  ${i + 1}. ${c}`),
      '',
      '───────────────────────────────────────────────────────────',
      'COMPLIANCE ALIGNMENT',
      '───────────────────────────────────────────────────────────',
      'HIPAA Safeguards:',
      ...allHipaa.slice(0, 6).map(h => `  • ${h}`),
      '',
      'NIST CSF 2.0:',
      ...allNist.slice(0, 6).map(n => `  • ${n}`),
      '',
      '───────────────────────────────────────────────────────────',
      'CONCLUSION & NEXT STEPS',
      '───────────────────────────────────────────────────────────',
      `Residual Risk Level: ${residualLevel.toUpperCase()}`,
      '',
      'Recommended Actions:',
      allControls[0] ? `  Immediate:   ${allControls[0]}` : '',
      allControls[1] ? `  Short-Term:  ${allControls[1]}` : '',
      allControls[2] ? `  Ongoing:     ${allControls[2]}` : '',
      '',
      'Reassessment recommended within 90 days of implementing priority controls.',
      '',
      '═══════════════════════════════════════════════════════════',
      'This assessment aligns with ISO 27005 · HIPAA · HITECH · NIST CSF 2.0',
      'AI Risk Navigator for Healthcare — Confidential',
    ].filter(l => l !== undefined);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'GRC_Executive_Brief.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const copyReport = () => {
    const text = [
      `GRC Risk Assessment — Overall Risk: ${overall}`,
      `${results.length} risks identified.`,
      '',
      'Top Risks:',
      ...topRisks.map((r, i) => `  ${i + 1}. ${r.risk} [${r.likelihood}]`),
      '',
      'Control Priorities:',
      ...allControls.map((c, i) => `  ${i + 1}. ${c}`),
    ].join('\n');
    navigator.clipboard.writeText(text);
    onCopy();
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">

      {/* ══ REPORT HEADER ══════════════════════════════════════════════════ */}
      <div className="bg-slate-900 px-8 py-8">
        {/* Branding row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">
                AI Risk Navigator for Healthcare
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
              GRC Risk Assessment
            </h2>
            <p className="text-slate-400 text-sm mt-1">Executive Brief — Confidential</p>
          </div>
          <FileText className="h-8 w-8 text-slate-600 flex-shrink-0 mt-1" />
        </div>

        {/* Metadata bar */}
        <div className="flex flex-wrap gap-x-8 gap-y-1 mb-6 border-t border-slate-800 pt-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Date Generated</p>
            <p className="text-sm text-slate-300 font-medium">{today}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Framework Alignment</p>
            <p className="text-sm text-slate-300 font-medium">ISO 27005 · HIPAA · HITECH · NIST CSF 2.0</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Risks Identified</p>
            <p className="text-sm text-slate-300 font-medium">{results.length} total</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Classification</p>
            <p className="text-sm text-slate-300 font-medium">Confidential · Internal Use Only</p>
          </div>
        </div>

        {/* Overall Risk Level — prominent */}
        <div className={`flex items-center gap-5 bg-slate-800 rounded-xl px-6 py-5 ring-2 ${overallSt.ring} shadow-xl ${overallSt.glow}`}>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Overall Risk Level</p>
            <span className={`inline-block px-6 py-2.5 rounded-xl text-2xl font-extrabold tracking-wide ${overallSt.bg} ${overallSt.text}`}>
              {overall.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-4 border-l border-slate-700 pl-5">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 leading-none">{highCount}</div>
              <div className="text-xs text-slate-500 mt-1">High / Critical</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 leading-none">{medCount}</div>
              <div className="text-xs text-slate-500 mt-1">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 leading-none">{lowCount}</div>
              <div className="text-xs text-slate-500 mt-1">Low</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ ACTION BAR ═════════════════════════════════════════════════════ */}
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

      {/* ══ DISCLAIMER BANNER ══════════════════════════════════════════════ */}
      <div className="bg-amber-50 border-l-4 border-amber-400 px-6 py-3 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">Disclaimer:</span> Outputs are for risk analysis purposes only and should not be used as a substitute for professional medical, legal, or compliance advice.
        </p>
      </div>

      {/* ══ REPORT BODY ════════════════════════════════════════════════════ */}
      <div className="px-8 py-10 space-y-12">

        {/* ── EXECUTIVE SUMMARY ─────────────────────────────────────────── */}
        <section>
          <SectionHeading number="I" title="Executive Summary" subtitle="High-level assessment overview and key findings" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                This assessment identified <strong>{results.length} risks</strong> across the evaluated AI system, with <strong>{highCount} high or critical findings</strong> requiring prompt remediation. The overall exposure profile is rated <strong>{overall}</strong> based on likelihood and clinical impact.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                Primary risk vectors include {topRisks.slice(0,2).map(r => r.affected_asset || 'AI system components').join(' and ')}-related threats. Implementing the identified controls will materially reduce exposure across HIPAA and NIST CSF 2.0 domains.
              </p>
              {allControls[0] && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Priority action:</span> {allControls[0]}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div className={`rounded-xl p-4 ${overallSt.bg} ${overallSt.text} text-center`}>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Overall Risk</p>
                <p className="text-3xl font-extrabold">{overall}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Residual Risk</p>
                <p className="text-lg font-bold text-slate-700 capitalize">{residualLevel}</p>
                <p className="text-xs text-slate-400 mt-1">Post-control estimate</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── TOP RISKS ─────────────────────────────────────────────────── */}
        <section>
          <SectionHeading number="II" title="Top Risks" subtitle="Priority findings by likelihood and clinical impact" />
          <div className="space-y-3">
            {topRisks.map((item, i) => {
              const rs = riskStyle(item.likelihood);
              return (
                <div key={i} className="flex items-start gap-0 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className={`w-1.5 self-stretch flex-shrink-0 ${rs.bar}`} />
                  <div className="flex-1 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-400">{i + 1}.</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${rs.badge}`}>{rs.label}</span>
                      {item.affected_asset && (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${assetBadge(item.affected_asset)}`}>
                          {item.affected_asset}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 leading-snug mb-1">{item.risk}</p>
                    {item.impact?.clinical && (
                      <p className="text-xs text-slate-500"><span className="font-medium">Clinical impact:</span> {item.impact.clinical}</p>
                    )}
                    {item.impact?.operational && (
                      <p className="text-xs text-slate-500"><span className="font-medium">Operational impact:</span> {item.impact.operational}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── KEY ASSETS ────────────────────────────────────────────────── */}
        {allAssets.length > 0 && (
          <section>
            <SectionHeading number="III" title="Key Assets" subtitle="Assets within scope of this assessment" />
            <div className="flex flex-wrap gap-2">
              {allAssets.map((asset, i) => (
                <span key={i} className={`text-sm font-medium px-4 py-2 rounded-full ${assetBadge(asset)}`}>
                  {asset}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── RISK → CONTROL MAPPING ────────────────────────────────────── */}
        <section>
          <SectionHeading number="IV" title="Risk → Control Mapping" subtitle={`${results.length} findings with structured control assignments`} />
          <div className="space-y-3">
            {sortedByRisk.map((item, i) => <RiskEntry key={i} item={item} index={i} />)}
          </div>
        </section>

        {/* ── CONTROL PRIORITIES ────────────────────────────────────────── */}
        {allControls.length > 0 && (
          <section>
            <SectionHeading number="V" title="Control Priorities" subtitle="Recommended mitigations in implementation order" />
            <div className="space-y-2">
              {allControls.map((c, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed pt-0.5">{c}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── COMPLIANCE ALIGNMENT ──────────────────────────────────────── */}
        <section>
          <SectionHeading number="VI" title="Compliance Alignment" subtitle="HIPAA safeguards and NIST CSF 2.0 function mapping" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">HIPAA Safeguards</p>
              <ul className="space-y-2">
                {allHipaa.slice(0, 8).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-blue-900">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
                {allHipaa.length > 8 && <li className="text-xs text-blue-400 italic pl-5">+{allHipaa.length - 8} additional controls</li>}
              </ul>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">NIST CSF 2.0</p>
              <ul className="space-y-2">
                {allNist.slice(0, 8).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-indigo-900">
                    <CheckCircle className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
                {allNist.length > 8 && <li className="text-xs text-indigo-400 italic pl-5">+{allNist.length - 8} additional mappings</li>}
              </ul>
            </div>
          </div>
          {/* NIST CSF lifecycle bar */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200">
            {[
              { name: 'Govern',   color: 'bg-slate-700' },
              { name: 'Identify', color: 'bg-blue-600' },
              { name: 'Protect',  color: 'bg-emerald-600' },
              { name: 'Detect',   color: 'bg-orange-500' },
              { name: 'Respond',  color: 'bg-red-600' },
              { name: 'Recover',  color: 'bg-purple-600' },
            ].map((fn, i, arr) => (
              <div key={fn.name} className={`flex-1 ${fn.color} text-white text-center py-3 ${i < arr.length - 1 ? 'border-r border-white/20' : ''}`}>
                <p className="text-xs font-bold">{fn.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONCLUSION & NEXT STEPS ───────────────────────────────────── */}
        <section className="bg-slate-900 rounded-2xl p-7">
          <SectionHeading number="VII" title="Conclusion & Next Steps" subtitle="" dark />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-1">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Residual Risk Level</p>
              {(() => {
                const styleMap = { critical: 'bg-red-600', high: 'bg-orange-500', medium: 'bg-amber-400', low: 'bg-emerald-500' };
                return (
                  <span className={`inline-block px-5 py-2.5 rounded-xl text-lg font-extrabold text-white capitalize ${styleMap[residualLevel] || 'bg-slate-600'}`}>
                    {residualLevel}
                  </span>
                );
              })()}
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Estimated exposure after implementing priority controls.</p>
            </div>
            <div className="md:col-span-2 border border-slate-700 rounded-xl px-5 py-4">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Recommended Actions</p>
              <div className="space-y-2">
                {[
                  allControls[0] && { tag: 'Immediate',   color: 'bg-red-600',   text: allControls[0] },
                  allControls[1] && { tag: 'Short-Term',  color: 'bg-amber-500', text: allControls[1] },
                  allControls[2] && { tag: 'Ongoing',     color: 'bg-blue-600',  text: allControls[2] },
                ].filter(Boolean).map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className={`text-xs font-bold text-white px-2 py-0.5 rounded flex-shrink-0 ${a.color}`}>{a.tag}</span>
                    <p className="text-sm text-slate-300 leading-snug">{a.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 border border-slate-700 rounded-xl px-5 py-4">
            <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Reassessment recommended</span> within 90 days of implementing priority controls, or sooner if system configuration, data flows, or clinical context change materially.
            </p>
          </div>
        </section>

        {/* ── REPORT FOOTER ─────────────────────────────────────────────── */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-slate-400">
              This report aligns with <span className="font-semibold">ISO 27005 · HIPAA · HITECH · NIST CSF 2.0</span>. It is intended for governance and risk management purposes only.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowRaw(!showRaw)} className="text-xs text-slate-400 hover:text-slate-600 underline">
                {showRaw ? 'Hide' : 'Show'} raw JSON
              </button>
              <button onClick={onCopy} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <Copy className="h-3 w-3" /> {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
          </div>
          {showRaw && (
            <pre className="mt-4 bg-slate-900 text-green-300 text-xs p-4 rounded-xl overflow-auto max-h-72 font-mono border border-slate-700">
              {rawJson}
            </pre>
          )}
        </div>

      </div>
    </div>
  );
}
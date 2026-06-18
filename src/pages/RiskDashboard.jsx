import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Plus, ChevronDown, ChevronUp, Calendar, Building2, Download, RefreshCw } from 'lucide-react';
import RiskMappingCard from '@/components/RiskMappingCard';
import ComplianceAssetMap from '@/components/ComplianceAssetMap';
import ComprehensiveRiskCard from '@/components/ComprehensiveRiskCard';
import { base44 } from '@/api/base44Client';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import moment from 'moment';
import jsPDF from 'jspdf';

function getRiskStyle(level) {
  const map = {
    low: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', label: 'Low Risk' },
    medium: { badge: 'bg-amber-100 text-amber-700 border-amber-200', bar: 'bg-amber-500', label: 'Medium Risk' },
    high: { badge: 'bg-orange-100 text-orange-700 border-orange-200', bar: 'bg-orange-500', label: 'High Risk' },
    critical: { badge: 'bg-red-100 text-red-700 border-red-200', bar: 'bg-red-500', label: 'Critical Risk' },
  };
  return map[level] || map.medium;
}

function ScoreBar({ label, score }) {
  const color = score < 26 ? 'bg-emerald-500' : score < 51 ? 'bg-amber-500' : score < 76 ? 'bg-orange-500' : 'bg-red-500';
  const textColor = score < 26 ? 'text-emerald-700' : score < 51 ? 'text-amber-700' : score < 76 ? 'text-orange-700' : 'text-red-700';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className={`font-bold ${textColor}`}>{score ?? '—'}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score || 0}%` }} />
      </div>
    </div>
  );
}

function exportCardPDF(a) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const style = getRiskStyle(a.risk_level);
  const scoreColors = { low: [16,185,129], medium: [245,158,11], high: [249,115,22], critical: [239,68,68] };
  const [r, g, b] = scoreColors[a.risk_level] || [100,116,139];

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 36, 'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(15); doc.setFont('helvetica', 'bold');
  doc.text('AI Risk Navigator for Healthcare', pageW/2, 14, { align: 'center' });
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.setTextColor(148,163,184);
  doc.text('Risk Assessment Report', pageW/2, 23, { align: 'center' });
  doc.setTextColor(203,213,225);
  doc.text(a.system_name, pageW/2, 31, { align: 'center' });

  doc.setFillColor(r, g, b);
  doc.rect(0, 36, pageW, 26, 'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(26); doc.setFont('helvetica', 'bold');
  doc.text(String(a.overall_risk_score ?? '—'), 18, 54);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text('/100', 40, 54);
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text(style.label, pageW - 14, 54, { align: 'right' });

  let y = 76;
  doc.setTextColor(30,41,59);

  if (a.vendor || a.deployment_context) {
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(100,116,139);
    doc.text('SYSTEM DETAILS', 14, y); y += 6;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(71,85,105); doc.setFontSize(10);
    if (a.vendor) { doc.text(`Vendor: ${a.vendor}`, 14, y); y += 6; }
    if (a.deployment_context) { doc.text(`Deployment: ${a.deployment_context}`, 14, y); y += 6; }
    y += 4;
  }

  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(100,116,139);
  doc.text('RISK DIMENSION SCORES', 14, y); y += 6;
  const dims = [
    ['Algorithmic Bias', a.bias_score],
    ['Cybersecurity', a.cybersecurity_score],
    ['Regulatory Compliance', a.compliance_score],
    ['Clinical Impact', a.clinical_impact_score],
  ];
  dims.forEach(([label, score]) => {
    const sc = score ?? 0;
    const sc2 = sc < 26 ? [16,185,129] : sc < 51 ? [245,158,11] : sc < 76 ? [249,115,22] : [239,68,68];
    doc.setFont('helvetica', 'normal'); doc.setTextColor(71,85,105); doc.setFontSize(10);
    doc.text(label, 14, y);
    doc.setTextColor(...sc2); doc.setFont('helvetica', 'bold');
    doc.text(String(sc), pageW-14, y, { align: 'right' }); y += 7;
  });
  y += 4;

  if (a.summary) {
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(100,116,139);
    doc.text('EXECUTIVE SUMMARY', 14, y); y += 6;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(71,85,105); doc.setFontSize(10);
    const lines = doc.splitTextToSize(a.summary, pageW - 28);
    doc.text(lines, 14, y); y += lines.length * 5 + 6;
  }

  if (a.governance_gaps?.length) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(194,65,12);
    doc.text('GOVERNANCE GAPS', 14, y); y += 6;
    a.governance_gaps.forEach(gap => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'normal'); doc.setTextColor(71,85,105); doc.setFontSize(10);
      const lines = doc.splitTextToSize(`• ${gap}`, pageW - 28);
      doc.text(lines, 14, y); y += lines.length * 5 + 2;
    });
    y += 4;
  }

  if (a.recommendations?.length) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(29,78,216);
    doc.text('RECOMMENDATIONS', 14, y); y += 6;
    a.recommendations.forEach((rec, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'normal'); doc.setTextColor(71,85,105); doc.setFontSize(10);
      const lines = doc.splitTextToSize(`${i+1}. ${rec}`, pageW - 28);
      doc.text(lines, 14, y); y += lines.length * 5 + 2;
    });
  }

  doc.setFontSize(8); doc.setTextColor(148,163,184);
  doc.text(`Generated ${new Date().toLocaleDateString()} · AI Risk Navigator for Healthcare`, pageW/2, 290, { align: 'center' });
  doc.save(`AI-Risk-${a.system_name.replace(/\s+/g, '-')}.pdf`);
}

function AssessmentCard({ assessment }) {
  const [expanded, setExpanded] = useState(false);
  const style = getRiskStyle(assessment.risk_level);
  const radarData = [
    { dim: 'Bias', score: assessment.bias_score || 0 },
    { dim: 'Cybersecurity', score: assessment.cybersecurity_score || 0 },
    { dim: 'Compliance', score: assessment.compliance_score || 0 },
    { dim: 'Clinical', score: assessment.clinical_impact_score || 0 },
  ];

  return (
    <Card className="border border-slate-200 hover:border-slate-300 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-slate-900 text-base truncate">{assessment.system_name}</h3>
              <Badge className={`${style.badge} border text-xs px-2 py-0.5 flex-shrink-0`}>{style.label}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
              {assessment.vendor && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{assessment.vendor}</span>}
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{moment(assessment.created_date).format('MMM D, YYYY')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ScoreBar label="Algorithmic Bias" score={assessment.bias_score} />
              <ScoreBar label="Cybersecurity" score={assessment.cybersecurity_score} />
              <ScoreBar label="Compliance" score={assessment.compliance_score} />
              <ScoreBar label="Clinical Impact" score={assessment.clinical_impact_score} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className={`text-3xl font-bold ${assessment.overall_risk_score < 26 ? 'text-emerald-600' : assessment.overall_risk_score < 51 ? 'text-amber-600' : assessment.overall_risk_score < 76 ? 'text-orange-600' : 'text-red-600'}`}>
              {assessment.overall_risk_score ?? '—'}
            </div>
            <div className="text-xs text-slate-400">overall</div>
            <button
              onClick={() => exportCardPDF(assessment)}
              title="Export PDF"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded px-2 py-1 transition-colors"
            >
              <Download className="h-3 w-3" /> PDF
            </button>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-3 font-medium"
        >
          {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Hide details</> : <><ChevronDown className="h-3.5 w-3.5" /> View details</>}
        </button>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">Risk Radar</div>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip formatter={(v) => [`${v}`, 'Risk Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {assessment.summary && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Summary</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{assessment.summary}</p>
                </div>
              )}
              {assessment.key_assets && assessment.key_assets.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Complete Risk Assessment</div>
                  <ComprehensiveRiskCard
                    asset={assessment.key_assets[0] + ' + ePHI' || 'AI System + ePHI'}
                    threat={assessment.governance_gaps?.[0] || 'System failure or output error'}
                    risk={assessment.summary || 'Risk identified'}
                    control={assessment.recommendations?.[0] || 'Implement security controls'}
                    nistFunctions={['Identify', 'Protect', 'Detect']}
                    hipaaType="Technical Safeguards"
                    riskLevel={assessment.risk_level}
                    compact={true}
                  />
                </div>
              )}

              {assessment.governance_gaps?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Governance Gaps
                  </div>
                  <ul className="space-y-1">
                    {assessment.governance_gaps.map((g, i) => (
                      <li key={i} className="text-xs text-slate-600 flex gap-1.5"><span className="text-orange-400 mt-0.5">⚠</span>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
              {assessment.recommendations?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Recommendations (NIST CSF 2.0 Aligned)</div>
                  <ul className="space-y-1.5">
                    {assessment.recommendations.slice(0, 3).map((r, i) => {
                      const recText = typeof r === 'string' ? r : r;
                      const lowerRec = recText.toLowerCase();
                      let nistTag = 'Protect';
                      let tagBg = 'bg-emerald-100';
                      let tagText = 'text-emerald-600';
                      
                      if (lowerRec.includes('monitor') || lowerRec.includes('audit') || lowerRec.includes('log')) {
                        nistTag = 'Detect';
                        tagBg = 'bg-orange-100';
                        tagText = 'text-orange-600';
                      } else if (lowerRec.includes('policy') || lowerRec.includes('governance') || lowerRec.includes('procedure')) {
                        nistTag = 'Govern';
                        tagBg = 'bg-slate-200';
                        tagText = 'text-slate-700';
                      } else if (lowerRec.includes('respond') || lowerRec.includes('escalate') || lowerRec.includes('incident')) {
                        nistTag = 'Respond';
                        tagBg = 'bg-red-100';
                        tagText = 'text-red-600';
                      } else if (lowerRec.includes('recover') || lowerRec.includes('restore') || lowerRec.includes('validate')) {
                        nistTag = 'Recover';
                        tagBg = 'bg-purple-100';
                        tagText = 'text-purple-600';
                      }

                      return (
                        <li key={i} className="text-xs text-slate-600 flex gap-1.5 items-start">
                          <span className={`${tagBg} ${tagText} text-xs font-bold px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 mt-0.5`}>{nistTag}</span>
                          <span className="flex-1">{recText}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RiskDashboard() {
  useEffect(() => { document.title = 'AI Risk Reports | AI Risk Navigator'; }, []);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [newAlerts, setNewAlerts] = useState([]);

  useEffect(() => {
    base44.entities.AIRiskAssessment.list('-created_date', 50)
      .then(setAssessments)
      .catch(console.error)
      .finally(() => setLoading(false));

    // Real-time sync
    const unsubscribe = base44.entities.AIRiskAssessment.subscribe((event) => {
      if (event.type === 'create') {
        setAssessments(prev => [event.data, ...prev]);
        if (event.data?.risk_level === 'critical' || event.data?.risk_level === 'high') {
          setNewAlerts(prev => [event.data, ...prev].slice(0, 5));
        }
      } else if (event.type === 'update') {
        setAssessments(prev => prev.map(a => a.id === event.data.id ? event.data : a));
      } else if (event.type === 'delete') {
        setAssessments(prev => prev.filter(a => a.id !== event.entity_id));
      }
    });
    return unsubscribe;
  }, []);

  const filtered = filter === 'all' ? assessments : assessments.filter(a => a.risk_level === filter);

  const counts = {
    total: assessments.length,
    low: assessments.filter(a => a.risk_level === 'low').length,
    medium: assessments.filter(a => a.risk_level === 'medium').length,
    high: assessments.filter(a => a.risk_level === 'high').length,
    critical: assessments.filter(a => a.risk_level === 'critical').length,
  };
  const avgScore = assessments.length
    ? Math.round(assessments.reduce((s, a) => s + (a.overall_risk_score || 0), 0) / assessments.length)
    : 0;

  const filterButtons = [
    { key: 'all', label: `All (${counts.total})` },
    { key: 'critical', label: `Critical (${counts.critical})`, color: 'text-red-600' },
    { key: 'high', label: `High (${counts.high})`, color: 'text-orange-600' },
    { key: 'medium', label: `Medium (${counts.medium})`, color: 'text-amber-600' },
    { key: 'low', label: `Low (${counts.low})`, color: 'text-emerald-600' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Real-time alert banner */}
      {newAlerts.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-red-700 mb-1">New High-Risk Alert{newAlerts.length > 1 ? 's' : ''}</div>
            {newAlerts.map((a, i) => (
              <div key={i} className="text-xs text-red-600">{a.system_name} — {a.risk_level === 'critical' ? 'Critical' : 'High'} Risk (Score: {a.overall_risk_score})</div>
            ))}
          </div>
          <button onClick={() => setNewAlerts([])} className="text-red-400 hover:text-red-600 text-xs font-medium">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-bold text-slate-900">Risk Dashboard</h1>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <RefreshCw className="h-3 w-3" /> Live
            </div>
          </div>
          <p className="text-slate-500 text-sm">AI system risk assessments and governance insights</p>
        </div>
        <Link to="/RiskAssessment">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Assessment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900">{counts.total}</div>
            <div className="text-xs text-slate-500 mt-0.5">Total Assessments</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${avgScore < 26 ? 'text-emerald-600' : avgScore < 51 ? 'text-amber-600' : avgScore < 76 ? 'text-orange-600' : 'text-red-600'}`}>{counts.total ? avgScore : '—'}</div>
            <div className="text-xs text-slate-500 mt-0.5">Average Risk Score</div>
          </CardContent>
        </Card>
        <Card className="border-red-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{counts.critical}</div>
            <div className="text-xs text-slate-500 mt-0.5">Critical Risk</div>
          </CardContent>
        </Card>
        <Card className="border-orange-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{counts.high}</div>
            <div className="text-xs text-slate-500 mt-0.5">High Risk</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterButtons.map(fb => (
          <button
            key={fb.key}
            onClick={() => setFilter(fb.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === fb.key
                ? 'bg-blue-600 text-white border-blue-600'
                : `border-slate-200 text-slate-600 hover:border-slate-300 bg-white ${fb.color || ''}`
            }`}
          >
            {fb.label}
          </button>
        ))}
      </div>

      {/* Assessments List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          Loading assessments...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-slate-700 font-semibold mb-2">{filter === 'all' ? 'No assessments yet' : `No ${filter} risk assessments`}</h3>
          <p className="text-slate-400 text-sm mb-6">Run your first AI risk assessment to see results here.</p>
          <Link to="/RiskAssessment">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Start Assessment
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => <AssessmentCard key={a.id} assessment={a} />)}
        </div>
      )}
    </div>
  );
}
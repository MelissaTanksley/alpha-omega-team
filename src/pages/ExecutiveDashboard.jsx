import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, AlertTriangle, TrendingUp, TrendingDown, Minus,
  Plus, Activity, Lock, Brain, FileCheck, ArrowRight, Calendar
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

const RISK_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };

function getRiskStyle(level) {
  const map = {
    low: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Low' },
    medium: { badge: 'bg-amber-100 text-amber-700 border-amber-200', text: 'text-amber-600', dot: 'bg-amber-500', label: 'Medium' },
    high: { badge: 'bg-orange-100 text-orange-700 border-orange-200', text: 'text-orange-600', dot: 'bg-orange-500', label: 'High' },
    critical: { badge: 'bg-red-100 text-red-700 border-red-200', text: 'text-red-600', dot: 'bg-red-500', label: 'Critical' },
  };
  return map[level] || map.medium;
}

function scoreColor(score) {
  if (score < 26) return 'text-emerald-600';
  if (score < 51) return 'text-amber-600';
  if (score < 76) return 'text-orange-600';
  return 'text-red-600';
}

function scoreBg(score) {
  if (score < 26) return 'bg-emerald-500';
  if (score < 51) return 'bg-amber-500';
  if (score < 76) return 'bg-orange-500';
  return 'bg-red-500';
}

function KPICard({ title, value, sub, icon: Icon, iconColor, iconBg, trend, trendLabel }) {
  return (
    <Card className="border-slate-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-red-500' : trend < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
              {trend > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : trend < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
              {trendLabel}
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
        <div className="text-sm font-medium text-slate-700">{title}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export default function ExecutiveDashboard() {
  useEffect(() => { document.title = 'Executive Dashboard | AI Risk Navigator'; }, []);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AIRiskAssessment.list('-created_date', 100)
      .then(setAssessments)
      .catch(console.error)
      .finally(() => setLoading(false));

    const unsubscribe = base44.entities.AIRiskAssessment.subscribe((event) => {
      if (event.type === 'create') {
        setAssessments(prev => [event.data, ...prev]);
      } else if (event.type === 'update') {
        setAssessments(prev => prev.map(a => a.id === event.data.id ? event.data : a));
      } else if (event.type === 'delete') {
        setAssessments(prev => prev.filter(a => a.id !== event.entity_id));
      }
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const total = assessments.length;
  const counts = {
    low: assessments.filter(a => a.risk_level === 'low').length,
    medium: assessments.filter(a => a.risk_level === 'medium').length,
    high: assessments.filter(a => a.risk_level === 'high').length,
    critical: assessments.filter(a => a.risk_level === 'critical').length,
  };
  const avgScore = total ? Math.round(assessments.reduce((s, a) => s + (a.overall_risk_score || 0), 0) / total) : 0;
  const avgBias = total ? Math.round(assessments.reduce((s, a) => s + (a.bias_score || 0), 0) / total) : 0;
  const avgCyber = total ? Math.round(assessments.reduce((s, a) => s + (a.cybersecurity_score || 0), 0) / total) : 0;
  const avgCompliance = total ? Math.round(assessments.reduce((s, a) => s + (a.compliance_score || 0), 0) / total) : 0;
  const avgClinical = total ? Math.round(assessments.reduce((s, a) => s + (a.clinical_impact_score || 0), 0) / total) : 0;

  // Pie data
  const pieData = [
    { name: 'Low', value: counts.low, color: RISK_COLORS.low },
    { name: 'Medium', value: counts.medium, color: RISK_COLORS.medium },
    { name: 'High', value: counts.high, color: RISK_COLORS.high },
    { name: 'Critical', value: counts.critical, color: RISK_COLORS.critical },
  ].filter(d => d.value > 0);

  // Bar chart data — top systems by score
  const barData = [...assessments]
    .sort((a, b) => (b.overall_risk_score || 0) - (a.overall_risk_score || 0))
    .slice(0, 8)
    .map(a => ({
      name: a.system_name.length > 16 ? a.system_name.slice(0, 14) + '…' : a.system_name,
      score: a.overall_risk_score || 0,
      fill: RISK_COLORS[a.risk_level] || RISK_COLORS.medium
    }));

  // Radar average data
  const radarData = [
    { dim: 'Bias', score: avgBias },
    { dim: 'Cybersecurity', score: avgCyber },
    { dim: 'Compliance', score: avgCompliance },
    { dim: 'Clinical Impact', score: avgClinical },
  ];

  // Dimension bar data
  const dimBarData = [
    { name: 'Algorithmic Bias', score: avgBias, fill: '#8b5cf6' },
    { name: 'Cybersecurity', score: avgCyber, fill: '#3b82f6' },
    { name: 'Compliance', score: avgCompliance, fill: '#10b981' },
    { name: 'Clinical Impact', score: avgClinical, fill: '#f97316' },
  ];

  // Most recent 5
  const recent = assessments.slice(0, 5);

  // All governance gaps
  const allGaps = assessments.flatMap(a =>
    (a.governance_gaps || []).map(g => ({ gap: g, system: a.system_name, level: a.risk_level }))
  ).slice(0, 6);

  if (total === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">No Data Yet</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">Run your first AI risk assessment to populate the executive dashboard with insights, scores, and governance analytics.</p>
        <Link to="/RiskAssessment">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Start First Assessment
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Live</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Executive Risk Dashboard</h1>
              <p className="text-slate-500 text-sm mt-0.5">Portfolio-wide AI governance overview · {total} system{total !== 1 ? 's' : ''} assessed</p>
            </div>
            <Link to="/RiskAssessment">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0">
                <Plus className="h-4 w-4 mr-2" /> New Assessment
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Portfolio Risk Score"
            value={avgScore}
            sub="Average across all systems"
            icon={Activity}
            iconColor={scoreColor(avgScore)}
            iconBg="bg-slate-100"
          />
          <KPICard
            title="Critical Systems"
            value={counts.critical}
            sub={`${counts.high} high risk`}
            icon={AlertTriangle}
            iconColor="text-red-600"
            iconBg="bg-red-50"
          />
          <KPICard
            title="Systems Assessed"
            value={total}
            sub={`${counts.low} low risk`}
            icon={Shield}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <KPICard
            title="Compliance Exposure"
            value={`${avgCompliance}`}
            sub="Avg compliance risk score"
            icon={FileCheck}
            iconColor="text-violet-600"
            iconBg="bg-violet-50"
          />
        </div>

        {/* Row 2: Risk Distribution + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Distribution Pie */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(counts).map(([level, count]) => {
                  const s = getRiskStyle(level);
                  return (
                    <div key={level} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                        <span className="text-xs text-slate-600 capitalize">{level}</span>
                      </div>
                      <span className={`text-xs font-bold ${s.text}`}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Radar */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Portfolio Risk Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
                  <Tooltip formatter={(v) => [`${v}`, 'Avg Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Dimension Averages */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Average Dimension Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dimBarData} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={100} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`${v}`, 'Avg Risk Score']} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {dimBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Row 3: Top Risk Systems Bar Chart */}
        {barData.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">Highest Risk Systems</CardTitle>
                <Link to="/RiskDashboard" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`${v}`, 'Risk Score']} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Row 4: Recent Assessments + Governance Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Assessments */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">Recent Assessments</CardTitle>
                <Link to="/RiskDashboard" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {recent.map((a) => {
                const s = getRiskStyle(a.risk_level);
                return (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                        <span className="text-sm font-medium text-slate-800 truncate">{a.system_name}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-3.5">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{moment(a.created_date).fromNow()}
                        </span>
                        {a.vendor && <span className="text-xs text-slate-400">· {a.vendor}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <Badge className={`${s.badge} border text-xs px-2 py-0`}>{s.label}</Badge>
                      <span className={`text-sm font-bold ${scoreColor(a.overall_risk_score)}`}>{a.overall_risk_score}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Governance Gaps */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" /> Top Governance Gaps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {allGaps.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No governance gaps identified.</p>
              ) : allGaps.map((item, i) => {
                const s = getRiskStyle(item.level);
                return (
                  <div key={i} className="flex gap-3 items-start p-2.5 bg-orange-50 rounded-lg border border-orange-100">
                    <AlertTriangle className="h-3.5 w-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700">{item.gap}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.system}</p>
                    </div>
                    <Badge className={`${s.badge} border text-xs px-1.5 py-0 flex-shrink-0`}>{s.label}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Summary Bar */}
        <Card className="border-slate-200 bg-slate-900 text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Avg Bias Score', value: avgBias, icon: Brain },
                { label: 'Avg Cyber Score', value: avgCyber, icon: Lock },
                { label: 'Avg Compliance Score', value: avgCompliance, icon: FileCheck },
                { label: 'Avg Clinical Score', value: avgClinical, icon: Activity },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center">
                  <Icon className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                  <div className={`text-3xl font-bold ${scoreColor(value)} mb-0.5`}>{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                  <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${scoreBg(value)} rounded-full`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
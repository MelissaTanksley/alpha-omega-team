import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Edit2, Trash2, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { isDemoMode } from '@/utils/demoData';
import RiskRegisterTable from '@/components/RiskRegisterTable';
import { parseAssessmentToRiskRegister } from '@/utils/riskUtils';

export default function RiskRegister() {
  useEffect(() => { document.title = 'Risk Register | AI Risk Navigator'; }, []);
  const [generatedRisks, setGeneratedRisks] = useState([]);
  const [manualRisks, setManualRisks] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [manualRiskFilter, setManualRiskFilter] = useState('all');
  const [formData, setFormData] = useState({
    risk_description: '', affected_asset: '', likelihood: 'medium', impact: 'medium',
    risk_level: 'medium', recommended_control: '', owner: '', due_date: '', status: 'open'
  });

  useEffect(() => {
    loadData();
  }, []);

  // Scroll to top when page loads
  useEffect(() => {
    if (!isLoading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isLoading]);

  const loadData = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      setIsAuthenticated(isAuth);

      // Only load data for authenticated users
      if (!isAuth) {
        setIsLoading(false);
        return;
      }

      const assessmentData = await base44.entities.AIRiskAssessment.list('-updated_date', 50);
      setAssessments(assessmentData);
      
      const allRisksData = assessmentData.flatMap(assessment =>
        parseAssessmentToRiskRegister(assessment).map(risk => ({
          ...risk,
          assessmentId: assessment.id,
          assessmentName: assessment.system_name,
          source: 'generated'
        }))
      );
      
      setGeneratedRisks(allRisksData);
      
      const manualData = await base44.entities.ManualRisk.list('-updated_date', 100);
      setManualRisks(manualData.map(r => ({ ...r, source: 'manual' })));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRisk = async () => {
    if (!formData.risk_description.trim()) return;
    try {
      const newRisk = await base44.entities.ManualRisk.create(formData);
      setManualRisks(prev => [{ ...newRisk, source: 'manual' }, ...prev]);
      setFormData({ risk_description: '', affected_asset: '', likelihood: 'medium', impact: 'medium', risk_level: 'medium', recommended_control: '', owner: '', due_date: '', status: 'open' });
      setIsAddingNew(false);
    } catch (error) {
      console.error('Failed to create risk:', error);
    }
  };

  const handleEditRisk = async (id) => {
    try {
      await base44.entities.ManualRisk.update(id, formData);
      setManualRisks(prev => prev.map(r => r.id === id ? { ...r, ...formData } : r));
      setEditingId(null);
      setFormData({ risk_description: '', affected_asset: '', likelihood: 'medium', impact: 'medium', risk_level: 'medium', recommended_control: '', owner: '', due_date: '', status: 'open' });
    } catch (error) {
      console.error('Failed to update risk:', error);
    }
  };

  const handleDeleteRisk = async (id) => {
    if (!confirm('Delete this risk?')) return;
    try {
      await base44.entities.ManualRisk.delete(id);
      setManualRisks(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete risk:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await base44.entities.ManualRisk.update(id, { status: newStatus });
      setManualRisks(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const startEdit = (risk) => {
    setEditingId(risk.id);
    setFormData({
      risk_description: risk.risk_description || '',
      affected_asset: risk.affected_asset || '',
      likelihood: risk.likelihood || 'medium',
      impact: risk.impact || 'medium',
      risk_level: risk.risk_level || 'medium',
      recommended_control: risk.recommended_control || '',
      owner: risk.owner || '',
      due_date: risk.due_date || '',
      status: risk.status || 'open'
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormData({ risk_description: '', affected_asset: '', likelihood: 'medium', impact: 'medium', risk_level: 'medium', recommended_control: '', owner: '', due_date: '', status: 'open' });
  };

  const calcRiskLevel = (likelihood, impact) => {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    const l = levels[likelihood] || 2;
    const i = levels[impact] || 2;
    const score = l * i;
    if (score <= 2) return 'low';
    if (score <= 4) return 'medium';
    if (score <= 9) return 'high';
    return 'critical';
  };

  const filteredManualRisks = manualRiskFilter === 'all' 
    ? manualRisks 
    : manualRisks.filter(r => r.risk_level?.toLowerCase() === manualRiskFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show empty state for signed-out users
  if (!isAuthenticated && !isDemoMode()) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 style={{ color: '#ffffff !important' }} className="text-4xl font-bold mb-2">Risk Register</h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.85) !important' }}>Define and track risks across your healthcare AI systems</p>
            </div>
          </div>

          {/* Sign-in Prompt */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-2">Sign in to create and manage your Risk Register</p>
                  <p className="text-sm text-blue-800 mb-4">Once signed in, you can create manual risks, track auto-generated risks from assessments, and manage your complete risk picture.</p>
                  <Button onClick={() => base44.auth.redirectToLogin(window.location.pathname)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign In to Get Started
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empty Table Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-700">Risk Register Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Risk Description</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Affected Asset</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Likelihood</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Impact</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Risk Level</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Recommended Control</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Owner</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Due Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-400">—</td>
                        <td className="px-4 py-3 text-slate-400">—</td>
                        <td className="px-4 py-3 text-slate-400">—</td>
                        <td className="px-4 py-3 text-slate-400">—</td>
                        <td className="px-4 py-3 text-slate-400">—</td>
                        <td className="px-4 py-3 text-slate-400">—</td>
                        <td className="px-4 py-3 text-slate-400">—</td>
                        <td className="px-4 py-3 text-slate-400">—</td>
                        <td className="px-4 py-3 text-slate-400">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 mt-4 text-center">Sign in to populate this table with your risks</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show demo state if demo mode is active
  const isDemoActive = isDemoMode();

  const allRisks = [...generatedRisks, ...manualRisks];
  // Generated risks use `riskLevel`; manual risks use `risk_level` — normalise both
  const getRiskLevel = (r) => (r.riskLevel || r.risk_level || '').toLowerCase();
  const totalCritical = allRisks.filter(r => getRiskLevel(r) === 'critical').length;
  const totalHigh = allRisks.filter(r => getRiskLevel(r) === 'high').length;
  const totalMedium = allRisks.filter(r => getRiskLevel(r) === 'medium').length;
  const totalLow = allRisks.filter(r => getRiskLevel(r) === 'low').length;

  return (
    <div className="min-h-screen">
      {isDemoActive && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800"><span className="font-semibold">Demo Mode: Example Risk Register Structure</span> — This is sample data. <button onClick={() => base44.auth.redirectToLogin(window.location.pathname)} className="underline font-semibold hover:text-amber-900">Sign in</button> to manage your own risks.</p>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1.5rem', borderRadius: '0.75rem', border: 'none !important', outline: 'none !important', boxShadow: 'none !important', backdropFilter: 'blur(6px)' }}>
               <h1 style={{ color: '#ffffff !important' }} className="text-4xl font-bold mb-2">Risk Register</h1>
               <p style={{ color: 'rgba(255, 255, 255, 0.85) !important' }}>Define and track risks across your healthcare AI systems</p>
             </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{allRisks.length}</p>
                <p className="text-sm text-slate-600">Total Risks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{totalCritical}</p>
                <p className="text-sm text-slate-600">Critical</p>
                <p className="text-xs text-slate-400 mt-0.5">Score 76–100</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{totalHigh}</p>
                <p className="text-sm text-slate-600">High</p>
                <p className="text-xs text-slate-400 mt-0.5">Score 51–75</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{totalMedium}</p>
                <p className="text-sm text-slate-600">Medium</p>
                <p className="text-xs text-slate-400 mt-0.5">Score 26–50</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{totalLow}</p>
                <p className="text-sm text-slate-600">Low</p>
                <p className="text-xs text-slate-400 mt-0.5">Score 0–25</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Risks */}
        {generatedRisks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🤖</span> Auto-Generated Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RiskRegisterTable risks={generatedRisks} />
            </CardContent>
          </Card>
        )}

        {/* Manual Risks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">✋</span> Manual Risk Register
              </CardTitle>
              <div className="flex items-center gap-2">
                {manualRisks.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {['all', 'critical', 'high', 'medium', 'low'].map(level => {
                      const count = level === 'all' ? manualRisks.length : manualRisks.filter(r => r.risk_level?.toLowerCase() === level).length;
                      return (
                        <button
                          key={level}
                          onClick={() => setManualRiskFilter(level)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                            manualRiskFilter === level
                              ? level === 'critical' ? 'bg-red-600 text-white' :
                                level === 'high' ? 'bg-orange-600 text-white' :
                                level === 'medium' ? 'bg-amber-600 text-white' :
                                level === 'low' ? 'bg-emerald-600 text-white' :
                                'bg-slate-800 text-white'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)} {count > 0 && `(${count})`}
                        </button>
                      );
                    })}
                  </div>
                )}
                {!isAddingNew && editingId === null && (
                  <Button onClick={() => setIsAddingNew(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 flex-shrink-0">
                    <Plus className="h-4 w-4" /> Add New Risk
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Risk Form */}
            {isAddingNew && (
              <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-700 mb-3">Create New Risk</p>
                <Input
                  placeholder="Risk Description *"
                  value={formData.risk_description}
                  onChange={e => setFormData({ ...formData, risk_description: e.target.value })}
                  className="text-sm"
                />
                <Input
                  placeholder="Affected Asset"
                  value={formData.affected_asset}
                  onChange={e => setFormData({ ...formData, affected_asset: e.target.value })}
                  className="text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={formData.likelihood} onValueChange={v => {
                    const newRisk = calcRiskLevel(v, formData.impact);
                    setFormData({ ...formData, likelihood: v, risk_level: newRisk });
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Likelihood: Low</SelectItem>
                      <SelectItem value="medium">Likelihood: Medium</SelectItem>
                      <SelectItem value="high">Likelihood: High</SelectItem>
                      <SelectItem value="critical">Likelihood: Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={formData.impact} onValueChange={v => {
                    const newRisk = calcRiskLevel(formData.likelihood, v);
                    setFormData({ ...formData, impact: v, risk_level: newRisk });
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Impact: Low</SelectItem>
                      <SelectItem value="medium">Impact: Medium</SelectItem>
                      <SelectItem value="high">Impact: High</SelectItem>
                      <SelectItem value="critical">Impact: Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Recommended Control"
                  value={formData.recommended_control}
                  onChange={e => setFormData({ ...formData, recommended_control: e.target.value })}
                  className="text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    placeholder="Owner"
                    value={formData.owner}
                    onChange={e => setFormData({ ...formData, owner: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Status: Open</SelectItem>
                    <SelectItem value="in_progress">Status: In Progress</SelectItem>
                    <SelectItem value="closed">Status: Closed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                  <Button size="sm" onClick={handleAddRisk} className="bg-blue-600 hover:bg-blue-700">Save Risk</Button>
                </div>
              </div>
            )}

            {/* Manual Risks Table */}
            {filteredManualRisks.length === 0 && !isAddingNew ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm mb-4">
                  {manualRisks.length === 0 ? 'No manual risks yet. Create one to get started.' : 'No risks found in this category.'}
                </p>
                {manualRisks.length === 0 && (
                  <Button onClick={() => setIsAddingNew(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" /> Add New Risk
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredManualRisks.map(risk => (
                  <div key={risk.id}>
                    {editingId === risk.id ? (
                      <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-3 space-y-2">
                        <Input
                          placeholder="Risk Description"
                          value={formData.risk_description}
                          onChange={e => setFormData({ ...formData, risk_description: e.target.value })}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Affected Asset"
                          value={formData.affected_asset}
                          onChange={e => setFormData({ ...formData, affected_asset: e.target.value })}
                          className="text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Select value={formData.likelihood} onValueChange={v => {
                          const newRisk = calcRiskLevel(v, formData.impact);
                          setFormData({ ...formData, likelihood: v, risk_level: newRisk });
                          }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                          </Select>
                          <Select value={formData.impact} onValueChange={v => {
                          const newRisk = calcRiskLevel(formData.likelihood, v);
                          setFormData({ ...formData, impact: v, risk_level: newRisk });
                          }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                          </Select>
                          </div>
                        <Input
                          placeholder="Recommended Control"
                          value={formData.recommended_control}
                          onChange={e => setFormData({ ...formData, recommended_control: e.target.value })}
                          className="text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Owner"
                            value={formData.owner}
                            onChange={e => setFormData({ ...formData, owner: e.target.value })}
                            className="text-sm"
                          />
                          <Input
                            type="date"
                            value={formData.due_date}
                            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                        <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                          <Button size="sm" onClick={() => handleEditRisk(risk.id)} className="bg-green-600 hover:bg-green-700">Save</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">MANUAL</span>
                              <h4 className="font-semibold text-slate-900">{risk.risk_description}</h4>
                            </div>
                            <div className="text-xs space-y-1 text-slate-600">
                              {risk.affected_asset && <div><strong>Asset:</strong> {risk.affected_asset}</div>}
                              <div className="flex gap-3">
                                {risk.likelihood && <span className="inline-block"><strong>Likelihood:</strong> <span className="capitalize">{risk.likelihood}</span></span>}
                                {risk.impact && <span className="inline-block"><strong>Impact:</strong> <span className="capitalize">{risk.impact}</span></span>}
                              </div>
                              {risk.recommended_control && <div><strong>Control:</strong> {risk.recommended_control}</div>}
                              <div className="flex gap-3 mt-2">
                                {risk.owner && <span className="inline-block"><strong>Owner:</strong> {risk.owner}</span>}
                                {risk.due_date && <span className="inline-block"><strong>Due:</strong> {new Date(risk.due_date).toLocaleDateString()}</span>}
                              </div>
                            </div>
                            <div className="text-xs">
                              <Select value={risk.status} onValueChange={v => handleStatusChange(risk.id, v)}>
                                <SelectTrigger className={`w-40 h-7 text-xs font-bold ${
                                  risk.status === 'closed' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                                  risk.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                  'bg-amber-100 text-amber-700 border-amber-300'
                                }`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button size="sm" variant="outline" onClick={() => startEdit(risk)} className="h-8 w-8 p-0">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteRisk(risk.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assessed Systems */}
        {assessments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🏥</span> Assessed Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {assessments.map(assessment => (
                  <div key={assessment.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900">{assessment.system_name}</h4>
                        <p className="text-xs text-slate-600 capitalize">{assessment.system_type?.replace(/_/g, ' ')}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        assessment.risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                        assessment.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        assessment.risk_level === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {assessment.risk_level?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{assessment.summary || 'No summary available'}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `/GRCReport?id=${assessment.id}`}
                      >
                        View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Note */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-700">
              <strong>Dual-Mode Risk Register:</strong> Auto-generated risks come from AI assessments and are read-only. Manual risks are user-created and fully editable. Both feed your complete risk picture for compliance tracking and remediation management.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
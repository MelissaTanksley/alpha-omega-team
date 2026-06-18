import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import RiskRegisterTable from '@/components/RiskRegisterTable';
import { parseAssessmentToRiskRegister } from '@/utils/riskUtils';

export default function RiskRegister() {
  useEffect(() => { document.title = 'Risk Register | AI Risk Navigator'; }, []);
  const [allRisks, setAllRisks] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await base44.entities.AIRiskAssessment.list('-updated_date', 50);
      setAssessments(data);
      
      // Parse all assessments into a unified risk register
      const allRisksData = data.flatMap(assessment =>
        parseAssessmentToRiskRegister(assessment).map(risk => ({
          ...risk,
          assessmentId: assessment.id,
          assessmentName: assessment.system_name
        }))
      );
      
      setAllRisks(allRisksData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Risk Register</h1>
            <p className="text-slate-600">Centralized view of all identified risks across AI systems</p>
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
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{allRisks.length}</p>
                <p className="text-sm text-slate-600">Total Risks</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {allRisks.filter(r => r.riskLevel?.toLowerCase() === 'critical').length}
                </p>
                <p className="text-sm text-slate-600">Critical</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {allRisks.filter(r => r.riskLevel?.toLowerCase() === 'high').length}
                </p>
                <p className="text-sm text-slate-600">High</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {allRisks.filter(r => r.riskLevel?.toLowerCase() === 'medium').length}
                </p>
                <p className="text-sm text-slate-600">Medium</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">📋</span> Master Risk Register
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allRisks.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">No Risks Yet</h2>
                <p className="text-slate-600 mb-6">Create AI system assessments to populate the risk register.</p>
                <Button onClick={() => window.location.href = '/RiskAssessment'} className="bg-blue-600 hover:bg-blue-700">
                  Start Assessment
                </Button>
              </div>
            ) : (
              <RiskRegisterTable risks={allRisks} />
            )}
          </CardContent>
        </Card>

        {/* Assessments Summary */}
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
              <strong>Note:</strong> This Risk Register is automatically derived from all AI Risk Assessments in the system. It updates dynamically when new assessments are completed or existing ones are modified. Use this as your authoritative record for compliance documentation and risk tracking.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
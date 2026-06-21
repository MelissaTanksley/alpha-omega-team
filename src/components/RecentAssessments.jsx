import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronRight, Lock } from 'lucide-react';

export default function RecentAssessments({ assessments = [] }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Show sign-in prompt if not authenticated
  if (!loading && !user) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-slate-400" />
          </div>
          <div className="text-center max-w-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Sign in to view your assessments</h3>
            <p className="text-sm text-slate-500 mb-4">Access your saved risk assessments, reports, and analysis history.</p>
            <Button
              size="sm"
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || !assessments.length) {
    return null;
  }

  const getRiskColor = (level) => {
    const colors = {
      low: 'bg-emerald-100 text-emerald-800',
      medium: 'bg-amber-100 text-amber-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[level?.toLowerCase()] || colors.medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card className="border border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Recent Assessments
        </CardTitle>
        <p className="text-sm text-slate-500 font-normal mt-1">Access previous assessments and their reports</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {assessment.system_name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {assessment.system_type?.replace(/_/g, ' ')} • {formatDate(assessment.created_date)}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <Badge className={`text-xs font-bold ${getRiskColor(assessment.risk_level)}`}>
                  {assessment.risk_level?.toUpperCase()}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.location.href = `/GRCReport?id=${assessment.id}`}
                  className="h-8 px-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  View Report <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
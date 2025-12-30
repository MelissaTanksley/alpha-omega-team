import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Presentation, BookOpen, Users, Calendar, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const PROJECT_ICONS = {
  paper: FileText,
  presentation: Presentation,
  study: BookOpen,
  sermon: BookOpen,
  other: FileText
};

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800'
};

export default function ProjectCard({ project, onClick, currentUserEmail }) {
  const Icon = PROJECT_ICONS[project.project_type] || FileText;
  const isOwner = project.created_by === currentUserEmail;
  const userRole = project.team_members?.find(m => m.email === currentUserEmail)?.role || 'viewer';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-700 bg-slate-900/70 backdrop-blur-sm overflow-hidden"
        onClick={() => onClick(project)}
      >
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Icon className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-200 line-clamp-1">{project.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 mt-1">{project.description}</p>
              </div>
            </div>
            <Badge className={STATUS_COLORS[project.status]}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              {project.team_members?.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{project.team_members.length} members</span>
                </div>
              )}
              {project.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(project.due_date), 'MMM d')}</span>
                </div>
              )}
            </div>

            {project.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs text-slate-400 border-slate-700">
                    {tag}
                  </Badge>
                ))}
                {project.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs text-slate-400 border-slate-700">
                    +{project.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                {project.created_date && format(new Date(project.created_date), 'MMM d, yyyy')}
              </span>
              <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-400">
                {isOwner ? 'Owner' : userRole}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
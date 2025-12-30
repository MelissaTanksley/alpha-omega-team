import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from '../components/projects/ProjectCard';
import ProjectEditor from '../components/projects/ProjectEditor';
import { Plus, Search, Users, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamProjects() {
  const [user, setUser] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const allProjects = await base44.entities.TeamProject.list('-updated_date');
      // Filter to show projects user created or is a member of
      return allProjects.filter(p => 
        p.created_by === user.email || 
        p.team_members?.some(m => m.email === user.email)
      );
    },
    enabled: !!user
  });

  const createProjectMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamProject.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setShowEditor(false);
      setEditingProject(null);
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamProject.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setShowEditor(false);
      setEditingProject(null);
    }
  });

  const handleSaveProject = (projectData) => {
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: projectData });
    } else {
      createProjectMutation.mutate(projectData);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowEditor(true);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterTab === 'all' ||
      (filterTab === 'my_projects' && project.created_by === user?.email) ||
      (filterTab === 'shared' && project.team_members?.some(m => m.email === user?.email && project.created_by !== user?.email));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Team Projects
          </h1>
          <p className="text-slate-300 mt-1">Collaborate on papers, presentations, and studies</p>
        </div>
        
        <Button
          onClick={() => {
            setEditingProject(null);
            setShowEditor(!showEditor);
          }}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProjectEditor
              project={editingProject}
              onSave={handleSaveProject}
              onCancel={() => {
                setShowEditor(false);
                setEditingProject(null);
              }}
              currentUser={user}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/70 border-slate-700 text-slate-200"
            />
          </div>
        </div>
        
        <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto">
          <TabsList className="bg-slate-900/70 border border-slate-700">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="my_projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Shared
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-900/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="p-4 bg-slate-900/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FolderOpen className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No projects yet</h3>
          <p className="text-slate-400">Start collaborating with your team on biblical projects</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={handleEditProject}
              currentUserEmail={user?.email}
            />
          ))}
        </div>
      )}
    </div>
  );
}
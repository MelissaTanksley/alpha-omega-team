import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, X, UserPlus, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill';

export default function ProjectEditor({ project, onSave, onCancel, currentUser }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_type: 'paper',
    content: '',
    status: 'draft',
    team_members: [],
    due_date: '',
    tags: []
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        project_type: project.project_type || 'paper',
        content: project.content || '',
        status: project.status || 'draft',
        team_members: project.team_members || [],
        due_date: project.due_date || '',
        tags: project.tags || []
      });
    }
  }, [project]);

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) return;
    
    const newMember = {
      email: newMemberEmail.trim(),
      name: newMemberEmail.split('@')[0],
      role: 'editor'
    };

    setFormData(prev => ({
      ...prev,
      team_members: [...prev.team_members, newMember]
    }));
    setNewMemberEmail('');
  };

  const handleRemoveMember = (email) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.filter(m => m.email !== email)
    }));
  };

  const handleAddTag = () => {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return;
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return (
    <Card className="border-slate-700 shadow-lg bg-slate-900/70 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
        <CardTitle>{project?.id ? 'Edit Project' : 'New Team Project'}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">Project Title *</Label>
            <Input
              id="title"
              placeholder="Enter project title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-slate-300">Project Type</Label>
            <Select 
              value={formData.project_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, project_type: value }))}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paper">Research Paper</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="study">Bible Study</SelectItem>
                <SelectItem value="sermon">Sermon</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-300">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief project description..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="bg-slate-800 border-slate-700 text-slate-200"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="due_date" className="text-slate-300">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">Project Content *</Label>
          <div className="min-h-[300px] border rounded-lg overflow-hidden border-slate-700">
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              className="h-[250px] bg-slate-800 text-slate-200"
              placeholder="Write your project content here..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">Team Members</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address..."
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
            <Button onClick={handleAddMember} variant="outline" className="border-slate-700 text-slate-300">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          {formData.team_members.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.team_members.map((member, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-900/20 bg-slate-800 text-slate-300"
                  onClick={() => handleRemoveMember(member.email)}
                >
                  {member.email}
                  <Trash2 className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
            <Button onClick={handleAddTag} variant="outline" className="border-slate-700 text-slate-300">
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-900/20 bg-slate-800 text-slate-300"
                  onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                >
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-3 border-t border-slate-800 bg-slate-800/50 p-4">
        <Button variant="outline" onClick={onCancel} className="border-slate-700 text-slate-300">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!formData.title.trim() || !formData.content.trim()}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Project
        </Button>
      </CardFooter>
    </Card>
  );
}
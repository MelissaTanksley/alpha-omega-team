import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, Star, Tag, BookOpen } from 'lucide-react';
import ReactQuill from 'react-quill';

export default function NoteEditor({ note, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    verse_reference: '',
    tags: [],
    is_favorite: false
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        verse_reference: note.verse_reference || '',
        tags: note.tags || [],
        is_favorite: note.is_favorite || false
      });
    }
  }, [note]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <span>{note?.id ? 'Edit Note' : 'New Note'}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFormData(prev => ({ ...prev, is_favorite: !prev.is_favorite }))}
            className="text-white hover:text-amber-300"
          >
            <Star className={`h-5 w-5 ${formData.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Note title..."
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="text-lg font-medium"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="verse_ref" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Verse Reference
          </Label>
          <Input
            id="verse_ref"
            placeholder="e.g., John 3:16 or Romans 8:28-30"
            value={formData.verse_reference}
            onChange={(e) => setFormData(prev => ({ ...prev, verse_reference: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <div className="min-h-[300px] border rounded-lg overflow-hidden">
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              className="h-[250px]"
              placeholder="Write your notes here..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </Label>
          <Input
            placeholder="Add a tag and press Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-3 border-t bg-slate-50 p-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!formData.title.trim()}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Note
        </Button>
      </CardFooter>
    </Card>
  );
}
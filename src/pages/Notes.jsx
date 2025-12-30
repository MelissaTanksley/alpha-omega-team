import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NoteEditor from '../components/notes/NoteEditor';
import NoteCard from '../components/notes/NoteCard';
import { Plus, Search, Star, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notes() {
  const [user, setUser] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
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

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: () => base44.entities.Note.filter({ created_by: user.email }, '-updated_date'),
    enabled: !!user
  });

  const createNoteMutation = useMutation({
    mutationFn: (noteData) => base44.entities.Note.create(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      setShowEditor(false);
      setEditingNote(null);
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Note.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      setShowEditor(false);
      setEditingNote(null);
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.Note.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
    }
  });

  const handleSaveNote = (noteData) => {
    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data: noteData });
    } else {
      createNoteMutation.mutate(noteData);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleToggleFavorite = (note) => {
    updateNoteMutation.mutate({
      id: note.id,
      data: { ...note, is_favorite: !note.is_favorite }
    });
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.verse_reference?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterTab === 'all' ||
      (filterTab === 'favorites' && note.is_favorite);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            My Study Notes
          </h1>
          <p className="text-slate-300 mt-1">Capture insights from your Bible study</p>
        </div>
        
        <Button
          onClick={() => {
            setEditingNote(null);
            setShowEditor(!showEditor);
          }}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <NoteEditor
              note={editingNote}
              onSave={handleSaveNote}
              onCancel={() => {
                setShowEditor(false);
                setEditingNote(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/70 border-slate-700 text-slate-200"
            />
          </div>
        </div>
        
        <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full md:w-auto">
          <TabsList className="bg-slate-900/70 border border-slate-700">
            <TabsTrigger value="all">All Notes</TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Favorites
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
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="p-4 bg-slate-900/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Tag className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No notes yet</h3>
          <p className="text-slate-400">Start capturing your biblical insights</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={() => deleteNoteMutation.mutate(note.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
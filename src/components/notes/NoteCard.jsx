import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, BookOpen, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function NoteCard({ note, onEdit, onDelete, onToggleFavorite }) {
  // Strip HTML tags for preview
  const getPreview = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.slice(0, 150) + (text.length > 150 ? '...' : '');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 line-clamp-1">{note.title}</h3>
              {note.verse_reference && (
                <div className="flex items-center gap-1 text-sm text-amber-700 mt-1">
                  <BookOpen className="h-3 w-3" />
                  {note.verse_reference}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(note);
              }}
              className="h-8 w-8"
            >
              <Star className={`h-4 w-4 ${note.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-slate-600 line-clamp-3 mb-3">
            {getPreview(note.content)}
          </p>
          
          {note.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs bg-slate-100">
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-slate-100">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-slate-500">
              {note.created_date && format(new Date(note.created_date), 'MMM d, yyyy')}
            </span>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(note)}>
                <Pencil className="h-4 w-4 text-slate-600" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(note)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
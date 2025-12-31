import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, Tag, Star, Calendar, Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ContentOrganizer({ content, onFilter, onSort, onTagFilter }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedTag, setSelectedTag] = useState('all');

  // Extract unique tags from content
  const allTags = [...new Set(content.flatMap(item => item.tags || []))];

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    onFilter({ search: value, type: selectedType, tag: selectedTag });
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
    onFilter({ search: searchQuery, type: value, tag: selectedTag });
  };

  const handleTagChange = (value) => {
    setSelectedTag(value);
    onFilter({ search: searchQuery, type: selectedType, tag: value });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onSort(value);
  };

  const contentTypeCounts = {
    all: content.length,
    study: content.filter(c => c.content_type === 'study').length,
    explanation: content.filter(c => c.content_type === 'explanation').length,
    word_study: content.filter(c => c.content_type === 'word_study').length,
    application: content.filter(c => c.content_type === 'application').length,
    sermon_notes: content.filter(c => c.content_type === 'sermon_notes').length,
    devotional: content.filter(c => c.content_type === 'devotional').length
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search saved content..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full md:w-[200px] bg-slate-800 border-slate-700 text-slate-200">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types ({contentTypeCounts.all})</SelectItem>
                <SelectItem value="study">Studies ({contentTypeCounts.study})</SelectItem>
                <SelectItem value="explanation">Explanations ({contentTypeCounts.explanation})</SelectItem>
                <SelectItem value="word_study">Word Studies ({contentTypeCounts.word_study})</SelectItem>
                <SelectItem value="application">Applications ({contentTypeCounts.application})</SelectItem>
                <SelectItem value="sermon_notes">Sermon Notes ({contentTypeCounts.sermon_notes})</SelectItem>
                <SelectItem value="devotional">Devotionals ({contentTypeCounts.devotional})</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full md:w-[200px] bg-slate-800 border-slate-700 text-slate-200">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="favorites">Favorites</SelectItem>
                <SelectItem value="alphabetical">A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge
                variant={selectedTag === 'all' ? 'default' : 'outline'}
                className={`cursor-pointer ${selectedTag === 'all' ? 'bg-amber-600' : 'border-slate-600 text-slate-400 hover:bg-slate-800'}`}
                onClick={() => handleTagChange('all')}
              >
                <Tag className="h-3 w-3 mr-1" />
                All
              </Badge>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className={`cursor-pointer ${selectedTag === tag ? 'bg-amber-600' : 'border-slate-600 text-slate-400 hover:bg-slate-800'}`}
                  onClick={() => handleTagChange(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
          <CardContent className="p-4 text-center">
            <FolderOpen className="h-6 w-6 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{content.length}</div>
            <div className="text-xs text-slate-400">Total Items</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {content.filter(c => c.is_favorite).length}
            </div>
            <div className="text-xs text-slate-400">Favorites</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
          <CardContent className="p-4 text-center">
            <Tag className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{allTags.length}</div>
            <div className="text-xs text-slate-400">Tags</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {content.filter(c => {
                const date = new Date(c.created_date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date > weekAgo;
              }).length}
            </div>
            <div className="text-xs text-slate-400">This Week</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
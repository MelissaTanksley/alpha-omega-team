import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, DollarSign, BookOpen } from 'lucide-react';

export default function SellBookForm({ user, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'bible_study',
    price: '',
    page_count: '',
    cover_image_url: '',
    preview_pdf_url: '',
    full_pdf_url: ''
  });
  const [uploading, setUploading] = useState(false);

  const createBookMutation = useMutation({
    mutationFn: (data) => base44.entities.Book.create(data),
    onSuccess: () => {
      alert('Book listed successfully!');
      setFormData({
        title: '',
        description: '',
        category: 'bible_study',
        price: '',
        page_count: '',
        cover_image_url: '',
        preview_pdf_url: '',
        full_pdf_url: ''
      });
      onSuccess();
    }
  });

  const handleFileUpload = async (file, field) => {
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, [field]: result.file_url });
    } catch (error) {
      alert('Failed to upload file');
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createBookMutation.mutate({
      ...formData,
      author: user.full_name,
      author_email: user.email,
      price: parseFloat(formData.price),
      page_count: formData.page_count ? parseInt(formData.page_count) : undefined
    });
  };

  return (
    <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700 max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-amber-400" />
          List Your Book for Sale
        </CardTitle>
        <CardDescription>Share your Christian literature with the community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Book Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter book title"
                required
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Price (USD) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="9.99"
                required
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your book..."
              required
              className="h-32 bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bible_study">Bible Study</SelectItem>
                  <SelectItem value="theology">Theology</SelectItem>
                  <SelectItem value="devotional">Devotional</SelectItem>
                  <SelectItem value="christian_living">Christian Living</SelectItem>
                  <SelectItem value="biblical_commentary">Biblical Commentary</SelectItem>
                  <SelectItem value="apologetics">Apologetics</SelectItem>
                  <SelectItem value="church_history">Church History</SelectItem>
                  <SelectItem value="biography">Biography</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Page Count</Label>
              <Input
                type="number"
                value={formData.page_count}
                onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
                placeholder="200"
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-700 pt-6">
            <h3 className="text-slate-200 font-semibold">Upload Files</h3>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Cover Image</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'cover_image_url')}
                  className="bg-slate-800 border-slate-700 text-slate-200"
                  disabled={uploading}
                />
                {formData.cover_image_url && (
                  <img src={formData.cover_image_url} alt="Cover" className="h-10 w-10 object-cover rounded" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Full Book PDF</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'full_pdf_url')}
                className="bg-slate-800 border-slate-700 text-slate-200"
                disabled={uploading}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={createBookMutation.isPending || uploading}
            className="w-full bg-amber-600 hover:bg-amber-700 h-12"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {createBookMutation.isPending ? 'Listing...' : 'List Book for Sale'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
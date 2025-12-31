import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Church, MapPin, Globe, Search, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Churches() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: churches = [], isLoading } = useQuery({
    queryKey: ['churches'],
    queryFn: () => base44.entities.Church.list('-updated_date', 100)
  });

  const filteredChurches = churches.filter(church => {
    const query = searchQuery.toLowerCase();
    return !query || 
      church.name?.toLowerCase().includes(query) ||
      church.denomination?.toLowerCase().includes(query) ||
      church.location?.toLowerCase().includes(query);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading churches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
          <Church className="h-10 w-10 text-amber-400" />
          Churches
        </h1>
        <p className="text-slate-300">Discover churches in your area</p>
      </motion.div>

      {/* Search */}
      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, denomination, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Churches Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChurches.map((church) => (
          <motion.div
            key={church.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700 hover:border-amber-500/30 transition-all h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  {church.logo_url ? (
                    <img src={church.logo_url} alt={church.name} className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Church className="h-8 w-8 text-slate-600" />
                    </div>
                  )}
                  {church.is_verified && (
                    <Badge className="bg-blue-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-slate-200 mt-3">{church.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {church.denomination && (
                  <Badge variant="outline" className="text-amber-400 border-amber-400">
                    {church.denomination}
                  </Badge>
                )}
                {church.location && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <MapPin className="h-4 w-4" />
                    {church.location}
                  </div>
                )}
                {church.pastor_name && (
                  <p className="text-slate-400 text-sm">Pastor: {church.pastor_name}</p>
                )}
                {church.description && (
                  <p className="text-slate-300 text-sm line-clamp-3">{church.description}</p>
                )}
                {church.website && (
                  <a
                    href={church.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm"
                  >
                    <Globe className="h-4 w-4" />
                    Visit Website
                  </a>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredChurches.length === 0 && (
        <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
          <CardContent className="py-16 text-center">
            <Church className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No churches found</h3>
            <p className="text-slate-500">Try adjusting your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
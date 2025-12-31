import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyBooks({ purchases, onSelectBook }) {
  if (purchases.length === 0) {
    return (
      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
        <CardContent className="p-12 text-center">
          <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">Your Library is Empty</h3>
          <p className="text-slate-500">Purchase books to start building your library</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">My Library ({purchases.length} books)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchases.map((purchase, idx) => (
          <motion.div
            key={purchase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700 hover:border-amber-500/50 transition-all">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-1">
                    {purchase.book_title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Purchased {new Date(purchase.created_date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-600">
                    Owned
                  </Badge>
                  <span className="text-amber-400 font-semibold">
                    ${purchase.price_paid.toFixed(2)}
                  </span>
                </div>
                
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  onClick={() => {
                    // In real implementation, fetch book details
                    alert('Download feature coming soon!');
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
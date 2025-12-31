import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, DollarSign, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookCard({ book, onSelect, isPurchased }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700 hover:border-amber-500/50 transition-all cursor-pointer h-full flex flex-col">
        <div 
          onClick={() => onSelect(book)}
          className="flex-1"
        >
          {book.cover_image_url ? (
            <img 
              src={book.cover_image_url} 
              alt={book.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-t-lg flex items-center justify-center">
              <span className="text-6xl">📖</span>
            </div>
          )}
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg text-slate-200 line-clamp-2">
                {book.title}
              </CardTitle>
              {book.is_featured && (
                <Badge className="bg-amber-500 shrink-0">⭐</Badge>
              )}
            </div>
            <p className="text-sm text-slate-400">by {book.author}</p>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-400 line-clamp-2">
              {book.description}
            </p>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
                {book.category?.replace('_', ' ')}
              </Badge>
              {book.rating > 0 && (
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{book.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <span className="text-2xl font-bold text-amber-400">
                ${book.price.toFixed(2)}
              </span>
              
              {isPurchased ? (
                <Badge className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Owned
                </Badge>
              ) : (
                <Button 
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(book);
                  }}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Buy
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
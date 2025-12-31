import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, X, Download, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookDetails({ book, onClose, isPurchased, user }) {
  const [processing, setProcessing] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Purchase.create({
        book_id: book.id,
        book_title: book.title,
        buyer_email: user.email,
        buyer_name: user.full_name,
        price_paid: book.price,
        payment_method: 'paypal'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['purchases']);
      alert('Purchase successful! You can now download your book.');
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const updatedReviews = [
        ...(book.reviews || []),
        {
          user_email: user.email,
          user_name: user.full_name,
          rating: rating,
          review: review,
          timestamp: new Date().toISOString()
        }
      ];
      
      const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
      
      return await base44.entities.Book.update(book.id, {
        reviews: updatedReviews,
        rating: totalRating
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      setRating(0);
      setReview('');
      alert('Review submitted successfully!');
    }
  });

  const handlePurchase = async () => {
    setProcessing(true);
    // In real implementation, this would redirect to PayPal
    window.open(`https://www.paypal.com/paypalme/YOUR_USERNAME/${book.price}`, '_blank');
    
    // Simulate purchase (in real app, this would happen after PayPal callback)
    setTimeout(() => {
      purchaseMutation.mutate();
      setProcessing(false);
    }, 2000);
  };

  const handleDownload = () => {
    if (book.full_pdf_url) {
      window.open(book.full_pdf_url, '_blank');
    } else {
      alert('Download link not available');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl text-slate-200 mb-2">{book.title}</CardTitle>
                <p className="text-lg text-slate-400">by {book.author}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400">
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  {book.cover_image_url ? (
                    <img 
                      src={book.cover_image_url} 
                      alt={book.title}
                      className="w-full rounded-lg shadow-xl"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-8xl">📖</span>
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    <div className="text-3xl font-bold text-amber-400 text-center">
                      ${book.price.toFixed(2)}
                    </div>
                    
                    {isPurchased ? (
                      <>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={handleDownload}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Book
                        </Button>
                        <Badge className="w-full justify-center bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          You own this book
                        </Badge>
                      </>
                    ) : (
                      <Button 
                        className="w-full bg-amber-600 hover:bg-amber-700"
                        onClick={handlePurchase}
                        disabled={processing}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {processing ? 'Processing...' : 'Buy Now'}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">About This Book</h3>
                    <p className="text-slate-300 leading-relaxed">{book.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Category</p>
                      <Badge variant="outline" className="mt-1 border-slate-700 text-slate-300">
                        {book.category?.replace('_', ' ')}
                      </Badge>
                    </div>
                    {book.page_count && (
                      <div>
                        <p className="text-sm text-slate-500">Pages</p>
                        <p className="text-slate-200 mt-1">{book.page_count}</p>
                      </div>
                    )}
                    {book.rating > 0 && (
                      <div>
                        <p className="text-sm text-slate-500">Rating</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 text-amber-400 fill-current" />
                          <span className="text-slate-200">{book.rating.toFixed(1)}</span>
                          <span className="text-slate-500 text-sm">({book.reviews?.length || 0} reviews)</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Reviews Section */}
                  <div className="border-t border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Reviews</h3>
                    
                    {isPurchased && (
                      <div className="bg-slate-800 rounded-lg p-4 mb-4">
                        <p className="text-sm text-slate-300 mb-3">Leave a review</p>
                        <div className="flex gap-2 mb-3">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="transition-colors"
                            >
                              <Star 
                                className={`h-6 w-6 ${star <= rating ? 'text-amber-400 fill-current' : 'text-slate-600'}`}
                              />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="Share your thoughts..."
                          className="bg-slate-900 border-slate-700 text-slate-200 mb-3"
                        />
                        <Button
                          onClick={() => reviewMutation.mutate()}
                          disabled={!rating || !review.trim()}
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          Submit Review
                        </Button>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {book.reviews?.length > 0 ? (
                        book.reviews.map((r, idx) => (
                          <div key={idx} className="bg-slate-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-slate-200 font-medium">{r.user_name}</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    className={`h-3 w-3 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-slate-600'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-slate-400">{r.review}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-center py-4">No reviews yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import BookCard from '../components/store/BookCard';
import BookDetails from '../components/store/BookDetails';
import SellBookForm from '../components/store/SellBookForm';
import MyBooks from '../components/store/MyBooks';
import { Store as StoreIcon, Search, Plus, BookOpen, ShoppingCart, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Store() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showSellForm, setShowSellForm] = useState(false);
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

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.filter({ is_published: true }, '-created_date')
  });

  const { data: myPurchases = [] } = useQuery({
    queryKey: ['purchases', user?.email],
    queryFn: () => base44.entities.Purchase.filter({ buyer_email: user.email }),
    enabled: !!user
  });

  const categories = [
    { id: 'all', name: 'All Books', icon: BookOpen },
    { id: 'bible_study', name: 'Bible Study', icon: BookOpen },
    { id: 'theology', name: 'Theology', icon: BookOpen },
    { id: 'devotional', name: 'Devotional', icon: BookOpen },
    { id: 'christian_living', name: 'Christian Living', icon: BookOpen },
    { id: 'biblical_commentary', name: 'Commentary', icon: BookOpen },
    { id: 'apologetics', name: 'Apologetics', icon: BookOpen }
  ];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredBooks = books.filter(b => b.is_featured).slice(0, 3);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            Christian Book
          </span>
          <span className="text-white"> Marketplace</span>
        </h1>
        <p className="text-slate-300 text-lg">Discover and sell Christian literature</p>
      </motion.div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto bg-slate-900/70 border border-slate-700">
          <TabsTrigger value="browse" className="data-[state=active]:bg-amber-600">
            <StoreIcon className="h-4 w-4 mr-2" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="my-library" className="data-[state=active]:bg-amber-600">
            <BookOpen className="h-4 w-4 mr-2" />
            My Library
          </TabsTrigger>
          <TabsTrigger value="sell" className="data-[state=active]:bg-amber-600">
            <DollarSign className="h-4 w-4 mr-2" />
            Sell
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filter */}
          <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search books or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id 
                      ? "bg-amber-600 hover:bg-amber-700" 
                      : "border-slate-700 text-slate-300 hover:bg-slate-800"}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Featured Books */}
          {featuredBooks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                ⭐ Featured Books
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredBooks.map(book => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onSelect={setSelectedBook}
                    isPurchased={myPurchases.some(p => p.book_id === book.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Books */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
              All Books ({filteredBooks.length})
            </h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto" />
              </div>
            ) : filteredBooks.length === 0 ? (
              <Card className="bg-slate-900/70 backdrop-blur-sm border-slate-700">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No books found matching your search</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map(book => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onSelect={setSelectedBook}
                    isPurchased={myPurchases.some(p => p.book_id === book.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-library">
          <MyBooks purchases={myPurchases} onSelectBook={setSelectedBook} />
        </TabsContent>

        <TabsContent value="sell">
          <SellBookForm user={user} onSuccess={() => queryClient.invalidateQueries(['books'])} />
        </TabsContent>
      </Tabs>

      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetails 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)}
          isPurchased={myPurchases.some(p => p.book_id === selectedBook.id)}
          user={user}
        />
      )}
    </div>
  );
}
import React from 'react';
import BibleSearch from '../components/bible/BibleSearch';
import { motion } from 'framer-motion';

export default function BibleSearchPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Search the Scriptures
        </h1>
        <p className="text-slate-300">
          Explore God's Word across all translations with Hebrew and Greek insights
        </p>
      </div>
      
      <BibleSearch />
    </motion.div>
  );
}
import React from 'react';
import ContactForm from '../components/contact/ContactForm';
import { motion } from 'framer-motion';

export default function ContactUs() {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            Contact Us
          </span>
        </h1>
        <p className="text-blue-400 text-lg">
          We'd love to hear from you
        </p>
      </motion.div>

      <ContactForm language="en" />
    </div>
  );
}
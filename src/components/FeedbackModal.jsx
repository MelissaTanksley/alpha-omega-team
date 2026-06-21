import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose }) {
  const [feedbackType, setFeedbackType] = useState('general');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      // Save to database
      await base44.entities.Feedback.create({
        type: feedbackType,
        message: message.trim(),
        email: email.trim() || null
      });

      // Send email notification
      await base44.functions.invoke('sendContactEmail', {
        name: email || 'Anonymous User',
        email: 'melissa.tanksley@gmail.com',
        subject: `New ${feedbackType} Feedback - AI Risk Navigator`,
        message: `Type: ${feedbackType}\n\nFeedback:\n${message}${email ? `\n\nFrom: ${email}` : ''}`
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setMessage('');
        setEmail('');
        setFeedbackType('general');
        onClose();
      }, 2500);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Give Feedback</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSubmitted ? (
            <div className="text-center py-8">
              <p className="text-lg font-semibold text-emerald-600">Thank you for your feedback!</p>
              <p className="text-sm text-slate-500 mt-2">Your input helps us improve.</p>
            </div>
          ) : (
            <>
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Feedback Type (Optional)
                </label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="general">General</option>
                  <option value="bug">Bug Report</option>
                  <option value="suggestion">Suggestion</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your thoughts, bugs, or suggestions..."
                  rows="5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting || !message.trim()}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, CheckCircle2, Clock, Reply as ReplyIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ManageContacts() {
  const [user, setUser] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      base44.auth.redirectToLogin(window.location.pathname);
    }
  };

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['contact-submissions'],
    queryFn: () => base44.entities.ContactSubmission.list('-created_date', 100),
    enabled: user?.role === 'admin'
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ContactSubmission.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contact-submissions'] })
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ submission, reply }) => {
      const response = await base44.functions.invoke('sendContactReply', {
        to: submission.email,
        name: submission.name,
        originalMessage: submission.message,
        reply: reply,
        language: submission.language || 'en'
      });
      return response.data;
    },
    onSuccess: (_, { submission }) => {
      updateStatusMutation.mutate({ id: submission.id, status: 'replied' });
      setReplyMessage('');
      setSelectedSubmission(null);
    }
  });

  const handleReply = () => {
    if (!replyMessage.trim() || !selectedSubmission) return;
    sendReplyMutation.mutate({ submission: selectedSubmission, reply: replyMessage });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-slate-600">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading submissions...</div>;
  }

  const statusColors = {
    new: 'bg-blue-500',
    read: 'bg-yellow-500',
    replied: 'bg-green-500'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Contact Submissions</h1>
        <Badge className="bg-slate-700">{submissions.length} Total</Badge>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No contact submissions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{submission.name}</CardTitle>
                      <Badge className={statusColors[submission.status]}>
                        {submission.status === 'new' && <Clock className="h-3 w-3 mr-1" />}
                        {submission.status === 'replied' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {submission.status}
                      </Badge>
                    </div>
                    <a href={`mailto:${submission.email}`} className="text-blue-600 hover:underline">
                      {submission.email}
                    </a>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(submission.created_date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {submission.status === 'new' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: submission.id, status: 'read' })}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Dialog open={selectedSubmission?.id === submission.id} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ReplyIcon className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Reply to {submission.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 mb-2">Original Message:</p>
                            <p className="text-slate-800">{submission.message}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                              Your Reply:
                            </label>
                            <Textarea
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder="Type your reply here..."
                              rows={6}
                              className="w-full"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedSubmission(null);
                                setReplyMessage('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleReply}
                              disabled={!replyMessage.trim() || sendReplyMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              {sendReplyMutation.isPending ? 'Sending...' : 'Send Reply'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{submission.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
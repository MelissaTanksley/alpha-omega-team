import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, User, ThumbsUp, Bell, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function NotificationList({ notifications }) {
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const getIcon = (type) => {
    switch (type) {
      case 'reply': return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'message': return <Mail className="h-4 w-4 text-green-400" />;
      case 'mention': return <User className="h-4 w-4 text-purple-400" />;
      case 'upvote': return <ThumbsUp className="h-4 w-4 text-amber-400" />;
      default: return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const getLink = (notification) => {
    if (notification.related_type === 'forum') return createPageUrl('Forum');
    if (notification.related_type === 'message') return createPageUrl('Messages');
    return null;
  };

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No notifications</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {notifications.map((notification) => {
        const link = getLink(notification);
        const content = (
          <div
            className={`p-4 border-b border-slate-700 hover:bg-slate-800/50 transition-colors flex gap-3 ${
              !notification.is_read ? 'bg-blue-900/20' : ''
            }`}
          >
            <div className="mt-1">{getIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200">{notification.title}</p>
              <p className="text-xs text-slate-400 mt-1">{notification.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-500">
                  {format(new Date(notification.created_date), 'MMM d, h:mm a')}
                </span>
                {notification.from_user && (
                  <>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{notification.from_user}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.preventDefault();
                    markReadMutation.mutate(notification.id);
                  }}
                >
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-500 hover:text-red-400"
                onClick={(e) => {
                  e.preventDefault();
                  deleteMutation.mutate(notification.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );

        return link ? (
          <Link key={notification.id} to={link}>
            {content}
          </Link>
        ) : (
          <div key={notification.id}>{content}</div>
        );
      })}
    </div>
  );
}
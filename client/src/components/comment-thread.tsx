import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { Comment } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CommentThreadProps {
  taskId: number;
  comments: Comment[];
  onAddComment: (taskId: number, content: string, parentId?: number) => void;
  onStatusChange: (taskId: number, newStatus: string, comment: string) => void;
  currentStatus: string;
}

const statusVariants = {
  pending: "status-pending",
  "work-in-process": "status-work-in-process", 
  "on-hold": "status-on-hold",
  completed: "status-completed",
};

const statusLabels = {
  pending: "Pending",
  "work-in-process": "Work In Process",
  "on-hold": "On Hold", 
  completed: "Completed",
};

export function CommentThread({ 
  taskId, 
  comments, 
  onAddComment, 
  onStatusChange, 
  currentStatus 
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(taskId, newComment);
      setNewComment("");
    }
  };

  const handleSubmitReply = (parentId: number) => {
    if (replyContent.trim()) {
      onAddComment(taskId, replyContent, parentId);
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
      "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300",
      "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300",
      "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300",
      "bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Organize comments into threads
  const parentComments = comments.filter(c => !c.parentId);
  const childComments = comments.filter(c => c.parentId);

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={cn("flex gap-3", isReply && "comment-thread ml-6 pl-4")}>
      <Avatar className={cn("h-8 w-8 text-xs font-semibold", isReply && "h-7 w-7", getAvatarColor(comment.author))}>
        <AvatarFallback className={getAvatarColor(comment.author)}>
          {getInitials(comment.author)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className={cn(
          "rounded-lg p-3 border",
          comment.isStatusChange 
            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
            : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{comment.author}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(comment.createdAt), "h:mm a")}
            </span>
            {comment.isStatusChange && (
              <Badge className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                Status Change
              </Badge>
            )}
          </div>
          
          {comment.isStatusChange && comment.oldStatus && comment.newStatus ? (
            <div className="mb-2">
              <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 flex-wrap">
                <span>Changed status from</span>
                <Badge className={cn("px-2 py-1 text-xs rounded-full", statusVariants[comment.oldStatus as keyof typeof statusVariants])}>
                  {statusLabels[comment.oldStatus as keyof typeof statusLabels]}
                </Badge>
                <span>to</span>
                <Badge className={cn("px-2 py-1 text-xs rounded-full", statusVariants[comment.newStatus as keyof typeof statusVariants])}>
                  {statusLabels[comment.newStatus as keyof typeof statusLabels]}
                </Badge>
              </div>
            </div>
          ) : null}
          
          <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyingTo(comment.id)}
            className="text-xs text-gray-500 hover:text-primary mt-2 p-0 h-auto"
          >
            Reply
          </Button>
        </div>
        
        {replyingTo === comment.id && (
          <div className="mt-3 ml-4">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full text-sm resize-none"
              rows={2}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={!replyContent.trim()}
              >
                Reply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Add Comment Input */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-gray-300 text-xs font-semibold">
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full text-sm resize-none"
            rows={2}
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
            >
              Add Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comment Thread */}
      {parentComments.length > 0 && (
        <div className="space-y-3">
          {parentComments.map(comment => (
            <div key={comment.id}>
              {renderComment(comment)}
              {/* Render replies */}
              {childComments
                .filter(child => child.parentId === comment.id)
                .map(reply => (
                  <div key={reply.id} className="mt-3">
                    {renderComment(reply, true)}
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

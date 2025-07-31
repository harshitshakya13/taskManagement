import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Edit, Trash2, MessageCircle, User, Calendar, UserCheck } from "lucide-react";
import { format } from "date-fns";
import type { Task, Comment } from "@shared/schema";
import { CommentThread } from "./comment-thread";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  comments: Comment[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onAddComment: (taskId: number, content: string, parentId?: number) => void;
  onStatusChange: (taskId: number, newStatus: string, comment: string) => void;
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

export function TaskCard({ 
  task, 
  comments, 
  onEdit, 
  onDelete, 
  onAddComment, 
  onStatusChange 
}: TaskCardProps) {
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  return (
    <Card className="task-card bg-white dark:bg-slate-800 shadow-sm border dark:border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {task.title}
              </h3>
              <Badge className={cn("px-2 py-1 text-xs font-medium rounded-full", statusVariants[task.status as keyof typeof statusVariants])}>
                {statusLabels[task.status as keyof typeof statusLabels]}
              </Badge>
            </div>
            
            {task.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {task.description}
              </p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>Added by <strong>{task.addedBy}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-3 w-3" />
                <span>Updated by <strong>{task.updatedBy}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Created: {format(new Date(task.createdAt), "MMM dd, yyyy 'at' h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Updated: {format(new Date(task.updatedAt), "MMM dd, yyyy 'at' h:mm a")}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="text-gray-400 hover:text-primary p-1 h-auto"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="text-gray-400 hover:text-red-500 p-1 h-auto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <div className="border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
        <Button
          variant="ghost"
          onClick={() => setCommentsExpanded(!commentsExpanded)}
          className="w-full justify-between px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-none"
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Comments ({comments.length})
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", commentsExpanded && "rotate-180")} />
        </Button>
        
        {commentsExpanded && (
          <div className="px-6 pb-4">
            <CommentThread
              taskId={task.id}
              comments={comments}
              onAddComment={onAddComment}
              onStatusChange={onStatusChange}
              currentStatus={task.status}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

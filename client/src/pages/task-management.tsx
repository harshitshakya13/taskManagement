import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Plus, ListTodo } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { TaskCard } from "@/components/task-card";
import { TaskModal } from "@/components/task-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Task, Comment } from "@shared/schema";

export default function TaskManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Fetch comments for all tasks
  const { data: allComments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/comments"],
    queryFn: async () => {
      const commentsPromises = tasks.map(task =>
        fetch(`/api/tasks/${task.id}/comments`).then(res => res.json())
      );
      const commentsArrays = await Promise.all(commentsPromises);
      return commentsArrays.flat();
    },
    enabled: tasks.length > 0,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...taskData }: any) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ taskId, content, parentId }: { taskId: number; content: string; parentId?: number }) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/comments`, {
        content,
        parentId,
        author: "Current User",
        isStatusChange: false,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comments"] });
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
    },
  });

  // Status change mutation
  const statusChangeMutation = useMutation({
    mutationFn: async ({ taskId, newStatus, comment }: { taskId: number; newStatus: string; comment: string }) => {
      // Update task status
      await updateTaskMutation.mutateAsync({ id: taskId, status: newStatus, updatedBy: "Current User" });
      
      // Add status change comment
      await addCommentMutation.mutateAsync({
        taskId,
        content: comment,
        parentId: undefined,
      });
    },
  });

  // Filter and search logic
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter(task => task.status === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [tasks, activeTab, searchTerm]);

  // Get status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: tasks.length,
      pending: 0,
      "work-in-process": 0,
      "on-hold": 0,
      completed: 0,
    };

    tasks.forEach(task => {
      if (task.status in counts) {
        counts[task.status as keyof typeof counts]++;
      }
    });

    return counts;
  }, [tasks]);

  const handleCreateTask = (taskData: any) => {
    createTaskMutation.mutate(taskData);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleUpdateTask = (taskData: any) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, ...taskData });
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (taskId: number) => {
    setDeleteTaskId(taskId);
  };

  const confirmDeleteTask = () => {
    if (deleteTaskId) {
      deleteTaskMutation.mutate(deleteTaskId);
      setDeleteTaskId(null);
    }
  };

  const handleAddComment = (taskId: number, content: string, parentId?: number) => {
    addCommentMutation.mutate({ taskId, content, parentId });
  };

  const handleStatusChange = (taskId: number, newStatus: string, comment: string) => {
    statusChangeMutation.mutate({ taskId, newStatus, comment });
  };

  const getCommentsForTask = (taskId: number) => {
    return allComments.filter(comment => comment.taskId === taskId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <ListTodo className="text-white text-xl h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 animate-glow">
                  &lt;HarshitTaskFlow/&gt;
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Professional Task Management</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Action Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Tasks <span className="ml-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 py-1 px-2 rounded-full text-xs">{statusCounts.all}</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending <span className="ml-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 py-1 px-2 rounded-full text-xs">{statusCounts.pending}</span>
            </TabsTrigger>
            <TabsTrigger value="work-in-process" className="flex items-center gap-2">
              In Progress <span className="ml-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 py-1 px-2 rounded-full text-xs">{statusCounts["work-in-process"]}</span>
            </TabsTrigger>
            <TabsTrigger value="on-hold" className="flex items-center gap-2">
              On Hold <span className="ml-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 py-1 px-2 rounded-full text-xs">{statusCounts["on-hold"]}</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              Completed <span className="ml-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 py-1 px-2 rounded-full text-xs">{statusCounts.completed}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Task List */}
        <div className="space-y-4">
          {tasksLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <ListTodo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? "No tasks found" : "No tasks yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Get started by creating your first task"
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setTaskModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <TaskCard
                  task={task}
                  comments={getCommentsForTask(task.id)}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onAddComment={handleAddComment}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>© 2025 &lt;HarshitTaskFlow/&gt;. Developed by <strong>Harshit Shakya</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>Version 1.0.0</span>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Task Modal */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        mode={editingTask ? "edit" : "create"}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

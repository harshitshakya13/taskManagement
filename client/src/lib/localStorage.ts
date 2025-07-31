import type { Task, Comment, InsertTask, InsertComment } from "@shared/schema";

export class LocalStorageManager {
  private static TASKS_KEY = "harshit_taskflow_tasks";
  private static COMMENTS_KEY = "harshit_taskflow_comments";
  private static TASK_ID_KEY = "harshit_taskflow_task_id";
  private static COMMENT_ID_KEY = "harshit_taskflow_comment_id";

  static getTasks(): Task[] {
    try {
      const data = localStorage.getItem(this.TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  }

  static getComments(): Comment[] {
    try {
      const data = localStorage.getItem(this.COMMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveComments(comments: Comment[]): void {
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
  }

  static getNextTaskId(): number {
    const id = parseInt(localStorage.getItem(this.TASK_ID_KEY) || "1");
    localStorage.setItem(this.TASK_ID_KEY, (id + 1).toString());
    return id;
  }

  static getNextCommentId(): number {
    const id = parseInt(localStorage.getItem(this.COMMENT_ID_KEY) || "1");
    localStorage.setItem(this.COMMENT_ID_KEY, (id + 1).toString());
    return id;
  }

  static initializeData(): void {
    if (this.getTasks().length === 0) {
      const sampleTasks: Task[] = [
        {
          id: 1,
          title: "Implement User Authentication",
          description: "Set up JWT authentication with login, register, and password reset functionality. Include email verification and role-based access control.",
          status: "work-in-process",
          addedBy: "Sarah Chen",
          updatedBy: "Mike Johnson",
          createdAt: new Date("2024-12-15T14:30:00Z"),
          updatedAt: new Date("2024-12-16T09:15:00Z"),
        },
        {
          id: 2,
          title: "Database Migration Scripts",
          description: "Create migration scripts for user tables, indexes, and initial data seeding for the production environment.",
          status: "completed",
          addedBy: "Alex Lee",
          updatedBy: "Alex Lee",
          createdAt: new Date("2024-12-14T10:00:00Z"),
          updatedAt: new Date("2024-12-16T11:30:00Z"),
        },
        {
          id: 3,
          title: "API Documentation Update",
          description: "Update API documentation with new endpoints and authentication requirements. Include request/response examples and error codes.",
          status: "pending",
          addedBy: "David Wilson",
          updatedBy: "David Wilson",
          createdAt: new Date("2024-12-16T08:00:00Z"),
          updatedAt: new Date("2024-12-16T08:00:00Z"),
        },
      ];

      const sampleComments: Comment[] = [
        {
          id: 1,
          taskId: 1,
          parentId: null,
          content: "Changed status from Pending to Work In Process. Started working on the JWT implementation. Setting up the authentication middleware first.",
          author: "Mike Johnson",
          createdAt: new Date("2024-12-16T07:00:00Z"),
          isStatusChange: true,
          oldStatus: "pending",
          newStatus: "work-in-process",
        },
        {
          id: 2,
          taskId: 1,
          parentId: null,
          content: "Great! Make sure to implement rate limiting for the authentication endpoints to prevent brute force attacks.",
          author: "Sarah Chen",
          createdAt: new Date("2024-12-16T05:00:00Z"),
          isStatusChange: false,
          oldStatus: null,
          newStatus: null,
        },
        {
          id: 3,
          taskId: 1,
          parentId: 2,
          content: "@Sarah Chen Good point! I'll also add Redis for session management and implement proper logout handling.",
          author: "Alex Lee",
          createdAt: new Date("2024-12-16T06:00:00Z"),
          isStatusChange: false,
          oldStatus: null,
          newStatus: null,
        },
      ];

      this.saveTasks(sampleTasks);
      this.saveComments(sampleComments);
      localStorage.setItem(this.TASK_ID_KEY, "4");
      localStorage.setItem(this.COMMENT_ID_KEY, "4");
    }
  }

  // Task operations
  static createTask(insertTask: InsertTask): Task {
    const tasks = this.getTasks();
    const id = this.getNextTaskId();
    const now = new Date();
    
    const task: Task = {
      ...insertTask,
      id,
      description: insertTask.description || null,
      createdAt: now,
      updatedAt: now,
    };
    
    tasks.push(task);
    this.saveTasks(tasks);
    return task;
  }

  static updateTask(id: number, updateData: Partial<InsertTask>): Task | null {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) return null;
    
    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...updateData,
      description: updateData.description !== undefined ? updateData.description || null : tasks[taskIndex].description,
      updatedAt: new Date(),
    };
    
    tasks[taskIndex] = updatedTask;
    this.saveTasks(tasks);
    return updatedTask;
  }

  static deleteTask(id: number): boolean {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    
    if (filteredTasks.length === tasks.length) return false;
    
    this.saveTasks(filteredTasks);
    
    // Also delete associated comments
    const comments = this.getComments();
    const filteredComments = comments.filter(c => c.taskId !== id);
    this.saveComments(filteredComments);
    
    return true;
  }

  static getTasksByStatus(status?: string): Task[] {
    const tasks = this.getTasks();
    if (!status || status === "all") return tasks;
    return tasks.filter(t => t.status === status);
  }

  // Comment operations
  static getCommentsByTaskId(taskId: number): Comment[] {
    const comments = this.getComments();
    return comments
      .filter(c => c.taskId === taskId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static createComment(insertComment: InsertComment): Comment {
    const comments = this.getComments();
    const id = this.getNextCommentId();
    
    const comment: Comment = {
      ...insertComment,
      id,
      parentId: insertComment.parentId || null,
      isStatusChange: insertComment.isStatusChange || null,
      oldStatus: insertComment.oldStatus || null,
      newStatus: insertComment.newStatus || null,
      createdAt: new Date(),
    };
    
    comments.push(comment);
    this.saveComments(comments);
    return comment;
  }

  static deleteComment(id: number): boolean {
    const comments = this.getComments();
    const filteredComments = comments.filter(c => c.id !== id);
    
    if (filteredComments.length === comments.length) return false;
    
    this.saveComments(filteredComments);
    return true;
  }
}
import { type Task, type InsertTask, type Comment, type InsertComment } from "@shared/schema";

export interface IStorage {
  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Comments
  getCommentsByTaskId(taskId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
}

// LocalStorage implementation for browser-side storage
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
}

export class MemStorage implements IStorage {
  private tasks: Map<number, Task>;
  private comments: Map<number, Comment>;
  private currentTaskId: number;
  private currentCommentId: number;

  constructor() {
    this.tasks = new Map();
    this.comments = new Map();
    this.currentTaskId = 1;
    this.currentCommentId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Initialize with some sample data
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

    sampleTasks.forEach(task => this.tasks.set(task.id, task));
    sampleComments.forEach(comment => this.comments.set(comment.id, comment));
    
    this.currentTaskId = Math.max(...sampleTasks.map(t => t.id)) + 1;
    this.currentCommentId = Math.max(...sampleComments.map(c => c.id)) + 1;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const now = new Date();
    const task: Task = {
      ...insertTask,
      id,
      description: insertTask.description || null,
      status: insertTask.status || "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;

    const updatedTask: Task = {
      ...existingTask,
      ...updateData,
      description: updateData.description !== undefined ? updateData.description || null : existingTask.description,
      updatedAt: new Date(),
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const deleted = this.tasks.delete(id);
    // Also delete associated comments
    if (deleted) {
      Array.from(this.comments.entries()).forEach(([commentId, comment]) => {
        if (comment.taskId === id) {
          this.comments.delete(commentId);
        }
      });
    }
    return deleted;
  }

  async getCommentsByTaskId(taskId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.taskId === taskId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const comment: Comment = {
      ...insertComment,
      id,
      parentId: insertComment.parentId || null,
      isStatusChange: insertComment.isStatusChange || null,
      oldStatus: insertComment.oldStatus || null,
      newStatus: insertComment.newStatus || null,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }
}

export const storage = new MemStorage();

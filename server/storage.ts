import { type Task, type InsertTask, type Comment, type InsertComment } from "@shared/schema";
import { promises as fs } from "fs";
import path from "path";

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

// JSON file-based storage implementation
export class JsonFileStorage implements IStorage {
  private tasksPath = path.join(process.cwd(), "data", "tasks.json");
  private commentsPath = path.join(process.cwd(), "data", "comments.json");
  private countersPath = path.join(process.cwd(), "data", "counters.json");

  private async readTasks(): Promise<Task[]> {
    try {
      const data = await fs.readFile(this.tasksPath, "utf-8");
      const tasks = JSON.parse(data);
      return tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
    } catch (error) {
      console.error("Error reading tasks:", error);
      return [];
    }
  }

  private async writeTasks(tasks: Task[]): Promise<void> {
    try {
      await fs.writeFile(this.tasksPath, JSON.stringify(tasks, null, 2));
    } catch (error) {
      console.error("Error writing tasks:", error);
    }
  }

  private async readComments(): Promise<Comment[]> {
    try {
      const data = await fs.readFile(this.commentsPath, "utf-8");
      const comments = JSON.parse(data);
      return comments.map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
      }));
    } catch (error) {
      console.error("Error reading comments:", error);
      return [];
    }
  }

  private async writeComments(comments: Comment[]): Promise<void> {
    try {
      await fs.writeFile(this.commentsPath, JSON.stringify(comments, null, 2));
    } catch (error) {
      console.error("Error writing comments:", error);
    }
  }

  private async readCounters(): Promise<{ nextTaskId: number; nextCommentId: number }> {
    try {
      const data = await fs.readFile(this.countersPath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading counters:", error);
      return { nextTaskId: 1, nextCommentId: 1 };
    }
  }

  private async writeCounters(counters: { nextTaskId: number; nextCommentId: number }): Promise<void> {
    try {
      await fs.writeFile(this.countersPath, JSON.stringify(counters, null, 2));
    } catch (error) {
      console.error("Error writing counters:", error);
    }
  }

  private async getNextTaskId(): Promise<number> {
    const counters = await this.readCounters();
    const nextId = counters.nextTaskId;
    await this.writeCounters({ ...counters, nextTaskId: nextId + 1 });
    return nextId;
  }

  private async getNextCommentId(): Promise<number> {
    const counters = await this.readCounters();
    const nextId = counters.nextCommentId;
    await this.writeCounters({ ...counters, nextCommentId: nextId + 1 });
    return nextId;
  }

  async getTasks(): Promise<Task[]> {
    const tasks = await this.readTasks();
    return tasks.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    const tasks = await this.readTasks();
    return tasks.find(task => task.id === id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const tasks = await this.readTasks();
    const id = await this.getNextTaskId();
    const now = new Date();
    
    const task: Task = {
      ...insertTask,
      id,
      description: insertTask.description || null,
      status: insertTask.status || "pending",
      createdAt: now,
      updatedAt: now,
    };
    
    tasks.push(task);
    await this.writeTasks(tasks);
    return task;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const tasks = await this.readTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) return undefined;
    
    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...updateData,
      description: updateData.description !== undefined ? updateData.description || null : tasks[taskIndex].description,
      updatedAt: new Date(),
    };
    
    tasks[taskIndex] = updatedTask;
    await this.writeTasks(tasks);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const tasks = await this.readTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === tasks.length) return false;
    
    await this.writeTasks(filteredTasks);
    
    // Also delete associated comments
    const comments = await this.readComments();
    const filteredComments = comments.filter(comment => comment.taskId !== id);
    await this.writeComments(filteredComments);
    
    return true;
  }

  async getCommentsByTaskId(taskId: number): Promise<Comment[]> {
    const comments = await this.readComments();
    return comments
      .filter(comment => comment.taskId === taskId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const comments = await this.readComments();
    const id = await this.getNextCommentId();
    
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
    await this.writeComments(comments);
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const comments = await this.readComments();
    const filteredComments = comments.filter(comment => comment.id !== id);
    
    if (filteredComments.length === comments.length) return false;
    
    await this.writeComments(filteredComments);
    return true;
  }
}

export const storage = new JsonFileStorage();

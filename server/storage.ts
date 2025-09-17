import { type User, type InsertUser, type Transaction, type InsertTransaction } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const TRANSACTIONS_FILE = path.join(DATA_DIR, "transactions.json");

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: string, newBalance: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserStatus(id: string, isActive: boolean): Promise<User | undefined>;
  
  // Authentication methods
  validateUser(email: string, password: string): Promise<User | null>;
  
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined>;
  getUserTransactionSummary(userId: string): Promise<{
    totalSent: string;
    totalReceived: string;
    transactionCount: number;
  }>;
}

export class FileStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private transactions: Map<string, Transaction> = new Map();

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await this.loadData();
    } catch (error) {
      console.error("Failed to initialize storage:", error);
    }
  }

  private async loadData() {
    try {
      // Load users
      try {
        const usersData = await fs.readFile(USERS_FILE, "utf-8");
        const users = JSON.parse(usersData) as User[];
        users.forEach(user => this.users.set(user.id, user));
      } catch (error) {
        // File doesn't exist yet, that's okay
      }

      // Load transactions
      try {
        const transactionsData = await fs.readFile(TRANSACTIONS_FILE, "utf-8");
        const transactions = JSON.parse(transactionsData) as Transaction[];
        transactions.forEach(transaction => this.transactions.set(transaction.id, transaction));
      } catch (error) {
        // File doesn't exist yet, that's okay
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }

  private async saveUsers() {
    try {
      const usersArray = Array.from(this.users.values());
      await fs.writeFile(USERS_FILE, JSON.stringify(usersArray, null, 2));
    } catch (error) {
      console.error("Failed to save users:", error);
    }
  }

  private async saveTransactions() {
    try {
      const transactionsArray = Array.from(this.transactions.values());
      await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify(transactionsArray, null, 2));
    } catch (error) {
      console.error("Failed to save transactions:", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      balance: "1000.00", // Starting balance
      isActive: true,
      isAdmin: false,
      createdAt: new Date(),
    };
    
    this.users.set(id, user);
    await this.saveUsers();
    return user;
  }

  async updateUserBalance(id: string, newBalance: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, balance: newBalance };
    this.users.set(id, updatedUser);
    await this.saveUsers();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, isActive };
    this.users.set(id, updatedUser);
    await this.saveUsers();
    return updatedUser;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.isActive) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      status: "completed",
      createdAt: new Date(),
      stripePaymentIntentId: null,
      description: insertTransaction.description ?? null,
      fromUserId: insertTransaction.fromUserId ?? null,
      toUserId: insertTransaction.toUserId ?? null,
    };
    
    this.transactions.set(id, transaction);
    await this.saveTransactions();
    return transaction;
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.fromUserId === userId || transaction.toUserId === userId
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, status };
    this.transactions.set(id, updatedTransaction);
    await this.saveTransactions();
    return updatedTransaction;
  }

  async getUserTransactionSummary(userId: string): Promise<{
    totalSent: string;
    totalReceived: string;
    transactionCount: number;
  }> {
    const transactions = await this.getTransactionsByUserId(userId);
    
    let totalSent = 0;
    let totalReceived = 0;
    
    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      if (transaction.fromUserId === userId) {
        totalSent += amount;
      } else if (transaction.toUserId === userId) {
        totalReceived += amount;
      }
    });
    
    return {
      totalSent: totalSent.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      transactionCount: transactions.length,
    };
  }
}

export const storage = new FileStorage();

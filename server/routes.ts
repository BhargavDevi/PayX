import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, paymentSchema } from "@shared/schema";
import session from "express-session";
import Stripe from "stripe";

// Initialize Stripe (optional for development)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    })
  : null;

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'banking-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  };

  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", requireAuth, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment processing not available. Stripe not configured." });
      }
      
      const { amount, recipientEmail, description } = paymentSchema.parse(req.body);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "inr",
        metadata: {
          senderId: req.session.userId!,
          recipientEmail,
          description: description || '',
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post("/api/process-payment", requireAuth, async (req, res) => {
    try {
      const { recipientEmail, amount, description } = paymentSchema.parse(req.body);
      
      const sender = await storage.getUser(req.session.userId!);
      const recipient = await storage.getUserByEmail(recipientEmail);
      
      if (!sender || !recipient) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const senderBalance = parseFloat(sender.balance);
      if (senderBalance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      // Update balances
      const newSenderBalance = (senderBalance - amount).toFixed(2);
      const newRecipientBalance = (parseFloat(recipient.balance) + amount).toFixed(2);
      
      await storage.updateUserBalance(sender.id, newSenderBalance);
      await storage.updateUserBalance(recipient.id, newRecipientBalance);
      
      // Create transaction records
      await storage.createTransaction({
        fromUserId: sender.id,
        toUserId: recipient.id,
        amount: amount.toFixed(2),
        type: 'transfer',
        description: description || `Payment to ${recipient.fullName}`,
      });
      
      res.json({ message: 'Payment processed successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Transaction routes
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByUserId(req.session.userId!);
      
      // Populate user details
      const enrichedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          const fromUser = transaction.fromUserId ? await storage.getUser(transaction.fromUserId) : null;
          const toUser = transaction.toUserId ? await storage.getUser(transaction.toUserId) : null;
          
          return {
            ...transaction,
            fromUser: fromUser ? { id: fromUser.id, fullName: fromUser.fullName, email: fromUser.email } : null,
            toUser: toUser ? { id: toUser.id, fullName: toUser.fullName, email: toUser.email } : null,
          };
        })
      );
      
      res.json(enrichedTransactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/transaction-summary", requireAuth, async (req, res) => {
    try {
      const summary = await storage.getUserTransactionSummary(req.session.userId!);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/transactions", requireAdmin, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      
      // Populate user details
      const enrichedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          const fromUser = transaction.fromUserId ? await storage.getUser(transaction.fromUserId) : null;
          const toUser = transaction.toUserId ? await storage.getUser(transaction.toUserId) : null;
          
          return {
            ...transaction,
            fromUser: fromUser ? { id: fromUser.id, fullName: fromUser.fullName, email: fromUser.email } : null,
            toUser: toUser ? { id: toUser.id, fullName: toUser.fullName, email: toUser.email } : null,
          };
        })
      );
      
      res.json(enrichedTransactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/users/:id/status", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const updatedUser = await storage.updateUserStatus(id, isActive);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const transactions = await storage.getAllTransactions();
      
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const dailyTransactions = transactions.filter(t => 
        t.createdAt && new Date(t.createdAt).toISOString().split('T')[0] === todayString
      );
      
      const totalVolume = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const activeUsers = users.filter(u => u.isActive).length;
      
      res.json({
        totalUsers: users.length,
        activeUsers,
        dailyTransactions: dailyTransactions.length,
        totalVolume: totalVolume.toFixed(2),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

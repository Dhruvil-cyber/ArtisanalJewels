import {
  users,
  categories,
  products,
  productVariants,
  cart,
  orders,
  reviews,
  newsletter,
  banners,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductVariant,
  type InsertVariant,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type Review,
  type InsertReview,
  type Newsletter,
  type InsertNewsletter,
  type Banner,
  type InsertBanner,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, sql, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(filters?: {
    category?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    metal?: string;
    gemstone?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductByHandle(handle: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Product variant operations
  getProductVariants(productId: number): Promise<ProductVariant[]>;
  createVariant(variant: InsertVariant): Promise<ProductVariant>;
  updateVariant(id: number, variant: Partial<InsertVariant>): Promise<ProductVariant>;
  
  // Cart operations
  getCartItems(userId?: string, sessionId?: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId?: string, sessionId?: string): Promise<void>;
  
  // Order operations
  getOrders(userId?: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // Review operations
  getReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Promotion operations
  getActivePromotions(): Promise<any[]>;
  createPromotion(promotion: any): Promise<any>;
  
  // Analytics operations
  getAnalytics(startDate: string, endDate: string): Promise<any[]>;
  updateAnalytics(date: string, data: any): Promise<void>;
  
  // Wishlist operations
  addToWishlist(userId: string, productId: number): Promise<void>;
  removeFromWishlist(userId: string, productId: number): Promise<void>;
  getWishlist(userId: string): Promise<number[]>;

  // Additional Analytics operations for admin dashboard
  getTotalOrders(): Promise<number>;
  getTotalRevenue(): Promise<number>;
  getTotalCustomers(): Promise<number>;
  getOrdersFromDate(date: Date): Promise<Order[]>;
  getRevenueFromDate(date: Date): Promise<number>;
  getRevenueAnalytics(period: string): Promise<any>;
  getTopSellingProducts(): Promise<any[]>;
  getLowStockProducts(): Promise<Product[]>;
  getTotalProducts(): Promise<number>;
  getCustomerAnalytics(): Promise<any>;
  
  // Banner operations
  getBanners(): Promise<Banner[]>;
  getActiveBanners(): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: number, banner: Partial<InsertBanner>): Promise<Banner>;
  deleteBanner(id: number): Promise<void>;

  // Customer management operations
  getAllCustomers(): Promise<User[]>;
  getCustomerStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    lastOrder: Date | null;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  // Product operations
  async getProducts(filters: {
    category?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    metal?: string;
    gemstone?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<Product[]> {
    const conditions = [eq(products.isActive, true)];
    
    if (filters.category) {
      conditions.push(eq(products.category, filters.category));
    }
    
    if (filters.search) {
      conditions.push(
        or(
          ilike(products.title, `%${filters.search}%`),
          ilike(products.description, `%${filters.search}%`)
        )!
      );
    }
    
    if (filters.minPrice) {
      conditions.push(sql`${products.basePrice}::numeric >= ${filters.minPrice}`);
    }
    
    if (filters.maxPrice) {
      conditions.push(sql`${products.basePrice}::numeric <= ${filters.maxPrice}`);
    }
    
    if (filters.metal) {
      conditions.push(eq(products.metal, filters.metal));
    }
    
    if (filters.gemstone) {
      conditions.push(eq(products.gemstone, filters.gemstone));
    }
    
    if (filters.featured) {
      conditions.push(eq(products.isFeatured, true));
    }

    let queryBuilder = db.select().from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));

    if (filters.limit) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }
    
    if (filters.offset) {
      queryBuilder = queryBuilder.offset(filters.offset);
    }

    return await queryBuilder;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductByHandle(handle: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.handle, handle));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Product variant operations
  async getProductVariants(productId: number): Promise<ProductVariant[]> {
    return await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  }

  async createVariant(variant: InsertVariant): Promise<ProductVariant> {
    const [created] = await db.insert(productVariants).values(variant).returning();
    return created;
  }

  async updateVariant(id: number, variant: Partial<InsertVariant>): Promise<ProductVariant> {
    const [updated] = await db
      .update(productVariants)
      .set(variant)
      .where(eq(productVariants.id, id))
      .returning();
    return updated;
  }

  // Cart operations
  async getCartItems(userId?: string, sessionId?: string): Promise<CartItem[]> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(cart.userId, userId));
    }
    if (sessionId) {
      conditions.push(eq(cart.sessionId, sessionId));
    }
    
    if (conditions.length === 0) return [];
    
    // First get cart items
    const cartItems = await db.select().from(cart).where(or(...conditions));
    
    // Then get product details for each cart item
    const cartWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
        if (product.length > 0) {
          return {
            ...item,
            price: product[0].basePrice,
            title: product[0].title,
            images: product[0].images
          };
        }
        return item;
      })
    );
    
    return cartWithProducts as CartItem[];
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Build conditions to check for existing cart item
    const conditions = [];
    
    // For authenticated users, match by userId
    // For guests, match by sessionId
    if (item.userId) {
      conditions.push(eq(cart.userId, item.userId));
    } else if (item.sessionId) {
      conditions.push(eq(cart.sessionId, item.sessionId));
      conditions.push(isNull(cart.userId)); // Ensure we don't match user carts
    } else {
      // Fallback: create new item if neither userId nor sessionId
      const [created] = await db.insert(cart).values(item).returning();
      return created;
    }

    conditions.push(eq(cart.productId, item.productId));
    
    // Also check variantId match (both null/undefined or same value)
    if (item.variantId !== undefined && item.variantId !== null) {
      conditions.push(eq(cart.variantId, item.variantId));
    } else {
      conditions.push(isNull(cart.variantId));
    }

    const existingItem = await db
      .select()
      .from(cart)
      .where(and(...conditions))
      .limit(1);

    if (existingItem.length > 0) {
      // Update existing item quantity
      const currentQuantity = existingItem[0].quantity || 0;
      const addQuantity = item.quantity || 1;
      const newQuantity = currentQuantity + addQuantity;
      const [updated] = await db
        .update(cart)
        .set({ 
          quantity: newQuantity, 
          updatedAt: new Date() 
        })
        .where(eq(cart.id, existingItem[0].id))
        .returning();
      return updated;
    } else {
      // Create new cart item
      const [created] = await db.insert(cart).values(item).returning();
      return created;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updated] = await db
      .update(cart)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cart.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cart).where(eq(cart.id, id));
  }

  async clearCart(userId?: string, sessionId?: string): Promise<void> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(cart.userId, userId));
    }
    if (sessionId) {
      conditions.push(eq(cart.sessionId, sessionId));
    }
    
    if (conditions.length > 0) {
      await db.delete(cart).where(or(...conditions));
    }
  }

  // Order operations
  async getOrders(userId?: string): Promise<Order[]> {
    const query = db.select().from(orders).orderBy(desc(orders.createdAt));
    
    if (userId) {
      return await query.where(eq(orders.userId, userId));
    }
    
    return await query;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.paymentIntentId, paymentIntentId));
    return order || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Review operations
  async getReviews(productId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  // Wishlist operations
  async addToWishlist(userId: string, productId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const currentWishlist = user.wishlist || [];
    if (!currentWishlist.includes(productId.toString())) {
      const updatedWishlist = [...currentWishlist, productId.toString()];
      await db
        .update(users)
        .set({ wishlist: updatedWishlist })
        .where(eq(users.id, userId));
    }
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const currentWishlist = user.wishlist || [];
    const updatedWishlist = currentWishlist.filter(id => id !== productId.toString());
    await db
      .update(users)
      .set({ wishlist: updatedWishlist })
      .where(eq(users.id, userId));
  }

  async getWishlist(userId: string): Promise<number[]> {
    const user = await this.getUser(userId);
    if (!user) return [];
    
    return (user.wishlist || []).map(id => parseInt(id));
  }

  // Additional Analytics operations for admin dashboard
  async getTotalOrders(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(orders);
    return result[0]?.count || 0;
  }

  async getTotalRevenue(): Promise<number> {
    const result = await db.select({ 
      total: sql<number>`coalesce(sum(${orders.total}), 0)` 
    }).from(orders);
    return result[0]?.total || 0;
  }

  async getTotalCustomers(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0]?.count || 0;
  }

  async getOrdersFromDate(date: Date): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(sql`${orders.createdAt} >= ${date}`)
      .orderBy(desc(orders.createdAt));
  }

  async getRevenueFromDate(date: Date): Promise<number> {
    const result = await db.select({ 
      total: sql<number>`coalesce(sum(${orders.total}), 0)` 
    }).from(orders)
    .where(sql`${orders.createdAt} >= ${date}`);
    return result[0]?.total || 0;
  }

  async getRevenueAnalytics(period: string): Promise<any> {
    const now = new Date();
    let days = 7;
    
    switch (period) {
      case "30d": days = 30; break;
      case "90d": days = 90; break;
      case "1y": days = 365; break;
      default: days = 7;
    }

    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    // Generate revenue data for each day
    const revenueData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const result = await db.select({ 
        total: sql<number>`coalesce(sum(${orders.total}), 0)` 
      }).from(orders)
      .where(sql`${orders.createdAt} >= ${date} AND ${orders.createdAt} < ${nextDate}`);
      
      revenueData.push({
        date: date.toISOString().split('T')[0],
        revenue: result[0]?.total || 0
      });
    }

    return revenueData;
  }

  async getTopSellingProducts(): Promise<any[]> {
    // Mock data for now since we need order items for real calculation
    return [
      { id: 1, title: "Diamond Solitaire Ring", sales: 24, revenue: 48000 },
      { id: 2, title: "Pearl Necklace", sales: 18, revenue: 25200 },
      { id: 3, title: "Gold Earrings", sales: 15, revenue: 22500 },
      { id: 4, title: "Tennis Bracelet", sales: 12, revenue: 57000 },
      { id: 5, title: "Ruby Ring", sales: 8, revenue: 24000 }
    ];
  }

  async getLowStockProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(sql`${products.stock} <= 5`)
      .orderBy(asc(products.stock));
  }

  async getTotalProducts(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(products);
    return result[0]?.count || 0;
  }

  async getCustomerAnalytics(): Promise<any> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const totalCustomers = await this.getTotalCustomers();
    
    const newCustomersThisMonth = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(users)
    .where(sql`${users.createdAt} >= ${thisMonth}`);

    const newCustomersLastMonth = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(users)
    .where(sql`${users.createdAt} >= ${lastMonth} AND ${users.createdAt} < ${thisMonth}`);

    return {
      totalCustomers,
      newCustomersThisMonth: newCustomersThisMonth[0]?.count || 0,
      newCustomersLastMonth: newCustomersLastMonth[0]?.count || 0,
      customerGrowth: 12.5 // Mock growth percentage
    };
  }

  // Placeholder implementations for existing interface methods
  async getActivePromotions(): Promise<any[]> {
    return [];
  }

  async createPromotion(promotion: any): Promise<any> {
    return promotion;
  }

  async getAnalytics(startDate: string, endDate: string): Promise<any[]> {
    return [];
  }

  async updateAnalytics(date: string, data: any): Promise<void> {
    // Placeholder implementation
  }

  // Customer management implementations
  async getAllCustomers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  // Banner operations
  async getBanners(): Promise<Banner[]> {
    return await db.select().from(banners).orderBy(asc(banners.sortOrder));
  }

  async getActiveBanners(): Promise<Banner[]> {
    return await db.select().from(banners)
      .where(eq(banners.isActive, true))
      .orderBy(asc(banners.sortOrder));
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const [created] = await db.insert(banners).values(banner).returning();
    return created;
  }

  async updateBanner(id: number, banner: Partial<InsertBanner>): Promise<Banner> {
    const [updated] = await db
      .update(banners)
      .set({ ...banner, updatedAt: new Date() })
      .where(eq(banners.id, id))
      .returning();
    return updated;
  }

  async deleteBanner(id: number): Promise<void> {
    await db.delete(banners).where(eq(banners.id, id));
  }

  async getCustomerStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    lastOrder: Date | null;
  }> {
    // Get total orders count
    const orderCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.userId, userId));
    
    // Get total spent
    const totalSpentResult = await db
      .select({ total: sql<number>`COALESCE(sum(${orders.total}), 0)` })
      .from(orders)
      .where(eq(orders.userId, userId));
    
    // Get last order date
    const lastOrderResult = await db
      .select({ createdAt: orders.createdAt })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(1);

    return {
      totalOrders: orderCountResult[0]?.count || 0,
      totalSpent: totalSpentResult[0]?.total || 0,
      lastOrder: lastOrderResult[0]?.createdAt || null
    };
  }

  // Newsletter operations
  async getNewsletterSubscribers(): Promise<Newsletter[]> {
    return await db
      .select()
      .from(newsletter)
      .where(eq(newsletter.isActive, true))
      .orderBy(desc(newsletter.subscribedAt));
  }

  async createNewsletter(data: InsertNewsletter): Promise<Newsletter> {
    const [created] = await db.insert(newsletter).values(data).returning();
    return created;
  }

  async updateNewsletterSubscription(id: number, data: Partial<InsertNewsletter>): Promise<Newsletter> {
    const [updated] = await db
      .update(newsletter)
      .set(data)
      .where(eq(newsletter.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();

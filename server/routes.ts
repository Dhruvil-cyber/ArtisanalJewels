import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateToken, hashPassword, comparePassword, requireAuth, type AuthenticatedRequest } from "./auth";
import { insertProductSchema, insertCategorySchema, insertReviewSchema, insertUserSchema, insertBannerSchema, reviews } from "@shared/schema";
import cookieParser from "cookie-parser";
import Stripe from "stripe";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(cookieParser());

  // Initialize Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'customer'
      });

      // Generate JWT token
      const token = generateToken(user);
      
      // Set HTTP-only cookie for cross-domain authentication
      res.cookie('authToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

      res.status(201).json({ 
        message: "User created successfully", 
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = generateToken(user);
      
      // Set HTTP-only cookie for cross-domain authentication
      res.cookie('authToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
      res.json({ 
        message: "Login successful", 
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Redirect /api/login to client-side login page (compatibility)
  app.get('/api/login', (req, res) => {
    res.redirect('/login');
  });

  // Redirect /api/auth/login GET requests to login page
  app.get('/api/auth/login', (req, res) => {
    res.redirect('/login');
  });

  // Handle both GET and POST logout for compatibility
  app.get('/api/logout', (req, res) => {
    res.clearCookie('authToken');
    res.redirect('/');
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: "Logged out successfully" });
  });

  app.get('/api/auth/user', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await storage.getUser(authReq.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public product routes
  app.get("/api/products", async (req, res) => {
    try {
      const {
        category,
        search,
        minPrice,
        maxPrice,
        metal,
        gemstone,
        featured,
        limit = "20",
        offset = "0"
      } = req.query;

      const filters = {
        category: category ? parseInt(category as string) : undefined,
        search: search as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        metal: metal as string,
        gemstone: gemstone as string,
        featured: featured === "true",
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      const products = await storage.getProducts(filters);
      
      // Add review statistics to each product
      const productsWithReviews = await Promise.all(
        products.map(async (product) => {
          const productReviews = await db
            .select()
            .from(reviews)
            .where(and(eq(reviews.productId, product.id), eq(reviews.isApproved, true)));
          
          const reviewCount = productReviews.length;
          let averageRating = 0;
          
          if (reviewCount > 0) {
            const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = totalRating / reviewCount;
          }
          
          return {
            ...product,
            reviewCount,
            averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
          };
        })
      );
      
      res.json(productsWithReviews);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const variants = await storage.getProductVariants(id);
      const reviews = await storage.getReviews(id);
      
      res.json({ ...product, variants, reviews });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/products/handle/:handle", async (req, res) => {
    try {
      const product = await storage.getProductByHandle(req.params.handle);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const variants = await storage.getProductVariants(product.id);
      const reviews = await storage.getReviews(product.id);
      
      res.json({ ...product, variants, reviews });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Cart routes
  app.get("/api/cart", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const sessionId = req.headers['x-session-id'] as string;
      
      const items = await storage.getCartItems(userId, sessionId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const sessionId = req.headers['x-session-id'] as string;
      const { productId, variantId, quantity = 1 } = req.body;

      const item = await storage.addToCart({
        userId,
        sessionId,
        productId,
        variantId,
        quantity,
      });
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;

      const item = await storage.updateCartItem(id, quantity);
      res.json(item);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  // Payment routes (Stripe)
  app.post("/api/create-payment-intent", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { cartItems, amount, currency = 'aud' } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Create customer for Indian export regulations compliance
      const customer = await stripe.customers.create({
        name: authReq.user!.firstName && authReq.user!.lastName 
          ? `${authReq.user!.firstName} ${authReq.user!.lastName}` 
          : 'Customer',
        email: authReq.user!.email || undefined,
        address: {
          line1: '123 Sample Street',
          city: 'International City',
          state: 'State',
          postal_code: '12345',
          country: 'AU' // Australia - non-Indian address required
        }
      });

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        description: "Artisanal Jewels - Luxury jewelry purchase from Melbourne, Australia",
        customer: customer.id,
        shipping: {
          name: authReq.user!.firstName && authReq.user!.lastName 
            ? `${authReq.user!.firstName} ${authReq.user!.lastName}` 
            : 'Customer',
          address: {
            line1: '123 Sample Street',
            city: 'International City',
            state: 'State',
            postal_code: '12345',
            country: 'AU' // Australia
          }
        },
        metadata: {
          userId: authReq.user!.id,
          itemCount: cartItems?.length?.toString() || "0"
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  app.post("/api/confirm-payment", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { paymentIntentId, shippingAddress } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not completed" });
      }

      // Get user's cart items
      const userId = authReq.user!.id;
      const sessionId = req.headers['x-session-id'] as string;
      const cartItems = await storage.getCartItems(userId, sessionId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate pricing breakdown
      const subtotal = cartItems.reduce((sum, item) => 
        sum + (parseFloat(item.price || "0") * (item.quantity || 1)), 0
      );
      const shipping = 25.00; // Fixed shipping for Australia
      const tax = 0.00; // No tax for now
      const total = subtotal + shipping + tax;

      // Create order in database
      const orderData = {
        userId,
        email: authReq.user!.email,
        items: cartItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          title: item.title
        })),
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2), 
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        currency: paymentIntent.currency.toUpperCase(),
        status: 'confirmed',
        shippingAddress,
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'paid'
      };
      
      console.log('🛍️ Creating order with data:', JSON.stringify(orderData, null, 2));
      const order = await storage.createOrder(orderData);

      // Clear cart after successful order
      await storage.clearCart(userId, sessionId);

      res.json({ 
        message: "Payment confirmed and order created",
        orderId: order.id,
        order
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Error confirming payment" });
    }
  });

  // Wishlist routes (protected)
  app.get("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const wishlistIds = await storage.getWishlist(userId);
      
      // Get full product details for wishlist items
      const products = [];
      for (const productId of wishlistIds) {
        const product = await storage.getProduct(productId);
        if (product) {
          products.push(product);
        }
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { productId } = req.body;

      await storage.addToWishlist(userId, productId);
      res.status(201).json({ message: "Added to wishlist" });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const productId = parseInt(req.params.productId);

      await storage.removeFromWishlist(userId, productId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Orders (protected)
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if the order belongs to the current user (security check)
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      
      // Note: Cart clearing is handled in confirm-payment endpoint instead
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getReviews(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/products/:id/reviews", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const productId = parseInt(req.params.id);
      const userId = authReq.user!.id;
      const { rating, title, comment } = req.body;

      const review = await storage.createReview({
        productId,
        userId,
        customerName: authReq.user?.firstName ? 
          `${authReq.user.firstName} ${authReq.user.lastName || ''}`.trim() :
          authReq.user?.email?.split('@')[0] || 'Anonymous',
        rating,
        title,
        comment,
        isVerified: true, // Since user is authenticated
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Admin routes (protected)
  app.get("/api/admin/products", async (req, res) => {
    try {
      // For now, allow all requests - TODO: Add proper admin authentication
      // const user = await storage.getUser(req.user.id);
      // if (user?.role !== "admin") {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const products = await storage.getProducts({ limit: 100 });
      res.json(products);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", async (req, res) => {
    try {
      // For now, allow all requests - TODO: Add proper admin authentication
      // const user = await storage.getUser(req.user.id);
      // if (user?.role !== "admin") {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", async (req, res) => {
    try {
      // For now, allow all requests - TODO: Add proper admin authentication
      // const user = await storage.getUser(req.user.id);
      // if (user?.role !== "admin") {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const id = parseInt(req.params.id);
      const product = await storage.updateProduct(id, req.body);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Admin review approval
  // Get approved reviews for testimonials
  app.get("/api/reviews/approved", async (req, res) => {
    try {
      const result = await db
        .select({
          id: reviews.id,
          customerName: reviews.customerName,
          rating: reviews.rating,
          title: reviews.title,
          comment: reviews.comment,
          isApproved: reviews.isApproved,
        })
        .from(reviews)
        .where(eq(reviews.isApproved, true))
        .orderBy(reviews.createdAt);
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching approved reviews:", error);
      res.status(500).json({ message: "Failed to fetch approved reviews" });
    }
  });

  app.put("/api/admin/reviews/:id/approve", async (req, res) => {
    try {
      // For now, allow all requests - TODO: Add proper admin authentication
      const reviewId = parseInt(req.params.id);
      const result = await db
        .update(reviews)
        .set({ isApproved: true })
        .where(eq(reviews.id, reviewId))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "Failed to approve review" });
    }
  });

  // Admin order management
  app.get("/api/admin/orders", async (req, res) => {
    try {
      // For now, allow all requests - TODO: Add proper admin authentication
      const orders = await storage.getOrders(); // Get all orders for admin
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Admin review management
  app.get("/api/admin/reviews", async (req, res) => {
    try {
      // For now, allow all requests - TODO: Add proper admin authentication
      const result = await db
        .select({
          id: reviews.id,
          productId: reviews.productId,
          userId: reviews.userId,
          customerName: reviews.customerName,
          rating: reviews.rating,
          title: reviews.title,
          comment: reviews.comment,
          isApproved: reviews.isApproved,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .orderBy(reviews.createdAt);
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.put("/api/admin/orders/:id/status", async (req, res) => {
    try {
      // For now, allow all requests - TODO: Add proper admin authentication
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      if (!status || !["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be one of: pending, confirmed, shipped, delivered, cancelled" });
      }

      const order = await storage.updateOrderStatus(orderId, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.post("/api/admin/categories", async (req, res) => {
    try {
      // For now, allow all requests - TODO: Add proper admin authentication
      // const user = await storage.getUser(req.user.id);
      // if (user?.role !== "admin") {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const validated = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validated);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Banner admin routes
  app.get("/api/admin/banners", async (req, res) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  app.post("/api/admin/banners", async (req, res) => {
    try {
      const validated = insertBannerSchema.parse(req.body);
      const banner = await storage.createBanner(validated);
      res.status(201).json(banner);
    } catch (error) {
      console.error("Error creating banner:", error);
      res.status(500).json({ message: "Failed to create banner" });
    }
  });

  app.put("/api/admin/banners/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const banner = await storage.updateBanner(id, req.body);
      res.json(banner);
    } catch (error) {
      console.error("Error updating banner:", error);
      res.status(500).json({ message: "Failed to update banner" });
    }
  });

  app.delete("/api/admin/banners/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBanner(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting banner:", error);
      res.status(500).json({ message: "Failed to delete banner" });
    }
  });

  // Public banner route for frontend
  app.get("/api/banners", async (req, res) => {
    try {
      const banners = await storage.getActiveBanners();
      res.json(banners);
    } catch (error) {
      console.error("Error fetching active banners:", error);
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  // Admin Analytics API endpoints
  app.get("/api/admin/analytics/overview", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      // Check if user has admin role
      const user = await storage.getUser(authReq.user!.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get overall metrics
      const totalOrders = await storage.getTotalOrders();
      const totalRevenue = await storage.getTotalRevenue();
      const totalCustomers = await storage.getTotalCustomers();
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get this month's metrics for comparison
      const currentMonth = new Date();
      currentMonth.setDate(1); // First day of current month
      const monthlyOrders = await storage.getOrdersFromDate(currentMonth);
      const monthlyRevenue = await storage.getRevenueFromDate(currentMonth);

      res.json({
        totalOrders,
        totalRevenue,
        totalCustomers,
        avgOrderValue,
        monthlyOrders: monthlyOrders.length,
        monthlyRevenue,
        revenueGrowth: 15.8, // Mock growth percentage
        orderGrowth: 23.4    // Mock growth percentage
      });
    } catch (error) {
      console.error("Analytics overview error:", error);
      res.status(500).json({ message: "Failed to fetch analytics overview" });
    }
  });

  app.get("/api/admin/analytics/revenue", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      // Check if user has admin role
      const user = await storage.getUser(authReq.user!.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { period = "7d" } = req.query as { period: string };
      
      // Generate revenue data for the specified period
      const revenueData = await storage.getRevenueAnalytics(period);
      
      res.json(revenueData);
    } catch (error) {
      console.error("Revenue analytics error:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get("/api/admin/analytics/products", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      // Check if user has admin role
      const user = await storage.getUser(authReq.user!.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const topProducts = await storage.getTopSellingProducts();
      const lowStockProducts = await storage.getLowStockProducts();
      
      res.json({
        topProducts,
        lowStockProducts,
        totalProducts: await storage.getTotalProducts()
      });
    } catch (error) {
      console.error("Product analytics error:", error);
      res.status(500).json({ message: "Failed to fetch product analytics" });
    }
  });

  app.get("/api/admin/analytics/customers", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      // Check if user has admin role
      const user = await storage.getUser(authReq.user!.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const customerStats = await storage.getCustomerAnalytics();
      
      res.json(customerStats);
    } catch (error) {
      console.error("Customer analytics error:", error);
      res.status(500).json({ message: "Failed to fetch customer analytics" });
    }
  });

  // Newsletter subscription route
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const { email, firstName, source = "website" } = req.body;
      
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email address is required" });
      }

      // Check if email already exists
      const { db } = await import("./db");
      const { newsletter } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      const { sendWelcomeEmail } = await import("./sendgrid");
      
      const [existingSubscription] = await db.select().from(newsletter).where(eq(newsletter.email, email));
      
      if (existingSubscription) {
        if (existingSubscription.isActive) {
          return res.status(400).json({ message: "This email is already subscribed to our newsletter" });
        } else {
          // Reactivate subscription
          await db.update(newsletter)
            .set({ 
              isActive: true, 
              firstName: firstName || existingSubscription.firstName,
              source,
              unsubscribedAt: null 
            })
            .where(eq(newsletter.id, existingSubscription.id));

          // Send welcome email for reactivated subscription
          await sendWelcomeEmail(email, firstName || existingSubscription.firstName);
          
          return res.json({ message: "Newsletter subscription reactivated successfully" });
        }
      }

      // Create new subscription
      await db.insert(newsletter).values({
        email,
        firstName: firstName || null,
        source,
        isActive: true,
      });

      // Send welcome email to new subscriber
      await sendWelcomeEmail(email, firstName);

      res.json({ message: "Successfully subscribed to newsletter" });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Unsubscribe from newsletter
  app.post('/api/newsletter/unsubscribe', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email address is required" });
      }

      const { db } = await import("./db");
      const { newsletter } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      // Update subscription to inactive
      const [updated] = await db.update(newsletter)
        .set({ 
          isActive: false, 
          unsubscribedAt: new Date()
        })
        .where(eq(newsletter.email, email))
        .returning();

      if (!updated) {
        return res.status(404).json({ message: "Email not found in our newsletter list" });
      }

      res.json({ message: "Successfully unsubscribed from newsletter" });
    } catch (error) {
      console.error("Newsletter unsubscribe error:", error);
      res.status(500).json({ message: "Failed to unsubscribe from newsletter" });
    }
  });

  // Send newsletter to all subscribers (admin only)
  app.post('/api/admin/newsletter/send', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Check if user has admin role
      const user = await storage.getUser(authReq.user!.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { subject, title, message, includeProducts, includePromotions } = req.body;
      
      if (!subject || !title || !message) {
        return res.status(400).json({ message: "Subject, title, and message are required" });
      }

      const { sendNewsletterUpdate } = await import("./sendgrid");
      
      // Get all active subscribers
      const subscribers = await storage.getNewsletterSubscribers();
      
      if (subscribers.length === 0) {
        return res.json({ message: "No active subscribers found", sent: 0 });
      }

      // Prepare newsletter content
      let products: any[] = [];
      let promotions: any[] = [];

      if (includeProducts) {
        // Get featured products for the newsletter
        products = await storage.getProducts({ featured: true, limit: 4 });
      }

      if (includePromotions) {
        // Get active banners as promotions
        const banners = await storage.getActiveBanners();
        promotions = banners.map(banner => ({
          title: banner.title,
          description: banner.description || "Special offer available now!"
        }));
      }

      const newsletterContent = {
        title,
        message,
        products: products.length > 0 ? products : undefined,
        promotions: promotions.length > 0 ? promotions : undefined
      };

      // Send emails to all subscribers
      let sentCount = 0;
      let failedCount = 0;
      let lastError = null;

      for (const subscriber of subscribers) {
        try {
          const success = await sendNewsletterUpdate(
            subscriber.email,
            subscriber.firstName,
            subject,
            newsletterContent
          );
          
          if (success) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Failed to send newsletter to ${subscriber.email}:`, error);
          failedCount++;
          lastError = error;
        }
      }

      // If all emails failed, return error status
      if (sentCount === 0 && failedCount > 0) {
        return res.status(500).json({
          message: "Failed to send newsletter - email service error",
          error: lastError?.message || "Unknown email service error",
          sent: sentCount,
          failed: failedCount,
          totalSubscribers: subscribers.length
        });
      }

      res.json({ 
        message: sentCount > 0 ? "Newsletter sending completed" : "Newsletter partially sent",
        sent: sentCount,
        failed: failedCount,
        totalSubscribers: subscribers.length,
        warning: failedCount > 0 ? "Some emails failed to send - check email service configuration" : null
      });
    } catch (error) {
      console.error("Newsletter send error:", error);
      res.status(500).json({ message: "Failed to send newsletter" });
    }
  });

  // Get newsletter subscribers (admin only)
  app.get('/api/admin/newsletter/subscribers', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Check if user has admin role
      const user = await storage.getUser(authReq.user!.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const subscribers = await storage.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Newsletter subscribers error:", error);
      res.status(500).json({ message: "Failed to fetch newsletter subscribers" });
    }
  });

  // Seed data endpoint for initial setup
  app.post("/api/seed", async (req, res) => {
    try {
      // Create default categories
      const engagementCategory = await storage.createCategory({
        name: "Engagement Rings",
        slug: "engagement-rings",
        description: "Beautiful engagement rings for your special moment",
      });

      const necklaceCategory = await storage.createCategory({
        name: "Necklaces",
        slug: "necklaces", 
        description: "Elegant necklaces for every occasion",
      });

      const earringCategory = await storage.createCategory({
        name: "Earrings",
        slug: "earrings",
        description: "Stunning earrings to complement your style",
      });

      const braceletCategory = await storage.createCategory({
        name: "Bracelets",
        slug: "bracelets",
        description: "Sophisticated bracelets and bangles",
      });

      // Create sample products
      const products = [
        {
          title: "Classic Solitaire Diamond Ring",
          handle: "classic-solitaire-diamond-ring",
          description: "A timeless solitaire diamond ring featuring a brilliant 1-carat diamond set in 14k gold. Perfect for engagements and special occasions.",
          shortDescription: "1ct Diamond, 14k Gold",
          category: engagementCategory.id,
          tags: ["diamond", "engagement", "solitaire", "classic"],
          images: [
            {
              url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
              alt: "Classic diamond engagement ring"
            }
          ],
          basePrice: "3200.00",
          metal: "gold",
          gemstone: "diamond",
          carat: "1.00",
          sku: "ENG-SOL-1CT-14K",
          stock: 15,
          isFeatured: true,
        },
        {
          title: "Pearl Strand Necklace",
          handle: "pearl-strand-necklace",
          description: "Elegant cultured pearl necklace with 18k gold clasp. Each pearl is hand-selected for its luster and quality.",
          shortDescription: "Cultured Pearls, 18k Gold",
          category: necklaceCategory.id,
          tags: ["pearl", "necklace", "elegant", "classic"],
          images: [
            {
              url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
              alt: "Elegant pearl necklace"
            }
          ],
          basePrice: "1850.00",
          metal: "gold",
          gemstone: "pearl",
          sku: "NECK-PEARL-18K",
          stock: 8,
          isFeatured: true,
        },
        {
          title: "Diamond Stud Earrings",
          handle: "diamond-stud-earrings",
          description: "Classic diamond stud earrings featuring 0.5ct diamonds each in white gold settings. Perfect for everyday elegance.",
          shortDescription: "0.5ct Each, White Gold",
          category: earringCategory.id,
          tags: ["diamond", "studs", "earrings", "white-gold"],
          images: [
            {
              url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
              alt: "Diamond stud earrings"
            }
          ],
          basePrice: "2400.00",
          metal: "white-gold",
          gemstone: "diamond",
          carat: "0.50",
          sku: "EAR-STUD-05CT-WG",
          stock: 12,
          isFeatured: true,
        },
        {
          title: "Tennis Bracelet",
          handle: "tennis-bracelet",
          description: "Stunning diamond line tennis bracelet in 18k gold. Features carefully matched diamonds for consistent brilliance.",
          shortDescription: "Diamond Line, 18k Gold",
          category: braceletCategory.id,
          tags: ["diamond", "bracelet", "tennis", "luxury"],
          images: [
            {
              url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
              alt: "Diamond tennis bracelet"
            }
          ],
          basePrice: "4750.00",
          metal: "gold",
          gemstone: "diamond",
          sku: "BRAC-TENNIS-18K",
          stock: 5,
          isFeatured: true,
        },
      ];

      for (const productData of products) {
        await storage.createProduct(productData);
      }

      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  // Temporary public endpoint to test customer data
  app.get("/api/test/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      
      // Get stats for each customer
      const customersWithStats = await Promise.all(
        customers.map(async (customer) => {
          const stats = await storage.getCustomerStats(customer.id);
          return {
            ...customer,
            stats
          };
        })
      );

      res.json(customersWithStats);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // Customer Management API Routes (Admin only)
  app.get("/api/admin/customers", async (req, res) => {
    try {
      // For now, allow all authenticated requests to get customers
      // TODO: Add proper admin role checking later

      const customers = await storage.getAllCustomers();
      
      // Get stats for each customer
      const customersWithStats = await Promise.all(
        customers.map(async (customer) => {
          const stats = await storage.getCustomerStats(customer.id);
          return {
            ...customer,
            stats
          };
        })
      );

      res.json(customersWithStats);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/admin/customers/:id/stats", async (req, res) => {
    try {
      // For now, allow all requests to get customer stats
      // TODO: Add proper admin role checking later

      const customerId = req.params.id;
      const stats = await storage.getCustomerStats(customerId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching customer stats:", error);
      res.status(500).json({ message: "Failed to fetch customer stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

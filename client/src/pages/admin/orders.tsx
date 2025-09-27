import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/formatters";
import { Package, User, Search, Filter, ArrowUpDown, Eye } from "lucide-react";
import { Link } from "wouter";
import type { Order } from "@shared/schema";

interface OrderItem {
  productId: number;
  variantId?: number;
  quantity: number;
  price: string;
  title: string;
}

export default function AdminOrders() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: orders = [], isLoading, refetch } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated && (user as any)?.role === "admin",
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/admin/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Order Status Updated",
        description: `Order #${variables.orderId} status changed to ${variables.status}`,
      });
      // Invalidate both admin and customer caches
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = searchTerm === "" || 
        order.id.toString().includes(searchTerm) ||
        (order.userId && order.userId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "amount-high":
          return parseFloat(b.total || "0") - parseFloat(a.total || "0");
        case "amount-low":
          return parseFloat(a.total || "0") - parseFloat(b.total || "0");
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'default';
      case 'shipped': return 'secondary';
      case 'confirmed': return 'outline';
      case 'pending': return 'destructive';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusOptions = () => [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  if ((user as any)?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Header onMobileMenuToggle={() => {}} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMobileMenuToggle={() => {}} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="loading-shimmer w-32 h-8 rounded bg-muted"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => {}} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif font-bold text-3xl text-foreground mb-2" data-testid="text-admin-orders-title">
              Order Management
            </h1>
            <p className="text-muted-foreground">
              Manage customer orders and update their status
            </p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" data-testid="button-back-dashboard">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by Order ID or User ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-orders"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger data-testid="select-sort-orders">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">Highest Amount</SelectItem>
                  <SelectItem value="amount-low">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Orders Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "No orders have been placed yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
              const shippingAddress = typeof order.shippingAddress === 'string' 
                ? JSON.parse(order.shippingAddress) 
                : order.shippingAddress || {};

              return (
                <Card key={order.id} className="border-l-4 border-l-accent" data-testid={`order-card-${order.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order #{order.id}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              User: {order.userId?.slice(-8)}
                            </div>
                            <span>•</span>
                            <span>
                              {format(new Date(order.createdAt || Date.now()), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getStatusColor(order.status || "pending")} data-testid={`order-status-${order.id}`}>
                          {(order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1)}
                        </Badge>
                        <span className="font-semibold text-lg">
                          {formatPrice(parseFloat(order.total || "0"), order.currency || "USD")}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Items */}
                      <div>
                        <h4 className="font-medium mb-2">Items ({items.length})</h4>
                        <div className="space-y-2">
                          {items.slice(0, 3).map((item, index) => (
                            <div key={index} className="text-sm flex justify-between">
                              <span className="truncate pr-2">{item.title || "Unknown Item"}</span>
                              <span className="text-muted-foreground">×{item.quantity || 1}</span>
                            </div>
                          ))}
                          {items.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              +{items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-medium mb-2">Shipping Address</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{shippingAddress?.fullName || "N/A"}</p>
                          <p>{shippingAddress?.city && shippingAddress?.state ? `${shippingAddress.city}, ${shippingAddress.state}` : "N/A"}</p>
                          <p>{shippingAddress?.country || "N/A"}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Update Status</label>
                          <Select 
                            value={order.status || "pending"} 
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger data-testid={`select-status-${order.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getStatusOptions().map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-order-${order.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Statistics */}
        {filteredOrders.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Order Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => {
                  const count = filteredOrders.filter(o => o.status === status).length;
                  return (
                    <div key={status} className="p-3 rounded-lg border">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground capitalize">{status}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

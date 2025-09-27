import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/formatters";
import { ChevronLeft, Package, MapPin, CreditCard, Truck } from "lucide-react";
import { Order } from "@shared/schema";

interface OrderItem {
  productId: number;
  variantId?: number;
  quantity: number;
  price: string;
  title: string;
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || "0");

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId && !isNaN(orderId),
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'default';
      case 'shipped': return 'secondary';
      case 'confirmed': return 'outline';
      case 'pending': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  };

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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMobileMenuToggle={() => {}} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The order you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/account/order-history">
              <Button>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Order History
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const shippingAddress = typeof order.shippingAddress === 'string' 
    ? JSON.parse(order.shippingAddress) 
    : order.shippingAddress || {};

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => {}} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account/order-history">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
              <ChevronLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="font-serif font-bold text-3xl text-foreground" data-testid="text-order-detail-title">
              Order #{order.id}
            </h1>
            <p className="text-muted-foreground">
              Placed on {format(new Date(order.createdAt || Date.now()), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusColor(order.status)} data-testid={`badge-status-${order.id}`}>
                    {getStatusText(order.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {order.paymentStatus === 'paid' ? 'Payment Confirmed' : 'Payment Pending'}
                  </span>
                </div>
                {order.status === 'shipped' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Your order is on its way and should arrive within 3-5 business days.
                  </p>
                )}
                {order.status === 'delivered' && (
                  <p className="text-sm text-green-600 mt-2">
                    Your order has been successfully delivered. Enjoy your beautiful jewelry!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Items ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-border rounded-lg" data-testid={`item-${index}`}>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground" data-testid={`item-title-${index}`}>
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span data-testid={`item-quantity-${index}`}>Qty: {item.quantity}</span>
                        <span data-testid={`item-price-${index}`}>
                          {formatPrice(parseFloat(item.price), order.currency || 'USD')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground" data-testid={`item-total-${index}`}>
                        {formatPrice(parseFloat(item.price) * item.quantity, order.currency || 'USD')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm" data-testid="shipping-address">
                  <p className="font-medium">{shippingAddress.fullName}</p>
                  <p>{shippingAddress.address}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                  {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span data-testid="subtotal">
                    {formatPrice(parseFloat(order.subtotal || "0"), order.currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span data-testid="shipping">
                    {formatPrice(parseFloat(order.shipping || "0"), order.currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span data-testid="tax">
                    {formatPrice(parseFloat(order.tax || "0"), order.currency || 'USD')}
                  </span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span data-testid="total">
                      {formatPrice(parseFloat(order.total || "0"), order.currency || 'USD')}
                    </span>
                  </div>
                </div>
                {order.paymentIntentId && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Payment ID: {order.paymentIntentId.slice(-8)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Link href="/contact">
                    <Button variant="outline" className="w-full">
                      Contact Support
                    </Button>
                  </Link>
                  {order.status === 'delivered' && (
                    <Link href="/account/order-history">
                      <Button variant="outline" className="w-full">
                        Leave Reviews
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

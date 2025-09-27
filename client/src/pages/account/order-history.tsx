import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ChevronLeft, Package, Star, StarIcon, MessageSquare } from "lucide-react";
import { Order, Review } from "@shared/schema";

interface OrderItem {
  productId: number;
  variantId?: number;
  quantity: number;
  price: string;
  title: string;
}

export default function OrderHistory() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewData, setReviewData] = useState({
    productId: 0,
    rating: 5,
    title: "",
    comment: ""
  });

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: { productId: number; rating: number; title: string; comment: string }) => {
      const response = await apiRequest("POST", `/api/products/${data.productId}/reviews`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted! ⭐",
        description: "Thank you for your feedback. Your review will be published after approval.",
      });
      setReviewData({ productId: 0, rating: 5, title: "", comment: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Review Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
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

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewData.productId && reviewData.comment.trim()) {
      createReviewMutation.mutate(reviewData);
    }
  };

  const openReviewDialog = (productId: number, productTitle: string) => {
    setReviewData({ ...reviewData, productId, title: `Review for ${productTitle}` });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-shimmer w-32 h-8 rounded bg-muted"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => {}} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account/dashboard">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="font-serif font-bold text-3xl text-foreground" data-testid="text-order-history-title">
              Order History
            </h1>
            <p className="text-muted-foreground">
              View all your previous orders and leave reviews for purchased items
            </p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-serif text-xl mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any orders yet. Start shopping to see your order history here.
              </p>
              <Link href="/catalog">
                <Button data-testid="button-start-shopping">Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-order-${order.id}`}>
                        Order #{order.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on {format(new Date(order.createdAt!), "PPP")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={getStatusColor(order.status!)} data-testid={`badge-status-${order.id}`}>
                        {getStatusText(order.status!)}
                      </Badge>
                      <div className="text-right">
                        <p className="font-semibold" data-testid={`text-total-${order.id}`}>
                          {order.currency} ${order.total}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                      Order Items
                    </h4>
                    
                    {/* Order Items */}
                    <div className="space-y-4">
                      {(order.items as OrderItem[]).map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/20 rounded-lg"
                          data-testid={`order-item-${order.id}-${index}`}
                        >
                          <div className="flex-1">
                            <h5 className="font-medium" data-testid={`text-item-title-${order.id}-${index}`}>
                              {item.title}
                            </h5>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>Qty: {item.quantity}</span>
                              <span data-testid={`text-item-price-${order.id}-${index}`}>
                                ${item.price} each
                              </span>
                            </div>
                          </div>
                          
                          {/* Review Button - Only show for delivered orders */}
                          {order.status === 'delivered' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => openReviewDialog(item.productId, item.title)}
                                  data-testid={`button-review-${order.id}-${index}`}
                                >
                                  <Star className="w-4 h-4" />
                                  Write Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Write a Review</DialogTitle>
                                </DialogHeader>
                                
                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">
                                      Product: {item.title}
                                    </Label>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">Rating</Label>
                                    <div className="flex gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => setReviewData({ ...reviewData, rating: star })}
                                          className="p-1"
                                          data-testid={`button-rating-${star}`}
                                        >
                                          <StarIcon
                                            className={`w-6 h-6 ${
                                              star <= reviewData.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-muted-foreground'
                                            }`}
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="review-title" className="text-sm font-medium">
                                      Review Title (Optional)
                                    </Label>
                                    <Input
                                      id="review-title"
                                      placeholder="Summarize your experience..."
                                      value={reviewData.title}
                                      onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                                      data-testid="input-review-title"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="review-comment" className="text-sm font-medium">
                                      Your Review *
                                    </Label>
                                    <Textarea
                                      id="review-comment"
                                      placeholder="Share your thoughts about this product..."
                                      value={reviewData.comment}
                                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                      rows={4}
                                      required
                                      data-testid="textarea-review-comment"
                                    />
                                  </div>

                                  <div className="flex justify-end gap-3">
                                    <DialogTrigger asChild>
                                      <Button type="button" variant="outline" data-testid="button-cancel-review">
                                        Cancel
                                      </Button>
                                    </DialogTrigger>
                                    <Button
                                      type="submit"
                                      disabled={createReviewMutation.isPending || !reviewData.comment.trim()}
                                      data-testid="button-submit-review"
                                    >
                                      {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                                    </Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4 mt-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="text-sm text-muted-foreground">
                          <p><strong>Subtotal:</strong> ${order.subtotal}</p>
                          <p><strong>Shipping:</strong> ${order.shipping}</p>
                          {order.tax !== "0.00" && <p><strong>Tax:</strong> ${order.tax}</p>}
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold">
                            <strong>Total: {order.currency} ${order.total}</strong>
                          </p>
                          <p className="text-muted-foreground mt-1">
                            Payment: {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

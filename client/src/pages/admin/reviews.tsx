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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare, User, Package, Check, X, Filter } from "lucide-react";
import { Link } from "wouter";

interface AdminReview {
  id: number;
  productId: number;
  userId?: string;
  customerName?: string;
  rating: number;
  title?: string;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviews() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  const { data: reviews = [], isLoading, refetch } = useQuery<AdminReview[]>({
    queryKey: ["/api/admin/reviews"],
    enabled: isAuthenticated && (user as any)?.role === "admin",
  });

  // Approve review mutation
  const approveReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await apiRequest("PUT", `/api/admin/reviews/${reviewId}/approve`);
      return response.json();
    },
    onSuccess: (data, reviewId) => {
      toast({
        title: "Review Approved",
        description: "The review is now visible on the product page.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      // Also refresh product pages that might show this review
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve review",
        variant: "destructive",
      });
    },
  });

  // Filter reviews based on search and filters
  const filteredReviews = reviews
    .filter(review => {
      const matchesSearch = searchTerm === "" || 
        (review.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         review.title?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "approved" && review.isApproved) ||
        (statusFilter === "pending" && !review.isApproved);
      
      const matchesRating = ratingFilter === "all" || 
        review.rating.toString() === ratingFilter;
      
      return matchesSearch && matchesStatus && matchesRating;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleApproveReview = (reviewId: number) => {
    approveReviewMutation.mutate(reviewId);
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

  const pendingReviews = reviews.filter(r => !r.isApproved);
  const approvedReviews = reviews.filter(r => r.isApproved);

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => {}} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif font-bold text-3xl text-foreground mb-2" data-testid="text-admin-reviews-title">
              Review Management
            </h1>
            <p className="text-muted-foreground">
              Moderate customer reviews and approve them for display
            </p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" data-testid="button-back-dashboard">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews.length}</div>
              <p className="text-xs text-muted-foreground">All customer reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <X className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{pendingReviews.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting moderation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Check className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{approvedReviews.length}</div>
              <p className="text-xs text-muted-foreground">Live on site</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-reviews"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger data-testid="select-rating-filter">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Reviews Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || ratingFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "No customer reviews have been submitted yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id} className={`border-l-4 ${review.isApproved ? 'border-l-green-500' : 'border-l-orange-500'}`} data-testid={`review-card-${review.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{review.customerName || "Anonymous"}</span>
                          <Badge variant={review.isApproved ? "default" : "secondary"}>
                            {review.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            Product ID: {review.productId}
                          </div>
                          <span>•</span>
                          <span>{format(new Date(review.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex text-yellow-400" data-testid={`stars-review-${review.id}`}>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            fill={i < review.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">({review.rating}/5)</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {review.title && (
                      <div>
                        <h4 className="font-semibold text-foreground" data-testid={`review-title-${review.id}`}>
                          {review.title}
                        </h4>
                      </div>
                    )}
                    
                    {review.comment && (
                      <div>
                        <p className="text-muted-foreground" data-testid={`review-comment-${review.id}`}>
                          {review.comment}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      {!review.isApproved ? (
                        <Button 
                          onClick={() => handleApproveReview(review.id)}
                          disabled={approveReviewMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`button-approve-${review.id}`}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {approveReviewMutation.isPending ? "Approving..." : "Approve Review"}
                        </Button>
                      ) : (
                        <Badge variant="default" className="bg-green-600">
                          <Check className="w-3 h-3 mr-1" />
                          Approved & Live
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

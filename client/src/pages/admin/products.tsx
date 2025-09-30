import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/formatters";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import type { Product, Category, InsertProduct } from "@shared/schema";

export default function AdminProducts() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!isLoading && user?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createProductMutation = useMutation({
    mutationFn: async (product: InsertProduct) => {
      const response = await apiRequest("POST", "/api/admin/products", product);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "Product has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create product.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, product }: { id: number; product: Partial<InsertProduct> }) => {
      const response = await apiRequest("PUT", `/api/admin/products/${id}`, product);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "Product has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setEditingProduct(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-shimmer w-32 h-8 rounded bg-muted"></div>
      </div>
    );
  }

  if (user?.role !== "admin") {
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

  const toggleProductStatus = (product: Product) => {
    updateProductMutation.mutate({
      id: product.id,
      product: { isActive: !product.isActive }
    });
  };

  const ProductForm = ({ product, onSubmit, isLoading: isSubmitting }: {
    product?: Product;
    onSubmit: (data: InsertProduct) => void;
    isLoading: boolean;
  }) => {
    const [formData, setFormData] = useState<InsertProduct>({
      title: product?.title || "",
      handle: product?.handle || "",
      description: product?.description || "",
      shortDescription: product?.shortDescription || "",
      category: product?.category || undefined,
      tags: product?.tags || [],
      images: product?.images || [],
      videos: product?.videos || [],
      basePrice: product?.basePrice || "0.00",
      currency: product?.currency || "USD",
      metal: product?.metal || "",
      gemstone: product?.gemstone || "",
      carat: product?.carat || undefined,
      size: product?.size || "",
      sku: product?.sku || "",
      stock: product?.stock || 0,
      isFeatured: product?.isFeatured || false,
      isActive: product?.isActive !== false,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              data-testid="input-product-title"
            />
          </div>
          <div>
            <Label htmlFor="handle">Handle (URL)</Label>
            <Input
              id="handle"
              value={formData.handle}
              onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
              required
              data-testid="input-product-handle"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input
            id="shortDescription"
            value={formData.shortDescription || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
            data-testid="input-product-short-description"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            data-testid="textarea-product-description"
          />
        </div>

        <div>
          <Label htmlFor="images">Product Images</Label>
          <div className="space-y-4">
            {/* Display existing images */}
            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative border rounded-lg p-2">
                    <img
                      src={image.url}
                      alt={image.alt || `Product image ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <div className="mt-2 space-y-1">
                      <Input
                        placeholder="Alt text"
                        value={image.alt || ""}
                        onChange={(e) => {
                          const newImages = [...(formData.images || [])];
                          newImages[index] = { ...newImages[index], alt: e.target.value };
                          setFormData(prev => ({ ...prev, images: newImages }));
                        }}
                        className="text-xs"
                        data-testid={`input-image-alt-${index}`}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newImages = formData.images?.filter((_, i) => i !== index) || [];
                          setFormData(prev => ({ ...prev, images: newImages }));
                        }}
                        className="w-full text-xs"
                        data-testid={`button-remove-image-${index}`}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* File upload input */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    Array.from(files).forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          const newImage = {
                            url: event.target.result as string,
                            alt: file.name.replace(/\.[^/.]+$/, "") // Remove file extension for alt text
                          };
                          setFormData(prev => ({
                            ...prev,
                            images: [...(prev.images || []), newImage]
                          }));
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                  }
                  // Clear the input
                  e.target.value = '';
                }}
                className="hidden"
                id="imageUpload"
                data-testid="input-image-upload"
              />
              <label htmlFor="imageUpload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-muted-foreground">
                    📸 Click to upload product images
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Select multiple images at once (JPG, PNG, GIF)
                  </div>
                  <Button type="button" variant="outline" className="mt-2">
                    Choose Images
                  </Button>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="videos">Product Videos</Label>
          <div className="space-y-4">
            {/* Display existing videos */}
            {formData.videos && formData.videos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.videos.map((video: any, index: number) => (
                  <div key={index} className="relative border rounded-lg p-4">
                    <div className="aspect-video bg-muted rounded-lg mb-2 overflow-hidden">
                      <video
                        src={video.url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Video title"
                        value={video.title || ""}
                        onChange={(e) => {
                          const newVideos = [...(formData.videos || [])];
                          newVideos[index] = { ...newVideos[index], title: e.target.value };
                          setFormData(prev => ({ ...prev, videos: newVideos }));
                        }}
                        className="text-xs"
                        data-testid={`input-video-title-${index}`}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newVideos = formData.videos?.filter((_, i) => i !== index) || [];
                          setFormData(prev => ({ ...prev, videos: newVideos }));
                        }}
                        className="w-full text-xs"
                        data-testid={`button-remove-video-${index}`}
                      >
                        Remove Video
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Video file upload */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    Array.from(files).forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          const newVideo = {
                            url: event.target.result as string,
                            title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension for title
                            type: 'direct'
                          };
                          setFormData(prev => ({
                            ...prev,
                            videos: [...(prev.videos || []), newVideo]
                          }));
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                  }
                  // Clear the input
                  e.target.value = '';
                }}
                className="hidden"
                id="videoUpload"
                data-testid="input-video-upload"
              />
              <label htmlFor="videoUpload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-muted-foreground">
                    🎥 Click to upload product videos
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Select multiple videos at once (MP4, WebM, MOV)
                  </div>
                  <Button type="button" variant="outline" className="mt-2">
                    Choose Videos
                  </Button>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="basePrice">Base Price</Label>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
              required
              data-testid="input-product-price"
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
              required
              data-testid="input-product-stock"
            />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              data-testid="input-product-sku"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: parseInt(value) }))}>
              <SelectTrigger data-testid="select-product-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="metal">Metal</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, metal: value }))}>
              <SelectTrigger data-testid="select-product-metal">
                <SelectValue placeholder="Select metal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="white-gold">White Gold</SelectItem>
                <SelectItem value="rose-gold">Rose Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
              data-testid="switch-product-featured"
            />
            <Label htmlFor="isFeatured">Featured Product</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              data-testid="switch-product-active"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          data-testid="button-save-product"
        >
          {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => {}} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Link href="/admin">
                <Button variant="outline" size="sm" data-testid="button-back-dashboard">
                  ← Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="font-serif font-bold text-3xl text-foreground mb-2" data-testid="text-products-title">
              Product Management
            </h1>
            <p className="text-muted-foreground">
              Manage your jewelry inventory
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" data-testid="button-add-product">
                <Plus size={16} className="mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <ProductForm
                onSubmit={(data) => createProductMutation.mutate(data)}
                isLoading={createProductMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6">
          {products.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">No products found</p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  data-testid="button-add-first-product"
                >
                  <Plus size={16} className="mr-2" />
                  Add Your First Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-semibold text-lg text-foreground" data-testid={`text-product-title-${product.id}`}>
                          {product.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {product.isFeatured && (
                            <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                          )}
                          <Badge variant={product.isActive ? "default" : "secondary"} data-testid={`badge-status-${product.id}`}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {product.stock < 5 && (
                            <Badge variant="destructive" data-testid={`badge-low-stock-${product.id}`}>
                              Low Stock ({product.stock})
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-2">{product.shortDescription}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="price-highlight font-semibold">
                          {formatPrice(product.basePrice, product.currency)}
                        </span>
                        <span className="text-muted-foreground">SKU: {product.sku}</span>
                        <span className="text-muted-foreground">Stock: {product.stock}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleProductStatus(product)}
                        disabled={updateProductMutation.isPending}
                        data-testid={`button-toggle-${product.id}`}
                      >
                        {product.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" data-testid={`button-edit-${product.id}`}>
                            <Edit size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                          </DialogHeader>
                          <ProductForm
                            product={product}
                            onSubmit={(data) => updateProductMutation.mutate({ id: product.id, product: data })}
                            isLoading={updateProductMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

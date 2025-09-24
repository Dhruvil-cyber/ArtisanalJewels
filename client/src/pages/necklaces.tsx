import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileMenu from "@/components/layout/mobile-menu";
import ProductGrid from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Sparkles, Moon, Sun } from "lucide-react";
import type { Product } from "@shared/schema";

export default function Necklaces() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { category: "necklaces", limit: 12 }],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-6">
              <Star className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6">
                Luxury <span className="gold-accent">Necklaces</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Adorn yourself with our stunning collection of necklaces. 
                From delicate chains to statement pendants, each piece is designed 
                to enhance your natural beauty and express your personal style.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                <Sparkles className="w-4 h-4 mr-1" />
                Premium Chains
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                <Star className="w-4 h-4 mr-1" />
                Statement Pieces
              </Badge>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                <Sun className="w-4 h-4 mr-1" />
                Layering Sets
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Necklace Styles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Necklace Collections
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From everyday elegance to special occasion glamour, find the perfect necklace for every moment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-1 bg-amber-600 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Delicate Chains</h3>
                <p className="text-muted-foreground text-sm">
                  Subtle and refined chains perfect for everyday wear.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Statement Pendants</h3>
                <p className="text-muted-foreground text-sm">
                  Bold centerpieces that command attention and admiration.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Diamond Tennis</h3>
                <p className="text-muted-foreground text-sm">
                  Continuous diamond brilliance for ultimate luxury.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Moon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Vintage Inspired</h3>
                <p className="text-muted-foreground text-sm">
                  Timeless designs with antique charm and character.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Featured Necklaces
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover our handpicked selection of the finest necklaces, each crafted with exceptional attention to detail.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="loading-shimmer aspect-square bg-muted"></div>
                  <CardContent className="p-4">
                    <div className="loading-shimmer h-4 bg-muted rounded mb-2"></div>
                    <div className="loading-shimmer h-6 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <ProductGrid products={products} />
          )}

          <div className="text-center mt-12">
            <Link href="/catalog?category=necklaces">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                View All Necklaces
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Layering Guide */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-6">
                The Art of Layering
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your perfect layered look with our curated necklace sets. 
                Mix different lengths, textures, and pendant styles to express your unique personality.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-primary text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Start with a Base</h4>
                    <p className="text-muted-foreground text-sm">Choose a delicate chain as your foundation layer.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-primary text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Add a Statement</h4>
                    <p className="text-muted-foreground text-sm">Include a pendant or charm for visual interest.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-primary text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Vary the Lengths</h4>
                    <p className="text-muted-foreground text-sm">Mix chokers, princess, and matinee lengths.</p>
                  </div>
                </div>
              </div>
              <Link href="/catalog?category=necklaces&filter=sets">
                <Button variant="outline" size="lg">
                  Shop Layering Sets
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Star className="w-24 h-24 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Layering Style Guide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

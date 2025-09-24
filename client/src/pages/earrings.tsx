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
import { Sparkles, Circle, Gem, Star } from "lucide-react";
import type { Product } from "@shared/schema";

export default function Earrings() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { category: "earrings", limit: 12 }],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-6">
              <Sparkles className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6">
                Exquisite <span className="gold-accent">Earrings</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Frame your face with our stunning earring collection. 
                From subtle studs to dramatic chandeliers, each pair is crafted 
                to add the perfect finishing touch to any look.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                <Gem className="w-4 h-4 mr-1" />
                Diamond Studs
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                <Star className="w-4 h-4 mr-1" />
                Statement Drops
              </Badge>
              <Badge variant="secondary" className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100">
                <Circle className="w-4 h-4 mr-1" />
                Classic Hoops
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Earring Styles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Earring Styles
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the perfect pair for every occasion, from everyday elegance to special event glamour.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gem className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Stud Earrings</h3>
                <p className="text-muted-foreground text-sm">
                  Classic and versatile, perfect for everyday wear.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Circle className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Hoop Earrings</h3>
                <p className="text-muted-foreground text-sm">
                  Timeless circles of gold that complement any style.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Drop Earrings</h3>
                <p className="text-muted-foreground text-sm">
                  Elegant movement and sophisticated glamour.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Chandelier</h3>
                <p className="text-muted-foreground text-sm">
                  Dramatic statement pieces for special occasions.
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
              Featured Earrings
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Handcrafted earrings that capture light and attention with every movement.
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
            <Link href="/catalog?category=earrings">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                View All Earrings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Care Instructions */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Gem className="w-24 h-24 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Earring Care Guide</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Caring for Your Earrings
              </h2>
              <p className="text-muted-foreground mb-6">
                Proper care ensures your earrings maintain their beauty and brilliance for years to come. 
                Follow these simple guidelines to protect your investment.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Clean Regularly</h4>
                    <p className="text-muted-foreground text-sm">Use gentle soap and warm water for routine cleaning.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <Circle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Store Safely</h4>
                    <p className="text-muted-foreground text-sm">Keep in individual pouches to prevent scratching.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Professional Service</h4>
                    <p className="text-muted-foreground text-sm">Annual professional cleaning and inspection.</p>
                  </div>
                </div>
              </div>
              <Link href="/care-instructions">
                <Button variant="outline" size="lg">
                  Complete Care Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

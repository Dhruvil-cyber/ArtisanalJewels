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
import { Heart, Infinity, Shield, Sparkles } from "lucide-react";
import type { Product } from "@shared/schema";

export default function WeddingBands() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { category: "wedding-bands", limit: 12 }],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-6">
              <Infinity className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6">
                Wedding <span className="gold-accent">Bands</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Celebrate your eternal bond with our collection of wedding bands. 
                From classic comfort-fit designs to diamond-studded eternity bands, 
                each piece represents the unbreakable circle of love.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                <Shield className="w-4 h-4 mr-1" />
                Lifetime Warranty
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                <Sparkles className="w-4 h-4 mr-1" />
                Perfect Match Sets
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                <Heart className="w-4 h-4 mr-1" />
                Custom Engraving
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Band Styles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Wedding Band Styles
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect symbol of your commitment, crafted with precision and designed to last a lifetime.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-amber-600 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Classic Bands</h3>
                <p className="text-muted-foreground text-sm">
                  Timeless comfort-fit bands in various metals and widths.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Diamond Bands</h3>
                <p className="text-muted-foreground text-sm">
                  Sparkling diamond accents for added brilliance and luxury.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Infinity className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Eternity Bands</h3>
                <p className="text-muted-foreground text-sm">
                  Continuous circle of diamonds representing endless love.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Matching Sets</h3>
                <p className="text-muted-foreground text-sm">
                  Perfectly paired his and hers wedding band sets.
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
              Featured Wedding Bands
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Expertly crafted bands that will be treasured for generations to come.
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
            <Link href="/catalog?category=wedding-bands">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                View All Wedding Bands
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Matching Sets CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Perfect Matching Sets
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover our curated collection of his and hers wedding band sets, 
            designed to complement each other perfectly while reflecting your individual styles.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link href="/catalog?category=wedding-bands&filter=sets">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Shop Matching Sets
              </Button>
            </Link>
            <Link href="/size-guide">
              <Button size="lg" variant="outline">
                Ring Sizing Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

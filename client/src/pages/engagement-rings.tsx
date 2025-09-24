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
import { Heart, Star, Sparkles, Crown, Gem } from "lucide-react";
import type { Product } from "@shared/schema";

export default function EngagementRings() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { category: "engagement-rings", limit: 12 }],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-6">
              <Crown className="w-16 h-16 text-rose-600 mx-auto mb-4" />
              <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6">
                Engagement <span className="gold-accent">Rings</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Begin your forever with our exquisite collection of engagement rings. 
                Each piece is thoughtfully crafted to symbolize your unique love story 
                with timeless elegance and unparalleled brilliance.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100">
                <Gem className="w-4 h-4 mr-1" />
                Certified Diamonds
              </Badge>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                <Sparkles className="w-4 h-4 mr-1" />
                Custom Settings
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                <Heart className="w-4 h-4 mr-1" />
                Lifetime Care
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Ring Styles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ring Styles
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the perfect setting for your diamond, from classic solitaires to vintage-inspired designs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-3">Classic Solitaire</h3>
                <p className="text-muted-foreground">
                  Timeless elegance with a single, stunning diamond centerpiece that showcases maximum brilliance.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-3">Vintage Inspired</h3>
                <p className="text-muted-foreground">
                  Romantic designs featuring intricate details and milgrain work reminiscent of bygone eras.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <Gem className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-3">Halo Setting</h3>
                <p className="text-muted-foreground">
                  Maximize sparkle with a diamond halo that creates the illusion of a larger center stone.
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
              Featured Engagement Rings
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Handpicked selections from our master craftsmen, each ring tells a story of love and commitment.
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
            <Link href="/catalog?category=engagement-rings">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                View All Engagement Rings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Design CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Crown className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Create Your Dream Ring
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Work with our master jewelers to design a completely custom engagement ring 
            that reflects your unique love story and personal style.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link href="/custom-design">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Start Custom Design
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Schedule Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

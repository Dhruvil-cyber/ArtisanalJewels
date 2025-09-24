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
import { Sparkles, Circle, Link as LinkIcon, Heart } from "lucide-react";
import type { Product } from "@shared/schema";

export default function Bracelets() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { category: "bracelets", limit: 12 }],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-6">
              <LinkIcon className="w-16 h-16 text-violet-600 mx-auto mb-4" />
              <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6">
                Luxury <span className="gold-accent">Bracelets</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Grace your wrist with our sophisticated bracelet collection. 
                From delicate tennis bracelets to bold cuffs, each piece combines 
                timeless elegance with contemporary style.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100">
                <Sparkles className="w-4 h-4 mr-1" />
                Diamond Tennis
              </Badge>
              <Badge variant="secondary" className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100">
                <Heart className="w-4 h-4 mr-1" />
                Charm Bracelets
              </Badge>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                <Circle className="w-4 h-4 mr-1" />
                Gold Bangles
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Bracelet Styles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Bracelet Collections
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Express your style with our diverse range of bracelets, from subtle accents to bold statement pieces.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Tennis Bracelets</h3>
                <p className="text-muted-foreground text-sm">
                  Continuous line of diamonds for ultimate sparkle.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Circle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Bangles</h3>
                <p className="text-muted-foreground text-sm">
                  Classic circular bracelets in various metals and styles.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Charm Bracelets</h3>
                <p className="text-muted-foreground text-sm">
                  Personal storytelling through meaningful charms.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LinkIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Chain Bracelets</h3>
                <p className="text-muted-foreground text-sm">
                  Versatile link styles from delicate to statement.
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
              Featured Bracelets
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover our curated selection of exceptional bracelets, each crafted with meticulous attention to detail.
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
            <Link href="/catalog?category=bracelets">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                View All Bracelets
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sizing Guide */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Perfect Fit Guide
              </h2>
              <p className="text-muted-foreground mb-6">
                Finding the right bracelet size ensures comfort and security. 
                Follow our simple measuring guide to determine your perfect fit.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-primary text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Measure Your Wrist</h4>
                    <p className="text-muted-foreground text-sm">Use a flexible measuring tape around your wrist bone.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-primary text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Add for Comfort</h4>
                    <p className="text-muted-foreground text-sm">Add 0.5-1 inch for comfortable movement.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-primary text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Consider Style</h4>
                    <p className="text-muted-foreground text-sm">Bangles fit snugly, while chains can be looser.</p>
                  </div>
                </div>
              </div>
              <Link href="/size-guide">
                <Button variant="outline" size="lg">
                  Complete Sizing Guide
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <LinkIcon className="w-24 h-24 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Bracelet Sizing Chart</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stacking Guide CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Stack in Style
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create your unique arm stack with our mix-and-match bracelet sets. 
            Combine different textures, metals, and styles for a look that's uniquely yours.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link href="/catalog?category=bracelets&filter=sets">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Shop Stacking Sets
              </Button>
            </Link>
            <Link href="/custom-design">
              <Button size="lg" variant="outline">
                Custom Designs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

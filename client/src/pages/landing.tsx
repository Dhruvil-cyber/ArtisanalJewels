import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileMenu from "@/components/layout/mobile-menu";
import ProductGrid from "@/components/product/product-grid";
import { PromoBanner } from "@/components/PromoBanner";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Heart, Shield, Truck, RotateCcw, Star, Check } from "lucide-react";
import { CustomerTestimonials } from "@/components/customer-testimonials";
import type { Product, Banner } from "@shared/schema";

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch featured products  
  const { data: featuredProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: true, limit: 4 }],
  });

  // Fetch active banners
  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
  });


  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <main>
        {/* Hero Section */}
        <section className="relative h-[90vh] min-h-[500px] sm:h-[80vh] sm:min-h-[600px] luxury-gradient overflow-hidden">
          <div className="hero-pattern absolute inset-0"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: banners.length > 0 && banners[0].images && Array.isArray(banners[0].images) && banners[0].images.length > 0
                ? `url('${banners[0].images[0].url}')`
                : "url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-2xl w-full">
              <div className="mb-3 sm:mb-4">
                <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/20 border border-primary rounded-full text-primary font-semibold text-xs sm:text-sm tracking-wide">
                  SINCE 1985 • MELBOURNE, AUSTRALIA
                </span>
              </div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-4 sm:mb-6 leading-tight">
                {banners.length > 0 && banners[0].title
                  ? banners[0].title
                  : <>Artisanal <span className="gold-accent">Luxury</span> Jewelry</>
                }
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed">
                {banners.length > 0 && banners[0].description
                  ? banners[0].description
                  : "Discover our collection of timeless pieces, each meticulously crafted by master artisans using the finest materials and techniques passed down through generations in the heart of Melbourne."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {isAuthenticated ? (
                  <>
                    <Link href="/catalog" className="w-full sm:w-auto">
                      <Button 
                        className="w-full luxury-border bg-primary hover:bg-primary/90 text-black px-6 py-3 sm:px-8 sm:py-4 font-semibold transition-all duration-300 transform hover:scale-105"
                        data-testid="button-explore-collections"
                      >
                        Explore Collections
                      </Button>
                    </Link>
                    <Link href="/about" className="w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        className="w-full border-2 border-white text-white hover:bg-white hover:text-black px-6 py-3 sm:px-8 sm:py-4 font-semibold transition-all duration-300"
                        data-testid="button-watch-story"
                      >
                        Our Craftsmanship Story
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="w-full sm:w-auto">
                      <Button 
                        className="w-full luxury-border bg-primary hover:bg-primary/90 text-black px-6 py-3 sm:px-8 sm:py-4 font-semibold transition-all duration-300 transform hover:scale-105"
                        data-testid="button-visitor-login"
                      >
                        Login to View Collections
                      </Button>
                    </Link>
                    <Link href="/register" className="w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        className="w-full border-2 border-white text-white hover:bg-white hover:text-black px-6 py-3 sm:px-8 sm:py-4 font-semibold transition-all duration-300"
                        data-testid="button-visitor-signup"
                      >
                        Create Account
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="absolute bottom-2 sm:bottom-4 lg:bottom-8 left-1/2 transform -translate-x-1/2 w-full px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 lg:gap-8 text-white/70 text-center">
              <div className="flex items-center justify-center gap-2">
                <Shield className="text-accent w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                <span className="text-xs sm:text-xs lg:text-sm">Lifetime Warranty</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Truck className="text-accent w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                <span className="text-xs sm:text-xs lg:text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <RotateCcw className="text-accent w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                <span className="text-xs sm:text-xs lg:text-sm">30-Day Returns</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Collections */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
                {isAuthenticated ? "Featured Collections" : "Exclusive Collections"}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isAuthenticated 
                  ? "Explore our carefully curated collections, each telling a unique story of craftsmanship and elegance."
                  : "Join our exclusive community to access our premium jewelry collections and personalized recommendations."
                }
              </p>
              {!isAuthenticated && (
                <div className="mt-8 flex justify-center space-x-4">
                  <Link href="/login">
                    <Button className="bg-primary hover:bg-primary/90 text-black font-semibold px-6 py-3">
                      Login to Browse
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black font-semibold px-6 py-3">
                      Join Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Collection Cards */}
              {[
                {
                  title: "Engagement Rings",
                  description: "Timeless symbols of love, crafted with the finest diamonds and precious metals.",
                  price: "From $2,500",
                  image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                },
                {
                  title: "Necklaces", 
                  description: "Elegant pieces that grace the neckline with sophistication and style.",
                  price: "From $890",
                  image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                },
                {
                  title: "Earrings",
                  description: "From subtle studs to statement drops, perfect for every occasion.",
                  price: "From $450", 
                  image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                }
              ].map((collection, index) => (
                <div key={index} className="card-hover bg-card rounded-lg overflow-hidden shadow-md border border-border">
                  <img 
                    src={collection.image} 
                    alt={`${collection.title} collection`}
                    className="w-full h-64 object-cover" 
                  />
                  <div className="p-6">
                    <h3 className="font-serif font-semibold text-xl text-foreground mb-2">{collection.title}</h3>
                    <p className="text-muted-foreground mb-4">{collection.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{collection.price}</span>
                      {isAuthenticated ? (
                        <Button 
                          variant="ghost"
                          className="text-accent hover:text-accent/80 font-medium"
                          data-testid={`button-explore-${collection.title.toLowerCase().replace(" ", "-")}`}
                        >
                          Explore Collection <span className="ml-2">→</span>
                        </Button>
                      ) : (
                        <Link href="/login">
                          <Button 
                            variant="ghost"
                            className="text-accent hover:text-accent/80 font-medium"
                            data-testid={`button-login-${collection.title.toLowerCase().replace(" ", "-")}`}
                          >
                            Login to View <span className="ml-2">→</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              {isAuthenticated ? (
                <Link href="/catalog">
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold"
                    data-testid="button-view-all-products"
                  >
                    View All Products
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold"
                    data-testid="button-signup-to-view"
                  >
                    Sign Up to View Products
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Featured Products - Only show for authenticated users */}
        {isAuthenticated && (
          <section className="py-20 bg-muted">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
                  Bestsellers
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Our most loved pieces, chosen by discerning customers worldwide.
                </p>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card rounded-lg border border-border p-4">
                      <div className="loading-shimmer w-full h-64 rounded bg-muted mb-4"></div>
                      <div className="loading-shimmer w-3/4 h-4 rounded bg-muted mb-2"></div>
                      <div className="loading-shimmer w-1/2 h-4 rounded bg-muted"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <ProductGrid products={featuredProducts} showActions={false} />
              )}
              
              <div className="text-center mt-12">
                <Link href="/catalog">
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold"
                    data-testid="button-view-all-products-featured"
                  >
                    View All Products
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Craftsmanship Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-6">
                  Master <span className="text-accent">Craftsmanship</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Each piece in our collection is meticulously handcrafted by skilled artisans who have dedicated their lives to perfecting their craft. Using time-honored techniques passed down through generations, we create jewelry that tells a story of excellence and passion.
                </p>
                
                <div className="space-y-4 mb-8">
                  {[
                    {
                      title: "Ethical Sourcing",
                      description: "Responsibly sourced materials from certified suppliers worldwide."
                    },
                    {
                      title: "Quality Guarantee", 
                      description: "Every piece comes with our lifetime craftsmanship warranty."
                    },
                    {
                      title: "Custom Design",
                      description: "Personalized pieces crafted to your exact specifications."
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center mt-1">
                        <Check className="text-accent-foreground" size={12} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{feature.title}</h4>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 font-semibold"
                  data-testid="button-learn-process"
                >
                  Learn About Our Process
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Artisan crafting jewelry in workshop" 
                  className="rounded-lg shadow-lg" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Close-up of jewelry crafting tools and gems" 
                  className="rounded-lg shadow-lg sm:mt-8" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Master jeweler inspecting a diamond" 
                  className="rounded-lg shadow-lg sm:-mt-8" 
                />
                <img 
                  src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Beautiful finished jewelry pieces" 
                  className="rounded-lg shadow-lg" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                { icon: Shield, title: "Lifetime Warranty", description: "Comprehensive coverage on all craftsmanship" },
                { icon: Star, title: "Certified Gemstones", description: "GIA certified diamonds and precious stones" },
                { icon: Truck, title: "Free Shipping", description: "Insured delivery worldwide" },
                { icon: RotateCcw, title: "30-Day Returns", description: "Hassle-free return policy" }
              ].map((badge, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <badge.icon className="text-accent-foreground" size={24} />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">{badge.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{badge.description}</p>
                </div>
              ))}
            </div>
            
            {/* Customer Testimonials - Real Reviews */}
            <CustomerTestimonials />
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white mb-4">
                Stay in the Know
              </h2>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                Be the first to discover new collections, exclusive offers, and jewelry care tips from our master craftsmen.
              </p>
              
              <div className="max-w-md mx-auto">
                <NewsletterSignup variant="inline" className="flex-1" />
                <p className="text-sm text-gray-300 mt-3">
                  By subscribing, you agree to our Privacy Policy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

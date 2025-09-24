import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileMenu from "@/components/layout/mobile-menu";
import { PromoBanner } from "@/components/PromoBanner";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Heart, Shield, Truck, RotateCcw, Star, Check } from "lucide-react";
import type { Banner } from "@shared/schema";

export default function Welcome() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch banners for the hero section
  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <PromoBanner />

      <main>
        {/* Hero Section */}
        <section className="relative h-[90vh] min-h-[500px] sm:h-[80vh] sm:min-h-[600px] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
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
                <Link href="/login" className="w-full sm:w-auto">
                  <Button 
                    className="w-full luxury-border bg-primary hover:bg-primary/90 text-black px-6 py-3 sm:px-8 sm:py-4 font-semibold transition-all duration-300 transform hover:scale-105"
                    data-testid="button-hero-login"
                  >
                    Login to Browse Collections
                  </Button>
                </Link>
                <Link href="/register" className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-white text-white hover:bg-white hover:text-black px-6 py-3 sm:px-8 sm:py-4 font-semibold transition-all duration-300"
                    data-testid="button-hero-register"
                  >
                    Create Account
                  </Button>
                </Link>
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

        {/* Exclusive Collections Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
                Exclusive Collections
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join our exclusive community to access our premium jewelry collections and personalized recommendations.
              </p>
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
                      <Link href="/login">
                        <Button 
                          variant="ghost"
                          className="text-accent hover:text-accent/80 font-medium"
                          data-testid={`button-login-${collection.title.toLowerCase().replace(" ", "-")}`}
                        >
                          Login to View <span className="ml-2">→</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/register">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold"
                  data-testid="button-signup-to-view"
                >
                  Sign Up to View Products
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Join Section */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
                Why Join Artisanal Jewels?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Become part of our exclusive community and unlock premium benefits.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Exclusive Access",
                  description: "First access to new collections and limited edition pieces.",
                  icon: Star
                },
                {
                  title: "Personal Consultant",
                  description: "Dedicated jewelry consultant for personalized recommendations.",
                  icon: Heart
                },
                {
                  title: "Premium Rewards",
                  description: "Earn points with every purchase and unlock special rewards.",
                  icon: Check
                },
                {
                  title: "Lifetime Support",
                  description: "Complimentary maintenance and care for all your jewelry.",
                  icon: Shield
                }
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                      <Icon className="text-primary" size={24} />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center mt-12 space-y-4">
              <div className="flex justify-center space-x-4">
                <Link href="/login">
                  <Button className="bg-primary hover:bg-primary/90 text-black font-semibold px-6 py-3">
                    Already a Member? Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black font-semibold px-6 py-3">
                    Join Today
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-background border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-4">
                Stay in the Know
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Subscribe to our newsletter for exclusive offers, new collection previews, and jewelry care tips.
              </p>
            </div>
            <NewsletterSignup variant="card" className="max-w-md mx-auto" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

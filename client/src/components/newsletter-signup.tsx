import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Check } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "inline" | "card";
  className?: string;
}

export function NewsletterSignup({ variant = "inline", className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const fullUrl = API_BASE_URL ? `${API_BASE_URL}/api/newsletter/subscribe` : '/api/newsletter/subscribe';
      
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          source: "website",
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to subscribe");
      }

      setIsSubscribed(true);
      setEmail("");
      setFirstName("");
      
      toast({
        title: "Successfully Subscribed!",
        description: "Thank you for subscribing to our newsletter. You'll receive exclusive updates about our latest collections.",
      });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`flex items-center space-x-2 text-accent ${className}`}>
        <Check className="w-5 h-5" />
        <span className="text-sm font-medium">Thank you for subscribing!</span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`bg-muted rounded-lg p-6 ${className}`}>
        <div className="text-center mb-4">
          <Mail className="w-8 h-8 text-accent mx-auto mb-2" />
          <h3 className="font-serif font-bold text-xl text-foreground mb-2">
            Stay Updated
          </h3>
          <p className="text-muted-foreground">
            Subscribe to our newsletter for exclusive offers, new collection previews, and jewelry care tips.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="First Name (Optional)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            data-testid="input-newsletter-firstname"
          />
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="input-newsletter-email"
          />
          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90 text-white"
            disabled={isSubmitting}
            data-testid="button-newsletter-subscribe"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
        
        <p className="text-xs text-muted-foreground text-center mt-3">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    );
  }

  // Inline variant
  return (
    <form onSubmit={handleSubmit} className={`flex space-x-2 ${className}`}>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1"
        data-testid="input-newsletter-email-inline"
      />
      <Button 
        type="submit" 
        className="bg-accent hover:bg-accent/90 text-white px-6"
        disabled={isSubmitting}
        data-testid="button-newsletter-subscribe-inline"
      >
        {isSubmitting ? "..." : "Subscribe"}
      </Button>
    </form>
  );
}

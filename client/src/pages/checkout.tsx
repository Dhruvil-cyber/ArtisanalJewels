import { useEffect, useState } from "react";
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ShoppingBag, CreditCard, Truck, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Extended cart item interface with joined product data
interface CartItemWithProduct {
  id: number;
  userId?: string | null;
  sessionId?: string | null;
  productId: number;
  variantId?: number | null;
  quantity: number;
  price: string;
  title: string;
  images?: Array<{ url: string; alt: string }> | null;
  variantDescription?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Initialize Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Stripe Checkout Form Component
function StripeCheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Australia',
    phone: ''
  });

  const handleShippingChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const confirmPaymentMutation = useMutation({
    mutationFn: async ({ paymentIntentId, shippingAddress }: { paymentIntentId: string, shippingAddress: ShippingAddress }) => {
      const response = await apiRequest("POST", "/api/confirm-payment", {
        paymentIntentId,
        shippingAddress
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Payment Successful!",
        description: `Your order #${data.orderId} has been confirmed.`,
      });
      setLocation(`/orders/${data.orderId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Confirmation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate shipping address
    const requiredFields = ['fullName', 'address', 'city', 'state', 'postalCode', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field as keyof ShippingAddress]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Incomplete Shipping Information",
        description: "Please fill in all required shipping fields.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent?.status === 'succeeded') {
        // Payment succeeded, confirm on backend
        await confirmPaymentMutation.mutateAsync({
          paymentIntentId: paymentIntent.id,
          shippingAddress
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                data-testid="input-shipping-name"
                value={shippingAddress.fullName}
                onChange={(e) => handleShippingChange('fullName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                data-testid="input-shipping-phone"
                value={shippingAddress.phone}
                onChange={(e) => handleShippingChange('phone', e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              data-testid="input-shipping-address"
              value={shippingAddress.address}
              onChange={(e) => handleShippingChange('address', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                data-testid="input-shipping-city"
                value={shippingAddress.city}
                onChange={(e) => handleShippingChange('city', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                data-testid="input-shipping-state"
                value={shippingAddress.state}
                onChange={(e) => handleShippingChange('state', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                data-testid="input-shipping-postal"
                value={shippingAddress.postalCode}
                onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        Your payment information is securely processed by Stripe
      </div>

      <Button 
        type="submit" 
        className="w-full bg-black hover:bg-gray-800 text-white"
        disabled={!stripe || isProcessing || confirmPaymentMutation.isPending}
        data-testid="button-complete-payment"
      >
        {isProcessing || confirmPaymentMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          'Complete Payment'
        )}
      </Button>
    </form>
  );
}

// Razorpay Checkout Form Component
function RazorpayCheckoutForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: ''
  });

  const handleShippingChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleRazorpayPayment = async () => {
    try {
      // Create Razorpay order (server calculates amounts with currency conversion)
      const orderResponse = await apiRequest("POST", "/api/create-razorpay-order", {});
      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error("Failed to create Razorpay order");
      }

      // Initialize Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Artisanal Jewels',
        description: 'Luxury Jewelry Purchase',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment on backend (server fetches cart and calculates amounts)
            const verifyResponse = await apiRequest("POST", "/api/verify-razorpay-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
              queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
              toast({
                title: "Payment Successful!",
                description: `Your order #${verifyData.orderId} has been confirmed.`,
              });
              setLocation(`/orders/${verifyData.orderId}`);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            toast({
              title: "Payment Verification Failed",
              description: error instanceof Error ? error.message : "Please contact support",
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
          email: user?.email || '',
          contact: shippingAddress.phone
        },
        theme: {
          color: '#A0816C'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process",
              variant: "destructive",
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        toast({
          title: "Payment Failed",
          description: response.error.description || "Payment could not be processed",
          variant: "destructive",
        });
      });
      
      rzp.open();
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate shipping address
    const requiredFields = ['fullName', 'address', 'city', 'state', 'postalCode', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field as keyof ShippingAddress]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Incomplete Shipping Information",
        description: "Please fill in all required shipping fields.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    await handleRazorpayPayment();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                data-testid="input-shipping-name"
                value={shippingAddress.fullName}
                onChange={(e) => handleShippingChange('fullName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                data-testid="input-shipping-phone"
                value={shippingAddress.phone}
                onChange={(e) => handleShippingChange('phone', e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              data-testid="input-shipping-address"
              value={shippingAddress.address}
              onChange={(e) => handleShippingChange('address', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                data-testid="input-shipping-city"
                value={shippingAddress.city}
                onChange={(e) => handleShippingChange('city', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                data-testid="input-shipping-state"
                value={shippingAddress.state}
                onChange={(e) => handleShippingChange('state', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                data-testid="input-shipping-postal"
                value={shippingAddress.postalCode}
                onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        Your payment will be securely processed by Razorpay after clicking Complete Payment
      </div>

      <Button 
        type="submit" 
        className="w-full bg-black hover:bg-gray-800 text-white"
        disabled={isProcessing}
        data-testid="button-complete-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          'Complete Payment'
        )}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay'>('stripe');

  // Get cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  // Calculate total
  // For Razorpay: convert AUD to INR (approximate rate: 1 AUD = 60 INR)
  const AUD_TO_INR_RATE = 60;
  
  const subtotalAUD = cartItems.reduce((sum: number, item: CartItemWithProduct) => {
    const price = parseFloat(item.price || '0');
    return sum + (price * item.quantity);
  }, 0);
  
  const subtotal = paymentMethod === 'razorpay' ? subtotalAUD * AUD_TO_INR_RATE : subtotalAUD;
  const shipping = paymentMethod === 'razorpay' ? (25.00 * AUD_TO_INR_RATE) : 25.00; // ₹1500 for India (Razorpay), $25 for Australia (Stripe)
  const total = subtotal + shipping;

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setLocation('/login');
      return;
    }

    if (cartItems.length === 0 && !cartLoading) {
      setLocation('/cart');
      return;
    }

    if (cartItems.length > 0 && !clientSecret && paymentMethod === 'stripe') {
      // Create Stripe payment intent only for Stripe payments
      apiRequest("POST", "/api/create-payment-intent", { 
        cartItems, 
        amount: total,
        currency: 'aud'
      })
        .then(res => res.json())
        .then(data => {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
        })
        .catch(error => {
          console.error('Error creating payment intent:', error);
          setLocation('/cart');
        });
    }
  }, [user, authLoading, cartItems, cartLoading, clientSecret, total, setLocation, paymentMethod]);

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (cartItems.length === 0) {
    return null; // Will redirect to cart
  }

  if (paymentMethod === 'stripe' && !clientSecret) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing Stripe checkout...</p>
        </div>
      </div>
    );
  }

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#000000',
        colorBackground: '#ffffff',
        colorText: '#000000',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'razorpay')} data-testid="radio-payment-method">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="stripe" id="stripe" data-testid="radio-stripe" />
                    <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                      <div className="font-medium">Credit/Debit Card (Stripe)</div>
                      <div className="text-sm text-muted-foreground">Pay with international cards (AUD)</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="razorpay" id="razorpay" data-testid="radio-razorpay" />
                    <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                      <div className="font-medium">Razorpay (UPI, Cards, Wallets)</div>
                      <div className="text-sm text-muted-foreground">Pay with Indian payment methods (INR)</div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {paymentMethod === 'stripe' ? (
              <Elements stripe={stripePromise} options={stripeOptions}>
                <StripeCheckoutForm />
              </Elements>
            ) : (
              <RazorpayCheckoutForm />
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item: CartItemWithProduct) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0">
                      {item.images?.[0] && (
                        <img
                          src={item.images[0].url}
                          alt={item.images[0].alt}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      {item.variantDescription && (
                        <p className="text-xs text-muted-foreground">{item.variantDescription}</p>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{paymentMethod === 'razorpay' ? '₹' : '$'}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping ({paymentMethod === 'razorpay' ? 'India' : 'Australia'})</span>
                    <span>{paymentMethod === 'razorpay' ? '₹' : '$'}{shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{paymentMethod === 'razorpay' ? '₹' : '$'}{total.toFixed(2)} {paymentMethod === 'razorpay' ? 'INR' : 'AUD'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

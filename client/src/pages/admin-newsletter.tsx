import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Mail, Users, Send, CheckCircle } from "lucide-react";

export function AdminNewsletterPage() {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [includeProducts, setIncludeProducts] = useState(true);
  const [includePromotions, setIncludePromotions] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get newsletter subscribers
  const { data: subscribers = [], isLoading: subscribersLoading } = useQuery({
    queryKey: ["/api/admin/newsletter/subscribers"],
  });

  // Send newsletter mutation
  const sendNewsletterMutation = useMutation({
    mutationFn: async (data: {
      subject: string;
      title: string;
      message: string;
      includeProducts: boolean;
      includePromotions: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/admin/newsletter/send", data);
      return response.json();
    },
    onSuccess: (result) => {
      // Show success message with details about sent/failed emails
      const successMessage = result.sent > 0 
        ? `Successfully sent to ${result.sent} subscribers!`
        : "Newsletter processing completed";
      
      const detailMessage = result.failed > 0 
        ? `${result.failed} emails failed to send. ${result.warning || ''}`
        : "All emails sent successfully!";

      toast({
        title: result.sent > 0 ? "Newsletter Sent Successfully! 🎉" : "Newsletter Status",
        description: `${successMessage} ${detailMessage}`,
        variant: result.failed > 0 && result.sent === 0 ? "destructive" : "default",
      });
      
      // Clear form only if at least some emails were sent
      if (result.sent > 0) {
        setSubject("");
        setTitle("");
        setMessage("");
        setIncludeProducts(true);
        setIncludePromotions(true);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Newsletter",
        description: error.message?.includes("email service error") 
          ? "Email service configuration error. Please check your email settings."
          : error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSendNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !title.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    sendNewsletterMutation.mutate({
      subject,
      title,
      message,
      includeProducts,
      includePromotions
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Newsletter Management</h1>
        <p className="text-muted-foreground">Send updates to all your newsletter subscribers</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Newsletter Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Newsletter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNewsletter} className="space-y-6">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Email Subject *
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., New Collection Launch - Exclusive Preview Inside!"
                    data-testid="input-subject"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Newsletter Title *
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Discover Our Latest Collection"
                    data-testid="input-title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Newsletter Message *
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your newsletter message here. This will be the main content that subscribers see..."
                    rows={6}
                    data-testid="textarea-message"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Content Options</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-products"
                      checked={includeProducts}
                      onCheckedChange={(checked) => setIncludeProducts(checked as boolean)}
                      data-testid="checkbox-products"
                    />
                    <label htmlFor="include-products" className="text-sm">
                      Include featured products
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-promotions"
                      checked={includePromotions}
                      onCheckedChange={(checked) => setIncludePromotions(checked as boolean)}
                      data-testid="checkbox-promotions"
                    />
                    <label htmlFor="include-promotions" className="text-sm">
                      Include current promotions
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={sendNewsletterMutation.isPending || !subject.trim() || !title.trim() || !message.trim()}
                  data-testid="button-send-newsletter"
                >
                  {sendNewsletterMutation.isPending ? (
                    <>
                      <Mail className="w-4 h-4 mr-2 animate-spin" />
                      Sending Newsletter...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send to {subscribers.length} Subscribers
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscriber Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscribersLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2" data-testid="text-subscriber-count">
                    {subscribers.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Subscribers</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Subscribers */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              {subscribersLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : subscribers.length > 0 ? (
                <div className="space-y-3">
                  {subscribers.slice(0, 5).map((subscriber: any) => (
                    <div key={subscriber.id} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {subscriber.firstName || 'Anonymous'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {subscriber.email}
                        </div>
                      </div>
                    </div>
                  ))}
                  {subscribers.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      and {subscribers.length - 5} more...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No subscribers yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Newsletter Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Keep subject lines under 50 characters</p>
              <p>• Include a clear call-to-action</p>
              <p>• Highlight new arrivals and exclusive offers</p>
              <p>• Test your message before sending</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

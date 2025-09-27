import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  AlertTriangle,
  Calendar,
  Download
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function AdminAnalytics() {
  const [revenuePeriod, setRevenuePeriod] = useState("7d");

  // Overview analytics
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["/api/admin/analytics/overview"],
  });

  // Revenue analytics
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["/api/admin/analytics/revenue", { period: revenuePeriod }],
  });

  // Product analytics
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ["/api/admin/analytics/products"],
  });

  // Customer analytics
  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ["/api/admin/analytics/customers"],
  });

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);

  const formatNumber = (value: number) => 
    new Intl.NumberFormat('en-AU').format(value);

  const COLORS = ['#D4AF37', '#000000', '#F8F8FF', '#DAA520', '#FFD700'];

  if (overviewLoading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor your business performance and insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm" data-testid="button-refresh">
              <Calendar className="w-4 h-4 mr-2" />
              Today
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="card-total-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="text-total-revenue">
                {formatCurrency((overview as any)?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{(overview as any)?.revenueGrowth || 0}%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-orders">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-orders">
                {formatNumber((overview as any)?.totalOrders || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{(overview as any)?.orderGrowth || 0}%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-customers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-customers">
                {formatNumber((overview as any)?.totalCustomers || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +{(customerData as any)?.newCustomersThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-avg-order-value">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-order-value">
                {formatCurrency((overview as any)?.avgOrderValue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {(overview as any)?.totalOrders || 0} orders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card data-testid="card-revenue-chart">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Daily revenue performance</CardDescription>
              </div>
              <Select value={revenuePeriod} onValueChange={setRevenuePeriod}>
                <SelectTrigger className="w-[140px]" data-testid="select-revenue-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {revenueLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      fontSize={12}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-AU')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#D4AF37" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card data-testid="card-top-products">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products by sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  (productData as any)?.topProducts?.map((product: any, index: number) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm" data-testid={`text-product-name-${product.id}`}>
                            {product.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.sales} sales
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm" data-testid={`text-product-revenue-${product.id}`}>
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card data-testid="card-low-stock">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : (productData as any)?.lowStockProducts?.length > 0 ? (
                  (productData as any).lowStockProducts.map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-low-stock-product-${product.id}`}>
                          {product.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <Badge 
                        variant={product.stock <= 2 ? "destructive" : "secondary"}
                        data-testid={`badge-stock-${product.id}`}
                      >
                        {product.stock} left
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">All products are well stocked! 🎉</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Growth Chart */}
        <Card data-testid="card-customer-growth">
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <CardDescription>New customer acquisitions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary" data-testid="text-new-customers-this-month">
                  {(customerData as any)?.newCustomersThisMonth || 0}
                </div>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" data-testid="text-new-customers-last-month">
                  {(customerData as any)?.newCustomersLastMonth || 0}
                </div>
                <p className="text-sm text-muted-foreground">Last Month</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600" data-testid="text-customer-growth">
                  +{(customerData as any)?.customerGrowth || 0}%
                </div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

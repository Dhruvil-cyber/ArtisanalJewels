import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileMenu from "@/components/layout/mobile-menu";
import ProductGrid from "@/components/product/product-grid";
import ProductFilters from "@/components/product/product-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Product, Category } from "@shared/schema";

interface ProductFilters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  metal: string;
  gemstone: string;
  sortBy: string;
}

export default function Catalog() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "all-categories",
    minPrice: "",
    maxPrice: "",
    metal: "all-metals",
    gemstone: "all-gemstones",
    sortBy: "newest",
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<
    Product[]
  >({
    queryKey: ["/api/products", {
      search: filters.search || undefined,
      category: filters.category !== "all-categories" ? filters.category : undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      metal: filters.metal !== "all-metals" ? filters.metal : undefined,
      gemstone: filters.gemstone !== "all-gemstones" ? filters.gemstone : undefined,
      limit: "24"
    }],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the filter state change
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-4">
            Our Collection
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover exquisite handcrafted jewelry pieces made with the finest
            materials.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search for jewelry..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </form>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full justify-between"
            data-testid="button-toggle-filters"
          >
            Filter & Sort
            <span className="text-muted-foreground">
              {isFiltersOpen ? "Hide" : "Show"}
            </span>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filters Sidebar */}
          <aside
            className={`sticky top-24 h-fit ${isFiltersOpen ? "block" : "hidden lg:block"}`}
          >
            <ProductFilters
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </aside>

          {/* Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {productsLoading
                  ? "Loading..."
                  : `${products.length} products found`}
              </p>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-lg border border-border p-4"
                  >
                    <div className="loading-shimmer w-full h-64 rounded bg-muted mb-4"></div>
                    <div className="loading-shimmer w-3/4 h-4 rounded bg-muted mb-2"></div>
                    <div className="loading-shimmer w-1/2 h-4 rounded bg-muted"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No products found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      search: "",
                      category: "all-categories",
                      minPrice: "",
                      maxPrice: "",
                      metal: "all-metals",
                      gemstone: "all-gemstones",
                      sortBy: "newest",
                    })
                  }
                  className="mt-4"
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

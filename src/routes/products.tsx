import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { CTABanner } from "@/components/CTABanner";
import { PageHero } from "@/components/PageHero";
import { BRANDS } from "@/lib/products";
import { useProducts } from "@/lib/admin-data";
import { SEO } from "@/components/SEO";
import { useCategories } from "@/lib/categories-data";



function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const [cat, setCatState] = useState<string>(searchParams.get("category") || "All");
  const [brand, setBrand] = useState<string>("All");
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    setCatState(searchParams.get("category") || "All");
  }, [searchParams]);

  // Clear search on page refresh
  useEffect(() => {
    if (typeof window !== "undefined" && window.performance) {
      const navEntries = window.performance.getEntriesByType("navigation");
      const isReload = navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === "reload";
      if (isReload) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.delete("search");
          return next;
        });
      }
    }
  }, []);

  const setCat = (value: string) => {
    setCatState(value);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === "All") {
        next.delete("category");
      } else {
        next.set("category", value);
      }
      return next;
    });
  };

  const filtered = products.filter((p) => {
    const matchesCategory = cat === "All" || p.category === cat;
    const matchesBrand = brand === "All" || p.brand === brand;
    
    // Split search query into individual keywords
    const keywords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    
    // Every keyword must be found in either name, description, brand, or category
    const matchesSearch = keywords.every((kw) =>
      p.name.toLowerCase().includes(kw) ||
      p.description.toLowerCase().includes(kw) ||
      (p.brand && p.brand.toLowerCase().includes(kw)) ||
      (p.category && p.category.toLowerCase().includes(kw))
    );
    
    return matchesCategory && matchesBrand && matchesSearch;
  });
  return (
    <>
      <SEO
        title="Products Catalogue"
        description="Browse our full range of high-quality fiber optic equipment including fusion splicers, OTDRs, optical power meters, cleavers, VFLs, and other field accessories."
        keywords="fiber optic products, buy fusion splicer, otdr catalog, field tools, fiber gear"
      />
      <PageHero
        eyebrow="CATALOGUE"
        title="All Products"
        description="Browse our full range of fiber optic equipment and accessories. Tap any product for a WhatsApp quote."
        
      />

      <section className="py-12 md:py-16 bg-background">
        <div className="mx-auto max-w-[1920px] px-6 md:px-16 grid md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr] gap-10 items-start">
          <aside className="md:sticky md:top-24 self-start space-y-8 md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:pr-2">
            <div>
              <h3 className="font-medium text-sm mb-3 text-foreground">Category</h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {["All", ...categories.map((c) => c.name)].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`text-left text-sm px-3 py-2 border transition ${cat === c ? "bg-yellow-500 text-black border-yellow-500" : "bg-card border-border hover:border-yellow-500 hover:text-yellow-600"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="text-sm text-muted-foreground">
                {searchQuery ? (
                  <span>
                    Found {filtered.length} {filtered.length === 1 ? "product" : "products"} for "<strong>{searchQuery}</strong>"
                  </span>
                ) : (
                  <span>{filtered.length} {filtered.length === 1 ? "product" : "products"}</span>
                )}
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete("search");
                    return next;
                  })}
                  className="text-xs text-yellow-500 hover:text-yellow-600 font-medium hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
            
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col bg-card border border-border h-[320px] animate-pulse">
                    <div className="aspect-[4/3] bg-muted w-full"></div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="mt-auto h-8 bg-muted rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((p, i) => <ProductCard key={p.id} p={p} idx={i} allProducts={products} />)}
                </div>
                {filtered.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">No products match your filters.</div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
      <CTABanner />
    </>
  );
}

export default ProductsPage;

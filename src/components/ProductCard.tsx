import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, ArrowLeft } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { QuoteDialog } from "@/components/QuoteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProducts } from "@/lib/admin-data";

export function ProductCard({ p, idx = 0, allProducts = [] }: { p: Product; idx?: number; allProducts?: Product[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product>(p);
  const [activeTab, setActiveTab] = useState<"details" | "pdf">("details");
  const [history, setHistory] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const products = allProducts;

  const handleOpen = () => {
    setActiveProduct(p);
    setSelectedImage(p.images && p.images.length > 0 ? p.images[0] : p.image);
    setActiveTab("details");
    setHistory([]);
    setIsOpen(true);
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setActiveTab("details");
      setHistory([]);
      setSelectedImage("");
    }
  };

  const handleSelectRelated = (r: Product) => {
    setHistory((prev) => [...prev, activeProduct]);
    setActiveProduct(r);
    setSelectedImage(r.images && r.images.length > 0 ? r.images[0] : r.image);
    setActiveTab("details");
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((prevStack) => prevStack.slice(0, -1));
    setActiveProduct(prev);
    setSelectedImage(prev.images && prev.images.length > 0 ? prev.images[0] : prev.image);
    setActiveTab("details");
  };

  const getEmbedUrl = (url?: string) => {
    if (!url) return "";
    if (url.includes("drive.google.com/file/d/")) {
      return url.replace(/\/view\??.*/, "/preview");
    }
    return url;
  };

  const related = products
    .filter((item) => item.brand === activeProduct.brand && item.category === activeProduct.category && item.id !== activeProduct.id)
    .slice(0, 3);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: idx * 0.04 }}
        className="group flex flex-col bg-card border border-border hover:border-primary transition-colors overflow-hidden h-full"
      >
        {/* Image (triggers popup) */}
        <button
          onClick={handleOpen}
          type="button"
          className="relative aspect-[16/10] sm:aspect-[4/3] bg-muted overflow-hidden block w-full text-left cursor-pointer focus:outline-none"
        >
          {p.image ? (
            <img
              src={p.image}
              alt={`${p.name} — ${p.brand} ${p.category} | SATYA POWER TECHNOLOGYS`}
              loading="lazy"
              className="h-full w-full object-contain bg-white p-2 transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground/30 text-xs font-medium uppercase tracking-widest">Image Loading</span>
            </div>
          )}
          {p.featured && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-primary text-primary-foreground text-[11px] font-normal px-2.5 py-1">
              Top Product
            </span>
          )}
        </button>

        {/* Body */}
        <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
          <div className="text-xs font-normal text-muted-foreground">{p.brand}</div>
          <button
            onClick={handleOpen}
            type="button"
            className="mt-1.5 text-left cursor-pointer focus:outline-none w-full"
          >
            <h3 className="text-sm md:text-lg font-light text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {p.name}
            </h3>
          </button>
          <p className="mt-1.5 text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {p.category}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <QuoteDialog
              productName={p.name}
              trigger={
                <button type="button" className="inline-flex items-center gap-1 text-sm font-normal bg-yellow-500 text-black px-3 py-1.5 hover:bg-yellow-400 cursor-pointer group/btn">
                  Get a quote
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              }
            />
            <button
              onClick={handleOpen}
              type="button"
              className="inline-flex items-center gap-1 text-sm font-normal border border-border px-3 py-1.5 hover:border-primary hover:text-primary transition cursor-pointer"
            >
              View details
            </button>
          </div>
        </div>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
          <DialogHeader className="sr-only">
            <DialogTitle>{activeProduct.name}</DialogTitle>
          </DialogHeader>

          <div className="max-h-[90vh] overflow-y-auto p-6 md:p-8">
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-red hover:underline mb-4 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to {history[history.length - 1].name}
              </button>
            )}

            {activeProduct.pdf && (
              <div className="flex border-b border-border mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`pb-2 px-4 text-sm font-semibold border-b-2 transition-colors -mb-[2px] ${
                    activeTab === "details"
                      ? "border-yellow-500 text-yellow-600"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("pdf")}
                  className={`pb-2 px-4 text-sm font-semibold border-b-2 transition-colors -mb-[2px] ${
                    activeTab === "pdf"
                      ? "border-yellow-500 text-yellow-600"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Brochure
                </button>
              </div>
            )}

            {activeTab === "details" ? (
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start mt-4 md:mt-0">
                <div className="flex flex-col gap-4">
                  <div className="bg-white border border-border overflow-hidden aspect-[4/3] flex items-center justify-center p-2">
                    <img
                      src={selectedImage || activeProduct.image}
                      alt={`${activeProduct.name} — ${activeProduct.brand}`}
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                  {activeProduct.images && activeProduct.images.length > 1 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {activeProduct.images.map((imgUrl, index) => {
                        const isActive = selectedImage === imgUrl;
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(imgUrl)}
                            type="button"
                            className={`w-16 h-16 border rounded overflow-hidden p-1 transition bg-white cursor-pointer ${
                              isActive
                                ? "border-yellow-500 ring-2 ring-yellow-500/20"
                                : "border-border hover:border-yellow-500"
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex flex-col h-full justify-between min-h-[400px]">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {activeProduct.brand}
                    </div>
                    <h2 className="mt-2 text-2xl md:text-3xl font-light text-foreground leading-tight">
                      {activeProduct.name}
                    </h2>
                    <div className="mt-1 text-xs md:text-sm text-primary font-medium">
                      {activeProduct.category}
                    </div>

                    {activeProduct.featured && (
                      <span className="inline-block mt-3 bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5">
                        Top Product
                      </span>
                    )}

                    <div className="mt-4 border-t border-border pt-4">
                      <h4 className="text-xs font-medium text-foreground uppercase tracking-wider mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed max-h-[140px] overflow-y-auto whitespace-pre-line pr-2 scrollbar-thin">
                        {activeProduct.description}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3">
                      <QuoteDialog
                        productName={activeProduct.name}
                        trigger={
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-normal hover:bg-brand-red-dark transition cursor-pointer"
                          >
                            Get a quote <ArrowRight className="h-4 w-4" />
                          </button>
                        }
                      />

                      {activeProduct.pdf && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("pdf")}
                          className="inline-flex items-center gap-2 bg-yellow-500 text-black px-5 py-2.5 text-sm font-medium hover:bg-yellow-400 transition"
                        >
                          <ExternalLink className="h-4 w-4" /> View Brochure
                        </button>
                      )}
                    </div>

                    {related.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                          Suggested Products
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {related.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => handleSelectRelated(r)}
                              className="group text-left border border-border bg-card hover:border-primary p-2 transition cursor-pointer flex flex-col h-full focus:outline-none"
                            >
                              <div className="aspect-[4/3] bg-muted overflow-hidden mb-1.5 w-full">
                                <img
                                  src={r.image}
                                  alt={r.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{r.brand}</div>
                              <div className="text-[10px] font-light text-foreground line-clamp-1 group-hover:text-primary transition-colors mt-0.5">
                                {r.name}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full h-[500px] sm:h-[600px] border border-border bg-muted overflow-hidden">
                  <iframe
                    src={getEmbedUrl(activeProduct.pdf)}
                    className="w-full h-full border-0"
                    title={`${activeProduct.name} Brochure`}
                    allow="autoplay"
                  ></iframe>
                </div>
                <div className="flex justify-end">
                  <a
                    href={activeProduct.pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 transition"
                  >
                    <ExternalLink className="h-4 w-4" /> Open in New Tab
                  </a>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

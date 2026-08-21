import { Link } from "react-router-dom";
import { ArrowRight, Package, Zap, Wrench, ShieldCheck, Battery, Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useRef } from "react";
import { Hero } from "@/components/Hero";
import { TrustIndicators } from "@/components/TrustIndicators";
import { BrandStrip } from "@/components/BrandStrip";
import { ServiceBranches } from "@/components/ServiceBranches";
import { WhyChoose } from "@/components/WhyChoose";
import { ProductCard } from "@/components/ProductCard";
import { CTABanner } from "@/components/CTABanner";
import { useProducts } from "@/lib/admin-data";
import evServiceImg from "@/assets/ev-service.png";
import { whatsappLink } from "@/lib/site";
import { SEO } from "@/components/SEO";


const REVIEWS = [
  {
    name: "K. Raghunath",
    role: "Managing Director",
    company: "Sri Sai Communications, Kakinada",
    rating: 5,
    content: "We have been purchasing Inno fusion splicers and accessories from Satya Power since 2018. Their pricing is unbeatable, and the service support in Kakinada is exceptionally prompt.",
  },
  {
    name: "Mohammad Ali",
    role: "Network Operator",
    company: "Deccan Fiber Links, Hyderabad",
    rating: 5,
    content: "The team resolved a calibration issue on our EXFO OTDR within 24 hours. The repair work is highly professional and they only use genuine components. Strongly recommended!",
  },
  {
    name: "P. Srinivas Rao",
    role: "Proprietor",
    company: "Srinivas Broadband Services, Vijayawada",
    rating: 5,
    content: "Very reliable supplier for fiber equipment in Andhra Pradesh. Bought multiple toolkit sets and cleaning supplies. Best prices and excellent customer service.",
  },
  {
    name: "G. Venkatesh",
    role: "Operations Head",
    company: "PowerGrid Telecom Subcontractor, Nellore",
    rating: 5,
    content: "Satya Power is our go-to partner for fusion splicer electrode replacement and service. Their technicians are highly knowledgeable and handle calibration perfectly.",
  },
  {
    name: "T. Anil Kumar",
    role: "ISP Partner",
    company: "SmartNet Broadband, Tirupati",
    rating: 5,
    content: "Recently purchased the Grandway optical power meters and laser sources. The products are extremely durable, and the team provided excellent guidance on operation.",
  },
];

function TestimonialsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.querySelector(".testimonial-card")?.clientWidth || 300;
      const gap = 24; // gap-6 is 24px
      containerRef.current.scrollBy({
        left: direction === "left" ? -(cardWidth + gap) : (cardWidth + gap),
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-background text-foreground border-t border-border overflow-hidden">
      <div className="mx-auto max-w-[1920px] px-6 md:px-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Customer Stories</div>
            <h2 className="text-3xl md:text-5xl font-light text-foreground leading-[1.15]">Trusted by industry partners</h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="h-12 w-12 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="h-12 w-12 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth pb-4"
        >
          {REVIEWS.map((rev, i) => (
            <div
              key={i}
              className="testimonial-card snap-center shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-card border border-border p-6 md:p-8 flex flex-col justify-between h-[280px] sm:h-[300px] relative overflow-hidden group hover:border-primary hover:shadow-lg transition-all duration-300"
            >
              <Quote className="absolute right-6 top-6 h-12 w-12 text-slate-100 dark:text-slate-800 -z-10 group-hover:scale-110 transition-transform duration-500 opacity-60" />
              
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed italic">
                  "{rev.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/60">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {rev.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 text-sm truncate">{rev.name}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{rev.role}, <span className="font-medium text-slate-600">{rev.company.split(",").pop()?.trim()}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Home() {
  const { products } = useProducts();
  const featured = products.filter((p) => p.featured).slice(0, 36);
  return (
    <>
      <SEO
        title="Authorized Distributor for Inno, Grandway, Claron & EXFO"
        description="SATYA POWER TECHNOLOGYS is the authorized sales & service distributor of premium fiber optic fusion splicers, OTDRs, cleavers, EV batteries repair, and testing equipment across Andhra Pradesh & Telangana."
        keywords="fusion splicers, otdr, fiber optic tools, inno distributor, satya power, ev battery repair, ap telangana"
      />
      <Hero />
      <TrustIndicators />
      <BrandStrip />

      <section className="py-12 md:py-20 bg-card">
        <div className="mx-auto max-w-[1920px] px-6 md:px-16">
          <div className="grid md:grid-cols-3 gap-6 mb-8 md:gap-10 md:mb-12 items-end">
            <div className="md:col-span-2">
              <div className="text-sm font-normal text-muted-foreground mb-3">Our top products</div>
              <h2 className="text-2xl md:text-5xl font-light text-foreground leading-[1.15]">Top picks from our catalogue</h2>
            </div>
            <div className="flex md:justify-end items-center gap-3 md:gap-4">
              <span className="inline-flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
                <Package className="h-3.5 w-3.5 text-primary" /> 500+ products
              </span>
              <Link to="/products" className="group inline-flex items-center gap-2 text-sm font-normal text-primary hover:text-brand-red-dark border-b border-primary pb-1">
                View all <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {featured.map((p, i) => <ProductCard key={p.id} p={p} idx={i} allProducts={products} />)}
          </div>
        </div>
      </section>

      <ServiceBranches />

      <section className="py-14 md:py-24 bg-card text-foreground border-t border-border overflow-hidden">
        <div className="mx-auto max-w-[1920px] px-6 md:px-16 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div>
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">New Service Frontier</div>
              <h2 className="text-3xl md:text-5xl font-light leading-[1.15] text-foreground">
                Powering the Future:<br />EV Battery Repair Services
              </h2>
            </div>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              We have recently expanded our service portfolio to support the transition to electric vehicles. For EV batteries, we specifically provide only repair, service, and cell replacement.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-accent text-primary flex items-center justify-center shrink-0">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-medium text-foreground">EV Battery Repair & Service</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive health diagnostics, safety testing, capacity validation, and servicing to restore original battery efficiency.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-accent text-primary flex items-center justify-center shrink-0">
                  <Battery className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-medium text-foreground">Battery Cells Replacement</h3>
                  <p className="text-sm text-muted-foreground">Cost-effective replacement of individual degraded or faulty cell modules to extend the lifecycle of your existing pack.</p>
                </div>
              </div>
            </div>
            <div>
              <a
                href={whatsappLink("Hello SATYA POWER TECHNOLOGYS, I am interested in your EV battery repair and cell replacement services.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/95 transition-all shadow-md group"
              >
                Inquire on WhatsApp <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
          <div className="relative group max-w-xl mx-auto lg:mx-0 w-full animate-in fade-in slide-in-from-right-5 duration-700">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-sm blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-card border border-border/80 overflow-hidden">
              <img
                src={evServiceImg}
                alt="EV Battery Repair Service"
                loading="lazy"
                className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      <WhyChoose />

      <TestimonialsSection />

      <CTABanner />
    </>
  );
}

export default Home;

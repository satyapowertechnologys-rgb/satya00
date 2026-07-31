import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  LayoutDashboard, Package, MessageSquare, Tag as TagIcon, Settings as SettingsIcon,
  LogOut, Plus, Pencil, Trash2, Upload, AlertCircle, CheckCircle2, X, Mail, Phone,
  TrendingUp, TrendingDown, ShoppingBag, Users, Eye, Menu, Wrench, Image as ImageIcon,
  Layers, ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useCategories } from "@/lib/categories-data";
import { getBrandLogo } from "@/lib/brand-logos";
import {
  useAuth, useProducts, useInquiries, isFirebaseConfigured,
  DEMO_CREDENTIALS,
  type Inquiry,
  getCompanyInfo, saveCompanyInfo, type CompanyInfo,
} from "@/lib/admin-data";
import { CATEGORIES, type Product } from "@/lib/products";
import { useServicesStore, ICON_NAMES, ICONS, type ServiceItem } from "@/lib/services-data";
import { useGallery, GALLERY_CATEGORIES, type GalleryItem } from "@/lib/gallery-data";
import { useBrands } from "@/lib/brands-data";
import { compressImage } from "@/lib/image-compress";
import { SITE } from "@/lib/site";
import { toast } from "sonner";


type Tab = "dashboard" | "products" | "services" | "inquiries" | "brands" | "gallery" | "categories" | "settings";

import { SEO } from "@/components/SEO";

function AdminPage() {
  const { user, loading, login, logout } = useAuth();
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return (
    <>
      <SEO title="Admin Login" description="Admin authentication panel for Satya Power Technologys." />
      <LoginScreen onLogin={login} />
    </>
  );
  return (
    <>
      <SEO title="Admin Dashboard" description="Admin management dashboard for Satya Power Technologys." />
      <Dashboard email={user.email ?? ""} onLogout={logout} />
    </>
  );
}

/* ============ LOGIN ============ */
function LoginScreen({ onLogin }: { onLogin: (e: string, p: string) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string; password: string }>();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-muted/30 py-12 px-4">
      <div className="w-full max-w-md bg-white border border-border p-8">
        <div className="flex justify-center mb-6"><Logo /></div>
        <h1 className="text-2xl font-black text-brand-black text-center">Admin Login</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">Sign in to manage your store</p>

        {!isFirebaseConfigured() && (
          <div className="mt-5 bg-brand-red/10 border border-brand-red p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-bold text-brand-red">Demo mode</div>
              <div className="text-muted-foreground mt-1">
                Sign in with the demo credentials below. Changes won't persist until Firebase keys are added in <code className="font-mono text-xs bg-muted px-1">src/lib/firebase.ts</code>.
              </div>
              <div className="mt-3 bg-white border border-brand-red/30 p-3 font-mono text-xs space-y-1">
                <div><span className="text-muted-foreground">Email:</span> <span className="font-bold text-brand-black select-all">{DEMO_CREDENTIALS.email}</span></div>
                <div><span className="text-muted-foreground">Password:</span> <span className="font-bold text-brand-black select-all">{DEMO_CREDENTIALS.password}</span></div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(async (d) => {
          setError(null);
          try { await onLogin(d.email, d.password); }
          catch (e: any) { setError(e?.message ?? "Login failed"); }
        })} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-black">Email</label>
            <input type="email" {...register("email", { required: "Required" })} className="mt-1.5 w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red" />
            {errors.email && <span className="text-xs text-brand-red">{errors.email.message}</span>}
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-black">Password</label>
            <input type="password" {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 characters" } })} className="mt-1.5 w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red" />
            {errors.password && <span className="text-xs text-brand-red">{errors.password.message}</span>}
          </div>
          {error && <div className="text-sm text-brand-red bg-brand-red/10 p-3 border border-brand-red">{error}</div>}
          <button type="submit" disabled={isSubmitting} className="w-full bg-brand-red text-white font-bold py-3 hover:bg-brand-red-dark transition disabled:opacity-60">
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============ DASHBOARD ============ */
function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { products, save, remove, uploadImage } = useProducts();
  const { inquiries, updateStatus, remove: removeInquiry } = useInquiries();

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "services", label: "Services", icon: Wrench },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare },
    { id: "brands", label: "Brands & Partners", icon: TagIcon },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const active = tabs.find((t) => t.id === tab);
  const unreadCount = inquiries.filter((i) => i.status === "new").length;

  const SidebarBody = (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Logo />
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-brand-red/10 text-brand-red"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <t.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{t.label}</span>
              {t.id === "inquiries" && unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-brand-red text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unreadCount}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-200 space-y-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-brand-red text-white grid place-items-center font-bold text-sm shrink-0">
            {(email || "A")[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 truncate">{email || "Admin"}</div>
            <div className="text-[11px] text-slate-500">Administrator</div>
          </div>
        </div>
        <button onClick={onLogout} className="w-full inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 font-semibold py-2 rounded-lg hover:bg-slate-100 transition text-sm">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {!isFirebaseConfigured() && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs text-center py-2 px-4">
          <AlertCircle className="inline h-3.5 w-3.5 mr-1" />
          Demo mode — Firebase isn't configured. Changes won't persist.
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[260px_1fr] min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
          {SidebarBody}
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/40 z-40"
              />
              <motion.aside
                initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                transition={{ type: "tween", duration: 0.2 }}
                className="lg:hidden fixed inset-y-0 left-0 w-[260px] bg-white z-50 flex flex-col shadow-xl"
              >
                {SidebarBody}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Right column */}
        <div className="flex flex-col min-w-0">
          {/* Top header */}
          <header className="h-14 sm:h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-slate-700" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider hidden sm:block">Admin Panel</div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">{active?.label}</h1>
            </div>
            <div className="h-9 w-9 rounded-full bg-brand-red text-white grid place-items-center font-bold text-sm shrink-0 lg:hidden">
              {(email || "A")[0].toUpperCase()}
            </div>
          </header>

          <section className="p-4 sm:p-6 lg:p-8 min-w-0">
            {tab === "dashboard" && <DashboardOverview products={products} inquiries={inquiries} onTab={setTab} />}
            {tab === "products" && <ProductsManager products={products} save={save} remove={remove} uploadImage={uploadImage} />}
            {tab === "categories" && <CategoriesManager />}
            {tab === "services" && <ServicesManager />}
            {tab === "inquiries" && <InquiriesManager inquiries={inquiries} updateStatus={updateStatus} remove={removeInquiry} />}
            {tab === "brands" && <BrandsManager />}
            {tab === "gallery" && <GalleryManager />}
            
            {tab === "settings" && <SettingsManager />}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ============ Overview ============ */
function DashboardOverview({ products, inquiries, onTab }: { products: Product[]; inquiries: Inquiry[]; onTab: (t: Tab) => void }) {
  const unread = inquiries.filter((i) => i.status === "new").length;
  const resolved = inquiries.filter((i) => i.status === "resolved").length;

  const stats = [
    {
      label: "Total Products", value: products.length, icon: ShoppingBag,
      iconBg: "bg-brand-red/10", iconColor: "text-brand-red",
      delta: "+12%", up: true, tab: "products" as const,
    },
    {
      label: "Inquiries", value: inquiries.length, icon: MessageSquare,
      iconBg: "bg-blue-50", iconColor: "text-blue-600",
      delta: "+8%", up: true, tab: "inquiries" as const,
    },
    {
      label: "Unread", value: unread, icon: Eye,
      iconBg: "bg-amber-50", iconColor: "text-amber-600",
      delta: unread > 0 ? "new" : "0", up: unread > 0, tab: "inquiries" as const,
    },
    {
      label: "Top Products", value: products.filter((p) => p.featured).length, icon: Users,
      iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
      delta: "live", up: true, tab: "products" as const,
    },
  ];

  // Category distribution for bar chart
  const chartData = useMemo(() => {
    const byCat = new Map<string, number>();
    products.forEach((p) => byCat.set(p.category, (byCat.get(p.category) ?? 0) + 1));
    return Array.from(byCat.entries()).map(([name, count]) => ({
      name: name.length > 10 ? name.slice(0, 10) + "…" : name,
      products: count,
      featured: products.filter((p) => p.category === name && p.featured).length,
    }));
  }, [products]);

  // Inquiry status donut
  const pieData = [
    { name: "New", value: unread, color: "#dc2626" },
    { name: "Read", value: inquiries.filter((i) => i.status === "read").length, color: "#3b82f6" },
    { name: "Resolved", value: resolved, color: "#10b981" },
  ].filter((d) => d.value > 0);
  const pieFallback = pieData.length === 0 ? [{ name: "No data", value: 1, color: "#e5e7eb" }] : pieData;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome back</h2>
        <p className="text-sm text-slate-500 mt-1">Here's what's happening with your store today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => onTab(s.tab)}
            className="text-left bg-white rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between">
              <div className={`h-9 w-9 rounded-lg grid place-items-center ${s.iconBg}`}>
                <s.icon className={`h-4.5 w-4.5 ${s.iconColor}`} />
              </div>
              <div className={`flex items-center gap-0.5 text-[11px] font-semibold ${s.up ? "text-emerald-600" : "text-slate-400"}`}>
                {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{s.delta}</span>
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-slate-900">Products by Category</h2>
              <p className="text-xs text-slate-500 mt-1">Distribution across your catalog</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-red" /> Products</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-slate-300" /> Top Products</span>
            </div>
          </div>
          <div className="h-64 sm:h-72 mt-4">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">No product data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(220,38,38,0.06)" }} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                  <Bar dataKey="products" fill="#dc2626" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="featured" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Inquiry Status</h2>
          <p className="text-xs text-slate-500 mt-1">Breakdown of customer messages</p>
          <div className="h-48 sm:h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieFallback} dataKey="value" innerRadius={50} outerRadius={78} paddingAngle={2}>
                  {pieFallback.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 mt-2">
            {[
              { name: "New", value: unread, color: "#dc2626" },
              { name: "Read", value: inquiries.filter((i) => i.status === "read").length, color: "#3b82f6" },
              { name: "Resolved", value: resolved, color: "#10b981" },
            ].map((d) => (
              <li key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} /> {d.name}</span>
                <span className="font-semibold tabular-nums text-slate-900">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent messages */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Recent Messages</h2>
          <button onClick={() => onTab("inquiries")} className="text-sm font-semibold text-brand-red hover:underline">View all →</button>
        </div>
        {inquiries.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No inquiries yet. Submissions from the contact form will appear here.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {inquiries.slice(0, 5).map((i) => (
              <li key={i.id} className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                <div className={`h-9 w-9 rounded-full grid place-items-center text-white text-xs font-bold shrink-0 ${i.status === "new" ? "bg-brand-red" : i.status === "resolved" ? "bg-emerald-500" : "bg-blue-500"}`}>
                  {i.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-sm truncate">{i.name} <span className="font-normal text-xs text-slate-500">— {i.phone}</span></div>
                  <div className="text-sm text-slate-500 line-clamp-1 mt-0.5">{i.message}</div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shrink-0 ${i.status === "new" ? "bg-red-50 text-brand-red" : i.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{i.status ?? "new"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ============ Products manager ============ */
function ProductsManager({ products, save, remove, uploadImage }: {
  products: Product[];
  save: (p: Product) => Promise<void>;
  remove: (id: string) => Promise<void>;
  uploadImage: (f: File) => Promise<string>;
}) {
  const [editing, setEditing] = useState<Product | null>(null);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500 mt-1">{products.length} item{products.length === 1 ? "" : "s"} in your catalog</p>
        </div>
        <button onClick={() => setEditing({ id: "", name: "", brand: "INNO", category: "Fusion Splicers", description: "", image: "" })}
          className="inline-flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-brand-red-dark transition text-sm shadow-sm">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Mobile card list */}
      <div className="grid sm:hidden gap-3">
        {products.map((p) => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-3 flex gap-3">
            <img src={p.image} alt="" className="h-16 w-16 object-cover rounded-lg shrink-0 bg-slate-100" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 text-sm truncate">{p.name}</div>
              <div className="text-xs text-slate-500 mt-0.5 truncate">{p.category}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded">{p.brand}</span>
                {p.featured && <span className="text-[10px] font-bold bg-red-50 text-brand-red px-1.5 py-0.5 rounded">TOP PRODUCT</span>}
              </div>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={() => setEditing(p)} className="p-1.5 rounded hover:bg-slate-100"><Pencil className="h-4 w-4 text-slate-600" /></button>
              <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) remove(p.id); }} className="p-1.5 rounded hover:bg-red-50"><Trash2 className="h-4 w-4 text-brand-red" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left p-3 font-semibold">Image</th>
                <th className="text-left p-3 font-semibold">Name</th>
                <th className="text-left p-3 font-semibold">Category</th>
                <th className="text-left p-3 font-semibold">Brand</th>
                <th className="text-left p-3 font-semibold">Top Product</th>
                <th className="text-right p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="p-3"><img src={p.image} alt="" className="h-12 w-12 object-cover rounded-md bg-slate-100" /></td>
                  <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                  <td className="p-3 text-slate-600">{p.category}</td>
                  <td className="p-3"><span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-1 rounded">{p.brand}</span></td>
                  <td className="p-3">{p.featured ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className="text-slate-300">—</span>}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(p)} className="p-2 rounded hover:bg-slate-100"><Pencil className="h-4 w-4 text-slate-600" /></button>
                    <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) remove(p.id); }} className="p-2 rounded hover:bg-red-50 ml-1"><Trash2 className="h-4 w-4 text-brand-red" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editing && <ProductEditor product={editing} onClose={() => setEditing(null)} onSave={async (p) => { await save(p); setEditing(null); }} uploadImage={uploadImage} />}
      </AnimatePresence>
    </div>
  );
}

function ProductEditor({ product, onClose, onSave, uploadImage }: {
  product: Product;
  onClose: () => void;
  onSave: (p: Product) => Promise<void>;
  uploadImage: (f: File) => Promise<string>;
}) {
  const { categories } = useCategories();
  const { items: brandItems } = useBrands();

  // Ensure images array is initialized from the product image if images is empty
  const productWithImages = useMemo(() => {
    const list = product.images && product.images.length > 0
      ? [...product.images]
      : product.image ? [product.image] : [];
    return { ...product, images: list };
  }, [product]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<Product>({
    defaultValues: productWithImages
  });

  const images = watch("images") || [];
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const isNew = !product.id;

  const handleUploadSuccess = (index: number, url: string) => {
    const next = [...images];
    next[index] = url;
    setValue("images", next, { shouldValidate: true });
    if (index === 0) {
      setValue("image", url, { shouldValidate: true });
    }
  };

  const handleRemoveImage = (index: number) => {
    const next = [...images];
    // Preserve the slot by clearing the image instead of splicing, so positions remain stable
    next[index] = "";
    setValue("images", next, { shouldValidate: true });
    // Update primary image to first non‑empty image (or empty string)
    const newPrimary = next.find((img) => img) || "";
    setValue("image", newPrimary, { shouldValidate: true });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-slate-900">{isNew ? "Add Product" : "Edit Product"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit(async (d) => {
          let id = d.id ? d.id.trim() : "";
          if (!id) {
            id = d.name;
          }
          // Convert to a clean URL slug (lowercase, alphanumeric, dashes) replacing any slashes or special chars.
          id = id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
          
          const cleanedImages = (d.images || []).filter(Boolean);
          const primaryImage = cleanedImages[0] || "";

          await onSave({
            ...d,
            id,
            image: primaryImage,
            images: cleanedImages
          });
        })} className="p-5 space-y-4">
          {isNew && (
            <Field label="ID (optional, slug)">
              <input {...register("id")} placeholder="auto-generated from name" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10" />
            </Field>
          )}
          <Field label="Name" error={errors.name?.message}>
            <input {...register("name", { required: "Required" })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <select {...register("category")} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red bg-white">
                {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Brand">
                <select {...register("brand")} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red bg-white">
                  {brandItems.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
            </Field>
          </div>
          <Field label="Description" error={errors.description?.message}>
            <textarea rows={5} {...register("description", { required: "Required", maxLength: 10000 })} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10" />
          </Field>

          <Field label="Product Images (Upload 2 to 5 images)" error={errors.image?.message}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-1.5">
              {[0, 1, 2, 3, 4].map((index) => {
                const imgUrl = images[index];
                const isUploading = uploadingIndex === index;
                const isPrimary = index === 0;
                
                return (
                  <div key={index} className="relative aspect-square border border-slate-200 rounded-lg flex flex-col items-center justify-center bg-slate-50 overflow-hidden group">
                    {imgUrl ? (
                      <>
                        <img src={imgUrl} alt="" className="w-full h-full object-contain p-1 bg-white" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 text-white text-[9px] text-center py-0.5">
                          {isPrimary ? "Primary" : `Image ${index + 1}`}
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-100 transition p-2 text-center">
                        <Upload className="h-5 w-5 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 font-medium">
                          {isUploading ? "Compressing…" : isPrimary ? "Upload Primary" : `Add Image ${index + 1}`}
                        </span>
                        <input
                          type="file"
                          disabled={uploadingIndex !== null}
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setUploadingIndex(index);
                            try {
                              const url = await uploadImage(f);
                              handleUploadSuccess(index, url);
                            } finally {
                              setUploadingIndex(null);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Primary image is required. Upload 1 to 4 additional images to enable product photo gallery. All images are compressed automatically.
            </p>
            <input type="hidden" {...register("image", { required: "Primary image is required" })} />
          </Field>

          <PdfField
            currentPdf={watch("pdf")}
            onChange={(url) => {
              setValue("pdf", url, { shouldValidate: false });
              setValue("pdfName", undefined, { shouldValidate: false });
            }}
          />
          <input type="hidden" {...register("pdf")} />
          <input type="hidden" {...register("pdfName")} />

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("featured")} className="h-4 w-4 accent-brand-red" />
            <span className="text-sm font-semibold text-slate-700">Show on homepage (Top Product)</span>
          </label>


          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 font-semibold py-2.5 rounded-lg hover:bg-slate-50 text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-brand-red text-white font-semibold py-2.5 rounded-lg hover:bg-brand-red-dark disabled:opacity-60 text-sm shadow-sm">
              {isSubmitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ============ Drive URL field (used by ProductEditor) ============ */
function PdfField({ currentPdf, onChange }: {
  currentPdf?: string;
  onChange: (url: string | undefined) => void;
}) {
  const [input, setInput] = useState(currentPdf || "");
  const [error, setError] = useState<string | null>(null);

  // Convert any Google Drive share link to a direct preview/open link
  function normalizeDriveUrl(raw: string): string {
    const trimmed = raw.trim();
    // Already a view link
    if (trimmed.includes("drive.google.com/file/d/")) {
      // Ensure it uses /view so it opens in Drive viewer
      return trimmed.replace(/\/?(edit|preview|download)[^?]*/, "/view");
    }
    return trimmed;
  }

  function handleSave() {
    const trimmed = input.trim();
    if (!trimmed) {
      onChange(undefined);
      setError(null);
      return;
    }
    if (!trimmed.includes("drive.google.com")) {
      setError("Please enter a valid Google Drive share link.");
      return;
    }
    setError(null);
    onChange(normalizeDriveUrl(trimmed));
    toast.success("Drive link saved!");
  }

  return (
    <Field label="Product Brochure — Google Drive Link (optional)">
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="url"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://drive.google.com/file/d/…/view"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10"
          />
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red-dark transition"
          >
            Save
          </button>
          {currentPdf && (
            <button
              type="button"
              onClick={() => { setInput(""); onChange(undefined); }}
              className="px-3 py-2.5 text-sm text-slate-500 border border-slate-200 rounded-lg hover:text-brand-red hover:border-brand-red transition"
            >
              Remove
            </button>
          )}
        </div>
        {error && <p className="text-xs text-brand-red">{error}</p>}
        {currentPdf && (
          <a
            href={currentPdf}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-brand-red hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Preview saved link
          </a>
        )}
        <p className="text-xs text-slate-500">Paste a Google Drive share link. Customers will open the PDF directly in Google Drive.</p>
      </div>
    </Field>
  );
}


/* ============ Inquiries ============ */
function InquiriesManager({ inquiries, updateStatus, remove }: {
  inquiries: Inquiry[];
  updateStatus: (id: string, s: Inquiry["status"]) => Promise<void>;
  remove: (id: string) => Promise<void>;
}) {
  const [filter, setFilter] = useState<"all" | "new" | "read" | "resolved">("all");
  const list = inquiries.filter((i) => filter === "all" || i.status === filter);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Inquiries</h2>
        <p className="text-sm text-slate-500 mt-1">Messages from your contact form</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(["all", "new", "read", "resolved"] as const).map((f) => {
          const count = f === "all" ? inquiries.length : inquiries.filter((i) => i.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs font-semibold capitalize px-3 py-1.5 rounded-lg transition ${filter === f ? "bg-brand-red text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
              {f} <span className={filter === f ? "text-white/80" : "text-slate-400"}>({count})</span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-sm">No inquiries to show.</div>
      ) : (
        <div className="space-y-3">
          {list.map((i) => (
            <div key={i.id} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900">{i.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${i.status === "new" ? "bg-red-50 text-brand-red" : i.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{i.status ?? "new"}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1.5">
                    {i.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{i.phone}</span>}
                    {i.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{i.email}</span>}
                  </div>
                  {i.subject && <div className="font-semibold mt-2 text-slate-800 text-sm">{i.subject}</div>}
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{i.message}</p>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0 flex-wrap">
                  {i.status !== "read" && <button onClick={() => updateStatus(i.id!, "read")} className="text-xs font-semibold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">Mark read</button>}
                  {i.status !== "resolved" && <button onClick={() => updateStatus(i.id!, "resolved")} className="text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700">Resolve</button>}
                  <button onClick={() => { if (confirm("Delete this inquiry?")) remove(i.id!); }} className="text-xs font-semibold text-brand-red hover:underline px-2 py-1.5">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ Brands manager (grid) ============ */
function BrandsManager() {
  const { items, add, update, remove } = useBrands();
  const [editing, setEditing] = useState<{ id?: string; item: BrandItemType } | null>(null);
  const [adding, setAdding] = useState(false);

  const saveItem = async (id: string | undefined, item: BrandItemType) => {
    try {
      if (id) await update(id, item);
      else await add(item);
      toast.success(id ? "Brand updated" : "Brand added");
      setEditing(null); setAdding(false);
    } catch (e: any) {
      toast.error("Brand upload failed", { description: e?.message ?? "Unknown error" });
    }
  };
  const removeItem = async (id: string, name: string) => {
    if (!confirm(`Delete brand "${name}"?`)) return;
    await remove(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-black">Brands</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage brand logos and descriptions. Saved to Firestore — persists across devices.</p>
        </div>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2.5 rounded-md hover:opacity-90 transition">
          <Plus className="h-4 w-4" /> Add Brand
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.id} className="group bg-white rounded-xl border border-border p-5 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition">
            <div className="flex items-start gap-3">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 grid place-items-center overflow-hidden shrink-0 border border-border">
                {(() => {
                  const logo = it.logo || getBrandLogo(it.name);
                  return logo ? (
                    <img src={logo} alt={it.name} className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="font-black text-brand-red text-lg">{it.name[0]}</span>
                  );
                })()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black text-brand-black text-lg truncate">{it.name}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Brand</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 line-clamp-3 flex-1 min-h-[3.75rem]">
              {it.description || <span className="italic text-muted-foreground/70">No description yet.</span>}
            </p>
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button onClick={() => setEditing({ id: it.id, item: it })} className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold border border-border px-3 py-2 rounded-md hover:border-brand-red hover:text-brand-red transition">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button onClick={() => removeItem(it.id!, it.name)} className="inline-flex items-center justify-center gap-1.5 text-xs font-bold border border-border px-3 py-2 rounded-md hover:bg-brand-red hover:border-brand-red hover:text-white transition">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {(editing || adding) && (
          <BrandEditor
            initial={editing?.item ?? { name: "", description: "", logo: "" }}
            isNew={adding}
            onClose={() => { setEditing(null); setAdding(false); }}
            onSave={(item) => saveItem(editing?.id, item)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

type BrandItemType = { name: string; description?: string; logo?: string };



function BrandEditor({ initial, isNew, onClose, onSave }: { initial: BrandItemType; isNew: boolean; onClose: () => void; onSave: (item: BrandItemType) => void }) {
  const [form, setForm] = useState<BrandItemType>(initial);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="bg-white w-full max-w-lg rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-black text-brand-black">{isNew ? "Add Brand" : "Edit Brand"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Brand Name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" />
          </Field>
          <Field label="Description">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" />
          </Field>
          <Field label="Logo">
            <div className="flex flex-wrap items-center gap-3">
              {form.logo && <img src={form.logo} alt="" className="h-16 w-16 object-contain rounded-lg border border-border bg-white p-1" />}
              <label className="inline-flex items-center gap-2 border border-input rounded px-4 py-2.5 font-semibold text-sm cursor-pointer hover:border-brand-red hover:text-brand-red transition">
                <Upload className="h-4 w-4" /> {form.logo ? "Replace logo" : "Upload logo"}
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const url = await compressImage(f, { maxSize: 400, quality: 0.85 });
                  setForm((p) => ({ ...p, logo: url }));
                }} />
              </label>
              <span className="text-xs text-slate-500">Auto-compressed.</span>
            </div>
          </Field>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-border font-bold py-2.5 rounded hover:bg-muted">Cancel</button>
            <button onClick={() => form.name.trim() && onSave(form)} className="flex-1 bg-brand-red text-white font-semibold py-2.5 rounded hover:opacity-90">Save</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============ Settings ============ */
const defaultCompany = (): CompanyInfo => ({
  name: SITE.name, tagline: SITE.tagline, phone: SITE.phone, phoneAlt: SITE.phoneAlt,
  email: SITE.email, address: SITE.address, gstin: SITE.gstin,
  founded: String(SITE.founded), ceo: SITE.ceo, website: SITE.website,
  logo: "",
});

function SettingsManager() {
  const [company, setCompany] = useState<CompanyInfo>(defaultCompany);
  const [companySaved, setCompanySaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { uploadImage } = useProducts();

  useEffect(() => {
    getCompanyInfo().then((data) => {
      setCompany(data);
    });
  }, []);

  const saveCompany = async () => {
    await saveCompanyInfo(company);
    setCompanySaved(true); setTimeout(() => setCompanySaved(false), 1800);
  };
  const set = <K extends keyof CompanyInfo>(k: K, v: CompanyInfo[K]) => setCompany((c) => ({ ...c, [k]: v }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-black">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage company information and store preferences.</p>
      </div>

      {/* Company details */}
      <div className="bg-white rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-black text-brand-black">Company Information</h2>
          <p className="text-sm text-muted-foreground mt-1">Contact details and business profile shown across the site.</p>
        </div>
        <div className="p-5 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Company Logo">
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {company.logo && (
                  <img src={company.logo} alt="Company logo preview" className="h-16 object-contain bg-slate-50 border border-border p-2 rounded" />
                )}
                <label className="inline-flex items-center gap-2 border border-border px-4 py-2.5 font-semibold text-sm cursor-pointer hover:border-brand-red hover:text-brand-red transition rounded bg-white text-slate-700 shadow-sm">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploading(true);
                      try {
                        const url = await uploadImage(f);
                        set("logo", url);
                      } catch (err: any) {
                        toast.error(err?.message || "Upload failed");
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                </label>
              </div>
            </Field>
          </div>
          <Field label="Tagline / Slogan"><input value={company.tagline} onChange={(e) => set("tagline", e.target.value)} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" /></Field>
          <Field label="Primary Phone"><input value={company.phone} onChange={(e) => set("phone", e.target.value)} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" /></Field>
          <Field label="Alternate Phone"><input value={company.phoneAlt} onChange={(e) => set("phoneAlt", e.target.value)} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" /></Field>
          <Field label="Email"><input type="email" value={company.email} onChange={(e) => set("email", e.target.value)} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" /></Field>
          <Field label="Website"><input value={company.website} onChange={(e) => set("website", e.target.value)} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" /></Field>
          <Field label="GSTIN"><input value={company.gstin} onChange={(e) => set("gstin", e.target.value)} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" /></Field>
          <Field label="Founded Year"><input value={company.founded} onChange={(e) => set("founded", e.target.value)} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" /></Field>
          <Field label="CEO / Owner"><input value={company.ceo} onChange={(e) => set("ceo", e.target.value)} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" /></Field>
          <div className="sm:col-span-2">
            <Field label="Address"><textarea rows={3} value={company.address} onChange={(e) => set("address", e.target.value)} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" /></Field>
          </div>
          <div className="sm:col-span-2 flex items-center gap-3 pt-2">
            <button onClick={saveCompany} className="bg-brand-red text-white font-semibold px-5 py-2.5 rounded hover:opacity-90">Save Changes</button>
            {companySaved && <span className="text-xs font-bold text-emerald-600">Saved ✓</span>}
          </div>
        </div>
      </div>

    </div>
  );
}

/* ============ Reusable ============ */
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-brand-black">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="text-xs text-brand-red mt-1 block">{error}</span>}
    </label>
  );
}

/* ============ Services manager ============ */
function ServicesManager() {
  const { items, upsert, remove } = useServicesStore();
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Services</h2>
          <p className="text-sm text-slate-500 mt-1">{items.length} services on the public site</p>
        </div>
        <button
          onClick={() => setEditing({ id: "", iconName: "Wrench", title: "", description: "" })}
          className="inline-flex items-center gap-2 bg-brand-red text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-brand-red-dark transition text-sm shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s) => {
          const Icon = ICONS[s.iconName] ?? ICONS.Wrench;
          return (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col">
              <div className="h-11 w-11 rounded-xl bg-brand-red/10 text-brand-red grid place-items-center mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed flex-1">{s.description}</p>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button onClick={() => setEditing(s)} className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold border border-border px-3 py-2 rounded-md hover:border-brand-red hover:text-brand-red transition">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => { if (confirm(`Delete service "${s.title}"?`)) remove(s.id); }} className="inline-flex items-center justify-center gap-1.5 text-xs font-bold border border-border px-3 py-2 rounded-md hover:bg-brand-red hover:border-brand-red hover:text-white transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {editing && (
          <ServiceEditor
            initial={editing}
            onClose={() => setEditing(null)}
            onSave={(s) => {
              const id = s.id || s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
              upsert({ ...s, id });
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ServiceEditor({ initial, onClose, onSave }: {
  initial: ServiceItem;
  onClose: () => void;
  onSave: (s: ServiceItem) => void;
}) {
  const [form, setForm] = useState<ServiceItem>(initial);
  const Icon = ICONS[form.iconName] ?? ICONS.Wrench;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="bg-white w-full max-w-lg rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-black text-brand-black">{initial.id ? "Edit Service" : "Add Service"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" />
          </Field>
          <Field label="Description">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" />
          </Field>
          <Field label="Icon">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-brand-red/10 text-brand-red grid place-items-center shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <select value={form.iconName} onChange={(e) => setForm({ ...form, iconName: e.target.value })} className="flex-1 border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded bg-white">
                {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </Field>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-border font-bold py-2.5 rounded hover:bg-muted">Cancel</button>
            <button onClick={() => form.title.trim() && form.description.trim() && onSave(form)} className="flex-1 bg-brand-red text-white font-semibold py-2.5 rounded hover:opacity-90">Save</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============ Gallery ============ */
function GalleryManager() {
  const { items, add, update, remove } = useGallery();
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(GALLERY_CATEGORIES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [editing, setEditing] = useState<GalleryItem | null>(null);

  const handleFile = (f: File | null) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setUploading(true);
    try {
      await add({ title: title.trim(), category, file });
      toast.success("Photo added to gallery");
      setTitle(""); setFile(null); setPreview(""); setCategory(GALLERY_CATEGORIES[0]);
    } catch (err: any) {
      toast.error("Gallery upload failed", { description: err?.message ?? "Unknown error" });
    } finally { setUploading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-black">Gallery</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload photos shown on the public Gallery page.</p>
        </div>
        <div className="text-xs text-slate-500">{items.length} {items.length === 1 ? "photo" : "photos"}</div>
      </div>

      {/* Upload form */}
      <form onSubmit={submit} className="bg-white border border-border rounded-xl p-5 grid md:grid-cols-[180px_1fr] gap-5">
        <div>
          <div className="aspect-square rounded-lg border-2 border-dashed border-border bg-muted/40 overflow-hidden flex items-center justify-center text-muted-foreground text-xs">
            {preview ? (
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="h-6 w-6" />
                <span>Preview</span>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hyderabad service center"
              className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded"
              maxLength={120}
            />
          </Field>
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded bg-white"
            >
              {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Photo">
            <label className="inline-flex items-center gap-2 border border-input rounded px-4 py-2.5 font-semibold text-sm cursor-pointer hover:border-brand-red hover:text-brand-red transition">
              <Upload className="h-4 w-4" /> {file ? file.name : "Choose image"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
            </label>
          </Field>
          <button
            type="submit"
            disabled={!file || !title.trim() || uploading}
            className="inline-flex items-center gap-2 bg-brand-red text-white font-semibold px-5 py-2.5 rounded-md hover:opacity-90 transition disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> {uploading ? "Uploading…" : "Add to gallery"}
          </button>
        </div>
      </form>

      {/* Existing items */}
      {items.length === 0 ? (
        <div className="bg-white border border-dashed border-border rounded-xl py-16 text-center text-muted-foreground">
          No photos yet. Upload one above.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((it) => (
            <div key={it.id} className="group relative bg-white border border-border rounded-lg overflow-hidden">
              <div className="aspect-square bg-muted overflow-hidden">
                <img src={it.image} alt={it.title} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="p-3">
                {it.category && (
                  <div className="text-[10px] font-bold uppercase tracking-wider text-brand-red truncate">{it.category}</div>
                )}
                <div className="text-sm font-semibold text-brand-black truncate">{it.title}</div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => setEditing(it)}
                  className="h-8 w-8 rounded-md bg-white/95 border border-border grid place-items-center hover:text-brand-red"
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => { if (confirm(`Delete "${it.title}"?`)) remove(it.id); }}
                  className="h-8 w-8 rounded-md bg-white/95 border border-border grid place-items-center hover:bg-brand-red hover:text-white"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-xl overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-black text-brand-black">Edit photo</h2>
                <button onClick={() => setEditing(null)} className="p-2 hover:bg-muted rounded"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <img src={editing.image} alt="" className="w-full h-48 object-cover rounded border border-border" />
                <Field label="Title">
                  <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded" />
                </Field>
                <Field label="Category">
                  <select value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full border border-input px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded bg-white">
                    {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setEditing(null)} className="flex-1 border border-border font-bold py-2.5 rounded hover:bg-muted">Cancel</button>
                  <button
                    onClick={async () => { await update(editing.id, { title: editing.title, category: editing.category }); setEditing(null); }}
                    className="flex-1 bg-brand-red text-white font-semibold py-2.5 rounded hover:opacity-90"
                  >Save</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ Categories manager ============ */
function CategoriesManager() {
  const { categories, loading, add, remove } = useCategories();
  const [newCatName, setNewCatName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await add(newCatName.trim());
    setNewCatName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500 mt-1">{categories.length} product categor{categories.length === 1 ? "y" : "ies"}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Add Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Add New Category</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-black">Category Name</label>
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Patch Cords"
                className="mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand-red text-white font-semibold py-2.5 rounded hover:bg-brand-red-dark transition text-sm shadow-sm"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {loading && categories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading categories...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {categories.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="font-medium text-slate-900">{c.name}</div>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete the category "${c.name}"?`)) {
                        remove(c.id);
                      }
                    }}
                    className="p-1.5 rounded hover:bg-red-50 text-brand-red transition"
                    aria-label="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No categories found. Add one above.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, X, Phone, MessageCircle, Facebook, Plus, Package } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { rentalService } from "@/lib/database-service";
import { Rental } from "@/lib/supabase";
import { getThumbnailUrl } from "@/lib/utils";
import { UNCATEGORIZED, sortCategories } from "@/lib/rental-categories";

const PHONE = "0387990332";
const ZALO_URL = `https://zalo.me/${PHONE}`;
const FACEBOOK_URL = "https://www.facebook.com/share/1DiibpAwPB/?mibextid=wwXIfr";
const ALL = "Tất cả";

// Lowercase and strip Vietnamese accents so "den" matches "Đèn"
const normalize = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

const formatPrice = (price: number) => `${new Intl.NumberFormat("vi-VN").format(price)}đ`;

const RentalHouse = () => {
  const navigate = useNavigate();
  const [contactItem, setContactItem] = useState<Rental | null>(null);
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [search, setSearch] = useState("");

  const { data: rentals = [], isLoading, error } = useQuery({
    queryKey: ["rentals", "published"],
    queryFn: () => rentalService.getAll("published"),
  });

  // Group items by category, in the suggested category order
  const groups = useMemo(() => {
    const byCategory = new Map<string, Rental[]>();
    for (const item of rentals) {
      const category = item.category?.trim() || UNCATEGORIZED;
      byCategory.set(category, [...(byCategory.get(category) || []), item]);
    }
    return sortCategories([...byCategory.keys()]).map((category) => ({
      category,
      items: byCategory.get(category)!,
    }));
  }, [rentals]);

  const terms = normalize(search).split(/\s+/).filter(Boolean);
  const matches = (item: Rental, category: string) => {
    const haystack = normalize(`${item.name} ${category} ${item.description || ""}`);
    return terms.every((term) => haystack.includes(term));
  };
  const visibleGroups = groups
    .filter((g) => activeCategory === ALL || g.category === activeCategory)
    .map((g) => ({ ...g, items: g.items.filter((item) => matches(item, g.category)) }))
    .filter((g) => g.items.length > 0);
  const resultCount = visibleGroups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 shrink-0" aria-label="Về trang chủ">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
            <img src="/logo_transparent.png" alt="Tú Nguyễn Film" className="h-10 md:h-12 w-auto" />
            <span className="hidden sm:inline text-lg font-bold tracking-[0.2em] text-yellow-400">RENTAL</span>
          </button>
          <label className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Tìm thiết bị..."
              aria-label="Tìm thiết bị"
              className="w-full rounded-full bg-gray-800 border border-gray-700 pl-9 pr-9 py-2 [&::-webkit-search-cancel-button]:hidden text-sm text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Xoá tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </label>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Category pills */}
        {groups.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 md:flex-wrap md:justify-center -mx-4 px-4 md:mx-0 md:px-0">
            {[ALL, ...groups.map((g) => g.category)].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full px-5 py-2 text-xs md:text-sm font-semibold uppercase tracking-wider border transition-colors ${
                  activeCategory === category
                    ? "bg-yellow-400 border-yellow-400 text-gray-900"
                    : "bg-white border-gray-300 text-gray-600 hover:border-gray-500"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {terms.length > 0 && !isLoading && (
          <p className="text-sm text-gray-500 mb-6 text-center">
            {resultCount} kết quả cho “{search.trim()}”
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="aspect-square bg-gray-100 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-center text-red-600">Không tải được danh sách. Vui lòng thử lại sau.</p>}

        {!isLoading && !error && visibleGroups.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            {rentals.length === 0
              ? <p>Chưa có thiết bị cho thuê. Liên hệ {PHONE} để được tư vấn.</p>
              : (
                <>
                  <p>Không tìm thấy thiết bị phù hợp.</p>
                  <button onClick={() => { setSearch(""); setActiveCategory(ALL); }} className="mt-3 text-sm font-semibold text-amber-700 hover:underline">
                    Xem tất cả thiết bị
                  </button>
                </>
              )}
          </div>
        )}

        {/* Sections by category */}
        <div className="space-y-12">
          {visibleGroups.map(({ category, items }) => (
            <section key={category}>
              <h2 className="border-l-4 border-yellow-400 pl-3 mb-5 text-sm md:text-base font-bold uppercase tracking-[0.15em]">
                {category}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow p-3 md:p-4 flex flex-col">
                    <div className="aspect-square flex items-center justify-center mb-3">
                      {item.image_url ? (
                        <img
                          src={getThumbnailUrl(item.image_url)}
                          alt={item.name}
                          loading="lazy"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-gray-300" />
                      )}
                    </div>
                    <h3 className="text-center text-xs md:text-sm font-bold uppercase leading-snug min-h-[2.5em]">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-center text-[11px] md:text-xs text-gray-500 mt-1 line-clamp-2" title={item.description}>
                        {item.description}
                      </p>
                    )}
                    <p className="text-center mt-3 mb-3">
                      <span className="text-base md:text-lg font-bold text-amber-700">{formatPrice(item.price_per_day)}</span>
                      <span className="text-xs text-gray-500"> / ngày</span>
                    </p>
                    <button
                      onClick={() => setContactItem(item)}
                      className="mt-auto w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 py-2.5 text-[11px] md:text-xs font-semibold uppercase tracking-wide hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Liên hệ thuê
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Floating contact buttons */}
      <div className="fixed right-4 z-30 flex flex-col gap-3" style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}>
        <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
          <Facebook className="w-5 h-5 text-blue-600" />
        </a>
        <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" aria-label="Zalo" className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-xs font-bold text-blue-600 hover:scale-105 transition-transform">
          Zalo
        </a>
        <a href={`tel:${PHONE}`} aria-label={`Gọi ${PHONE}`} className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
          <Phone className="w-5 h-5 text-green-600" />
        </a>
      </div>

      {/* Contact dialog */}
      <Dialog open={!!contactItem} onOpenChange={(open) => !open && setContactItem(null)}>
        <DialogContent className="bg-white text-gray-900 max-w-sm">
          <DialogHeader>
            <DialogTitle>Liên hệ thuê</DialogTitle>
            <DialogDescription>
              {contactItem?.name} · {contactItem && formatPrice(contactItem.price_per_day)} / ngày
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <a href={`tel:${PHONE}`} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Phone className="w-5 h-5 text-green-600" />
              <span className="font-medium">Gọi {PHONE}</span>
            </a>
            <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Nhắn Zalo</span>
            </a>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Facebook className="w-5 h-5 text-indigo-600" />
              <span className="font-medium">Nhắn Facebook</span>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RentalHouse;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { base44 } from "@/api/base44Client";

export default function BooksLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    base44.entities.BookPublication.filter({ status: "PUBLISHED" }, "-published_at", 500)
      .then((rows) => { if (alive) setBooks(rows || []); })
      .catch(() => { if (alive) setBooks([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter((book) => [book.title_ml, book.title_en, book.title_ar, book.author, book.category]
      .some((value) => String(value || "").toLowerCase().includes(q)));
  }, [books, query]);

  return (
    <PageLayout>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-7 text-center">
          <p className="font-amiri text-2xl text-yellow-300">مكتبة الكتب</p>
          <h1 className="mt-1 text-3xl font-bold text-white">പുസ്തകശാല</h1>
          <p className="mt-2 text-sm text-white/45">Books, study previews and digital publications</p>
        </div>

        <label className="mx-auto mb-7 flex max-w-xl items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
          <Search className="h-4 w-4 text-yellow-300/70" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="പുസ്തകം, വിഷയം, രചയിതാവ് തിരയുക" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
        </label>

        {loading && <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-yellow-300" /></div>}
        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-14 text-center">
            <BookOpen className="mx-auto h-9 w-9 text-yellow-300/45" />
            <p className="mt-3 text-sm text-white/50">ഇപ്പോൾ പ്രസിദ്ധീകരിച്ച പുസ്തകങ്ങളില്ല.</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((book) => (
            <Link key={book.id} to={`/books/${book.slug}`} className="group overflow-hidden rounded-2xl border border-yellow-500/15 bg-white/[0.025] transition hover:-translate-y-1 hover:border-yellow-400/40">
              <div className="aspect-[4/3] bg-gradient-to-br from-[#10203d] to-[#040914]">
                {book.cover_url ? <img src={book.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><BookOpen className="h-12 w-12 text-yellow-300/35" /></div>}
              </div>
              <div className="p-4">
                {book.title_ar && <p dir="rtl" className="font-amiri text-lg text-yellow-200">{book.title_ar}</p>}
                <h2 className="mt-1 text-lg font-bold text-white">{book.title_ml || book.title_en}</h2>
                <p className="mt-1 text-xs text-white/40">{book.author || book.category}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">{book.intro_ml || book.intro_en}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${book.access_mode === "FREE" ? "bg-emerald-400/10 text-emerald-300" : "bg-yellow-400/10 text-yellow-200"}`}>
                    {book.access_mode === "FREE" ? "FREE" : `${book.price_currency || "AED"} ${Number(book.price_amount || 0).toFixed(2)}`}
                  </span>
                  <span className="text-xs text-yellow-200/70">കൂടുതൽ വായിക്കുക →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </PageLayout>
  );
}

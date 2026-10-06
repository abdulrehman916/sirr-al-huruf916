import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SortAsc, SortDesc, Heart, Clock, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import SectionBVisualIntegrator from "@/components/sectionb/SectionBVisualIntegrator";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function HolyOnePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useAuth();
  const isAdmin = role === "admin" || role === "owner";
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("alphabetical"); // alphabetical, recently_viewed
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    loadNames();
  }, []);

  const loadNames = async () => {
    setLoading(true);
    try {
      const result = await base44.entities.HolyOneName.filter({ archived: false });
      setNames(result);
    } catch (e) {
      toast({ title: "Failed to load names", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = [...names];

    // Search filter
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(n =>
        (n.arabic_name || "").toLowerCase().includes(s) ||
        (n.malayalam_pronunciation || "").toLowerCase().includes(s) ||
        (n.meaning_malayalam || "").toLowerCase().includes(s)
      );
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(n => n.is_favorite);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "alphabetical") {
        comparison = (a.arabic_name || "").localeCompare(b.arabic_name || "", "ar");
      } else if (sortBy === "recently_viewed") {
        const aTime = a.last_viewed ? new Date(a.last_viewed).getTime() : 0;
        const bTime = b.last_viewed ? new Date(b.last_viewed).getTime() : 0;
        comparison = bTime - aTime;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [names, search, sortBy, sortOrder, showFavoritesOnly]);

  const toggleFavorite = async (name) => {
    try {
      await base44.entities.HolyOneName.update(name.id, { is_favorite: !name.is_favorite });
      loadNames();
      toast({ title: name.is_favorite ? "Removed from favorites" : "Added to favorites" });
    } catch (e) {
      toast({ title: "Failed to update", description: e.message, variant: "destructive" });
    }
  };

  const viewName = async (name) => {
    try {
      // Update view count and last viewed
      await base44.entities.HolyOneName.update(name.id, {
        view_count: (name.view_count || 0) + 1,
        last_viewed: new Date().toISOString()
      });
      navigate(`/holy-names/one/${name.name_id}`);
    } catch (e) {
      toast({ title: "Failed to open", description: e.message, variant: "destructive" });
    }
  };

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-amiri text-3xl font-bold text-gold mb-2">Holy One</h1>
          <p className="text-white/40 text-sm">Sacred Names with Meanings & Virtues</p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search names, meanings..."
              className="pl-10"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: G.border, fontSize: 16 }}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setSortBy("alphabetical")}
              variant={sortBy === "alphabetical" ? "default" : "outline"}
              className="flex-1 min-w-[120px]"
              style={{ 
                background: sortBy === "alphabetical" ? G.bg : "transparent",
                borderColor: G.border,
                fontSize: 16
              }}
            >
              {sortOrder === "asc" ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
              A-Z
            </Button>
            <Button
              onClick={() => setSortBy("recently_viewed")}
              variant={sortBy === "recently_viewed" ? "default" : "outline"}
              className="flex-1 min-w-[120px]"
              style={{ 
                background: sortBy === "recently_viewed" ? G.bg : "transparent",
                borderColor: G.border,
                fontSize: 16
              }}
            >
              <Clock className="w-4 h-4 mr-2" />
              Recent
            </Button>
            <Button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              variant={showFavoritesOnly ? "default" : "outline"}
              style={{ 
                background: showFavoritesOnly ? G.bg : "transparent",
                borderColor: G.border,
                fontSize: 16
              }}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 text-xs text-white/30">
          <span>{filteredAndSorted.length} names</span>
          {showFavoritesOnly && <span>• Favorites only</span>}
          {search && <span>• Search: "{search}"</span>}
        </div>

        {/* Admin-only: Tilimsani source-page visual renderer (Section B) */}
        {isAdmin && <SectionBVisualIntegrator />}

        {/* Names List */}
        <div className="grid grid-cols-1 gap-3">
          {loading ? (
            <div className="text-center py-12 text-white/30">Loading...</div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No names found</p>
            </div>
          ) : (
            filteredAndSorted.map((name, idx) => (
              <motion.div
                key={name.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => viewName(name)}
                className="rounded-xl border p-4 cursor-pointer transition-all hover:border-yellow-400/40"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-amiri font-bold text-xl text-gold mb-1 truncate">{name.arabic_name}</h3>
                    <p className="text-sm text-white/60 mb-1">{name.malayalam_pronunciation}</p>
                    <p className="text-xs text-white/40 line-clamp-2">{name.meaning_malayalam}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(name); }}
                    className="flex-shrink-0 p-2"
                    style={{ color: name.is_favorite ? G.text : "rgba(255,255,255,0.30)" }}
                  >
                    <Heart className={`w-5 h-5 ${name.is_favorite ? "fill-current" : ""}`} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-white/30">
                  {name.view_count > 0 && <span>{name.view_count} views</span>}
                  {name.last_viewed && <span>• Last viewed {new Date(name.last_viewed).toLocaleDateString()}</span>}
                </div>
              </motion.div>
            ))
          )}
        </div>

      </motion.div>
    </PageLayout>
  );
}
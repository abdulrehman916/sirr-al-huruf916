import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ShoppingBag, Star, ExternalLink, Play, X, ZoomIn,
  ChevronLeft, ChevronRight, CheckCircle, MessageSquare, Heart, Share2,
  Link2, Sparkles, Package, Shield, Truck, Award, ChevronDown, ChevronUp,
  FileText, GitCompare, BookOpen, Leaf, HeartPulse, AlertTriangle, ShieldCheck,
  Snowflake, Languages, Tag, Hash
} from "lucide-react";
import PageLayout from "../components/PageLayout";
import { base44 } from "../api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { ProductDetailSkeleton } from "../components/shop/ProductSkeleton";
import RelatedProducts from "../components/shop/RelatedProducts";
import ProductBadgesInline, { getDiscountPercent } from "../components/shop/ProductBadges";
import FaqSection from "../components/shop/FaqSection";
import SellerContact from "../components/shop/SellerContact";
import ShareMenu from "../components/shop/ShareMenu";
import ProductInfoSection from "../components/shop/ProductInfoSection";
import PriceDisplay from "../components/shop/PriceDisplay";
import MarketplaceButtons from "../components/shop/MarketplaceButtons";
import ShopBadges from "../components/shop/ShopBadges";
import { trackDetailView } from "@/lib/shopAnalytics";
import ShippingInfo from "../components/shop/ShippingInfo";
import PremiumGallery from "../components/shop/PremiumGallery";
import ProductInfoAccordion from "../components/shop/ProductInfoAccordion";
import {
  isInWishlist, toggleWishlist, shareProduct, copyProductLink,
  addRecentlyViewed, extractFeatures, getRecentlyViewed as getRecentlyViewedList,
  isInCompare, toggleCompare as toggleCompareUtil
} from "@/lib/shopUtils";

const G = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.55)",
  glow: "rgba(212,175,55,0.18)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.12)",
};

// Trust badges shown below buy buttons
const TRUST_BADGES = [
  { icon: Shield, label: "Quality Assured" },
  { icon: Truck, label: "External Shipping" },
  { icon: Award, label: "Curated Selection" },
];

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewer_name: "", rating: 5, title: "", comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [wished, setWished] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);

  useEffect(() => {
    loadProduct();
    loadAllProducts();
    setRecentlyViewed(getRecentlyViewedList());
    setActiveVideoIdx(0);
  }, [productId]);

  useEffect(() => {
    if (product) {
      setWished(isInWishlist(product.id));
      setInCompare(isInCompare(product.id));
      addRecentlyViewed(product);
    }
  }, [product]);

  useEffect(() => {
    const handler = () => {
      if (product) setWished(isInWishlist(product.id));
      setRecentlyViewed(getRecentlyViewedList());
    };
    window.addEventListener("shop-wishlist-changed", handler);
    window.addEventListener("shop-recently-viewed-changed", handler);
    return () => {
      window.removeEventListener("shop-wishlist-changed", handler);
      window.removeEventListener("shop-recently-viewed-changed", handler);
    };
  }, [product]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      let list = await base44.entities.Product.filter({ slug: productId });
      if (!list || list.length === 0) {
        list = await base44.entities.Product.filter({ product_id: productId });
      }
      if (list && list.length > 0) {
        const p = list[0];
        setProduct(p);
        setActiveImageIdx(p.thumbnail_index || 0);
        trackDetailView(p.product_id || p.id, p.name);
        loadReviews(p.product_id);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadAllProducts = async () => {
    try {
      const list = await base44.entities.Product.list("-created_date", 200);
      setAllProducts(list || []);
    } catch {
      setAllProducts([]);
    }
  };

  const loadReviews = async (pid) => {
    try {
      const list = await base44.entities.ProductReview.filter({ product_id: pid });
      setReviews(list || []);
    } catch {
      setReviews([]);
    }
  };

  const approvedReviews = useMemo(
    () => reviews.filter(r => r.is_approved !== false),
    [reviews]
  );

  const avgRating = useMemo(() => {
    if (approvedReviews.length === 0) return null;
    const sum = approvedReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / approvedReviews.length).toFixed(1);
  }, [approvedReviews]);

  const ratingBreakdown = useMemo(() => {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approvedReviews.forEach(r => {
      const rating = Math.round(r.rating || 0);
      if (breakdown[rating] !== undefined) breakdown[rating]++;
    });
    return breakdown;
  }, [approvedReviews]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.id !== product.id && p.is_active !== false && p.category === product.category)
      .slice(0, 8);
  }, [allProducts, product]);

  const recentlyViewedFiltered = useMemo(() => {
    if (!product) return recentlyViewed;
    return recentlyViewed.filter(p => p.id !== product.id).slice(0, 6);
  }, [recentlyViewed, product]);

  const features = useMemo(() => product ? extractFeatures(product) : [], [product]);

  const handleBuy = (link) => {
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  const nextImage = () => {
    if (!product?.images) return;
    setActiveImageIdx(prev => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product?.images) return;
    setActiveImageIdx(prev => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleWish = () => {
    if (!product) return;
    const added = toggleWishlist(product.id);
    setWished(added);
    toast({ title: added ? "Added to wishlist" : "Removed from wishlist", duration: 1800 });
  };

  const handleCompare = () => {
    if (!product) return;
    const added = toggleCompareUtil(product.id);
    setInCompare(added);
    toast({ title: added ? "Added to compare" : "Removed from compare", duration: 1800 });
  };

  const handleShare = () => {
    if (!product) return;
    const shared = shareProduct(product);
    toast({ title: "Share dialog opened", duration: 1800 });
  };

  const handleCopyLink = () => {
    if (!product) return;
    copyProductLink(product.slug || product.id).then(success => {
      toast({ title: success ? "Link copied to clipboard" : "Failed to copy", duration: 1800 });
    });
  };

  const handleMouseMove = (e) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const touchStartX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || !product?.images) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx > 0) prevImage();
      else nextImage();
    }
    touchStartX.current = null;
  };

  const submitReview = async () => {
    if (!reviewForm.reviewer_name.trim() || !reviewForm.comment.trim()) return;
    try {
      setSubmittingReview(true);
      await base44.entities.ProductReview.create({
        review_id: `REV-${Date.now()}`,
        product_id: product.product_id,
        reviewer_name: reviewForm.reviewer_name.trim(),
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
        is_approved: false,
        created_at: new Date().toISOString(),
      });
      setReviewForm({ reviewer_name: "", rating: 5, title: "", comment: "" });
      setShowReviewForm(false);
      toast({ title: "Review submitted! It will appear after approval.", duration: 3000 });
    } catch (err) {
      toast({ title: "Error submitting review", variant: "destructive", duration: 3000 });
    } finally {
      setSubmittingReview(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  };

  if (loading) {
    return (
      <PageLayout>
        <ProductDetailSkeleton />
      </PageLayout>
    );
  }

  if (!product) {
    return (
      <PageLayout>
        <div className="text-center py-20 space-y-4">
          <div className="relative w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ background: `radial-gradient(circle, ${G.bg} 0%, transparent 70%)` }}>
            <div className="absolute inset-0 rounded-full" style={{ border: `2px dashed ${G.faint}` }} />
            <ShoppingBag className="w-8 h-8" style={{ color: G.dim }} />
          </div>
          <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>Product not found</p>
          <button onClick={() => navigate("/shop")} className="font-inter text-xs underline" style={{ color: G.text }}>
            ← Back to Shop
          </button>
        </div>
      </PageLayout>
    );
  }

  const images = product.images || [];
  const specs = product.specifications || {};
  const specEntries = Object.entries(specs).filter(([, v]) => v);
  const affiliateLinks = product.affiliate_links || [];
  // Merge legacy single video_url + video_urls array (deduped)
  const videoUrls = (() => {
    const list = [];
    if (product.video_urls && Array.isArray(product.video_urls)) {
      list.push(...product.video_urls);
    }
    if (product.video_url && !list.includes(product.video_url)) {
      list.unshift(product.video_url);
    }
    return list.filter(Boolean);
  })();
  const safeVideoIdx = Math.min(activeVideoIdx, Math.max(0, videoUrls.length - 1));
  const embedUrl = videoUrls[safeVideoIdx] ? getEmbedUrl(videoUrls[safeVideoIdx]) : null;
  const isLongDesc = product.full_description && product.full_description.length > 300;
  const faqs = product.faqs || [];

  return (
    <PageLayout>
      {/* Top action bar */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <button
          onClick={() => navigate("/shop")}
          className="flex items-center gap-1.5 font-inter text-xs font-semibold"
          style={{ color: G.dim }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Shop
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCompare}
            className="p-2 rounded-lg"
            style={{
              background: inCompare ? "rgba(96,165,250,0.15)" : G.bg,
              border: inCompare ? "1px solid rgba(96,165,250,0.40)" : `1px solid ${G.faint}`,
            }}
            title={inCompare ? "Remove from compare" : "Add to compare"}
          >
            <GitCompare className="w-3.5 h-3.5" style={{ color: inCompare ? "#60A5FA" : G.dim }} />
          </button>
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-lg"
            style={{ background: G.bg, border: `1px solid ${G.faint}` }}
          >
            <Link2 className="w-3.5 h-3.5" style={{ color: G.dim }} />
          </button>
          <ShareMenu product={product} />
          <button
            onClick={handleWish}
            className="p-2 rounded-lg"
            style={{
              background: wished ? "rgba(248,113,113,0.15)" : G.bg,
              border: wished ? "1px solid rgba(248,113,113,0.40)" : `1px solid ${G.faint}`,
            }}
          >
            <Heart
              className="w-3.5 h-3.5"
              style={{
                color: wished ? "#F87171" : G.dim,
                fill: wished ? "#F87171" : "transparent",
              }}
            />
          </button>
        </div>
      </div>

      <div className="px-4 pb-8 space-y-6">
        {/* Premium Image Gallery */}
        {images.length > 0 && (
          <PremiumGallery images={images} productName={product.name} initialIndex={product.thumbnail_index || 0} />
        )}

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {product.category && (
            <span
              className="inline-block px-2.5 py-0.5 rounded-md font-inter text-[9px] font-bold uppercase tracking-widest"
              style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}
            >
              {product.category}
            </span>
          )}
          <h1 className="font-inter text-xl sm:text-2xl font-bold leading-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
            {product.name}
          </h1>
          {/* Badges */}
          <ProductBadgesInline product={product} />
          {/* Brand + SKU */}
          {(product.brand || product.sku) && (
            <div className="flex items-center gap-3 flex-wrap">
              {product.brand && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3" style={{ color: G.dim }} />
                  <span className="font-inter text-xs font-semibold" style={{ color: "rgba(255,255,255,0.70)" }}>
                    {product.brand}
                  </span>
                </div>
              )}
              {product.sku && (
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3 h-3" style={{ color: G.dim }} />
                  <span className="font-inter text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.40)" }}>
                    SKU: {product.sku}
                  </span>
                </div>
              )}
            </div>
          )}
          {product.short_description && (
            <p className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              {product.short_description}
            </p>
          )}
          {/* Rating + Price */}
          <div className="flex items-center gap-4 flex-wrap">
            {avgRating && (
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star
                      key={n}
                      className="w-3.5 h-3.5"
                      style={{
                        color: n <= Math.round(avgRating) ? G.text : G.faint,
                        fill: n <= Math.round(avgRating) ? G.text : "transparent",
                      }}
                    />
                  ))}
                </div>
                <span className="font-inter text-xs font-semibold" style={{ color: G.text }}>{avgRating}</span>
                <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>({approvedReviews.length} {approvedReviews.length === 1 ? "review" : "reviews"})</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <PriceDisplay
                priceDisplay={product.price_display}
                comparePriceDisplay={product.compare_price_display}
                outOfStock={product.is_out_of_stock}
                size="lg"
              />
              {getDiscountPercent(product) > 0 && (
                <span className="font-inter text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.15)", color: "#86EFAC" }}>
                  {getDiscountPercent(product)}% Off
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Shop Badges — country, currency, shipping, marketplace */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <ShopBadges product={product} variant="full" />
        </motion.div>

        {/* Buy Buttons */}
        {affiliateLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            {product.is_out_of_stock && (
              <div className="text-center py-2 rounded-xl font-inter text-xs font-bold" style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.30)", color: "#F87171" }}>
                Out of Stock — check back soon
              </div>
            )}
            <MarketplaceButtons product={product} />
            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {TRUST_BADGES.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div key={idx} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color: G.dim }} />
                    <span className="font-inter text-[9px] font-medium" style={{ color: "rgba(255,255,255,0.40)" }}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* WhatsApp Inquiry + Contact Seller */}
        <SellerContact product={product} />

        {/* Shipping & Delivery Info */}
        <ShippingInfo />

        {/* Videos Gallery (multiple) */}
        {videoUrls.length > 0 && embedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" style={{ color: G.text }} />
              <h2 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
                {videoUrls.length > 1 ? `Product Videos (${videoUrls.length})` : "Product Video"}
              </h2>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black" style={{ border: `1px solid ${G.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.40)" }}>
              <iframe
                key={activeVideoIdx}
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder="0"
              />
            </div>
            {videoUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {videoUrls.map((vUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveVideoIdx(idx)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                    style={{
                      background: idx === activeVideoIdx ? "rgba(212,175,55,0.14)" : "rgba(8,16,38,0.60)",
                      border: `1px solid ${idx === activeVideoIdx ? G.borderHi : G.faint}`,
                    }}
                  >
                    <Play className="w-2.5 h-2.5" style={{ color: idx === activeVideoIdx ? G.text : G.dim }} />
                    <span className="font-inter text-[10px] font-semibold" style={{ color: idx === activeVideoIdx ? G.text : "rgba(255,255,255,0.50)" }}>
                      Video {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* PDF Attachment */}
        {product.pdf_url && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: G.text }} />
              <h2 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
                Document
              </h2>
            </div>
            <a
              href={product.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.01]"
              style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}`, cursor: "pointer" }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.30)" }}>
                <FileText className="w-5 h-5" style={{ color: "#F87171" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-xs font-bold" style={{ color: G.text }}>Download PDF</p>
                <p className="font-inter text-[10px] truncate" style={{ color: "rgba(255,255,255,0.40)" }}>
                  Datasheet / brochure / manual
                </p>
              </div>
              <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: G.dim }} />
            </a>
          </motion.div>
        )}

        {/* Product Information Accordion */}
        <ProductInfoAccordion product={product} features={features} />

        {/* FAQ Section */}
        <FaqSection faqs={faqs} />

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" style={{ color: G.text }} />
              <h2 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
                Customer Reviews ({approvedReviews.length})
              </h2>
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-3 py-1 rounded-lg font-inter text-[10px] font-bold"
              style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.text }}
            >
              Write Review
            </button>
          </div>

          {/* Rating Summary */}
          {approvedReviews.length > 0 && (
            <div className="rounded-xl p-4 flex items-center gap-5" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}>
              <div className="text-center flex-shrink-0">
                <p className="font-inter text-3xl font-bold" style={{ color: G.text }}>{avgRating}</p>
                <div className="flex justify-center my-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star
                      key={n}
                      className="w-3 h-3"
                      style={{
                        color: n <= Math.round(avgRating) ? G.text : G.faint,
                        fill: n <= Math.round(avgRating) ? G.text : "transparent",
                      }}
                    />
                  ))}
                </div>
                <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>
                  {approvedReviews.length} {approvedReviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
              {/* Breakdown bars */}
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = ratingBreakdown[stars];
                  const pct = approvedReviews.length > 0 ? (count / approvedReviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="font-inter text-[9px] font-semibold w-3" style={{ color: "rgba(255,255,255,0.50)" }}>{stars}</span>
                      <Star className="w-2 h-2" style={{ color: G.dim, fill: G.dim }} />
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ background: G.text }}
                        />
                      </div>
                      <span className="font-inter text-[9px] w-4 text-right" style={{ color: "rgba(255,255,255,0.40)" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review Form */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.border}` }}>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={reviewForm.reviewer_name}
                    onChange={e => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-transparent outline-none font-inter text-sm"
                    style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }}
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>Rating:</span>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })}>
                        <Star
                          className="w-5 h-5"
                          style={{
                            color: n <= reviewForm.rating ? G.text : G.faint,
                            fill: n <= reviewForm.rating ? G.text : "transparent",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Review title (optional)"
                    value={reviewForm.title}
                    onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-transparent outline-none font-inter text-sm"
                    style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }}
                  />
                  <textarea
                    placeholder="Write your review..."
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-transparent outline-none font-inter text-sm resize-none"
                    style={{ border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.90)" }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitReview}
                      disabled={submittingReview || !reviewForm.reviewer_name.trim() || !reviewForm.comment.trim()}
                      className="flex-1 py-2 rounded-lg font-inter text-xs font-bold disabled:opacity-30"
                      style={{ background: G.bgHi, border: `1px solid ${G.borderHi}`, color: G.text }}
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 rounded-lg font-inter text-xs font-bold"
                      style={{ background: "transparent", border: `1px solid ${G.faint}`, color: "rgba(255,255,255,0.50)" }}
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Reviews are moderated and will appear after admin approval.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews List */}
          {approvedReviews.length === 0 ? (
            <div className="text-center py-8 rounded-xl" style={{ background: "rgba(8,16,38,0.40)", border: `1px solid ${G.faint}` }}>
              <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: G.dim, opacity: 0.4 }} />
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                No reviews yet. Be the first to review!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {approvedReviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl p-3.5 space-y-1.5"
                  style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-inter text-[10px] font-bold" style={{ background: G.bgHi, color: G.text }}>
                        {review.reviewer_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="font-inter text-xs font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
                        {review.reviewer_name}
                      </span>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star
                          key={n}
                          className="w-3 h-3"
                          style={{
                            color: n <= (review.rating || 0) ? G.text : G.faint,
                            fill: n <= (review.rating || 0) ? G.text : "transparent",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {review.title && (
                    <p className="font-inter text-xs font-semibold" style={{ color: G.text }}>
                      {review.title}
                    </p>
                  )}
                  <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {review.comment}
                  </p>
                  {review.created_at && (
                    <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <RelatedProducts
            title="Related Products"
            icon={Sparkles}
            products={relatedProducts}
          />
        )}

        {/* Customers also bought — best sellers from all categories */}
        {(() => {
          const alsoBought = allProducts
            .filter(p => p.id !== product?.id && p.is_active !== false && p.is_best_seller)
            .slice(0, 8);
          return alsoBought.length > 0 ? (
            <RelatedProducts
              title="Customers also bought"
              icon={ShoppingBag}
              products={alsoBought}
            />
          ) : null;
        })()}

        {/* Recently Viewed */}
        {recentlyViewedFiltered.length > 0 && (
          <RelatedProducts
            title="Recently Viewed"
            icon={ArrowLeft}
            products={recentlyViewedFiltered}
            isRecent
          />
        )}
      </div>

    </PageLayout>
  );
}
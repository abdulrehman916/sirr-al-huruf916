import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CLICK_TYPES = new Set([
  "buy_click", "amazon_click", "noon_click", "flipkart_click",
  "custom_click", "whatsapp_click", "email_click",
]);

const VIEW_TYPES = new Set(["view", "detail_view"]);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Fetch all events (paginated, capped at 10000 for performance) ──
    let allEvents = [];
    let skip = 0;
    while (allEvents.length < 10000) {
      const batch = await base44.asServiceRole.entities.ShopAnalyticsEvent.list(
        "-created_date", 500, skip
      );
      if (!batch || batch.length === 0) break;
      allEvents = allEvents.concat(batch);
      if (batch.length < 500) break;
      skip += 500;
    }

    // ── 1. Summary ──
    const summary = {
      totalViews: 0,
      totalDetailViews: 0,
      totalBuyClicks: 0,
      amazonClicks: 0,
      noonClicks: 0,
      flipkartClicks: 0,
      customClicks: 0,
      whatsappClicks: 0,
      emailClicks: 0,
      shareClicks: 0,
      wishlistAdds: 0,
    };
    allEvents.forEach(e => {
      switch (e.event_type) {
        case "view": summary.totalViews++; break;
        case "detail_view": summary.totalDetailViews++; break;
        case "buy_click": summary.totalBuyClicks++; break;
        case "amazon_click": summary.amazonClicks++; break;
        case "noon_click": summary.noonClicks++; break;
        case "flipkart_click": summary.flipkartClicks++; break;
        case "custom_click": summary.customClicks++; break;
        case "whatsapp_click": summary.whatsappClicks++; break;
        case "email_click": summary.emailClicks++; break;
        case "share_click": summary.shareClicks++; break;
        case "wishlist_add": summary.wishlistAdds++; break;
      }
    });

    // ── 2. Product Performance ──
    const productMap = {};
    allEvents.forEach(e => {
      if (!e.product_id) return;
      if (!productMap[e.product_id]) {
        productMap[e.product_id] = {
          product_id: e.product_id,
          product_name: e.product_name || e.product_id,
          views: 0, detailViews: 0, clicks: 0,
          marketplaceClicks: {}, lastClickDate: null,
          countries: {}, devices: {},
        };
      }
      const p = productMap[e.product_id];
      if (e.event_type === "view") p.views++;
      if (e.event_type === "detail_view") p.detailViews++;
      if (CLICK_TYPES.has(e.event_type)) {
        p.clicks++;
        const mp = e.marketplace || e.event_type.replace("_click", "");
        p.marketplaceClicks[mp] = (p.marketplaceClicks[mp] || 0) + 1;
        if (!p.lastClickDate || (e.created_date || "") > p.lastClickDate) {
          p.lastClickDate = e.created_date || null;
        }
      }
      if (e.country) p.countries[e.country] = (p.countries[e.country] || 0) + 1;
      if (e.device_type) p.devices[e.device_type] = (p.devices[e.device_type] || 0) + 1;
    });

    const products = Object.values(productMap).map(p => {
      const totalInteractions = p.views + p.detailViews + p.clicks;
      const ctr = totalInteractions > 0
        ? parseFloat(((p.clicks / totalInteractions) * 100).toFixed(1))
        : 0;
      const topMarketplace = Object.entries(p.marketplaceClicks)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
      const topCountries = Object.entries(p.countries)
        .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
      const topDevice = Object.entries(p.devices)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";
      return {
        ...p,
        ctr,
        topMarketplace,
        topCountries,
        topDevice,
      };
    }).sort((a, b) => (b.clicks - a.clicks) || (b.views - a.views));

    // ── 3. Country Analytics ──
    const countryMap = {};
    allEvents.forEach(e => {
      if (!e.country) return;
      if (!countryMap[e.country]) {
        countryMap[e.country] = {
          country: e.country,
          sessions: new Set(),
          clicks: 0,
          views: 0,
          productClicks: {},
        };
      }
      if (e.session_id) countryMap[e.country].sessions.add(e.session_id);
      if (CLICK_TYPES.has(e.event_type)) {
        countryMap[e.country].clicks++;
        if (e.product_id) {
          countryMap[e.country].productClicks[e.product_id] =
            (countryMap[e.country].productClicks[e.product_id] || 0) + 1;
        }
      }
      if (VIEW_TYPES.has(e.event_type)) countryMap[e.country].views++;
    });

    // Resolve top product names per country
    const productNameMap = {};
    products.forEach(p => { productNameMap[p.product_id] = p.product_name; });

    const countries = Object.values(countryMap).map(c => {
      const topProductEntry = Object.entries(c.productClicks)
        .sort((a, b) => b[1] - a[1])[0];
      return {
        country: c.country,
        visitors: c.sessions.size,
        views: c.views,
        clicks: c.clicks,
        topProductId: topProductEntry ? topProductEntry[0] : "",
        topProductName: topProductEntry
          ? (productNameMap[topProductEntry[0]] || topProductEntry[0])
          : "—",
      };
    }).sort((a, b) => b.visitors - a.visitors);

    // ── 4. Search Analytics ──
    const keywordMap = {};
    const noResultMap = {};
    const categoryFilterMap = {};
    allEvents.forEach(e => {
      if (e.event_type === "search" && e.keyword) {
        keywordMap[e.keyword] = (keywordMap[e.keyword] || 0) + 1;
      }
      if (e.event_type === "no_result_search" && e.keyword) {
        noResultMap[e.keyword] = (noResultMap[e.keyword] || 0) + 1;
      }
      if (e.event_type === "category_filter" && e.category) {
        categoryFilterMap[e.category] = (categoryFilterMap[e.category] || 0) + 1;
      }
    });

    const search = {
      topKeywords: Object.entries(keywordMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 20)
        .map(([keyword, count]) => ({ keyword, count })),
      noResultKeywords: Object.entries(noResultMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 20)
        .map(([keyword, count]) => ({ keyword, count })),
      topCategories: Object.entries(categoryFilterMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 20)
        .map(([category, count]) => ({ category, count })),
    };

    // ── 5. Charts (daily / weekly / monthly / yearly) ──
    const now = new Date();
    const charts = { daily: [], weekly: [], monthly: [], yearly: [] };

    const dateStr = (d) => d.toISOString().split("T")[0];

    // Daily — last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i);
      const ds = dateStr(d);
      const dayEvents = allEvents.filter(e =>
        e.created_date && e.created_date.startsWith(ds)
      );
      charts.daily.push({
        date: ds,
        label: ds.slice(5),
        views: dayEvents.filter(e => VIEW_TYPES.has(e.event_type)).length,
        clicks: dayEvents.filter(e => CLICK_TYPES.has(e.event_type)).length,
      });
    }

    // Weekly — last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setUTCDate(weekEnd.getUTCDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setUTCDate(weekStart.getUTCDate() - 6);
      const startStr = dateStr(weekStart);
      const endStr = dateStr(weekEnd);
      const weekEvents = allEvents.filter(e => {
        if (!e.created_date) return false;
        const d = e.created_date.split("T")[0];
        return d >= startStr && d <= endStr;
      });
      charts.weekly.push({
        week: `W${12 - i}`,
        label: `${startStr.slice(5)}—${endStr.slice(5)}`,
        views: weekEvents.filter(e => VIEW_TYPES.has(e.event_type)).length,
        clicks: weekEvents.filter(e => CLICK_TYPES.has(e.event_type)).length,
      });
    }

    // Monthly — last 12 months
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const monthKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const monthEvents = allEvents.filter(e =>
        e.created_date && e.created_date.startsWith(monthKey)
      );
      charts.monthly.push({
        month: monthKey,
        label: `${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
        views: monthEvents.filter(e => VIEW_TYPES.has(e.event_type)).length,
        clicks: monthEvents.filter(e => CLICK_TYPES.has(e.event_type)).length,
      });
    }

    // Yearly — last 5 years
    for (let i = 4; i >= 0; i--) {
      const year = now.getUTCFullYear() - i;
      const yearEvents = allEvents.filter(e =>
        e.created_date && e.created_date.startsWith(String(year))
      );
      charts.yearly.push({
        year: String(year),
        label: String(year),
        views: yearEvents.filter(e => VIEW_TYPES.has(e.event_type)).length,
        clicks: yearEvents.filter(e => CLICK_TYPES.has(e.event_type)).length,
      });
    }

    return Response.json({
      success: true,
      data: {
        summary,
        products,
        countries,
        search,
        charts,
        totalEvents: allEvents.length,
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});
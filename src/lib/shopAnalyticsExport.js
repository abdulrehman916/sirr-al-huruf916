/**
 * Shop Analytics Export Utilities — CSV, XLSX (Excel), PDF.
 *
 * Generates downloadable files from the aggregated analytics data
 * returned by the getShopAnalytics backend function.
 *
 * No personal data is exported — only anonymous aggregate statistics.
 */
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

// ── Build flat data rows for export ──

function buildSummaryRows(summary) {
  return [
    ["Metric", "Count"],
    ["Product Views", summary.totalViews || 0],
    ["Product Detail Views", summary.totalDetailViews || 0],
    ["Buy Button Clicks", summary.totalBuyClicks || 0],
    ["Amazon Button Clicks", summary.amazonClicks || 0],
    ["Noon Button Clicks", summary.noonClicks || 0],
    ["Flipkart Button Clicks", summary.flipkartClicks || 0],
    ["Custom Marketplace Clicks", summary.customClicks || 0],
    ["WhatsApp Inquiry Clicks", summary.whatsappClicks || 0],
    ["Email Inquiry Clicks", summary.emailClicks || 0],
    ["Share Button Clicks", summary.shareClicks || 0],
    ["Wishlist Adds", summary.wishlistAdds || 0],
  ];
}

function buildProductRows(products) {
  const rows = [["Product ID", "Product Name", "Total Views", "Detail Views", "Total Clicks", "CTR (%)", "Top Marketplace", "Last Click Date", "Top Countries", "Top Device"]];
  products.forEach(p => {
    rows.push([
      p.product_id,
      p.product_name,
      p.views,
      p.detailViews,
      p.clicks,
      p.ctr,
      p.topMarketplace,
      p.lastClickDate || "",
      (p.topCountries || []).join(", "),
      p.topDevice,
    ]);
  });
  return rows;
}

function buildCountryRows(countries) {
  const rows = [["Country", "Visitors", "Views", "Clicks", "Top Product"]];
  countries.forEach(c => {
    rows.push([c.country, c.visitors, c.views, c.clicks, c.topProductName]);
  });
  return rows;
}

function buildSearchRows(search) {
  const rows = [["Type", "Keyword / Category", "Count"]];
  (search.topKeywords || []).forEach(k => rows.push(["Search", k.keyword, k.count]));
  (search.noResultKeywords || []).forEach(k => rows.push(["No Results", k.keyword, k.count]));
  (search.topCategories || []).forEach(c => rows.push(["Category Filter", c.category, c.count]));
  return rows;
}

function buildChartRows(charts, period) {
  const data = charts[period] || [];
  const rows = [["Period", "Label", "Views", "Clicks"]];
  data.forEach(d => {
    rows.push([period, d.label, d.views, d.clicks]);
  });
  return rows;
}

// ── CSV ──

function rowsToCsv(rows) {
  return rows.map(row =>
    row.map(cell => {
      const s = String(cell ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }).join(",")
  ).join("\n");
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCsv(data, period = "daily") {
  const stamp = new Date().toISOString().split("T")[0];
  const sections = [
    { name: "Summary", rows: buildSummaryRows(data.summary) },
    { name: "Product Performance", rows: buildProductRows(data.products) },
    { name: "Country Analytics", rows: buildCountryRows(data.countries) },
    { name: "Search Analytics", rows: buildSearchRows(data.search) },
    { name: `Charts (${period})`, rows: buildChartRows(data.charts, period) },
  ];

  const csv = sections.map(s =>
    `# ${s.name}\n` + rowsToCsv(s.rows)
  ).join("\n\n");

  downloadBlob(csv, `shop_analytics_${stamp}.csv`, "text/csv;charset=utf-8;");
}

// ── XLSX (Excel) ──

export function exportXlsx(data, period = "daily") {
  const stamp = new Date().toISOString().split("T")[0];
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.aoa_to_sheet(buildSummaryRows(data.summary)), "Summary");
  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.aoa_to_sheet(buildProductRows(data.products)), "Products");
  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.aoa_to_sheet(buildCountryRows(data.countries)), "Countries");
  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.aoa_to_sheet(buildSearchRows(data.search)), "Search");
  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.aoa_to_sheet(buildChartRows(data.charts, period)), `Charts_${period}`);

  XLSX.writeFile(wb, `shop_analytics_${stamp}.xlsx`);
}

// ── PDF ──

const G = {
  text: "#D4AF37",
  dim: "#888888",
  dark: "#1a1a2e",
};

export function exportPdf(data, period = "daily") {
  const stamp = new Date().toISOString().split("T")[0];
  const doc = new jsPDF();
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(G.text);
  doc.text("Shop Analytics Report", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(G.dim);
  doc.text(`Generated: ${stamp}  |  Period: ${period}  |  Total Events: ${data.totalEvents || 0}`, 14, y);
  y += 10;

  // Summary
  doc.setFontSize(13);
  doc.setTextColor(G.dark);
  doc.text("Summary", 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(50);
  buildSummaryRows(data.summary).slice(1).forEach(([, label], idx, arr) => {
    const row = arr[idx];
    doc.text(`${row[0]}: ${row[1]}`, 16, y);
    y += 5;
    if (y > 270) { doc.addPage(); y = 20; }
  });
  y += 4;

  // Product Performance (top 20)
  doc.setFontSize(13);
  doc.setTextColor(G.dark);
  doc.text("Product Performance (Top 20)", 14, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(80);
  const prodRows = buildProductRows(data.products).slice(0, 21);
  prodRows.forEach((row, i) => {
    if (i === 0) {
      doc.setFont(undefined, "bold");
      doc.text(row.join("  |  "), 16, y);
      doc.setFont(undefined, "normal");
    } else {
      doc.text(row.join("  |  "), 16, y);
    }
    y += 5;
    if (y > 270) { doc.addPage(); y = 20; }
  });
  y += 4;

  // Country Analytics
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFontSize(13);
  doc.setTextColor(G.dark);
  doc.text("Country Analytics", 14, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(80);
  buildCountryRows(data.countries).forEach((row, i) => {
    if (i === 0) {
      doc.setFont(undefined, "bold");
      doc.text(row.join("  |  "), 16, y);
      doc.setFont(undefined, "normal");
    } else {
      doc.text(row.join("  |  "), 16, y);
    }
    y += 5;
    if (y > 270) { doc.addPage(); y = 20; }
  });
  y += 4;

  // Search Analytics
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFontSize(13);
  doc.setTextColor(G.dark);
  doc.text("Search Analytics", 14, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(80);
  buildSearchRows(data.search).forEach((row, i) => {
    if (i === 0) {
      doc.setFont(undefined, "bold");
      doc.text(row.join("  |  "), 16, y);
      doc.setFont(undefined, "normal");
    } else {
      doc.text(row.join("  |  "), 16, y);
    }
    y += 5;
    if (y > 270) { doc.addPage(); y = 20; }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(G.dim);
    doc.text(
      "Anonymous analytics only — no personal data collected. Purchases continue on external marketplaces.",
      14, 287
    );
    doc.text(`Page ${i} / ${pageCount}`, 180, 287);
  }

  doc.save(`shop_analytics_${stamp}.pdf`);
}
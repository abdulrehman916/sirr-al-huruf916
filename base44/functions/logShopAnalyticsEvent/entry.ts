import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const {
      event_type, product_id, product_name, marketplace,
      keyword, category, session_id,
    } = body;

    if (!event_type) {
      return Response.json({ success: false, error: "event_type required" }, { status: 400 });
    }

    // ── Anonymous geo + device derivation (no personal data stored) ──
    const country =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country-code") ||
      req.headers.get("cloudfront-viewer-country") ||
      "";

    const ua = (req.headers.get("user-agent") || "").toLowerCase();
    let device_type = "desktop";
    if (/ipad|tablet|kindle|silk|playbook/.test(ua)) {
      device_type = "tablet";
    } else if (/iphone|ipod|android.*mobile|windows phone|blackberry|mobile/.test(ua)) {
      device_type = "mobile";
    } else if (/mobile/.test(ua)) {
      device_type = "mobile";
    }

    await base44.asServiceRole.entities.ShopAnalyticsEvent.create({
      event_type,
      product_id: product_id || "",
      product_name: product_name || "",
      marketplace: marketplace || "",
      keyword: keyword || "",
      category: category || "",
      country,
      device_type,
      session_id: session_id || "",
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});
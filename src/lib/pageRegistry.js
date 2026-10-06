import ROUTE_MANIFEST from '@/lib/routeManifest';

/**
 * Dynamic Page Registry
 * Decentralized page registration with O(1) config retrieval
 *
 * Only routes that exist in ROUTE_MANIFEST are manually registered here
 * (for curated names/icons). All other manifest routes are auto-registered
 * by the loop at the bottom. No orphan entries for removed routes are kept.
 */

const pageRegistry = new Map();

export function registerPage(path, config) {
  pageRegistry.set(path, {
    path,
    requiresPermission: config.requiresPermission ?? true,
    permissionCode: config.permissionCode || derivePermissionCode(path),
    adminOnly: config.adminOnly ?? false,
    pageType: config.pageType || 'content', // 'content' | 'admin' | 'system' | 'audit'
    visible: config.visible ?? true,
    ...config
  });
}

export function derivePermissionCode(path) {
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!clean) return 'HOME_ACCESS';
  return clean.toUpperCase().replace(/[-/]/g, '_') + '_ACCESS';
}

export function getPageConfig(path) {
  if (pageRegistry.has(path)) {
    return pageRegistry.get(path);
  }
  for (const [pattern, config] of pageRegistry.entries()) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:\w+/g, '[^/]+') + '$');
      if (regex.test(path)) {
        return config;
      }
    }
  }
  return null;
}

export function isPublicPage(path) {
  const config = getPageConfig(path);
  return config ? !config.requiresPermission : false;
}

export function getAllPages() {
  return Array.from(pageRegistry.values());
}

export const getAllRegisteredPages = getAllPages;

export function getContentPages() {
  return getAllPages().filter(p => p.pageType === 'content' && p.visible);
}

export function getAdminVisiblePages() {
  return getAllPages().filter(p =>
    p.visible &&
    !p.adminOnly &&
    p.pageType === 'content'
  );
}

export function categorizePages() {
  const pages = getAllPages();
  return {
    content: pages.filter(p => p.pageType === 'content'),
    admin: pages.filter(p => p.pageType === 'admin'),
    system: pages.filter(p => p.pageType === 'system'),
    audit: pages.filter(p => p.pageType === 'audit')
  };
}

// ── Manual registrations (curated names/icons) — ONLY for routes in ROUTE_MANIFEST ──

// Core
registerPage('/', { name: 'Home', icon: '🏠', category: 'System', pageType: 'content', visible: true, requiresPermission: false });
registerPage('/onboarding', { requiresPermission: false, pageType: 'system' });

// Content pages
registerPage('/abjad', { name: 'Abjad Calculator', icon: '🔢', category: 'Calculators', pageType: 'content', visible: true, requiresPermission: false });
registerPage('/anasir', { name: 'Anasir Calculator', icon: '🌊', category: 'Calculators', pageType: 'content', visible: true, requiresPermission: false });
registerPage('/hadim', { name: 'Hadim Calculator', icon: '👑', category: 'Calculators', pageType: 'content', visible: true, requiresPermission: false });
registerPage('/mizaan9', { name: 'Mizan 9', icon: '⚖️', category: 'Calculators', pageType: 'content', visible: true, requiresPermission: true });
registerPage('/magic-sqayer', { name: 'Magic Sqayer', icon: '✨', category: 'Vefk Systems', pageType: 'content', visible: true, requiresPermission: true });
registerPage('/vefkin-yapilisi', { name: 'Vefkin Yapılışı', icon: '📜', category: 'Vefk Systems', pageType: 'content', visible: true, requiresPermission: true });
registerPage('/basthul-huroof-2', { name: 'Basthul Huroof 2', icon: '٢', category: 'Calculators', pageType: 'content', visible: true, requiresPermission: true });
registerPage('/faal-hasrath', { name: 'Faal Hasrath', icon: '🔮', category: 'Divination', pageType: 'content', visible: true, requiresPermission: true });
registerPage('/plants', { name: 'Plants Dictionary', icon: '🌿', category: 'Reference', pageType: 'content', visible: true, requiresPermission: true });
registerPage('/plants/:id', { pageType: 'content', visible: false, requiresPermission: true });
registerPage('/shop', { name: 'Shop', icon: '🛍️', category: 'Shop', pageType: 'content', visible: true, requiresPermission: true });
registerPage('/shop/:productId', { pageType: 'content', visible: false, requiresPermission: false });
registerPage('/evil-jinn', { name: 'Evil Jinn Names', icon: '👁️', category: 'Reference', pageType: 'content', visible: true, requiresPermission: true });
registerPage('/holy-names', { name: 'Magical Holy Names', icon: '✦', category: 'Reference', pageType: 'content', visible: true, requiresPermission: true });
registerPage('/astro-clock', { name: 'Astro Clock', icon: '🕰️', category: 'Timings', pageType: 'content', visible: true, requiresPermission: true });
registerPage('/astro-clock/search', { pageType: 'content', visible: false, requiresPermission: true });

// Support pages — all public
registerPage('/support', { name: 'Support Hub', icon: '🛡️', category: 'System', pageType: 'content', visible: true, requiresPermission: false });
registerPage('/support/hub', { pageType: 'content', visible: true, requiresPermission: false });
registerPage('/support/chat', { pageType: 'content', visible: false, requiresPermission: false });
registerPage('/support/voice', { pageType: 'content', visible: false, requiresPermission: false });
registerPage('/support/ticket', { pageType: 'content', visible: false, requiresPermission: false });

// Subscription pages
registerPage('/subscription/expired', { pageType: 'system', visible: false, requiresPermission: false });
registerPage('/subscription/pending', { pageType: 'system', visible: false, requiresPermission: false });
registerPage('/premium/request', { pageType: 'content', visible: true, requiresPermission: false });
registerPage('/my-subscription', { name: 'My Subscription', icon: '⭐', category: 'System', pageType: 'content', visible: true, requiresPermission: false });

// Admin pages (all exist in ROUTE_MANIFEST)
registerPage('/admin/access-dashboard', { name: 'Admin Dashboard', icon: '👑', category: 'Admin', pageType: 'admin', adminOnly: true, visible: false });
registerPage('/admin/support', { name: 'Support Messages', icon: '💬', category: 'Admin', pageType: 'admin', adminOnly: true, visible: false });
registerPage('/admin/page-permissions', { name: 'Page Permissions', icon: '🌐', category: 'Admin', pageType: 'admin', adminOnly: true, visible: false });
registerPage('/admin/access-logs', { pageType: 'admin', adminOnly: true, visible: false });
registerPage('/admin/access-requests', { pageType: 'admin', adminOnly: true, visible: false });
registerPage('/admin/admins', { name: 'Admins', icon: '🛡️', category: 'Admin', pageType: 'admin', adminOnly: true, visible: false });
registerPage('/admin/user/:userId', { pageType: 'admin', adminOnly: true, visible: false });

// ── AUTO-REGISTRATION FROM ROUTE_MANIFEST ──────────────────────────
// Any route not manually registered above is auto-registered with derived config.
// Manual registrations above always take precedence (curated names/icons win).

function derivePageName(path) {
  if (path === '/') return 'Home';
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!clean) return 'Home';
  const words = clean.split(/[-/]/).filter(Boolean);
  return words
    .map((w) => {
      const match = w.match(/^([a-zA-Z]+)(\d+)$/);
      if (match) {
        return match[1].charAt(0).toUpperCase() + match[1].slice(1) + ' ' + match[2];
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

function isSystemPath(path) {
  return (
    path.startsWith('/admin/') ||
    path.startsWith('/support/') ||
    path.startsWith('/subscription/') ||
    path.startsWith('/my-') ||
    path.startsWith('/redeem-') ||
    path.startsWith('/premium/') ||
    path.startsWith('/onboarding') ||
    path.startsWith('/otp-') ||
    path.startsWith('/rules-conditions') ||
    path.includes(':') // dynamic routes like /plants/:id
  );
}

// Auto-register every route from ROUTE_MANIFEST not already manually registered
for (const entry of ROUTE_MANIFEST) {
  if (pageRegistry.has(entry.path)) continue; // manual registration wins

  if (isSystemPath(entry.path)) {
    registerPage(entry.path, {
      pageType: entry.path.startsWith('/admin/') ? 'admin' : 'system',
      adminOnly: entry.path.startsWith('/admin/'),
      visible: false,
      requiresPermission: false,
    });
    continue;
  }

  const isPublic = entry.flags?.includes('public');
  registerPage(entry.path, {
    name: derivePageName(entry.path),
    pageType: 'content',
    visible: true,
    requiresPermission: !isPublic,
  });
}
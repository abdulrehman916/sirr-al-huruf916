import ROUTE_MANIFEST from './routeManifest.js';

export function parentRoute(pathname, search = '') {
  if (pathname === '/holy-names' && new URLSearchParams(search).has('section')) return '/holy-names';
  if (pathname.startsWith('/holy-names/one/')) {
    const isBookName = new URLSearchParams(search).get('tab') === 'b' || pathname.includes('/PDF-');
    return isBookName ? '/holy-names?section=section-b' : '/holy-names/one';
  }
  if (pathname === '/admin/access-dashboard') return '/';
  if (pathname.startsWith('/admin/user/')) return '/admin/approved-users';
  if (pathname.startsWith('/content/')) return '/resources';
  const parent = pathname.replace(/\/$/, '').split('/').slice(0, -1).join('/');
  if (ROUTE_MANIFEST.some(route => route.path === parent)) return parent;
  return pathname.startsWith('/admin/') ? '/admin/access-dashboard' : '/';
}

export function backDestination(historyIndex, pathname, search = '', fallback = null) {
  return Number.isInteger(historyIndex) && historyIndex > 0 ? -1 : fallback || parentRoute(pathname, search);
}

export function parentRoute(pathname, search = '') {
  if (pathname.startsWith('/holy-names/one/')) {
    const isBookName = new URLSearchParams(search).get('tab') === 'b' || pathname.includes('/PDF-');
    return isBookName ? '/holy-names?section=section-b' : '/holy-names/one';
  }
  const parent = pathname.replace(/\/$/, '').split('/').slice(0, -1).join('/');
  return parent || '/';
}

export function backDestination(historyIndex, pathname, search = '', fallback = null) {
  return Number.isInteger(historyIndex) && historyIndex > 0 ? -1 : fallback || parentRoute(pathname, search);
}

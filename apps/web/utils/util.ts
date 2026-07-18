export function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }

  return path;
}

export function isActivePath(pathname: string, href: string) {
  const current = normalizePath(pathname);

  if (href === '/dashboard') {
    return current === href;
  }

  return current.startsWith(href);
}

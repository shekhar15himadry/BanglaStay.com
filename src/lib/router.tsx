import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type RouteState = {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  navigate: (path: string) => void;
};

const RouterContext = createContext<RouteState | undefined>(undefined);

function parsePath(pathname: string): { path: string; query: Record<string, string> } {
  const [rawPath, rawQuery] = pathname.split('?');
  const query: Record<string, string> = {};
  if (rawQuery) {
    new URLSearchParams(rawQuery).forEach((value, key) => {
      query[key] = value;
    });
  }
  return { path: rawPath || '/', query };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => {
    const parsed = parsePath(window.location.pathname + window.location.search);
    return { ...parsed, params: {} };
  });

  useEffect(() => {
    const onPop = () => {
      const parsed = parsePath(window.location.pathname + window.location.search);
      setState({ ...parsed, params: {} });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    const parsed = parsePath(path);
    setState({ ...parsed, params: {} });
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ ...state, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

import { useState, useEffect, useCallback, useRef } from 'react';

// Hook genérico para paginación infinita
export const useInfiniteScroll = (fetchFunction, options = {}) => {
  const {
    initialPage = 1,
    pageSize = 20,
    threshold = 100, // píxeles antes del final para cargar más
    enabled = true
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async (reset = false) => {
    if (loadingRef.current || !enabled) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: reset ? initialPage : page,
        page_size: pageSize
      };

      const response = await fetchFunction(params);

      if (reset) {
        setData(response.results || []);
        setPage(initialPage + 1);
      } else {
        setData(prev => [...prev, ...(response.results || [])]);
        setPage(prev => prev + 1);
      }

      setHasMore(response.next !== null);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error in infinite scroll:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchFunction, page, pageSize, initialPage, enabled]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    loadMore(true);
  }, [loadMore, initialPage]);

  const refresh = useCallback(() => {
    loadMore(true);
  }, [loadMore]);

  // Cargar datos iniciales
  useEffect(() => {
    if (enabled) {
      loadMore(true);
    }
  }, [enabled]); // Solo dependemos de enabled para evitar loops

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    refresh
  };
};

// Hook para implementar scroll infinito en un elemento
export const useScrollTrigger = (callback, options = {}) => {
  const {
    threshold = 100,
    enabled = true,
    rootMargin = '0px'
  } = options;

  const [isNearBottom, setIsNearBottom] = useState(false);
  const targetRef = useRef(null);
  const callbackRef = useRef(callback);

  // Mantener callback actualizado
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const target = targetRef.current;
    if (!target) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = target;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom <= threshold) {
        if (!isNearBottom) {
          setIsNearBottom(true);
          callbackRef.current();
        }
      } else {
        setIsNearBottom(false);
      }
    };

    // Usar Intersection Observer si está disponible
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            callbackRef.current();
          }
        },
        {
          root: target,
          rootMargin,
          threshold: 0
        }
      );

      // Crear un elemento sentinel al final
      const sentinel = document.createElement('div');
      sentinel.style.height = '1px';
      target.appendChild(sentinel);

      observer.observe(sentinel);

      return () => {
        observer.disconnect();
        if (target.contains(sentinel)) {
          target.removeChild(sentinel);
        }
      };
    } else {
      // Fallback a scroll event
      target.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        target.removeEventListener('scroll', handleScroll);
      };
    }
  }, [threshold, enabled, rootMargin, isNearBottom]);

  return targetRef;
};

// Hook para cache con expiración
export const useCache = (key, defaultValue = null, ttl = 5 * 60 * 1000) => { // 5 minutos por defecto
  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < ttl) {
          return parsed.data;
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Error reading from cache:', error);
    }
    return defaultValue;
  });

  const setCachedData = useCallback((newData) => {
    setData(newData);
    try {
      localStorage.setItem(key, JSON.stringify({
        data: newData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Error writing to cache:', error);
    }
  }, [key]);

  const clearCache = useCallback(() => {
    setData(defaultValue);
    localStorage.removeItem(key);
  }, [key, defaultValue]);

  const isExpired = useCallback(() => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        return Date.now() - parsed.timestamp >= ttl;
      }
    } catch (error) {
      console.warn('Error checking cache expiration:', error);
    }
    return true;
  }, [key, ttl]);

  return [data, setCachedData, clearCache, isExpired];
};

// Hook para debounced search
export const useDebouncedSearch = (searchFunction, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  const performSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchFunction(term);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchFunction]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performSearch(searchTerm);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, performSearch, delay]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    clearResults: () => setResults([])
  };
};

// Hook para optimización de re-renders con deep comparison
export const useDeepCompareMemo = (value, compare) => {
  const ref = useRef();
  const signalRef = useRef(0);

  if (!compare(value, ref.current)) {
    ref.current = value;
    signalRef.current += 1;
  }

  return [signalRef.current];
};

// Función de comparación profunda
export const deepEqual = (a, b) => {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
};
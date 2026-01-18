import { useCallback, useEffect, useRef, useState } from 'react';

export const useScrollTrigger = (callback, options = {}) => {
  const { threshold = 100 } = options;
  const triggerRef = useRef(null);

  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;

      // Verificar si estamos cerca del final
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        callback();
      }
    };

    element.addEventListener('scroll', handleScroll);

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [callback, threshold]);

  return triggerRef;
};

export const useInfiniteScroll = (callback, hasMore, loading) => {
  const triggerRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const element = triggerRef.current;
    if (!element || !hasMore || loading) return;

    // Usar Intersection Observer para detectar cuando el elemento está visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          callback();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, hasMore, loading]);

  return triggerRef;
};

// Hook para cache con localStorage
export const useCache = (key, initialValue, ttl = 5 * 60 * 1000) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);
      const now = Date.now();

      // Verificar si el cache expiró
      if (parsed.expiry && now > parsed.expiry) {
        localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.value;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return initialValue;
    }
  });

  const setCachedValue = useCallback((newValue) => {
    try {
      const now = Date.now();
      const item = {
        value: newValue,
        expiry: now + ttl,
      };
      localStorage.setItem(key, JSON.stringify(item));
      setValue(newValue);
    } catch (error) {
      console.error('Error writing to cache:', error);
      setValue(newValue);
    }
  }, [key, ttl]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [key, initialValue]);

  return [value, setCachedValue, clearCache];
};

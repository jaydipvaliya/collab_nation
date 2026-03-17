import { useState, useEffect, useCallback } from 'react';
import { useQuery, useInfiniteQuery } from 'react-query';
import api from '../api/axios.js';

// ── useDebounce ───────────────────────────────────────────
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// ── useJobs (infinite scroll) ─────────────────────────────
export const useJobs = (filters = {}) => {
  return useInfiniteQuery(
    ['jobs', filters],
    async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: pageParam, limit: 20 });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const { data } = await api.get(`/jobs?${params}`);
      return data;
    },
    {
      getNextPageParam: (last) =>
        last.currentPage < last.totalPages ? last.currentPage + 1 : undefined,
      staleTime: 2 * 60 * 1000,
    }
  );
};

// ── useJob (single) ───────────────────────────────────────
export const useJob = (slug) =>
  useQuery(['job', slug], () => api.get(`/jobs/${slug}`).then(r => r.data), {
    enabled: !!slug, staleTime: 5 * 60 * 1000,
  });

// ── useCompanies ──────────────────────────────────────────
export const useCompanies = (filters = {}) =>
  useQuery(['companies', filters], () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    return api.get(`/companies?${params}`).then(r => r.data);
  }, { staleTime: 5 * 60 * 1000 });

// ── useDashboard ──────────────────────────────────────────
export const useDashboard = () =>
  useQuery('dashboard', () => api.get('/candidate/dashboard').then(r => r.data), {
    staleTime: 5 * 60 * 1000,
  });

// ── useLocalStorage ───────────────────────────────────────
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; }
    catch { return initialValue; }
  });
  const set = useCallback((v) => {
    setValue(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [value, set];
};

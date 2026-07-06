import { useEffect, useState } from 'react';
import type { SearchFilters } from '../types';

export function useUrlState(defaultFilters: SearchFilters): [SearchFilters, (filters: SearchFilters) => void] {
  const [state, setState] = useState<SearchFilters>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('p');
      const cat = params.get('cat');
      const lvl = params.get('lvl');
      const gen = params.get('gen');
      const br = params.get('br');
      const dist = params.get('dist');

      return {
        percentile: p ? parseFloat(p) : defaultFilters.percentile,
        category: cat || defaultFilters.category,
        level: lvl || undefined,
        gender: gen || undefined,
        branches: br ? br.split(',') : undefined,
        districts: dist ? dist.split(',') : undefined,
      };
    } catch {
      return defaultFilters;
    }
  });

  const setUrlState = (newFilters: SearchFilters) => {
    setState(newFilters);

    try {
      const params = new URLSearchParams();
      params.set('p', newFilters.percentile.toString());
      params.set('cat', newFilters.category);
      if (newFilters.level) params.set('lvl', newFilters.level);
      if (newFilters.gender) params.set('gen', newFilters.gender);
      if (newFilters.branches && newFilters.branches.length > 0) params.set('br', newFilters.branches.join(','));
      if (newFilters.districts && newFilters.districts.length > 0) params.set('dist', newFilters.districts.join(','));

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    } catch (e) {
      console.warn('Failed to update URL state:', e);
    }
  };

  // Listen to popstate to stay in sync if needed
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('p');
      const cat = params.get('cat');
      const lvl = params.get('lvl');
      const gen = params.get('gen');
      const br = params.get('br');
      const dist = params.get('dist');

      setState({
        percentile: p ? parseFloat(p) : defaultFilters.percentile,
        category: cat || defaultFilters.category,
        level: lvl || undefined,
        gender: gen || undefined,
        branches: br ? br.split(',') : undefined,
        districts: dist ? dist.split(',') : undefined,
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [defaultFilters]);

  return [state, setUrlState];
}

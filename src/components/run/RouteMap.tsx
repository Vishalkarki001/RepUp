'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';

/**
 * The run's route on an OpenStreetMap map (Leaflet, loaded only when shown).
 * Green dot = start, red dot = finish.
 */
export function RouteMap({ route, className }: { route: [number, number][]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || route.length < 2) return;
    let map: import('leaflet').Map | null = null;
    let cancelled = false;
    void import('leaflet').then((L) => {
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { zoomControl: false, scrollWheelZoom: false, attributionControl: true });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      }).addTo(map);
      const line = L.polyline(route, { color: '#7c3aed', weight: 4, opacity: 0.9 }).addTo(map);
      const dot = { radius: 6, color: '#ffffff', weight: 2, fillOpacity: 1 };
      L.circleMarker(route[0], { ...dot, fillColor: '#10b981' }).addTo(map);
      L.circleMarker(route[route.length - 1], { ...dot, fillColor: '#ef4444' }).addTo(map);
      map.fitBounds(line.getBounds(), { padding: [24, 24] });
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [route]);

  if (route.length < 2) return null;
  return (
    <div
      ref={ref}
      role="img"
      aria-label="Map of your route"
      className={cn('isolate h-56 w-full overflow-hidden rounded-xl border bg-muted', className)}
    />
  );
}

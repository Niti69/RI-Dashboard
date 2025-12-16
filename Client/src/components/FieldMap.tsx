import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Location {
  id: string;
  name: string;
  coordinates: [number, number];
  address: string;
  district: string;
}

interface FieldMapProps {
  locations: Location[];
  onLocationClick: (id: string) => void;
}

export const FieldMap = ({ locations, onLocationClick }: FieldMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = localStorage.getItem('mapbox_token');
    
    if (!token) {
      return;
    }

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [78.9629, 20.5937], // India center
      zoom: 4,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers
    locations.forEach((location) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = '#6366f1';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      const marker = new mapboxgl.Marker(el)
        .setLngLat(location.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 8px;">
                <h3 style="font-weight: bold; margin-bottom: 4px;">${location.name}</h3>
                <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${location.address}</p>
                <p style="font-size: 12px; color: #888;">${location.district}</p>
              </div>
            `)
        )
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onLocationClick(location.id);
      });

      markers.current.push(marker);
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, [locations, onLocationClick]);

  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get('token') as string;
    
    if (token) {
      localStorage.setItem('mapbox_token', token);
      toast.success('Mapbox token saved! Refreshing map...');
      window.location.reload();
    }
  };

  const token = localStorage.getItem('mapbox_token');

  if (!token) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Mapbox Token Required</h3>
            <p className="text-sm text-muted-foreground">
              To view the field locations map, please enter your Mapbox public token.
            </p>
          </div>
          
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="token" className="text-sm font-medium">
                Mapbox Public Token
              </label>
              <Input
                id="token"
                name="token"
                type="text"
                placeholder="pk.eyJ1Ijoi..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Get your token from{' '}
                <a
                  href="https://account.mapbox.com/access-tokens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Mapbox Dashboard
                </a>
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium"
            >
              Save Token & Load Map
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

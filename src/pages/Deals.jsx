import React, { useEffect, useRef, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import FeedCard from '../components/FeedCard';
import { Loader2, MapPinned, Tag } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-javascript-api';
const GOOGLE_MAPS_PROMISE_KEY = '__localDealsGoogleMapsPromise';
const BUSINESS_FILE_PATH = '/api/businesses';
const DEFAULT_MAP_ID = GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
const SCHOOLCRAFT_COLLEGE_CENTER = { lat: 42.4224, lng: -83.4277 };
const SCHOOLCRAFT_LOCATION_LABEL = 'Schoolcraft College, Livonia, MI';
const LOCAL_BUSINESS_RADIUS_MILES = 35;
const geocodeCache = new Map();

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function looksLocalToSchoolcraft(business) {
  const address = String(business?.address ?? '').toLowerCase();
  const zip = String(business?.zip ?? '').trim();

  return address.includes(', mi') || zip.startsWith('48');
}

function getDistanceInMiles(from, to) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const startLat = toRadians(from.lat);
  const endLat = toRadians(to.lat);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(haversine));
}

function loadGoogleMapsApi() {
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY.'));
  }

  if (window.google?.maps?.importLibrary) {
    return Promise.resolve(window.google.maps);
  }

  if (window[GOOGLE_MAPS_PROMISE_KEY]) {
    return window[GOOGLE_MAPS_PROMISE_KEY];
  }

  window[GOOGLE_MAPS_PROMISE_KEY] = new Promise((resolve, reject) => {
    const callbackName = '__localDealsInitGoogleMaps';
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google.maps);
    };

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&loading=async&v=weekly&libraries=geocoding,marker&map_ids=${encodeURIComponent(DEFAULT_MAP_ID)}&callback=${callbackName}`;
    script.onerror = () => {
      delete window[callbackName];
      delete window[GOOGLE_MAPS_PROMISE_KEY];
      reject(new Error('Google Maps JavaScript API failed to load.'));
    };

    document.head.appendChild(script);
  });

  return window[GOOGLE_MAPS_PROMISE_KEY];
}

async function geocodeBusiness(geocoder, business) {
  const businessName = business?.name?.trim() || 'Unnamed business';
  const address = business?.address?.trim();

  if (!address) {
    console.warn(`Skipping "${businessName}" because it is missing an address.`);
    return null;
  }

  const cacheKey = address.toLowerCase();

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  const geocodePromise = geocoder
    .geocode({ address })
    .then(({ results }) => {
      const firstResult = results?.[0];

      if (!firstResult?.geometry?.location) {
        console.error(`Geocoding failed for "${businessName}" at "${address}".`);
        return null;
      }

      return {
        name: businessName,
        address: firstResult.formatted_address || address,
        position: {
          lat: firstResult.geometry.location.lat(),
          lng: firstResult.geometry.location.lng(),
        },
      };
    })
    .catch((error) => {
      console.error(`Geocoding failed for "${businessName}" at "${address}":`, error);
      return null;
    });

  geocodeCache.set(cacheKey, geocodePromise);
  return geocodePromise;
}

function buildInfoWindowContent(business) {
  return `
    <div style="color:#0f172a;padding:4px 2px;max-width:240px;">
      <h2 style="margin:0 0 8px;font-size:16px;font-weight:700;">
        ${escapeHtml(business.name)}
      </h2>
      <p style="margin:0;font-size:14px;line-height:1.5;">
        ${escapeHtml(business.address)}
      </p>
    </div>
  `;
}

export default function Deals() {
  const { profile } = useProfile();
  const { zip } = profile;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapStatus, setMapStatus] = useState('loading');
  const [mapMessage, setMapMessage] = useState('Loading business map...');
  const [markerCount, setMarkerCount] = useState(0);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!zip) {
      setPosts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);

    fetch(`/api/feed?zip=${zip}&type=DEAL`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) {
          return;
        }

        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [zip]);

  useEffect(() => {
    let cancelled = false;

    async function loadBusinessesMap() {
      if (!mapRef.current) {
        return;
      }

      setMarkerCount(0);

      if (!GOOGLE_MAPS_API_KEY) {
        setMapStatus('error');
        setMapMessage('Add VITE_GOOGLE_MAPS_API_KEY to your .env.local file to load the map.');
        return;
      }

      setMapStatus('loading');
      setMapMessage(`Loading businesses near ${SCHOOLCRAFT_LOCATION_LABEL}...`);

      try {
        const businessResponse = await fetch(BUSINESS_FILE_PATH, { cache: 'no-store' });

        if (!businessResponse.ok) {
          throw new Error(`Could not load ${BUSINESS_FILE_PATH}.`);
        }

        const allBusinesses = await businessResponse.json();

        if (!Array.isArray(allBusinesses)) {
          throw new Error('The businesses file must contain a JSON array.');
        }

        const likelyLocalBusinesses = allBusinesses.filter(looksLocalToSchoolcraft);

        if (likelyLocalBusinesses.length === 0) {
          setMapStatus('empty');
          setMapMessage(`No Michigan businesses were found in ${BUSINESS_FILE_PATH}.`);
          return;
        }

        await loadGoogleMapsApi();

        const [{ Map, InfoWindow }, { AdvancedMarkerElement, PinElement }, { Geocoder }] = await Promise.all([
          google.maps.importLibrary('maps'),
          google.maps.importLibrary('marker'),
          google.maps.importLibrary('geocoding'),
        ]);

        if (cancelled || !mapRef.current) {
          return;
        }

        mapRef.current.innerHTML = '';

        const map = new Map(mapRef.current, {
          center: SCHOOLCRAFT_COLLEGE_CENTER,
          zoom: 11,
          mapId: DEFAULT_MAP_ID,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });
        const geocoder = new Geocoder();
        const infoWindow = new InfoWindow({ ariaLabel: 'Business details' });
        const bounds = new google.maps.LatLngBounds();
        let successfulMarkers = 0;

        // Geocode each address one by one so the logic stays easy to follow.
        for (const business of likelyLocalBusinesses) {
          if (cancelled) {
            return;
          }

          const geocodedBusiness = await geocodeBusiness(geocoder, business);

          if (!geocodedBusiness) {
            continue;
          }

          const distanceFromSchoolcraft = getDistanceInMiles(
            SCHOOLCRAFT_COLLEGE_CENTER,
            geocodedBusiness.position,
          );

          if (distanceFromSchoolcraft > LOCAL_BUSINESS_RADIUS_MILES) {
            continue;
          }

          const pin = new PinElement({
            background: '#674EA7',
            borderColor: '#FFFFFF',
            glyphColor: '#FFFFFF',
            scale: 1.1,
          });

          const marker = new AdvancedMarkerElement({
            map,
            position: geocodedBusiness.position,
            title: geocodedBusiness.name,
            content: pin.element,
          });

          marker.addListener('click', () => {
            infoWindow.setContent(buildInfoWindowContent(geocodedBusiness));
            infoWindow.open({
              map,
              anchor: marker,
            });
          });

          bounds.extend(geocodedBusiness.position);
          successfulMarkers += 1;
        }

        if (cancelled) {
          return;
        }

        if (successfulMarkers === 0) {
          setMapStatus('empty');
          setMapMessage(
            `No businesses within ${LOCAL_BUSINESS_RADIUS_MILES} miles of ${SCHOOLCRAFT_LOCATION_LABEL} could be mapped.`,
          );
          return;
        }

        map.fitBounds(bounds, 80);

        google.maps.event.addListenerOnce(map, 'idle', () => {
          if (map.getZoom() > 15) {
            map.setZoom(15);
          }
        });

        setMarkerCount(successfulMarkers);
        setMapStatus('ready');
        setMapMessage(
          `${successfulMarkers} local business marker${successfulMarkers === 1 ? '' : 's'} loaded near ${SCHOOLCRAFT_LOCATION_LABEL}.`,
        );
      } catch (error) {
        console.error('Failed to load the business map:', error);

        if (!cancelled) {
          setMapStatus('error');
          setMapMessage('The map could not load. Check your Google Maps API key and make sure Maps JavaScript API and Geocoding API are enabled.');
        }
      }
    }

    void loadBusinessesMap();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdateDeal = (updated) => {
    setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)));
  };

  const handleDeleteDeal = (id) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 tabIndex={0} className="text-4xl font-black text-white flex items-center gap-4 tracking-tight">
          <Tag className="text-purple-800" size={40} />
          Local Deals
        </h1>
        <p className="text-white font-medium mt-2">Save money while supporting local in {zip || 'your area'}</p>
      </div>

      <section className="mb-12 bg-white/10 rounded-[40px] border border-white/20 shadow-2xl p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
          <div>
            <p className="text-white font-black uppercase tracking-[0.2em] text-xs mb-2">Business Map</p>
            <h2 className="text-2xl font-black text-white tracking-tight">Businesses near {zip || 'your ZIP code'}</h2>
          </div>
        </div>

        <div className="relative rounded-[28px] overflow-hidden border border-white/20 bg-slate-200 min-h-[420px]">
          <div ref={mapRef} className="h-[420px] w-full" />

          {mapStatus !== 'ready' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-slate-900/65 backdrop-blur-sm">
              {mapStatus === 'loading' ? (
                <Loader2 className="animate-spin text-white mb-4" size={40} />
              ) : (
                <MapPinned className="text-white mb-4" size={40} />
              )}
              <p className="text-white font-black uppercase tracking-[0.2em] text-xs mb-2">
                {mapStatus === 'loading' ? 'Building your map...' : 'Map needs attention'}
              </p>
              <p className="text-white font-medium max-w-md">{mapMessage}</p>
            </div>
          ) : null}
        </div>

        <p className="text-white text-sm font-medium mt-4 leading-relaxed">
          Click a marker to see the business name and full address. The map starts in the local area, skips bad addresses
          automatically, and logs geocoding failures in the browser console.
        </p>
      </section>

      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-white mb-6" size={48} />
            <p className="text-white font-black uppercase tracking-[0.2em] text-xs">Hunting for deals...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <FeedCard
                key={post.id}
                post={post}
                onUpdate={handleUpdateDeal}
                onDelete={handleDeleteDeal}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/10 rounded-[40px] border border-white/20 shadow-2xl">
            <p className="text-white font-black uppercase tracking-widest text-sm mb-2">No active deals</p>
            <p className="text-white text-xs font-medium">
              {zip ? 'Check back soon for new offers in your area!' : 'Add a ZIP code to your profile to load location-based deals.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

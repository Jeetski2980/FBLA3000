import React, { useEffect, useRef, useState } from 'react';
import { Target, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [stats, setStats] = useState({ users: null, businesses: null }); // Live totals from the server
  const [displayStats, setDisplayStats] = useState({ users: 0, businesses: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isStatsHovered, setIsStatsHovered] = useState(false);
  const usersFrameRef = useRef(null);
  const businessesFrameRef = useRef(null);
  const displayedUsersRef = useRef(0);
  const displayedBusinessesRef = useRef(0);

  useEffect(() => { // Load and stream homepage stats
    const controller = new AbortController();
    let eventSource;

    const parseStats = (data) => ({
      users: typeof data?.users === 'number' ? data.users : null,
      businesses: typeof data?.businesses === 'number' ? data.businesses : null
    });

    const loadStatsFallback = async () => {
      const [usersResult, businessesResult] = await Promise.allSettled([
        fetch('/api/users/count', { signal: controller.signal }),
        fetch('/api/businesses', { signal: controller.signal })
      ]);

      const nextStats = { users: null, businesses: null };

      if (usersResult.status === 'fulfilled' && usersResult.value.ok) {
        const usersData = await usersResult.value.json();
        nextStats.users = typeof usersData.count === 'number' ? usersData.count : null;
      }

      if (businessesResult.status === 'fulfilled' && businessesResult.value.ok) {
        const businessesData = await businessesResult.value.json();
        nextStats.businesses = Array.isArray(businessesData) ? businessesData.length : null;
      }

      setStats(nextStats);
    };

    const loadHomeStats = async () => {
      try {
        const response = await fetch('/api/home/stats', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Failed to load home stats');
        }

        const data = await response.json();
        setStats(parseStats(data));
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        try {
          await loadStatsFallback();
        } catch {
          setStats({ users: null, businesses: null });
        }
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadHomeStats();

    if (typeof window !== 'undefined' && 'EventSource' in window) {
      eventSource = new EventSource('/api/home/stats/stream');

      eventSource.addEventListener('home-stats', (event) => {
        try {
          const data = JSON.parse(event.data);
          setStats(parseStats(data));
          setIsLoadingStats(false);
        } catch {
          setIsLoadingStats(false);
        }
      });

      eventSource.addEventListener('home-stats-error', () => {
        setIsLoadingStats(false);
      });

      eventSource.onerror = () => {
        eventSource?.close();
      };
    }

    return () => {
      controller.abort();
      eventSource?.close();
    };
  }, []);

  useEffect(() => { // Animate stat counters
    const animateCount = (frameRef, valueRef, key, nextValue) => {
      if (typeof nextValue !== 'number') {
        return;
      }

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      const startValue = valueRef.current;
      const endValue = nextValue;
      const duration = 1100;
      let startTimestamp = null;

      const step = (timestamp) => {
        if (!startTimestamp) {
          startTimestamp = timestamp;
        }

        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);

        valueRef.current = currentValue;
        setDisplayStats((current) => (
          current[key] === currentValue ? current : { ...current, [key]: currentValue }
        ));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(step);
          return;
        }

        valueRef.current = endValue;
        setDisplayStats((current) => (
          current[key] === endValue ? current : { ...current, [key]: endValue }
        ));
        frameRef.current = null;
      };

      frameRef.current = requestAnimationFrame(step);
    };

    animateCount(usersFrameRef, displayedUsersRef, 'users', stats.users);
    animateCount(businessesFrameRef, displayedBusinessesRef, 'businesses', stats.businesses);

    return () => {
      if (usersFrameRef.current) {
        cancelAnimationFrame(usersFrameRef.current);
      }

      if (businessesFrameRef.current) {
        cancelAnimationFrame(businessesFrameRef.current);
      }
    };
  }, [stats.users, stats.businesses]);

  const userCountLabel = isLoadingStats || typeof stats.users !== 'number'
    ? 'Over -- Users'
    : `Over ${displayStats.users.toLocaleString()} Users`;

  const businessCountLabel = isLoadingStats || typeof stats.businesses !== 'number'
    ? 'Over -- Local Businesses'
    : `Over ${displayStats.businesses.toLocaleString()} Local Businesses`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-20">
        <h1 tabIndex={0} className="text-[4.875rem] font-black text-white mb-6 tracking-tighter leading-none">
          LocalPulse
        </h1>
        <div className="home-hero mt-2 flex justify-center">
          <div className="card">
            <div className="content">
              <p>
                Connecting you to the heart of your community. Discover local gems, exclusive deals, and stay updated with what's happening around the corner.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <div
            className="relative inline-flex overflow-hidden rounded-2xl"
            onMouseEnter={() => setIsStatsHovered(true)}
            onMouseLeave={() => setIsStatsHovered(false)}
          >
            <div className="inline-flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/20 bg-purple-800 px-8 py-5 shadow-lg">
              <span className="text-[2.5rem] font-black uppercase tracking-[0.2em] text-white leading-none">
                {userCountLabel}
              </span>
              <span className="text-[2.5rem] font-black uppercase tracking-[0.2em] text-white leading-none">
                {businessCountLabel}
              </span>
            </div>
            <div
              className="pointer-events-none absolute inset-0 flex h-full w-full justify-center"
              style={{
                transform: isStatsHovered
                  ? 'skewX(-13deg) translateX(140%)'
                  : 'skewX(-13deg) translateX(-140%)',
                transition: 'transform 3200ms ease-in-out'
              }}
            >
              <div className="h-full w-56 bg-white/20"></div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link 
            to="/explore" 
            className="px-8 py-4 bg-purple-800 text-white font-black rounded-2xl transition-colors active:bg-green-600 uppercase tracking-widest text-[1.75rem] leading-none"
          >
            Explore
          </Link>
          <Link 
            to="/feed" 
            className="px-8 py-4 bg-purple-800 text-white font-black rounded-2xl transition-colors active:bg-green-600 uppercase tracking-widest text-[1.75rem] leading-none"
          >
            LocalPulse AI
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white/10 border border-white/20 rounded-[40px] p-10 shadow-2xl">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-purple-800 mb-6">
            <Target size={24} />
          </div>
          <h2 className="text-2xl font-black text-white mb-4 tracking-tight uppercase tracking-widest text-sm">Our Mission</h2>
          <p className="text-2xl leading-relaxed text-white italic font-serif">
            “LocalPulse keeps communities connected to the local businesses that define them”
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-[40px] p-10 shadow-2xl">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-purple-800 mb-6">
            <Eye size={24} />
          </div>
          <h2 className="text-2xl font-black text-white mb-4 tracking-tight uppercase tracking-widest text-sm">Our Vision</h2>
          <p className="text-2xl leading-relaxed text-white italic font-serif">
            "A world where every neighborhood thrives because people discover and support the businesses around the corner."
          </p>
        </div>
      </div>

    </div>
  );
}

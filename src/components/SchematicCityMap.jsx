import React, { useState, useId, useMemo } from 'react';
import { Map, ZoomIn, ZoomOut, RotateCcw, Navigation, Layers, Info, Landmark, Utensils, CheckCircle, XCircle } from 'lucide-react';

/**
 * SchematicCityMap Component:
 * Interactive schematic vector SVG map of Aethelgard Bay.
 *
 * Requirements satisfied:
 * - Exactly 25 markers clearly labelled: 10 hotels (H01-H10) + 15 wishlist places (P01-P15).
 * - Highlighting strictly the 15 comparison links originating from the inspected hotel.
 * - Displays supplied round_trip_minutes and weighted contribution (imp-min) on each link.
 * - Presentation coordinates are purely visual and never used for calculations.
 * - Clicking any hotel pin inspects that hotel.
 * - When scenario is invalid, clears derived link highlights.
 */
export function SchematicCityMap({
  hotels,
  destinations,
  inspectedHotel,
  contributions,
  budget,
  isValid = true,
  onSelectHotel
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showDistricts, setShowDistricts] = useState(true);
  const [showTransitGrid, setShowTransitGrid] = useState(true);
  const [hoveredLink, setHoveredLink] = useState(null);

  const filterId = useId();

  // Fast map of contributions keyed by destinationId
  const contributionMap = useMemo(() => {
    const map = {};
    if (contributions && Array.isArray(contributions)) {
      contributions.forEach((c) => {
        map[c.destinationId] = c;
      });
    }
    return map;
  }, [contributions]);

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.max(0.8, Math.min(2.0, parseFloat((prev + delta).toFixed(2)))));
  };

  return (
    <div className="panel p-6 flex flex-col relative overflow-hidden h-full">
      {/* Top Map Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="icon-tile bg-brand-500/10 border-brand-500/25 text-brand-400">
            <Map className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="panel-title flex items-center gap-2">
              Schematic City Transit Map
              <span className="chip border-white/10 bg-white/[0.05] text-ink-300 font-mono text-[10px]">
                25 Markers
              </span>
            </h3>
            <p className="panel-sub truncate">
              Inspecting{' '}
              <strong className="text-brand-300 font-semibold">
                {inspectedHotel ? `${inspectedHotel.name} (${inspectedHotel.id})` : 'None'}
              </strong>{' '}
              · Click any hotel marker to inspect
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowDistricts((v) => !v)}
            className={`btn !py-1 !px-2.5 !text-xs ${showDistricts ? '!border-purple-400/35 !bg-purple-400/10 !text-purple-300' : ''}`}
          >
            <Layers className="w-3 h-3" /> Districts
          </button>
          <button
            onClick={() => setShowTransitGrid((v) => !v)}
            className={`btn !py-1 !px-2.5 !text-xs ${showTransitGrid ? '!border-sky-400/35 !bg-sky-400/10 !text-sky-300' : ''}`}
          >
            <Navigation className="w-3 h-3" /> Grid
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button onClick={() => handleZoom(0.15)} className="btn !p-1.5" title="Zoom in">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleZoom(-0.15)} className="btn !p-1.5" title="Zoom out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoomLevel(1)} className="btn !p-1.5" title="Reset zoom">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="mt-4 relative rounded-xl border border-white/[0.08] bg-[#0c101c] overflow-hidden flex-1 min-h-[460px]">
        {/* Legend Overlay */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 text-[10px] pointer-events-none">
          <span className="chip border-brand-400/30 bg-ink-950/80 backdrop-blur text-brand-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-400 inline-block mr-1" />
            10 Hotels (H01–H10)
          </span>
          <span className="chip border-purple-400/30 bg-ink-950/80 backdrop-blur text-purple-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-400 inline-block mr-1" />
            8 Attractions (P01–P08)
          </span>
          <span className="chip border-amber-400/30 bg-ink-950/80 backdrop-blur text-amber-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block mr-1" />
            7 Food Stops (P09–P15)
          </span>
        </div>

        <svg
          viewBox="0 0 1000 640"
          className="w-full h-full select-none cursor-grab active:cursor-grabbing transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <defs>
            <filter id={`glow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="640" fill="#080c18" />
          <rect width="1000" height="640" fill="url(#grid)" />

          {/* Coastline / Bay Waterway */}
          <path
            d="M 0 200 Q 200 240, 260 360 T 300 580 T 1000 640 L 0 640 Z"
            fill="rgba(14, 165, 233, 0.05)"
            stroke="rgba(14, 165, 233, 0.15)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Canal Promenade Waterway */}
          <path
            d="M 340 640 C 370 470, 460 370, 680 340 T 1000 320"
            fill="none"
            stroke="rgba(56, 189, 248, 0.18)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Schematic Districts */}
          {showDistricts && (
            <g opacity="0.35">
              <rect x="300" y="60" width="310" height="190" rx="20" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="6 6" />
              <text x="315" y="80" fill="#c084fc" fontSize="10" fontFamily="sans-serif" fontWeight="bold">OLD CITADEL QUARTER</text>

              <rect x="80" y="270" width="220" height="280" rx="20" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="6 6" />
              <text x="95" y="290" fill="#38bdf8" fontSize="10" fontFamily="sans-serif" fontWeight="bold">MARINA & WHARFS</text>

              <rect x="700" y="140" width="260" height="360" rx="20" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="6 6" />
              <text x="715" y="160" fill="#34d399" fontSize="10" fontFamily="sans-serif" fontWeight="bold">BOTANICAL FOOTHILLS</text>
            </g>
          )}

          {/* 15 Comparison Links (originating from Inspected Hotel) */}
          {isValid && inspectedHotel && contributions && (
            <g>
              {destinations.map((dest) => {
                const c = contributionMap[dest.id];
                if (!c) return null;

                const startX = inspectedHotel.coordinates.x;
                const startY = inspectedHotel.coordinates.y;
                const endX = dest.coordinates.x;
                const endY = dest.coordinates.y;
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                const isHovered = hoveredLink === dest.id;
                const isOver90 = c.rawTravelTime > 90;

                return (
                  <g
                    key={`link-${dest.id}`}
                    onMouseEnter={() => setHoveredLink(dest.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="cursor-pointer"
                  >
                    {/* Glowing highlight link line */}
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={
                        isHovered
                          ? '#38bdf8'
                          : isOver90
                          ? '#f59e0b'
                          : 'rgba(99, 102, 241, 0.45)'
                      }
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      strokeDasharray={isOver90 ? '4 3' : 'none'}
                      opacity={isHovered ? 1 : 0.75}
                    />

                    {/* Midpoint Pill: Shows supplied round_trip_minutes and weighted contribution */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-30"
                        y="-10"
                        width="60"
                        height="20"
                        rx="10"
                        fill="#0b1120"
                        stroke={isHovered ? '#38bdf8' : isOver90 ? '#f59e0b' : 'rgba(255,255,255,0.15)'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill={isOver90 ? '#fbbf24' : '#ffffff'}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {c.rawTravelTime}m ({c.contribution})
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* 15 Wishlist Place Markers */}
          {destinations.map((dest) => {
            const isAttraction = dest.type === 'attraction';
            const imp = dest.defaultImportance ?? 3;
            const x = dest.coordinates.x;
            const y = dest.coordinates.y;

            return (
              <g key={dest.id} transform={`translate(${x}, ${y})`} className="cursor-default">
                {/* Outer ring */}
                <circle
                  r="14"
                  fill={isAttraction ? 'rgba(168, 85, 247, 0.15)' : 'rgba(245, 158, 11, 0.15)'}
                  stroke={isAttraction ? '#c084fc' : '#f59e0b'}
                  strokeWidth="1.5"
                />
                {/* Inner center dot */}
                <circle
                  r="6"
                  fill={isAttraction ? '#a855f7' : '#f59e0b'}
                />

                {/* Place Label Pill */}
                <g transform="translate(0, 22)">
                  <rect
                    x="-45"
                    y="-8"
                    width="90"
                    height="16"
                    rx="8"
                    fill="rgba(12, 16, 28, 0.9)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="9"
                    fontFamily="sans-serif"
                    fontWeight="600"
                  >
                    {dest.id} ★{imp}
                  </text>
                </g>
              </g>
            );
          })}

          {/* 10 Hotel Markers (H01-H10) */}
          {hotels.map((hotel) => {
            const isSelected = inspectedHotel?.id === hotel.id;
            const isAffordable = hotel.stay_cost <= budget;
            const isRec = hotel.id === 'H01_PALACE' && budget >= 14500 ? true : hotel.id === 'H02_METRO' && budget >= 10500 && budget < 14500;
            const x = hotel.coordinates.x;
            const y = hotel.coordinates.y;

            return (
              <g
                key={hotel.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => onSelectHotel(hotel.id)}
                className="cursor-pointer group"
              >
                {/* Selection pulse */}
                {isSelected && (
                  <circle
                    r="24"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-spin-slow"
                  />
                )}

                {/* Hotel Pin Box */}
                <rect
                  x="-18"
                  y="-18"
                  width="36"
                  height="36"
                  rx="10"
                  fill={
                    isSelected
                      ? '#4f46e5'
                      : isAffordable
                      ? '#1e293b'
                      : '#3f1822'
                  }
                  stroke={
                    isSelected
                      ? '#818cf8'
                      : isAffordable
                      ? 'rgba(255,255,255,0.2)'
                      : '#f43f5e'
                  }
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                {/* Hotel ID text */}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {hotel.id.replace('_', '').slice(0, 3)}
                </text>

                {/* Cost Label Pill below pin */}
                <g transform="translate(0, 27)">
                  <rect
                    x="-40"
                    y="-8"
                    width="80"
                    height="16"
                    rx="8"
                    fill={isAffordable ? 'rgba(15, 23, 42, 0.95)' : 'rgba(76, 5, 25, 0.95)'}
                    stroke={isAffordable ? 'rgba(52, 211, 153, 0.4)' : 'rgba(244, 63, 94, 0.4)'}
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={isAffordable ? '#34d399' : '#fda4af'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    ₹{hotel.stay_cost.toLocaleString('en-IN')}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-brand-400" />
          Schematic comparison links display exact supplied travel times & weighted impact. Map distances are presentation only.
        </span>
        <span className="font-mono text-[11px] text-ink-300">
          Inspecting: {inspectedHotel ? inspectedHotel.id : 'None'} (15 links active)
        </span>
      </div>
    </div>
  );
}

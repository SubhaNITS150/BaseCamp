import React, { useState, useMemo } from 'react';
import { Table, ArrowUpDown, Search, Filter, Clock, Scale, Utensils, Landmark } from 'lucide-react';

/**
 * ContributionTable Component:
 * Tabular analytical breakdown of travel times, priority weights, and weighted contributions
 * from the currently inspected hotel to all 15 destinations.
 * SPR26_D2_P03 Specification compliant.
 */
export function ContributionTable({ hotel, contributions }) {
  const [sortField, setSortField] = useState('contribution');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const processedData = useMemo(() => {
    return [...contributions]
      .filter((item) => {
        const matchesType = typeFilter === 'All' || item.type === typeFilter;
        const matchesQuery =
          item.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.destinationId.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesQuery;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [contributions, sortField, sortOrder, typeFilter, searchQuery]);

  const totalContribution = useMemo(() => {
    return contributions.reduce((acc, c) => acc + c.contribution, 0);
  }, [contributions]);

  const totalRawTime = useMemo(() => {
    return contributions.reduce((acc, c) => acc + c.rawTravelTime, 0);
  }, [contributions]);

  const totalImportance = useMemo(() => {
    return contributions.reduce((acc, c) => acc + c.importance, 0);
  }, [contributions]);

  const SortTh = ({ field, children, align = 'left', className = '' }) => {
    const active = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        aria-sort={active ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={`py-3 px-3 font-semibold cursor-pointer select-none transition hover:text-white ${
          active ? 'text-white' : ''
        } ${align === 'right' ? 'text-right' : ''} ${className}`}
      >
        <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
          {children}
          <ArrowUpDown className={`w-3 h-3 ${active ? 'text-brand-400' : 'text-ink-500'}`} />
        </span>
      </th>
    );
  };

  return (
    <div className="panel p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="icon-tile bg-brand-500/10 border-brand-500/25 text-brand-400">
            <Table className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="panel-title">15 Wishlist Route Contributions</h3>
            <p className="panel-sub truncate">
              {hotel ? <span className="text-brand-400 font-medium">{hotel.name}</span> : 'No hotel selected'}
              <span className="text-ink-500"> · </span>
              <span className="font-mono text-xs">contribution(h, p) = importance(p) × round_trip_minutes(h, p)</span>
            </p>
          </div>
        </div>

        {/* Search & filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs">
            {['All', 'attraction', 'food'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-2.5 py-1 rounded-lg border text-xs capitalize transition ${
                  typeFilter === type
                    ? 'border-brand-400 bg-brand-500/20 text-white font-semibold'
                    : 'border-white/10 bg-white/[0.03] text-ink-300 hover:bg-white/[0.08]'
                }`}
              >
                {type === 'attraction' ? 'Attractions' : type === 'food' ? 'Food Stops' : 'All 15'}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field !pl-8 !pr-3 !py-1 text-xs w-44"
            />
          </div>
        </div>
      </div>

      {/* Analytical Table */}
      <div className="mt-4 overflow-x-auto -mx-6 px-6">
        <table className="w-full text-xs text-ink-200">
          <thead>
            <tr className="border-b border-white/[0.08] text-ink-400 font-mono text-[11px]">
              <SortTh field="destinationId" className="w-20">ID</SortTh>
              <SortTh field="destinationName">Wishlist Destination</SortTh>
              <SortTh field="type">Type</SortTh>
              <SortTh field="importance" align="right">Importance (1–5)</SortTh>
              <SortTh field="rawTravelTime" align="right">Round-Trip (min)</SortTh>
              <SortTh field="contribution" align="right">Contribution (imp-min)</SortTh>
              <SortTh field="sharePercent" align="right">Share %</SortTh>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {processedData.map((item) => {
              const isOver90 = item.rawTravelTime > 90;
              return (
                <tr key={item.destinationId} className="hover:bg-white/[0.02] transition">
                  <td className="py-2.5 px-3 font-mono text-ink-400 font-semibold">{item.destinationId}</td>
                  <td className="py-2.5 px-3 font-medium text-white flex items-center gap-2">
                    {item.type === 'attraction' ? (
                      <Landmark className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                    ) : (
                      <Utensils className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    )}
                    <span>{item.destinationName}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`chip text-[10px] !py-0 !px-1.5 border capitalize ${
                        item.type === 'attraction'
                          ? 'border-purple-400/25 bg-purple-400/10 text-purple-300'
                          : 'border-amber-400/25 bg-amber-400/10 text-amber-300'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-display font-bold text-white num">
                    {item.importance}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono num">
                    <span className={isOver90 ? 'text-amber-300 font-bold' : 'text-ink-200'}>
                      {item.rawTravelTime} min
                    </span>
                    {isOver90 && (
                      <span className="ml-1 text-[9px] text-amber-400 font-semibold">&gt;90</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-display font-extrabold text-white num">
                    {item.contribution}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-ink-400 num">
                    {item.sharePercent}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-white/[0.1] font-semibold text-white bg-white/[0.02]">
              <td className="py-3 px-3 font-mono" colSpan={3}>
                Total Weighted Travel Total:
              </td>
              <td className="py-3 px-3 text-right font-display font-bold num text-brand-300">
                {totalImportance}
              </td>
              <td className="py-3 px-3 text-right font-mono num text-ink-300">
                {totalRawTime} min
              </td>
              <td className="py-3 px-3 text-right font-display font-extrabold text-emerald-300 text-sm num">
                {totalContribution.toLocaleString()} imp-min
              </td>
              <td className="py-3 px-3 text-right font-mono text-ink-300 num">
                100.0%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

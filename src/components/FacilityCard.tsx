'use client';

import React from 'react';

export interface Facility {
  category: string;
  name: string;
  description: string;
  bgGradient: string;
  imageUrl: string;
  icon: string;
}

export const FACILITIES: Facility[] = [
  {
    category: 'PLUMBING',
    name: 'Plumbing & Water Supply',
    description: 'Pipelines, water meters, bathroom fixtures, pump room & tank leakages.',
    bgGradient: 'from-blue-600 to-cyan-500',
    imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80',
    icon: '🚰',
  },
  {
    category: 'ELECTRICAL',
    name: 'Electrical & Power',
    description: 'Backup generators, corridor lights, transformer yards & meter rooms.',
    bgGradient: 'from-amber-500 to-orange-600',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    icon: '⚡',
  },
  {
    category: 'ELEVATOR',
    name: 'Passenger & Service Lifts',
    description: 'Elevator maintenance, ARD emergency rescue devices & cabin lighting.',
    bgGradient: 'from-indigo-600 to-purple-600',
    imageUrl: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=600&auto=format&fit=crop&q=80',
    icon: '🛗',
  },
  {
    category: 'SECURITY',
    name: 'Security & Surveillance',
    description: 'Main boom barriers, visitor intercoms, perimeter fencing & 24/7 CCTV.',
    bgGradient: 'from-emerald-600 to-teal-700',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80',
    icon: '🛡️',
  },
  {
    category: 'CLEANING',
    name: 'Housekeeping & Sanitation',
    description: 'Daily corridor mopping, garbage chutes, STP plant & pest control.',
    bgGradient: 'from-teal-500 to-emerald-600',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    icon: '🧹',
  },
  {
    category: 'CARPENTRY',
    name: 'Carpentry & Common Fixtures',
    description: 'Fire doors, clubhouse wooden fixtures, window locks & notice frames.',
    bgGradient: 'from-amber-700 to-yellow-600',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&auto=format&fit=crop&q=80',
    icon: '🪚',
  },
];

interface FacilityCardProps {
  facility: Facility;
  onSelect?: (category: string) => void;
}

export default function FacilityCard({ facility, onSelect }: FacilityCardProps) {
  return (
    <div
      onClick={() => onSelect?.(facility.category)}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Background Image Banner */}
      <div className="relative h-28 w-full overflow-hidden">
        <img
          src={facility.imageUrl}
          alt={facility.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
        <div className="absolute top-2.5 left-3 px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-xs font-extrabold text-slate-900 dark:text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
          <span>{facility.icon}</span>
          <span className="text-[10px] uppercase tracking-wider">{facility.category}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            {facility.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {facility.description}
          </p>
        </div>

        <div className="pt-2 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
          <span>Raise ticket in this category ➔</span>
        </div>
      </div>
    </div>
  );
}

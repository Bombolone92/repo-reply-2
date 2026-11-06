import React from 'react';
import type { Character } from '../types/cine3d';

interface CastPanelProps {
  characters: Character[];
  aspectRatio: string;
}

export default function CastPanel({ characters, aspectRatio }: CastPanelProps) {
  if (!characters.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {characters.map(char => (
        <div
          key={char.id}
          className="bg-[#121218] border border-neutral-800 rounded-2xl overflow-hidden shadow-lg transition duration-300 hover:border-amber-500/40 hover:-translate-y-1 flex flex-col"
        >
          {/* Character 3D portrait */}
          <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden">
            <img
              src={char.reference_image_url}
              alt={char.name}
              className="w-full h-full object-cover transition duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-3 left-4 right-4">
              <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold backdrop-blur-sm">
                {char.role}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-heading font-semibold text-white tracking-wide">
                {char.name}
              </h3>
              <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                {char.personality}
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-800/80">
              <details className="text-[11px] text-neutral-500 cursor-pointer">
                <summary className="hover:text-amber-400 font-mono transition">
                  Specifiche 3D Pixar (English)
                </summary>
                <p className="mt-1.5 text-neutral-400 text-[10px] leading-relaxed font-mono bg-[#161622] p-2 rounded-lg border border-neutral-800">
                  {char.appearance}
                </p>
              </details>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CABLE_TIER_SPECS, CABLE_TIER_ORDER } from '../utils/standardsData';
import { ShieldCheck, Info, Zap, AlertTriangle, Layers, Cpu } from 'lucide-react';

export const StandardsMatrixView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Universal USB, USB4 & Thunderbolt Specifications Reference
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          The USB Type-C connector is merely a physical shape. The underlying protocols—USB 2.0, USB 3.2, DisplayPort Alt Mode, USB4, and Thunderbolt 4/5—govern actual data speed, video capability, and maximum copper lengths.
        </p>
      </div>

      {/* Grid of Standard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CABLE_TIER_ORDER.map((tierKey) => {
          const tier = CABLE_TIER_SPECS[tierKey];
          return (
            <div
              key={tierKey}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
                    {tier.standardRating}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {tier.marketingName}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Official Spec: {tier.officialName}
                  </div>
                </div>

                <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-mono text-xs font-semibold shrink-0">
                  {tier.standardRating}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {tier.description}
              </p>

              {/* Specs List */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">Max Passive Run</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    ≤ {tier.maxPassiveLengthMeters}m (~{(tier.maxPassiveLengthMeters * 3.28).toFixed(1)}ft)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Max Active Run</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    ≤ {tier.maxActiveLengthMeters}m (~{(tier.maxActiveLengthMeters * 3.28).toFixed(1)}ft)
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 text-[10px] block">Video Architecture</span>
                  <span className="text-slate-800 dark:text-slate-200 font-sans text-xs">
                    {tier.videoTunnelingSupport}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Common Pitfalls Guide */}
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Critical Buyer Traps & Clarifications
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-950 dark:text-amber-300 leading-relaxed">
          <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
            <strong>The "White Charge Cable" Trap:</strong> The USB-C cables bundled with MacBooks, iPads, and smartphones are almost exclusively USB 2.0 (480 Mbps). They do not contain the high-speed differential wiring pairs needed for DisplayPort Alt Mode video.
          </div>
          <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
            <strong>Active TB3 vs Thunderbolt 4:</strong> Older active Thunderbolt 3 cables only work at 40 Gbps on Thunderbolt ports; when plugged into generic USB-C ports, they drop to slow USB 2.0 speeds. Thunderbolt 4 mandates universal backward compatibility with USB 3.2 and DisplayPort.
          </div>
          <div className="p-3 bg-white/80 dark:bg-slate-900/60 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
            <strong>120 Gbps Asymmetric Link & Physical Ceiling:</strong> Thunderbolt 5 provides 80 Gbps symmetric (~76 Gbps usable payload), and dynamically reconfigures to a sustained 3-lane downstream / 1-lane upstream hardware mode (~114 Gbps usable payload). No single cable can exceed 114 Gbps; setups beyond this must enable DSC or split displays across independent host ports.
          </div>
        </div>
      </div>
    </div>
  );
};

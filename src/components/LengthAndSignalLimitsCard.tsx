/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CABLE_TIER_SPECS, CABLE_TIER_ORDER } from '../utils/standardsData';
import { CableTierId } from '../types/calculator';
import { Layers, HelpCircle, ArrowRight } from 'lucide-react';

interface LengthAndSignalLimitsCardProps {
  currentTierId: CableTierId;
}

export const LengthAndSignalLimitsCard: React.FC<LengthAndSignalLimitsCardProps> = ({ currentTierId }) => {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Length & High-Speed Signal Integrity Reference
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official USB-IF & Intel physical length limits for passive vs active architectures
            </p>
          </div>
        </div>
      </div>

      {/* Standards Comparison Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 font-semibold text-slate-600 dark:text-slate-400">
              <th className="py-2.5 px-3">Interconnect Tier</th>
              <th className="py-2.5 px-3 font-mono">Max Bandwidth</th>
              <th className="py-2.5 px-3 font-mono">Max Passive Length</th>
              <th className="py-2.5 px-3 font-mono">Max Active Length</th>
              <th className="py-2.5 px-3">Video Capability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {CABLE_TIER_ORDER.map((tierKey) => {
              const spec = CABLE_TIER_SPECS[tierKey];
              const isSelected = tierKey === currentTierId;
              return (
                <tr
                  key={tierKey}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-950 dark:text-cyan-100 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex items-center gap-1.5">
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                      )}
                      <span>{spec.officialName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">{spec.standardRating}</td>
                  <td className="py-2.5 px-3">
                    ≤ {spec.maxPassiveLengthMeters}m (~{(spec.maxPassiveLengthMeters * 3.28).toFixed(1)}ft)
                  </td>
                  <td className="py-2.5 px-3">
                    ≤ {spec.maxActiveLengthMeters}m (~{(spec.maxActiveLengthMeters * 3.28).toFixed(1)}ft)
                  </td>
                  <td className="py-2.5 px-3 font-sans text-[11px] truncate max-w-xs" title={spec.videoTunnelingSupport}>
                    {spec.supportsVideo ? spec.videoTunnelingSupport : 'No Video (Charge Only)'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Physics / Signal Transmission Explainer */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Why are 40Gbps & 80Gbps passive cables limited to 0.8m–1.0m?</strong>{' '}
            High-frequency signals (up to 20 GHz per differential pair) experience severe capacitive attenuation and crosstalk across long copper traces. Passive cables simply conduct the analog waveform. At lengths &gt;0.8m, signals degrade beyond VESA/USB-IF eye-diagram compliance, requiring an <em>Active Retimer IC</em> chip inside the connector plug to de-jitter, amplify, and re-clock the data packets.
          </p>
        </div>
      </div>
    </div>
  );
};

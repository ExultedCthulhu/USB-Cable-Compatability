/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PowerConfig, PowerDeliveryPreset } from '../types/calculator';
import { POWER_PRESETS } from '../utils/standardsData';
import { Zap, ShieldCheck, AlertCircle } from 'lucide-react';

interface PowerDeliveryPanelProps {
  config: PowerConfig;
  onChange: (updated: Partial<PowerConfig>) => void;
}

export const PowerDeliveryPanel: React.FC<PowerDeliveryPanelProps> = ({ config, onChange }) => {
  const currentWatts =
    config.pdPreset === 'custom'
      ? config.customWattage
      : POWER_PRESETS[config.pdPreset].watts;

  const requiresEMarker = currentWatts > 60;
  const isEpr = currentWatts > 100;

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Power Delivery (USB-PD)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Charging wattage, e-Marker chip, and EPR requirements
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400">
            {currentWatts}W
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {isEpr ? 'EPR (USB-PD 3.1)' : requiresEMarker ? 'SPR 5A e-Marked' : 'Standard 3A'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Power Delivery Preset Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Host Laptop / Device Charging Wattage
          </label>
          <select
            value={config.pdPreset}
            onChange={(e) =>
              onChange({
                pdPreset: e.target.value as PowerDeliveryPreset,
                customWattage:
                  e.target.value === 'custom'
                    ? config.customWattage || 65
                    : POWER_PRESETS[e.target.value as PowerDeliveryPreset].watts,
              })
            }
            className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {Object.entries(POWER_PRESETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          {/* Custom Wattage Input */}
          {config.pdPreset === 'custom' && (
            <div className="mt-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
              <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Custom Charging Wattage (Watts)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min="5"
                  max="240"
                  step="5"
                  value={config.customWattage}
                  onChange={(e) =>
                    onChange({ customWattage: parseInt(e.target.value, 10) || 65 })
                  }
                  className="w-28 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
                />
                <span className="text-xs text-slate-500 font-mono">Watts</span>
              </div>
            </div>
          )}
        </div>

        {/* Technical Explainer Callout */}
        <div
          className={`p-3 rounded-lg border text-xs ${
            isEpr
              ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-200'
              : requiresEMarker
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
            {isEpr ? (
              <>
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Extended Power Range (EPR) 240W Required</span>
              </>
            ) : requiresEMarker ? (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>5A e-Marker Chip Required</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Standard 3A Cable (Up to 60W)</span>
              </>
            )}
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            {isEpr
              ? 'Wattages above 100W (e.g. 140W for 16" MacBook Pro or up to 240W for gaming laptops) operate at 28V–48V under USB-PD 3.1. Requires specialized EPR-certified e-Marker cables with arc-suppression capacitors.'
              : requiresEMarker
              ? 'Wattages between 61W and 100W require 5A current at 20V. A standard USB-C cable will cap charging at 60W (3A) unless it contains an electronic ID marker (e-Marker) chip in the plug.'
              : 'Wattages up to 60W (20V @ 3A) work with all standard USB-C cables without special e-Marker microchips.'}
          </p>
        </div>
      </div>
    </div>
  );
};

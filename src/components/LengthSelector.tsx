/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CableTierSpec } from '../types/calculator';
import { Ruler, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface LengthSelectorProps {
  desiredLengthMeters: number;
  onChangeLength: (length: number) => void;
  recommendedTier: CableTierSpec;
}

export const LengthSelector: React.FC<LengthSelectorProps> = ({
  desiredLengthMeters,
  onChangeLength,
  recommendedTier,
}) => {
  const isPassiveOk = desiredLengthMeters <= recommendedTier.maxPassiveLengthMeters;
  const isActiveOk = desiredLengthMeters <= recommendedTier.maxActiveLengthMeters;
  const isExceeded = !isActiveOk;

  const quickLengths = [0.5, 0.8, 1.0, 1.5, 2.0, 3.0];

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Desired Cable Run & Reach
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Check physical length constraints and active retimer requirements
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
            {desiredLengthMeters} meters
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            ~{(desiredLengthMeters * 3.28084).toFixed(1)} feet
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Slider & Quick Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Target Distance
            </span>
            <div className="flex items-center gap-1">
              {quickLengths.map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => onChangeLength(len)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                    desiredLengthMeters === len
                      ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {len}m
                </button>
              ))}
            </div>
          </div>

          <input
            type="range"
            min="0.3"
            max="4.0"
            step="0.1"
            value={desiredLengthMeters}
            onChange={(e) => onChangeLength(parseFloat(e.target.value) || 1.0)}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
          />

          {/* Scale Indicators */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>0.3m (Short dock)</span>
            <span>1.0m (Standard desk)</span>
            <span>2.0m (Under desk)</span>
            <span>3.0m (Long run)</span>
            <span>4.0m</span>
          </div>
        </div>

        {/* Spec Comparison Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-600 dark:text-slate-400">Spec Limits for {recommendedTier.standardRating}:</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">
              Passive ≤ {recommendedTier.maxPassiveLengthMeters}m · Active ≤ {recommendedTier.maxActiveLengthMeters}m
            </span>
          </div>

          {/* Status Message */}
          <div className="flex items-start gap-2 text-xs">
            {isPassiveOk ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300">
                  <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">Passive Cable Supported: </strong>
                  At {desiredLengthMeters}m, affordable standard passive copper cables will deliver full {recommendedTier.standardRating} speed without active repeater chips.
                </span>
              </>
            ) : !isExceeded ? (
              <>
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-slate-300">
                  <strong className="text-amber-700 dark:text-amber-400 font-semibold">Active Cable Required: </strong>
                  Exceeds passive limit ({recommendedTier.maxPassiveLengthMeters}m). You must purchase an ACTIVE cable with retimer chipsets (e.g. Apple Thunderbolt Pro or certified active USB4) to avoid disconnects.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="text-rose-700 dark:text-rose-400">
                  <strong>Exceeds Maximum Physical Spec: </strong>
                  {desiredLengthMeters}m is beyond the {recommendedTier.maxActiveLengthMeters}m maximum copper specification for {recommendedTier.standardRating}. High-frequency signal attenuation will cause dropouts unless using fiber-optic cables.
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CableRecommendation } from '../types/calculator';
import {
  CheckCircle2,
  AlertTriangle,
  Zap,
  Gauge,
  Ruler,
  ShieldCheck,
  Check,
  Tag,
  ArrowRight,
} from 'lucide-react';

interface CableRecommendationCardProps {
  recommendation: CableRecommendation;
  desiredLengthMeters: number;
}

export const CableRecommendationCard: React.FC<CableRecommendationCardProps> = ({
  recommendation,
  desiredLengthMeters,
}) => {
  const {
    recommendedTier,
    powerRequirements,
    bandwidthHeadroomPercent,
    isBandwidthSaturated,
    isImpossibleConfig,
    isAsymmetricLinkActive,
    actionableSuggestions,
    lengthWarning,
    shoppingChecklist,
    featuresRequiringThunderbolt,
  } = recommendation;

  return (
    <div
      className={`bg-white dark:bg-[#111827] border-2 ${
        isImpossibleConfig
          ? 'border-rose-500/80 dark:border-rose-500/70'
          : 'border-cyan-500/80 dark:border-cyan-500/60'
      } rounded-xl p-5 sm:p-6 shadow-sm transition-colors relative overflow-hidden`}
    >
      {/* Laser Accent Bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isImpossibleConfig
            ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600'
            : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500'
        }`}
      />

      {/* Main Recommendation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-xs uppercase tracking-wider font-mono font-bold ${
                isImpossibleConfig
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-cyan-600 dark:text-cyan-400'
              }`}
            >
              {isImpossibleConfig
                ? 'Physical Limit Exceeded · Single-Cable Hard Ceiling'
                : 'Optimal Cable Specification'}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {isImpossibleConfig
                ? 'Exceeds 120 Gbps Asymmetric Limit'
                : 'USB-IF / Thunderbolt Certified'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {recommendedTier.marketingName}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600 dark:text-slate-400">
            <span>Official Standard: {recommendedTier.officialName}</span>
            <span aria-hidden="true">·</span>
            <span>Video: {recommendedTier.videoTunnelingSupport}</span>
          </div>
        </div>

        {/* Badge / Rating Spec Box */}
        <div
          className={`flex items-center gap-3 ${
            isImpossibleConfig
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
              : 'bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800'
          } border px-4 py-3 rounded-lg shrink-0`}
        >
          <div className="text-center">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Speed Rating
            </div>
            <div
              className={`text-lg font-mono font-bold ${
                isImpossibleConfig
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-cyan-600 dark:text-cyan-400'
              }`}
            >
              {recommendedTier.standardRating}
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Power Delivery
            </div>
            <div className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400">
              {powerRequirements.targetWatts}W {powerRequirements.isEpr ? 'EPR' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetric Link Active Banner */}
      {!isImpossibleConfig && isAsymmetricLinkActive && (
        <div className="mt-4 p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">120 Gbps Asymmetric Link Active:</span> Hardware dynamically reconfigures to a sustained 3-lane downstream / 1-lane upstream mode delivering ~114 Gbps usable video/data payload for heavy multi-monitor setups.
          </div>
        </div>
      )}

      {/* IMPOSSIBLE CONFIGURATION: Alert Banner & Actionable Suggestions */}
      {isImpossibleConfig ? (
        <div className="my-5 space-y-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 rounded-xl text-rose-950 dark:text-rose-100 flex items-start gap-3.5 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-bold tracking-tight text-rose-900 dark:text-rose-200">
                Single-Cable Link Saturation Warning
              </div>
              <p className="text-xs leading-relaxed text-rose-800 dark:text-rose-300">
                This display configuration requires {recommendation.bandwidthBreakdown.totalVideoGbps} Gbps of {!recommendation.bandwidthBreakdown.dscApplied ? 'uncompressed ' : ''}bandwidth, which exceeds the absolute physical limit of a single USB-C / Thunderbolt 5 cable (120 Gbps asymmetric limit).
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-300 dark:border-amber-800/80">
            <div className="text-xs font-bold text-amber-950 dark:text-amber-200 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Actionable Recommendations to Reduce Required Bandwidth:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-amber-950 dark:text-amber-100">
              {actionableSuggestions?.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-amber-200 dark:border-amber-900/50"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 font-bold" />
                  <span className="leading-snug">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Primary KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
            {recommendation.bandwidthBreakdown.isDpAltMode2LaneSplit ? (
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="font-semibold">DP Alt Mode Split</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 font-semibold">
                    2+2 Lanes
                  </span>
                </div>
                <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center font-mono text-xs my-1.5 gap-y-1.5 gap-x-1">
                  <span className="text-slate-500 dark:text-slate-400 leading-tight">
                    Video<br />(DP 1.4):
                  </span>
                  <span className="text-right font-bold text-slate-900 dark:text-white tabular-nums">
                    {recommendation.bandwidthBreakdown.totalVideoGbps}
                  </span>
                  <span className="text-center text-slate-400 font-normal select-none px-0.5">
                    /
                  </span>
                  <span className="text-left text-[10px] text-slate-400 font-normal tabular-nums whitespace-nowrap">
                    12.96 Gbps
                  </span>

                  <span className="text-slate-500 dark:text-slate-400 leading-tight">
                    Data<br />(USB 3.x):
                  </span>
                  <span className="text-right font-bold text-slate-900 dark:text-white tabular-nums">
                    {recommendation.bandwidthBreakdown.totalDataGbps}
                  </span>
                  <span className="text-center text-slate-400 font-normal select-none px-0.5">
                    /
                  </span>
                  <span className="text-left text-[10px] text-slate-400 font-normal tabular-nums whitespace-nowrap">
                    {recommendedTier.standardRating}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono pt-1 border-t border-slate-200 dark:border-slate-800 truncate">
                  {bandwidthHeadroomPercent}% headroom · Separate physical pairs
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="font-semibold">Unified Tunneled Bandwidth</span>
                </div>
                <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {recommendation.bandwidthBreakdown.totalRequiredGbps}{' '}
                  <span className="text-xs font-normal text-slate-500">Gbps</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  {bandwidthHeadroomPercent}% headroom on {recommendedTier.maxNetBandwidthGbps}G payload
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold">Power Spec & e-Marker</span>
              </div>
              <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {powerRequirements.targetWatts}W{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({powerRequirements.targetVolts}V/{powerRequirements.targetAmps}A)
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                {powerRequirements.isEpr
                  ? 'Requires EPR 240W 48V Chip'
                  : powerRequirements.requiresEMarker
                  ? 'Requires 5A e-Marker Chip'
                  : 'Standard 3A cable'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Ruler className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold">Length & Cable Physics</span>
              </div>
              <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {desiredLengthMeters <= recommendedTier.maxPassiveLengthMeters ? 'Passive' : 'Active'}{' '}
                <span className="text-xs font-normal text-slate-500">
                  (at {desiredLengthMeters}m)
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Passive max: {recommendedTier.maxPassiveLengthMeters}m · Active: {recommendedTier.maxActiveLengthMeters}m
              </div>
            </div>
          </div>

          {/* Warnings & Alerts */}
          {lengthWarning && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>{lengthWarning}</span>
            </div>
          )}

          {featuresRequiringThunderbolt.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-lg text-xs text-blue-900 dark:text-blue-200">
              <div className="font-semibold mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Why Thunderbolt 4 / USB4 is Required for this Setup:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 pl-1">
                {featuresRequiringThunderbolt.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Shopping & Verification Checklist */}
          {shoppingChecklist.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Cable Buyer's Verification Checklist (Avoid Counterfeits & Charge-Only Cables):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {shoppingChecklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
                <div className="flex items-start gap-2 text-rose-700 dark:text-rose-400 font-medium">
                  <span className="text-rose-600 dark:text-rose-400 font-bold">✕</span>
                  <span>Avoid: Standard phone/MacBook white charge cables (they only do 480 Mbps & NO video!)</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

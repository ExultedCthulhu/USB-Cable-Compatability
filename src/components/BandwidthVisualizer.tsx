/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CableRecommendation } from '../types/calculator';
import { Activity, Info } from 'lucide-react';

interface BandwidthVisualizerProps {
  recommendation: CableRecommendation;
}

export const BandwidthVisualizer: React.FC<BandwidthVisualizerProps> = ({ recommendation }) => {
  const {
    bandwidthBreakdown,
    recommendedTier,
    isBandwidthSaturated,
    isImpossibleConfig,
    isAsymmetricLinkActive,
    bandwidthHeadroomPercent,
  } = recommendation;

  const totalCapacity = isImpossibleConfig || isAsymmetricLinkActive ? 114.0 : recommendedTier.maxNetBandwidthGbps;
  const totalRequired = bandwidthBreakdown.totalRequiredGbps;

  const isSplitMode = bandwidthBreakdown.isDpAltMode2LaneSplit;

  // Split Mode parameters
  const videoCapacity = 12.96;
  const videoUsed = bandwidthBreakdown.totalVideoGbps;
  const videoPct = Math.min(100, (videoUsed / videoCapacity) * 100);
  const videoHeadroomPct = Math.max(0, 100 - videoPct);

  const dataCapacity = totalCapacity; // e.g. 8.5 Gbps payload on 10G cable
  const dataUsed = Math.min(
    dataCapacity,
    bandwidthBreakdown.totalDataGbps + bandwidthBreakdown.protocolOverheadGbps
  );
  const dataUsedPct = Math.min(100, (dataUsed / dataCapacity) * 100);
  const dataHeadroomPct = Math.max(0, 100 - dataUsedPct);

  // Proportional percentages within the data channel (for split mode)
  const splitStoragePct = dataUsed > 0 ? (bandwidthBreakdown.storageGbps / dataUsed) * dataUsedPct : 0;
  const splitEthernetPct = dataUsed > 0 ? (bandwidthBreakdown.ethernetGbps / dataUsed) * dataUsedPct : 0;
  const splitWebcamPct = dataUsed > 0 ? (bandwidthBreakdown.webcamGbps / dataUsed) * dataUsedPct : 0;
  const splitOtherPct =
    dataUsed > 0
      ? ((bandwidthBreakdown.kbMouseGbps +
          bandwidthBreakdown.customPeripheralsGbps +
          bandwidthBreakdown.protocolOverheadGbps) /
          dataUsed) *
        dataUsedPct
      : 0;

  // Unified Mode parameters (USB4 / Thunderbolt tunneling)
  const unifiedVideoPct = Math.min(100, (bandwidthBreakdown.totalVideoGbps / totalCapacity) * 100);
  const unifiedStoragePct = Math.min(100, (bandwidthBreakdown.storageGbps / totalCapacity) * 100);
  const unifiedEthernetPct = Math.min(100, (bandwidthBreakdown.ethernetGbps / totalCapacity) * 100);
  const unifiedWebcamPct = Math.min(100, (bandwidthBreakdown.webcamGbps / totalCapacity) * 100);
  const unifiedOtherPct = Math.min(
    100,
    ((bandwidthBreakdown.kbMouseGbps +
      bandwidthBreakdown.customPeripheralsGbps +
      bandwidthBreakdown.protocolOverheadGbps) /
      totalCapacity) *
      100
  );

  const usedPct = Math.min(100, (totalRequired / totalCapacity) * 100);
  const headroomPct = Math.max(0, 100 - usedPct);

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isSplitMode
                ? 'DP Alt Mode Physical Lane-Split Breakdown'
                : 'High-Speed Interconnect Pipe Breakdown'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isSplitMode
                ? 'Dedicated DP 1.4 lanes (video) + USB 3.x lanes (data)'
                : isImpossibleConfig
                ? 'Single-cable physical limit exceeded (max 114 Gbps usable payload)'
                : isAsymmetricLinkActive
                ? '120 Gbps Asymmetric Link mode (sustained 3 TX / 1 RX lanes)'
                : 'Unified bandwidth across high-speed interconnect'}
            </p>
          </div>
        </div>

        {isImpossibleConfig ? (
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
              {totalRequired} Gbps required
            </div>
            <div className="text-[10px] text-rose-500 font-mono font-semibold">
              ⚠️ Exceeds 114 Gbps Limit (+{(totalRequired - 114.0).toFixed(1)}G)
            </div>
          </div>
        ) : isSplitMode ? (
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
              Video: {videoUsed}/12.96G · Data: {dataUsed.toFixed(1)}/{dataCapacity}G
            </div>
            <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
              2+2 Physical Lane Split (&gt;22G aggregate)
            </div>
          </div>
        ) : isAsymmetricLinkActive ? (
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
              {totalRequired} / 114 Gbps
            </div>
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
              120 Gbps Asymmetric Link Active ({usedPct.toFixed(1)}%)
            </div>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
              {totalRequired} / {totalCapacity} Gbps
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              {usedPct.toFixed(1)}% Pipe Utilization
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {isSplitMode ? (
          /* Dual-Lane Split Visualizer */
        <div className="space-y-4">
          {/* Lane Pair 1 & 2: Video */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Lanes 1 & 2: Dedicated Video (DP 1.4 Alt Mode)
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                {videoUsed} Gbps / 12.96 Gbps max ({Math.round(videoHeadroomPct)}% Headroom)
              </span>
            </div>
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/80 rounded-md overflow-hidden flex p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                style={{ width: `${videoPct}%` }}
                className="bg-cyan-500 h-full rounded transition-all duration-300"
                title={`Dedicated Video: ${videoUsed} Gbps`}
              />
              {videoHeadroomPct > 0 && (
                <div
                  style={{ width: `${videoHeadroomPct}%` }}
                  className="bg-transparent h-full transition-all duration-300"
                  title={`Available Video Headroom: ${(videoCapacity - videoUsed).toFixed(2)} Gbps`}
                />
              )}
            </div>
          </div>

          {/* Lane Pair 3 & 4: Data */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Lanes 3 & 4: Dedicated USB 3.x Data ({recommendedTier.standardRating})
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                {dataUsed.toFixed(2)} Gbps / {dataCapacity} Gbps net ({Math.round(dataHeadroomPct)}% Headroom)
              </span>
            </div>
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/80 rounded-md overflow-hidden flex p-0.5 border border-slate-200 dark:border-slate-700">
              {splitStoragePct > 0 && (
                <div
                  style={{ width: `${splitStoragePct}%` }}
                  className="bg-indigo-500 h-full first:rounded-l last:rounded-r transition-all duration-300"
                  title={`Storage: ${bandwidthBreakdown.storageGbps} Gbps`}
                />
              )}
              {splitEthernetPct > 0 && (
                <div
                  style={{ width: `${splitEthernetPct}%` }}
                  className="bg-emerald-500 h-full first:rounded-l last:rounded-r transition-all duration-300"
                  title={`Ethernet: ${bandwidthBreakdown.ethernetGbps} Gbps`}
                />
              )}
              {splitWebcamPct > 0 && (
                <div
                  style={{ width: `${splitWebcamPct}%` }}
                  className="bg-amber-500 h-full first:rounded-l last:rounded-r transition-all duration-300"
                  title={`Webcam: ${bandwidthBreakdown.webcamGbps} Gbps`}
                />
              )}
              {splitOtherPct > 0 && (
                <div
                  style={{ width: `${splitOtherPct}%` }}
                  className="bg-slate-400 dark:bg-slate-500 h-full first:rounded-l last:rounded-r transition-all duration-300"
                  title="Overhead & Peripherals"
                />
              )}
              {dataHeadroomPct > 0 && (
                <div
                  style={{ width: `${dataHeadroomPct}%` }}
                  className="bg-transparent h-full transition-all duration-300"
                  title={`Available Data Headroom: ${(dataCapacity - dataUsed).toFixed(2)} Gbps`}
                />
              )}
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
            💡 <strong>Physical Pin Split:</strong> High-speed pins are split 2-and-2. Video runs over DisplayPort wires (up to 12.96 Gbps) while USB data runs over separate SuperSpeed wires (up to 10 Gbps), delivering over 22 Gbps combined physical bandwidth.
          </div>
        </div>
      ) : (
        /* Unified Tunnel Progress Bar (USB4 / Thunderbolt) */
        <div className="space-y-3">
          <div className="h-5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-md overflow-hidden flex p-0.5 border border-slate-200 dark:border-slate-700">
            {unifiedVideoPct > 0 && (
              <div
                style={{ width: `${(bandwidthBreakdown.totalVideoGbps / totalRequired) * usedPct}%` }}
                className="bg-cyan-500 h-full first:rounded-l last:rounded-r transition-all duration-300"
                title={`Video: ${bandwidthBreakdown.totalVideoGbps} Gbps`}
              />
            )}
            {unifiedStoragePct > 0 && (
              <div
                style={{ width: `${(bandwidthBreakdown.storageGbps / totalRequired) * usedPct}%` }}
                className="bg-indigo-500 h-full first:rounded-l last:rounded-r transition-all duration-300"
                title={`Storage: ${bandwidthBreakdown.storageGbps} Gbps`}
              />
            )}
            {unifiedEthernetPct > 0 && (
              <div
                style={{ width: `${(bandwidthBreakdown.ethernetGbps / totalRequired) * usedPct}%` }}
                className="bg-emerald-500 h-full first:rounded-l last:rounded-r transition-all duration-300"
                title={`Ethernet: ${bandwidthBreakdown.ethernetGbps} Gbps`}
              />
            )}
            {unifiedWebcamPct > 0 && (
              <div
                style={{ width: `${(bandwidthBreakdown.webcamGbps / totalRequired) * usedPct}%` }}
                className="bg-amber-500 h-full first:rounded-l last:rounded-r transition-all duration-300"
                title={`Webcam: ${bandwidthBreakdown.webcamGbps} Gbps`}
              />
            )}
            {unifiedOtherPct > 0 && (
              <div
                style={{
                  width: `${
                    ((bandwidthBreakdown.kbMouseGbps +
                      bandwidthBreakdown.customPeripheralsGbps +
                      bandwidthBreakdown.protocolOverheadGbps) /
                      totalRequired) *
                    usedPct
                  }%`,
                }}
                className="bg-slate-400 dark:bg-slate-500 h-full first:rounded-l last:rounded-r transition-all duration-300"
                title="Peripherals & Protocol Framing Overhead"
              />
            )}
            {headroomPct > 0 && (
              <div
                style={{ width: `${headroomPct}%` }}
                className="bg-transparent h-full transition-all duration-300"
                title={`Available Headroom: ${(totalCapacity - totalRequired).toFixed(2)} Gbps`}
              />
            )}
          </div>
        </div>
      )}

        {/* Legend & Channel Items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-cyan-500 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 block truncate">Video Streams</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {bandwidthBreakdown.totalVideoGbps} Gbps
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 block truncate">SSD Storage</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {bandwidthBreakdown.storageGbps} Gbps
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 block truncate">Ethernet</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {bandwidthBreakdown.ethernetGbps} Gbps
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 block truncate">Webcam</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {bandwidthBreakdown.webcamGbps} Gbps
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 dark:bg-slate-500 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 block truncate">Overhead/HID</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {(
                  bandwidthBreakdown.kbMouseGbps +
                  bandwidthBreakdown.customPeripheralsGbps +
                  bandwidthBreakdown.protocolOverheadGbps
                ).toFixed(2)}{' '}
                Gbps
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-xs border border-dashed border-slate-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-500 block truncate">Headroom</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {bandwidthHeadroomPercent}% Free
              </span>
            </div>
          </div>
        </div>

        {/* Usable Payload vs Stamped Rating Explanation Blurb */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-xs">
            <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                Why is available bandwidth less than the stamped rating? (e.g. {recommendedTier.maxNetBandwidthGbps} Gbps available vs. {recommendedTier.standardRating} label)
              </span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11.5px]">
                The stamped cable rating (such as <strong>40 Gbps</strong> on USB4/TB4, <strong>80 Gbps</strong> on TB5, or <strong>120 Gbps</strong> in Asymmetric Link mode) represents the gross physical line signaling rate. Net usable payload capacity is ~10% lower (e.g. <strong>36 Gbps</strong> on 40G links, <strong>76 Gbps</strong> on 80G symmetric links, and <strong>~114 Gbps</strong> in 120 Gbps Asymmetric Link mode) due to 128b/132b line coding, packet framing headers, CRC error checking, and link management protocol overhead. Single-cable payloads cannot exceed ~114 Gbps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  DisplayConfig,
  ScreenResolutionPreset,
  RefreshRatePreset,
  ColorDepth,
  ColorFormat,
  DscMode,
  BandwidthBreakdown,
} from '../types/calculator';
import { RESOLUTION_PRESETS, REFRESH_RATE_PRESETS } from '../utils/standardsData';
import { calculateRawVideoBandwidth, getRequiredHdmiDpVersions } from '../utils/bandwidthMath';
import { Monitor, Info, CheckCircle2 } from 'lucide-react';

interface DisplayPanelProps {
  config: DisplayConfig;
  onChange: (updated: Partial<DisplayConfig>) => void;
  bandwidthBreakdown: BandwidthBreakdown;
}

export const DisplayPanel: React.FC<DisplayPanelProps> = ({ config, onChange, bandwidthBreakdown }) => {
  const currentWidth =
    config.resolutionPreset === 'custom'
      ? config.customWidth
      : RESOLUTION_PRESETS[config.resolutionPreset].width;

  const currentHeight =
    config.resolutionPreset === 'custom'
      ? config.customHeight
      : RESOLUTION_PRESETS[config.resolutionPreset].height;

  const currentRefresh =
    config.refreshRatePreset === 'custom'
      ? config.customRefreshRate
      : REFRESH_RATE_PRESETS[config.refreshRatePreset].rate;

  const rawInfo = calculateRawVideoBandwidth(
    currentWidth,
    currentHeight,
    currentRefresh,
    config.colorDepth,
    config.colorFormat
  );

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Display & Video Pipeline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Resolution, refresh rate, HDR color depth, and DSC
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-400">
            {rawInfo.rawGbps} Gbps
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {getRequiredHdmiDpVersions(rawInfo.rawGbps)}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            per display uncompressed
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* 1. Screen Resolution Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Display Resolution
          </label>
          <select
            value={config.resolutionPreset}
            onChange={(e) =>
              onChange({
                resolutionPreset: e.target.value as ScreenResolutionPreset,
                customWidth:
                  e.target.value === 'custom'
                    ? config.customWidth || 3840
                    : RESOLUTION_PRESETS[e.target.value as ScreenResolutionPreset].width,
                customHeight:
                  e.target.value === 'custom'
                    ? config.customHeight || 2160
                    : RESOLUTION_PRESETS[e.target.value as ScreenResolutionPreset].height,
              })
            }
            className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {Object.entries(RESOLUTION_PRESETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          {/* Custom Resolution Inputs */}
          {config.resolutionPreset === 'custom' && (
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
              <div>
                <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Width (pixels)
                </label>
                <input
                  type="number"
                  min="640"
                  max="15360"
                  step="8"
                  value={config.customWidth}
                  onChange={(e) =>
                    onChange({ customWidth: parseInt(e.target.value, 10) || 1920 })
                  }
                  className="w-full text-xs font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Height (pixels)
                </label>
                <input
                  type="number"
                  min="480"
                  max="8640"
                  step="8"
                  value={config.customHeight}
                  onChange={(e) =>
                    onChange({ customHeight: parseInt(e.target.value, 10) || 1080 })
                  }
                  className="w-full text-xs font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Refresh Rate Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Refresh Rate
          </label>
          <select
            value={config.refreshRatePreset}
            onChange={(e) =>
              onChange({
                refreshRatePreset: e.target.value as RefreshRatePreset,
                customRefreshRate:
                  e.target.value === 'custom'
                    ? config.customRefreshRate || 60
                    : REFRESH_RATE_PRESETS[e.target.value as RefreshRatePreset].rate,
              })
            }
            className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {Object.entries(REFRESH_RATE_PRESETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          {/* Custom Refresh Rate Input */}
          {config.refreshRatePreset === 'custom' && (
            <div className="mt-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
              <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Custom Refresh Rate (Hz)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min="24"
                  max="1000"
                  value={config.customRefreshRate}
                  onChange={(e) =>
                    onChange({ customRefreshRate: parseInt(e.target.value, 10) || 60 })
                  }
                  className="w-32 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
                />
                <span className="text-xs text-slate-500 font-mono">Hz</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Color Depth (8, 10, 12, 16-bit) and Color Format */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Color Resolution (Bit Depth)
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
              {([8, 10, 12, 16] as ColorDepth[]).map((depth) => {
                const isSelected = config.colorDepth === depth;
                return (
                  <button
                    key={depth}
                    type="button"
                    onClick={() => onChange({ colorDepth: depth })}
                    className={`py-1 text-xs font-mono font-medium rounded transition-colors ${
                      isSelected
                        ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-slate-950 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {depth}-bit
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              {config.colorDepth === 8
                ? 'Standard SDR (16.7M colors)'
                : config.colorDepth === 10
                ? 'HDR10 / Wide P3 (1.07B colors)'
                : config.colorDepth === 12
                ? 'Dolby Vision / Master (68B colors)'
                : 'Studio 16-bit Deep Color'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Chroma Subsampling
            </label>
            <select
              value={config.colorFormat}
              onChange={(e) => onChange({ colorFormat: e.target.value as ColorFormat })}
              className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-900 dark:text-slate-100"
            >
              <option value="RGB_444">RGB / 4:4:4 (Uncompressed Crisp Text)</option>
              <option value="YCbCr_422">YCbCr 4:2:2 (33% bandwidth saving)</option>
              <option value="YCbCr_420">YCbCr 4:2:0 (50% bandwidth saving)</option>
            </select>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              {rawInfo.bitsPerPixel} bits per pixel
            </div>
          </div>
        </div>

        {/* 4. Display Count and DSC Compression */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Number of Displays
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((count) => {
                const isSelected = config.displayCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => onChange({ displayCount: count })}
                    className={`flex-1 py-1.5 px-1 font-mono rounded-lg border transition-colors flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 dark:border-cyan-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight block">
                      {count}
                    </span>
                    <span
                      className={`text-[10px] leading-tight block ${
                        isSelected
                          ? 'text-slate-300 dark:text-slate-900 font-medium'
                          : 'text-slate-500 dark:text-slate-400 font-normal'
                      }`}
                    >
                      {count === 1 ? 'Screen' : 'Screens'}
                    </span>
                  </button>
                );
              })}
            </div>
            {config.displayCount > 1 && (
              <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-mono">
                Multi-monitor daisy chaining requires USB4 / Thunderbolt 4/5 dock
              </div>
            )}

            {/* DP Alt Mode Compatibility Checkbox */}
            <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
              <label htmlFor="dp-alt-mode-toggle" className="inline-flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
                <input
                  id="dp-alt-mode-toggle"
                  type="checkbox"
                  checked={config.isDpAltModeCompatible !== false}
                  onChange={(e) => onChange({ isDpAltModeCompatible: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-cyan-500 cursor-pointer accent-cyan-600 shrink-0"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  DP Alt Mode Compatible
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Display Stream Compression (DSC)
            </label>
            <select
              value={config.dscMode}
              onChange={(e) => onChange({ dscMode: e.target.value as DscMode })}
              className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-900 dark:text-slate-100"
            >
              <option value="auto">Auto (Compress when needed - If supported)</option>
              <option value="forced">Forced On (3:1 VESA Lossless Compression)</option>
              <option value="off">Off (Uncompressed Video)</option>
            </select>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              {config.dscMode === 'off'
                ? 'Requires high native DisplayPort Alt Mode bandwidth'
                : 'VESA DSC achieves up to 3:1 visually lossless stream reduction'}
            </div>
          </div>
        </div>

        {/* Dynamic DSC Compression Notice at the bottom of Display Pipeline Area */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {bandwidthBreakdown.dscApplied ? (
            <div className="flex items-start gap-2.5 p-3 bg-cyan-50/80 dark:bg-cyan-950/40 rounded-lg border border-cyan-200 dark:border-cyan-800/80 text-xs text-cyan-950 dark:text-cyan-200">
              <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <div>
                  <strong className="font-semibold text-cyan-900 dark:text-cyan-100">
                    {bandwidthBreakdown.dscTriggerReason === 'lane_split'
                      ? 'VESA DSC Active (Auto · 2-Lane DP Alt Mode Split · 3:1 Ratio)'
                      : bandwidthBreakdown.dscTriggerReason === 'forced'
                      ? 'VESA DSC Active (Forced · 3:1 Ratio)'
                      : 'VESA DSC Active (Auto · Cable Bandwidth Optimization · 3:1 Ratio)'}
                    :
                  </strong>{' '}
                  {bandwidthBreakdown.dscTriggerReason === 'lane_split' ? (
                    <span>
                      High-speed USB 3.x peripherals reserve 2 differential pairs for data, capping DisplayPort to{' '}
                      <span className="font-mono font-semibold">12.96 Gbps</span>. Because uncompressed video requires{' '}
                      <span className="font-mono font-semibold">
                        {(bandwidthBreakdown.rawVideoGbpsPerDisplay * config.displayCount).toFixed(2)} Gbps
                      </span>
                      , visually lossless 3:1 DSC was automatically engaged to compress stream demand down to{' '}
                      <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-300">
                        {bandwidthBreakdown.totalVideoGbps} Gbps
                      </span>
                      , allowing the display to run at full resolution and refresh rate without dropping USB data.
                    </span>
                  ) : (
                    <span>
                      Raw uncompressed stream requires{' '}
                      <span className="font-mono font-semibold">
                        {(bandwidthBreakdown.rawVideoGbpsPerDisplay * config.displayCount).toFixed(2)} Gbps
                      </span>
                      . Visually lossless 3:1 DSC compression reduces effective bandwidth to{' '}
                      <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-300">
                        {bandwidthBreakdown.totalVideoGbps} Gbps
                      </span>
                      , allowing your setup to fit within the lowest viable cable tier without requiring unnecessary expensive hardware.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <div>
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">
                    {config.dscMode === 'auto'
                      ? 'Uncompressed Stream (Auto · No Compression Needed)'
                      : 'Uncompressed Stream (DSC Disabled)'}
                    :
                  </strong>{' '}
                  Video transmits natively at{' '}
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {bandwidthBreakdown.totalVideoGbps} Gbps
                  </span>
                  .{' '}
                  {config.dscMode === 'auto' ? (
                    bandwidthBreakdown.hasHighSpeedPeripherals ? (
                      <span>
                        Under 2-lane DP Alt Mode splitting with USB 3.x data, the video bandwidth fits within the 12.96 Gbps limit without requiring DSC compression.
                      </span>
                    ) : (
                      <span>
                        With only USB 2.0 keyboard & mouse peripherals, all 4 high-speed lanes (up to 25.92 Gbps) are dedicated to DisplayPort, easily carrying the uncompressed stream.
                      </span>
                    )
                  ) : (
                    'Display Stream Compression is turned off, delivering pure uncompressed pixel data.'
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

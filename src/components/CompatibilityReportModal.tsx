/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CableCalculationInput,
  CableRecommendation,
} from '../types/calculator';
import {
  X,
  Printer,
  Copy,
  Check,
  Share2,
  FileText,
  ShieldCheck,
  Zap,
  Gauge,
  Ruler,
} from 'lucide-react';
import { encodeConfigToHash } from '../utils/urlState';
import { RESOLUTION_PRESETS, REFRESH_RATE_PRESETS } from '../utils/standardsData';
import { getRequiredHdmiDpVersions } from '../utils/bandwidthMath';

interface CompatibilityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: CableCalculationInput;
  recommendation: CableRecommendation;
}

export const CompatibilityReportModal: React.FC<CompatibilityReportModalProps> = ({
  isOpen,
  onClose,
  input,
  recommendation,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const { recommendedTier, powerRequirements, bandwidthBreakdown } = recommendation;

  const CLEAN_RES_NAMES: Record<string, string> = {
    '1080p': '1080p (1920 × 1080)',
    '1440p': '1440p (2560 × 1440)',
    '4K_UHD': '4K UHD (3840 × 2160)',
    '4K_DCI': '4K DCI (4096 × 2160)',
    'ultrawide_1440p': 'Ultrawide 1440p (3440 × 1440)',
    'super_ultrawide': 'Super Ultrawide (5120 × 1440)',
    '5K': '5K (5120 × 2880)',
    '6K': '6K (6016 × 3384)',
    '8K': '8K UHD (7680 × 4320)',
  };

  const resLabel =
    input.display.resolutionPreset === 'custom'
      ? `${input.display.customWidth} × ${input.display.customHeight}`
      : CLEAN_RES_NAMES[input.display.resolutionPreset] ||
        `${input.display.customWidth} × ${input.display.customHeight}`;

  const refreshLabel =
    input.display.refreshRatePreset === 'custom'
      ? `${input.display.customRefreshRate} Hz`
      : `${REFRESH_RATE_PRESETS[input.display.refreshRatePreset]?.rate || 60} Hz`;

  const shareableUrl = `${window.location.origin}${window.location.pathname}#${encodeConfigToHash(input)}`;

  const generateMarkdownReport = (): string => {
    const rawTotalVideo = (bandwidthBreakdown.rawVideoGbpsPerDisplay * input.display.displayCount).toFixed(2);
    const dscMarkdownStatus =
      input.display.dscMode === 'auto'
        ? bandwidthBreakdown.dscApplied
          ? `Auto — Compressed (${bandwidthBreakdown.dscCompressionRatio}:1 ratio via ${bandwidthBreakdown.dscTriggerReason === 'lane_split' ? '2-lane DP Alt Mode splitting' : 'link congestion'}) · Effective: ${bandwidthBreakdown.totalVideoGbps} Gbps (Raw uncompressed: ${rawTotalVideo} Gbps)`
          : `Auto — Uncompressed (Native stream fits link capacity) · ${bandwidthBreakdown.totalVideoGbps} Gbps`
        : input.display.dscMode === 'forced'
        ? `Forced — Compressed (${bandwidthBreakdown.dscCompressionRatio}:1 ratio) · Effective: ${bandwidthBreakdown.totalVideoGbps} Gbps (Raw: ${rawTotalVideo} Gbps)`
        : `Off — Uncompressed (Native stream) · ${bandwidthBreakdown.totalVideoGbps} Gbps`;

    if (recommendation.isImpossibleConfig) {
      return `### USB & Thunderbolt Cable Compatibility Report
Generated: ${new Date().toLocaleDateString()}

**Cable Standard:** ⚠️ EXCEEDS MAXIMUM SINGLE-CABLE CAPACITY

**Single-Cable Link Saturation Alert:**
This display configuration requires ${bandwidthBreakdown.totalVideoGbps} Gbps of ${input.display.dscMode === 'off' ? 'uncompressed ' : ''}bandwidth, which exceeds the absolute physical limit of a single USB-C / Thunderbolt 5 cable (120 Gbps asymmetric limit).

**Display Configuration:**
- Resolution: ${resLabel} (${input.display.displayCount} display${input.display.displayCount > 1 ? 's' : ''})
- Refresh Rate: ${refreshLabel}
- Color: ${input.display.colorDepth}-bit (${input.display.colorFormat})
- Uncompressed Port Standard: ${getRequiredHdmiDpVersions(bandwidthBreakdown.rawVideoGbpsPerDisplay)} (per display)
- DSC: ${dscMarkdownStatus}

**Peripherals & Throughput:**
- Keyboard & Mouse: ${input.peripherals.hasStandardKbMouse ? 'Yes (USB 2.0 HID)' : 'No'}
- Ethernet: ${input.peripherals.ethernetPreset} (${bandwidthBreakdown.ethernetGbps} Gbps)
- External Storage: ${input.peripherals.storagePreset} (${bandwidthBreakdown.storageGbps} Gbps)
- Webcam: ${input.peripherals.webcamPreset} (${bandwidthBreakdown.webcamGbps} Gbps)

**Actionable Recommendations to Reduce Required Bandwidth:**
- Enable DSC (Display Stream Compression) to reduce video stream requirements by up to 66%.
- Lower color depth from 16-bit / 10-bit to standard 8-bit.
- Reduce refresh rate to 120 Hz or 60 Hz.
- Split displays across two independent host ports / cables instead of running a single-cable daisy chain / dock.

**Disclaimer:**
This tool is for ESTIMATION AND PLANNING PURPOSES ONLY and specifications are based on published VESA, USB-IF, and Intel Thunderbolt standards as of 2026. Real-world results may vary considerably depending on cable build quality, conductor shielding, host device capabilities (e.g. whether the port supports DP Alt Mode, USB4 tunneling, or DSC), dock/hub controller chipsets, monitor firmware, operating system display limits (such as macOS not supporting DisplayPort MST daisy-chaining), and high-frequency signal attenuation over distance. Always verify exact port capabilities and multi-display support with your host and peripheral hardware manufacturers.

Shareable Configuration Link:
${shareableUrl}
`;
    }

    return `### USB & Thunderbolt Cable Compatibility Report
Generated: ${new Date().toLocaleDateString()}

**Recommended Minimum Cable Standard:**
- **Standard:** ${recommendedTier.officialName} (${recommendedTier.standardRating})
- **Marketing Label:** ${recommendedTier.marketingName}
${
  bandwidthBreakdown.isDpAltMode2LaneSplit
    ? `- **Connection Mode:** DisplayPort Alt Mode (2-Lane Physical Split)
- **Video Channel (2-Lane DP 1.4):** ${bandwidthBreakdown.totalVideoGbps} Gbps (max 12.96 Gbps dedicated video limit)
- **Data Channel (USB 3.x Gen 2):** ${bandwidthBreakdown.totalDataGbps} Gbps (max ${recommendedTier.standardRating} dedicated data limit)`
    : `- **Connection Mode:** ${recommendation.isAsymmetricLinkActive ? 'Thunderbolt 5 (120 Gbps Asymmetric)' : 'USB4 / Thunderbolt Dynamic Packet Tunneling'}
- **Required Unified Bandwidth:** ${bandwidthBreakdown.totalRequiredGbps} Gbps (of ${recommendation.isAsymmetricLinkActive ? '114' : recommendedTier.maxNetBandwidthGbps} Gbps tunnel capacity)`
}
- **Power Delivery:** ${powerRequirements.targetWatts}W (${powerRequirements.specificationName})
- **Physical Length:** ${input.desiredLengthMeters}m (${recommendation.activeCableRequired ? 'Active Cable Required' : 'Passive Cable OK'})

**Display Configuration:**
- Resolution: ${resLabel} (${input.display.displayCount} display${input.display.displayCount > 1 ? 's' : ''})
- Refresh Rate: ${refreshLabel}
- Color: ${input.display.colorDepth}-bit (${input.display.colorFormat})
- Uncompressed Port Standard: ${getRequiredHdmiDpVersions(bandwidthBreakdown.rawVideoGbpsPerDisplay)} (per display)
- DSC: ${dscMarkdownStatus}

**Peripherals & Throughput:**
- Keyboard & Mouse: ${input.peripherals.hasStandardKbMouse ? 'Yes (USB 2.0 HID)' : 'No'}
- Ethernet: ${input.peripherals.ethernetPreset} (${bandwidthBreakdown.ethernetGbps} Gbps)
- External Storage: ${input.peripherals.storagePreset} (${bandwidthBreakdown.storageGbps} Gbps)
- Webcam: ${input.peripherals.webcamPreset} (${bandwidthBreakdown.webcamGbps} Gbps)

**Buyer Checklist:**
${recommendation.shoppingChecklist.map((c) => `- ${c}`).join('\n')}
- ⚠️ AVOID: Standard phone/MacBook white charge cables (they only do 480 Mbps and NO video!)

**Disclaimer:**
This tool is for ESTIMATION AND PLANNING PURPOSES ONLY and specifications are based on published VESA, USB-IF, and Intel Thunderbolt standards as of 2026. Real-world results may vary considerably depending on cable build quality, conductor shielding, host device capabilities (e.g. whether the port supports DP Alt Mode, USB4 tunneling, or DSC), dock/hub controller chipsets, monitor firmware, operating system display limits (such as macOS not supporting DisplayPort MST daisy-chaining), and high-frequency signal attenuation over distance. Always verify exact port capabilities and multi-display support with your host and peripheral hardware manufacturers.

Shareable Configuration Link:
${shareableUrl}
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hardware Compatibility & Cable Specification Report
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print or save as PDF"
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
          {/* Executive Summary Card */}
          <div
            className={`p-4 rounded-xl ${
              recommendation.isImpossibleConfig
                ? 'bg-rose-50/70 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800'
                : 'bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/60'
            }`}
          >
            <div
              className={`text-xs font-mono font-bold uppercase tracking-wider mb-1 ${
                recommendation.isImpossibleConfig
                  ? 'text-rose-700 dark:text-rose-400'
                  : 'text-cyan-700 dark:text-cyan-400'
              }`}
            >
              {recommendation.isImpossibleConfig ? 'Physical Ceiling Exceeded' : 'Specification Conclusion'}
            </div>
            <h4
              className={`text-lg font-extrabold ${
                recommendation.isImpossibleConfig
                  ? 'text-rose-900 dark:text-rose-200'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {recommendedTier.marketingName}
            </h4>
            <p
              className={`text-xs mt-1 leading-relaxed ${
                recommendation.isImpossibleConfig
                  ? 'text-rose-800 dark:text-rose-300'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {recommendation.recommendationSummary}
            </p>
          </div>

          {/* Key Requirement Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {bandwidthBreakdown.isDpAltMode2LaneSplit ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="font-semibold">DP Alt Mode Split</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 font-semibold">
                    2+2 Physical Split
                  </span>
                </div>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Video<br />(2-Lane DP):</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {bandwidthBreakdown.totalVideoGbps}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">/ 12.96 Gbps</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Data<br />(USB 3.x):</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {bandwidthBreakdown.totalDataGbps}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">/ {recommendedTier.standardRating}</span>
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                  Separate physical pairs (&gt;22G aggregate)
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Unified Tunneled Bandwidth</span>
                </div>
                <div className="text-base font-mono font-bold text-slate-900 dark:text-white">
                  {bandwidthBreakdown.totalRequiredGbps} Gbps
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Unified Cable Rating: {recommendedTier.standardRating}
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Power Delivery</span>
              </div>
              <div className="text-base font-mono font-bold text-slate-900 dark:text-white">
                {powerRequirements.targetWatts}W
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {powerRequirements.isEpr ? 'USB-PD 3.1 EPR' : powerRequirements.requiresEMarker ? '5A e-Marker' : 'Standard 3A'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                <Ruler className="w-3.5 h-3.5 text-emerald-500" />
                <span>Physical Run</span>
              </div>
              <div className="text-base font-mono font-bold text-slate-900 dark:text-white">
                {input.desiredLengthMeters} meters
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {recommendation.activeCableRequired ? 'Active Retimer Required' : 'Passive Copper OK'}
              </div>
            </div>
          </div>

          {/* Complete Specification Breakdown Table */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-mono">
              Detailed Parameter Audit
            </h5>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
              <div className="grid grid-cols-2 p-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Display Setup</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {resLabel} @ {refreshLabel} ({input.display.displayCount}x)
                </span>
              </div>
              <div className="grid grid-cols-2 p-2.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Color Depth & Subsampling</span>
                <span>
                  {input.display.colorDepth}-bit HDR · {input.display.colorFormat}
                </span>
              </div>
              <div className="grid grid-cols-2 p-2.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Uncompressed Port Standard</span>
                <span className="font-mono text-cyan-700 dark:text-cyan-400 font-medium">
                  {getRequiredHdmiDpVersions(bandwidthBreakdown.rawVideoGbpsPerDisplay)} (per display)
                </span>
              </div>
              <div className="grid grid-cols-2 p-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Display Stream Compression (DSC)</span>
                <span className="font-medium">
                  {input.display.dscMode === 'auto'
                    ? bandwidthBreakdown.dscApplied
                      ? `Auto — Compressed (${bandwidthBreakdown.dscCompressionRatio}:1 ratio via ${bandwidthBreakdown.dscTriggerReason === 'lane_split' ? '2-lane DP Alt Mode split' : 'cable link capacity'})`
                      : 'Auto — Uncompressed (link capacity sufficient)'
                    : input.display.dscMode === 'forced'
                    ? `Forced — Compressed (${bandwidthBreakdown.dscCompressionRatio}:1 ratio)`
                    : 'Off — Uncompressed (Native Stream)'}
                </span>
              </div>
              <div className="grid grid-cols-2 p-2.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">DP Alt Mode Physical Lanes</span>
                <span className="font-mono text-xs">
                  {bandwidthBreakdown.dpAltModeLanes} Lanes ({bandwidthBreakdown.dpAltModeMaxVideoGbps} Gbps video limit) ·{' '}
                  {bandwidthBreakdown.hasHighSpeedPeripherals
                    ? '2 lanes reserved for USB 3.x data'
                    : '4 lanes dedicated to DisplayPort'}
                </span>
              </div>
              <div className="grid grid-cols-2 p-2.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Video Payload Bandwidth</span>
                <span>
                  <strong className="text-slate-900 dark:text-white font-mono font-semibold">
                    {bandwidthBreakdown.totalVideoGbps} Gbps
                  </strong>{' '}
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {bandwidthBreakdown.dscApplied
                      ? `(Compressed at ${bandwidthBreakdown.dscCompressionRatio}:1 ratio · Raw uncompressed: ${(bandwidthBreakdown.rawVideoGbpsPerDisplay * input.display.displayCount).toFixed(2)} Gbps)`
                      : '(Native Uncompressed)'}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-2 p-2.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Peripherals & Data</span>
                <span>
                  KB/Mouse ({bandwidthBreakdown.kbMouseGbps}G) · Storage ({bandwidthBreakdown.storageGbps}G) · Ethernet ({bandwidthBreakdown.ethernetGbps}G)
                </span>
              </div>
              <div className="grid grid-cols-2 p-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <span className="text-slate-500 dark:text-slate-400">
                  {bandwidthBreakdown.isDpAltMode2LaneSplit ? 'Physical Channel Allocation' : 'Unified Tunnel Allocation'}
                </span>
                <span className="font-mono text-xs">
                  {bandwidthBreakdown.isDpAltMode2LaneSplit ? (
                    <span>
                      <strong className="text-cyan-700 dark:text-cyan-400">Video: {bandwidthBreakdown.totalVideoGbps}G</strong> (of 12.96G DP) ·{' '}
                      <strong className="text-indigo-600 dark:text-indigo-400">Data: {bandwidthBreakdown.totalDataGbps}G</strong> (of {recommendedTier.standardRating})
                    </span>
                  ) : (
                    <span>
                      <strong className="text-slate-900 dark:text-white">{bandwidthBreakdown.totalRequiredGbps} Gbps</strong>{' '}
                      tunneled across {recommendedTier.standardRating} link
                    </span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-2 p-2.5 bg-slate-50 dark:bg-slate-900">
                <span className="text-slate-500 dark:text-slate-400">Power Delivery Spec</span>
                <span>
                  {powerRequirements.specificationName}
                </span>
              </div>
            </div>
          </div>

          {/* Buyer Shopping Checklist or Actionable Suggestions */}
          {recommendation.isImpossibleConfig ? (
            <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-300 dark:border-amber-800/80">
              <h5 className="text-xs font-bold text-amber-950 dark:text-amber-200 mb-2.5 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Actionable Recommendations to Reduce Required Bandwidth:</span>
              </h5>
              <ul className="space-y-2 text-xs text-amber-950 dark:text-amber-100">
                {recommendation.actionableSuggestions?.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/50"
                  >
                    <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0 mt-0.5">➔</span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>What to Check on the Cable Retail Packaging:</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {recommendation.shoppingChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical Disclaimer */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            <p>
              <strong className="font-semibold text-slate-700 dark:text-slate-300">Disclaimer:</strong> This tool is for ESTIMATION AND PLANNING PURPOSES ONLY and specifications are based on published VESA, USB-IF, and Intel Thunderbolt standards as of 2026. Real-world results may vary considerably depending on cable build quality, conductor shielding, host device capabilities (e.g. whether the port supports DP Alt Mode, USB4 tunneling, or DSC), dock/hub controller chipsets, monitor firmware, operating system display limits (such as macOS not supporting DisplayPort MST daisy-chaining), and high-frequency signal attenuation over distance. Always verify exact port capabilities and multi-display support with your host and peripheral hardware manufacturers.
            </p>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMd ? 'Copied Markdown!' : 'Copy Markdown Report'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied URL!' : 'Copy Shareable Link'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

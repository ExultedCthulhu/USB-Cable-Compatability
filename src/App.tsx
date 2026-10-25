/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PresetBar } from './components/PresetBar';
import { DisplayPanel } from './components/DisplayPanel';
import { PeripheralsPanel } from './components/PeripheralsPanel';
import { PowerDeliveryPanel } from './components/PowerDeliveryPanel';
import { LengthSelector } from './components/LengthSelector';
import { CableRecommendationCard } from './components/CableRecommendationCard';
import { BandwidthVisualizer } from './components/BandwidthVisualizer';
import { LengthAndSignalLimitsCard } from './components/LengthAndSignalLimitsCard';
import { CrossCompatibilityInspector } from './components/CrossCompatibilityInspector';
import { StandardsMatrixView } from './components/StandardsMatrixView';
import { CompatibilityReportModal } from './components/CompatibilityReportModal';
import { CableCalculationInput } from './types/calculator';
import { computeCableRecommendation } from './utils/bandwidthMath';
import { getDefaultConfig, decodeConfigFromHash, encodeConfigToHash } from './utils/urlState';
import { WORKSTATION_PRESETS } from './utils/standardsData';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'calculator' | 'matrix'>('calculator');

  // Dark mode state: default to dark for calibrated scientific/engineering look
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return true; // default dark
    }
    return true;
  });

  // Main configuration
  const [config, setConfig] = useState<CableCalculationInput>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const decoded = decodeConfigFromHash(window.location.hash);
      if (decoded) return decoded;
    }
    return getDefaultConfig();
  });

  const [activePresetId, setActivePresetId] = useState<string | undefined>(WORKSTATION_PRESETS[0].id);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Sync dark class on <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Compute recommendation
  const recommendation = computeCableRecommendation(config);

  // Handlers for partial updates
  const handleUpdateDisplay = (updated: Partial<CableCalculationInput['display']>) => {
    setConfig((prev) => ({
      ...prev,
      display: { ...prev.display, ...updated },
    }));
    setActivePresetId(undefined);
  };

  const handleUpdatePeripherals = (updated: Partial<CableCalculationInput['peripherals']>) => {
    setConfig((prev) => ({
      ...prev,
      peripherals: { ...prev.peripherals, ...updated },
    }));
    setActivePresetId(undefined);
  };

  const handleUpdatePower = (updated: Partial<CableCalculationInput['power']>) => {
    setConfig((prev) => ({
      ...prev,
      power: { ...prev.power, ...updated },
    }));
    setActivePresetId(undefined);
  };

  const handleChangeLength = (desiredLengthMeters: number) => {
    setConfig((prev) => ({
      ...prev,
      desiredLengthMeters,
    }));
  };

  const handleSelectPreset = (newConfig: CableCalculationInput) => {
    setConfig(JSON.parse(JSON.stringify(newConfig)));
    const matched = WORKSTATION_PRESETS.find(
      (p) => JSON.stringify(p.config) === JSON.stringify(newConfig)
    );
    setActivePresetId(matched?.id);
  };

  const handleShareLink = () => {
    const hash = encodeConfigToHash(config);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    navigator.clipboard.writeText(url);
    window.location.hash = hash;
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col">
      {/* Top Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
        onToggleDark={() => setIsDark((prev) => !prev)}
        onOpenReport={() => setIsReportModalOpen(true)}
        copiedShareLink={copiedShareLink}
        onShareLink={handleShareLink}
      />

      {/* Preset Quick Ribbon */}
      <PresetBar
        onSelectPreset={handleSelectPreset}
        activePresetId={activePresetId}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_750px] gap-6 items-start">
            {/* Left Column: Parameter Controls (Restored to original comfortable size) */}
            <div className="w-full space-y-6">
              <DisplayPanel
                config={config.display}
                onChange={handleUpdateDisplay}
                bandwidthBreakdown={recommendation.bandwidthBreakdown}
              />
              <PeripheralsPanel
                config={config.peripherals}
                onChange={handleUpdatePeripherals}
              />
              <PowerDeliveryPanel config={config.power} onChange={handleUpdatePower} />
              <LengthSelector
                desiredLengthMeters={config.desiredLengthMeters}
                onChangeLength={handleChangeLength}
                recommendedTier={recommendation.recommendedTier}
              />
            </div>

            {/* Right Column: Telemetry, Recommendations & Spec Matrix (750px for single-line fit) */}
            <div className="w-full lg:w-[750px] space-y-6">
              <CableRecommendationCard
                recommendation={recommendation}
                desiredLengthMeters={config.desiredLengthMeters}
              />
              <BandwidthVisualizer recommendation={recommendation} />
              <CrossCompatibilityInspector recommendation={recommendation} />
              <LengthAndSignalLimitsCard currentTierId={recommendation.recommendedTier.id} />
            </div>
          </div>
        )}

        {activeTab === 'matrix' && <StandardsMatrixView />}
      </main>

      {/* Clean Unboxed Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0B0F19] py-6 px-4 sm:px-6 transition-colors mt-auto">
        <div className="max-w-[1440px] mx-auto space-y-4">
          {/* Technical Disclaimer */}
          <div className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <p>
              <strong className="font-semibold text-slate-700 dark:text-slate-300">Disclaimer:</strong> This tool is for ESTIMATION AND PLANNING PURPOSES ONLY and specifications are based on published VESA, USB-IF, and Intel Thunderbolt standards as of 2026. Real-world results may vary considerably depending on cable build quality, conductor shielding, host device capabilities (e.g. whether the port supports DP Alt Mode, USB4 tunneling, or DSC), dock/hub controller chipsets, monitor firmware, operating system display limits (such as macOS not supporting DisplayPort MST daisy-chaining), and high-frequency signal attenuation over distance. Always verify exact port capabilities and multi-display support with your host and peripheral hardware manufacturers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>USB CableSpec</span>
              <span aria-hidden="true">·</span>
              <span>VESA DisplayPort 1.4/2.1</span>
              <span aria-hidden="true">·</span>
              <span>USB-IF USB4 2.0 & USB-PD 3.1</span>
              <span aria-hidden="true">·</span>
              <span>Intel Thunderbolt 4 & 5</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Export Report
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={handleShareLink}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {copiedShareLink ? 'Link Copied' : 'Share Configuration'}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Shareable Compatibility Report Modal */}
      <CompatibilityReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        input={config}
        recommendation={recommendation}
      />
    </div>
  );
}

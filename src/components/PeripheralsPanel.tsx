/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  PeripheralConfig,
  EthernetPreset,
  StoragePreset,
  WebcamPreset,
} from '../types/calculator';
import { ETHERNET_PRESETS, STORAGE_PRESETS } from '../utils/standardsData';
import { Cpu, HardDrive, Network, Camera, Keyboard, SlidersHorizontal } from 'lucide-react';

interface PeripheralsPanelProps {
  config: PeripheralConfig;
  onChange: (updated: Partial<PeripheralConfig>) => void;
}

export const PeripheralsPanel: React.FC<PeripheralsPanelProps> = ({ config, onChange }) => {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Workstation Peripherals & Data
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keyboard, mouse, Ethernet, external SSDs, and webcams
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* 1. Common Keyboard & Mouse Setup Checkbox */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.hasStandardKbMouse}
              onChange={(e) => onChange({ hasStandardKbMouse: e.target.checked })}
              className="mt-0.5 w-4 h-4 text-cyan-600 dark:text-cyan-500 border-slate-300 dark:border-slate-700 rounded focus:ring-cyan-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <Keyboard className="w-3.5 h-3.5 text-slate-500" />
                <span>Standard Desktop Keyboard & Mouse (HID)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                Reserves USB 2.0 D+/D- legacy sub-channel (~0.05 Gbps). Required for docks with wired/wireless USB dongles, mechanical keyboards, and mice.
              </p>
            </div>
          </label>
        </div>

        {/* 2. Ethernet Speed Dropdown */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Network className="w-3.5 h-3.5 text-slate-400" />
              <span>Wired Ethernet Network Speed</span>
            </label>
          </div>
          <select
            value={config.ethernetPreset}
            onChange={(e) =>
              onChange({
                ethernetPreset: e.target.value as EthernetPreset,
                customEthernetMbps:
                  e.target.value === 'custom'
                    ? config.customEthernetMbps || 1000
                    : (ETHERNET_PRESETS[e.target.value as EthernetPreset]?.bandwidthGbps || 0) * 1000,
              })
            }
            className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {Object.entries(ETHERNET_PRESETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          {/* Custom Ethernet Input */}
          {config.ethernetPreset === 'custom' && (
            <div className="mt-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
              <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Custom Ethernet Throughput (Mbps)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min="10"
                  max="40000"
                  step="100"
                  value={config.customEthernetMbps}
                  onChange={(e) =>
                    onChange({ customEthernetMbps: parseInt(e.target.value, 10) || 1000 })
                  }
                  className="w-36 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
                />
                <span className="text-xs text-slate-500 font-mono">
                  Mbps ({(config.customEthernetMbps / 1000).toFixed(2)} Gbps)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Storage SSD Dropdown */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>External SSD / High-Speed Storage</span>
          </label>
          <select
            value={config.storagePreset}
            onChange={(e) => onChange({ storagePreset: e.target.value as StoragePreset })}
            className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {Object.entries(STORAGE_PRESETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
          {config.storagePreset === 'nvme_pcie' && (
            <div className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-1 font-mono">
              Direct PCIe tunneling: requires Thunderbolt 3/4/5 or USB4 host controller
            </div>
          )}
        </div>

        {/* 4. Webcam & Custom Extra Bandwidth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              <span>Webcam / Capture Card</span>
            </label>
            <select
              value={config.webcamPreset}
              onChange={(e) => onChange({ webcamPreset: e.target.value as WebcamPreset })}
              className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-900 dark:text-slate-100"
            >
              <option value="none">None / Integrated Laptop Cam</option>
              <option value="1080p">1080p USB Webcam (~0.5 Gbps)</option>
              <option value="4k_uncompressed">4K 60fps Uncompressed / HDMI Camlink (5 Gbps)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Other Custom Bandwidth</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {config.customBandwidthGbps} Gbps
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={config.customBandwidthGbps}
              onChange={(e) =>
                onChange({ customBandwidthGbps: parseFloat(e.target.value) || 0 })
              }
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600 dark:accent-cyan-400"
            />
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              e.g., audio DACs, VR headsets, external GPUs, sensor probes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

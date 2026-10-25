/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CableRecommendation } from '../types/calculator';
import { Network, CheckCircle, AlertTriangle, XCircle, ArrowRightLeft } from 'lucide-react';

interface CrossCompatibilityInspectorProps {
  recommendation: CableRecommendation;
}

export const CrossCompatibilityInspector: React.FC<CrossCompatibilityInspectorProps> = ({
  recommendation,
}) => {
  const { recommendedTier } = recommendation;

  const scenarios = [
    {
      host: 'Thunderbolt 4 / 5 Host (Modern Mac & PC)',
      status: recommendation.isImpossibleConfig
        ? 'fail'
        : recommendation.isBandwidthSaturated
        ? 'partial'
        : 'full',
      result: recommendation.isImpossibleConfig
        ? 'Exceeds Single-Cable Physical Limit'
        : recommendation.isAsymmetricLinkActive
        ? '120 Gbps Asymmetric Link Active'
        : '100% Native Performance',
      detail: recommendation.isImpossibleConfig
        ? 'Setup requires more than 114 Gbps usable payload, exceeding the absolute physical boundary of a single cable. DSC or dual cables required.'
        : recommendation.isAsymmetricLinkActive
        ? 'Dynamically engages sustained 3-lane downstream / 1-lane upstream hardware mode delivering ~114 Gbps usable video/data payload.'
        : 'All video streams, 40–80 Gbps data, PCIe NVMe tunneling, and multi-display MST/daisy-chain work seamlessly.',
    },
    {
      host: 'Thunderbolt 3 Host (Intel Macs & older PCs)',
      status: 'full',
      result: 'Full 40 Gbps Interconnect',
      detail:
        'Supports dual 4K 60Hz and PCIe tunneling. Note: Intel Macs do not support MST multi-monitor on a single cable without dual DisplayPort streams.',
    },
    {
      host: 'USB-C DP Alt Mode Host (AMD / Non-TB PCs)',
      status: recommendation.featuresRequiringThunderbolt.length > 0 ? 'partial' : 'full',
      result: recommendation.featuresRequiringThunderbolt.length > 0
        ? 'Limited Bandwidth (USB 3.2 10G)'
        : 'Full Support via DP Alt Mode',
      detail:
        'Transmits single 4K display. If 4 differential pairs are dedicated to DP 1.4 video, USB hub data drops to USB 2.0 (480 Mbps) unless DSC is supported.',
    },
    {
      host: 'USB-C Data-Only Port (No DP Alt Mode)',
      status: 'fail',
      result: 'Data & Power Only (NO VIDEO)',
      detail:
        'Peripherals, external storage, and charging work normally, but connected monitors will receive no signal.',
    },
    {
      host: 'Legacy USB 3.0 Type-A Port (via A-to-C Adapter)',
      status: 'fail',
      result: 'Max 5 Gbps Data Only',
      detail:
        'No DisplayPort video, no Power Delivery (caps at 5V/0.9A = 4.5W), and no PCIe NVMe protocol tunneling.',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Cross-Generation & Backward Compatibility Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              What happens when connecting this setup across different host computer ports
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {scenarios.map((item, idx) => {
          return (
            <div
              key={idx}
              className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {item.status === 'full' && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {item.status === 'partial' && (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  {item.status === 'fail' && (
                    <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <span>{item.host}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 leading-normal">
                  {item.detail}
                </p>
              </div>

              <div className="pl-5 sm:pl-0 sm:text-right shrink-0">
                <span
                  className={`text-[11px] font-mono font-semibold ${
                    item.status === 'full'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : item.status === 'partial'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {item.result}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

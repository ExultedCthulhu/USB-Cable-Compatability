/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WORKSTATION_PRESETS } from '../utils/standardsData';
import { CableCalculationInput } from '../types/calculator';
import { Sparkles, Monitor, Gamepad2, Video, Briefcase, Zap } from 'lucide-react';

interface PresetBarProps {
  onSelectPreset: (config: CableCalculationInput) => void;
  activePresetId?: string;
}

const PRESET_ICONS: Record<string, React.ReactNode> = {
  basic_1080p_home_office: <Monitor className="w-3.5 h-3.5" />,
  single_4k_monitor: <Monitor className="w-3.5 h-3.5" />,
  dual_4k_dock: <Monitor className="w-3.5 h-3.5" />,
  gaming_ultrawide_144hz: <Gamepad2 className="w-3.5 h-3.5" />,
  creator_6k_studio: <Video className="w-3.5 h-3.5" />,
  extreme_8k_tb5: <Zap className="w-3.5 h-3.5" />,
};

export const PresetBar: React.FC<PresetBarProps> = ({ onSelectPreset, activePresetId }) => {
  return (
    <div className="w-full bg-slate-50 dark:bg-[#0E1524] border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-2.5">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Quick Presets:</span>
        </div>
        <div className="flex items-center gap-2">
          {WORKSTATION_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.config)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title={preset.description}
              >
                {PRESET_ICONS[preset.id]}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

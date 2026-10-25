/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon, Share2, FileText, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'matrix';
  onTabChange: (tab: 'calculator' | 'matrix') => void;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenReport: () => void;
  copiedShareLink: boolean;
  onShareLink: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isDark,
  onToggleDark,
  onOpenReport,
  copiedShareLink,
  onShareLink,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 py-3.5 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-cyan-600 dark:bg-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          USB
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            CableSpec
          </span>
          <span className="hidden sm:inline-block text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            USB4 · Thunderbolt · Power Delivery
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation views */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onTabChange('calculator')}
          className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'calculator'
              ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          Calculator
        </button>
        <button
          onClick={() => onTabChange('matrix')}
          className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          Standards Spec
        </button>
      </nav>

      {/* Zone 3: Actions & Dark Mode Toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          onClick={onShareLink}
          title="Copy shareable link"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          {copiedShareLink ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenReport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Report</span>
        </button>

        <button
          onClick={onToggleDark}
          aria-label="Toggle dark mode"
          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CableCalculationInput } from '../types/calculator';
import { WORKSTATION_PRESETS } from './standardsData';

export function getDefaultConfig(): CableCalculationInput {
  return JSON.parse(JSON.stringify(WORKSTATION_PRESETS[0].config));
}

export function encodeConfigToHash(config: CableCalculationInput): string {
  try {
    const jsonStr = JSON.stringify(config);
    return encodeURIComponent(btoa(jsonStr));
  } catch (err) {
    console.error('Failed to encode config to hash:', err);
    return '';
  }
}

export function decodeConfigFromHash(hashString: string): CableCalculationInput | null {
  try {
    const cleanHash = hashString.replace(/^#/, '');
    if (!cleanHash) return null;
    const jsonStr = atob(decodeURIComponent(cleanHash));
    const parsed = JSON.parse(jsonStr) as CableCalculationInput;
    if (parsed && parsed.display && parsed.peripherals && parsed.power) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('Could not parse hash config:', err);
    return null;
  }
}

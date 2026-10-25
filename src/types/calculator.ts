/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenResolutionPreset = 
  | '1080p'
  | '1440p'
  | '4K_UHD'
  | '4K_DCI'
  | '5K'
  | '6K'
  | '8K'
  | 'ultrawide_1440p'
  | 'super_ultrawide'
  | 'custom';

export type RefreshRatePreset = 
  | '30Hz'
  | '60Hz'
  | '75Hz'
  | '120Hz'
  | '144Hz'
  | '165Hz'
  | '240Hz'
  | '360Hz'
  | 'custom';

export type ColorDepth = 8 | 10 | 12 | 16;

export type ColorFormat = 'RGB_444' | 'YCbCr_422' | 'YCbCr_420';

export type DscMode = 'auto' | 'forced' | 'off';

export type EthernetPreset = 'none' | '100M' | '1G' | '2.5G' | '5G' | '10G' | 'custom';

export type PowerDeliveryPreset = 'none' | '60W' | '100W' | '140W' | '240W' | 'custom';

export type StoragePreset = 'none' | 'usb3_5g' | 'usb3_10g' | 'usb3_20g' | 'nvme_pcie';

export type WebcamPreset = 'none' | '1080p' | '4k_uncompressed';

export interface DisplayConfig {
  resolutionPreset: ScreenResolutionPreset;
  customWidth: number;
  customHeight: number;
  refreshRatePreset: RefreshRatePreset;
  customRefreshRate: number;
  colorDepth: ColorDepth;
  colorFormat: ColorFormat;
  dscMode: DscMode;
  displayCount: number;
  isDpAltModeCompatible?: boolean;
}

export interface PeripheralConfig {
  hasStandardKbMouse: boolean; // USB 2.0 HID
  ethernetPreset: EthernetPreset;
  customEthernetMbps: number;
  storagePreset: StoragePreset;
  webcamPreset: WebcamPreset;
  customBandwidthGbps: number;
}

export interface PowerConfig {
  pdPreset: PowerDeliveryPreset;
  customWattage: number;
}

export interface CableCalculationInput {
  display: DisplayConfig;
  peripherals: PeripheralConfig;
  power: PowerConfig;
  desiredLengthMeters: number;
}

export type CableTierId = 
  | 'usb_2_0'
  | 'usb_3_gen1'
  | 'usb_3_gen2'
  | 'usb4_20g'
  | 'tb3_40g'
  | 'usb4_40g_tb4'
  | 'tb5_80g';

export interface CableTierSpec {
  id: CableTierId;
  officialName: string;
  marketingName: string;
  standardRating: string;
  maxRawBandwidthGbps: number;
  maxNetBandwidthGbps: number;
  maxPassiveLengthMeters: number;
  maxActiveLengthMeters: number;
  supportsVideo: boolean;
  supportsPcieTunneling: boolean;
  videoTunnelingSupport: string;
  usbIfLogoName: string;
  description: string;
}

export interface BandwidthBreakdown {
  rawVideoGbpsPerDisplay: number;
  effectiveVideoGbpsPerDisplay: number;
  totalVideoGbps: number;
  uncompressedVideoGbps: number;
  compressedVideoGbps: number;
  dscApplied: boolean;
  dscCompressionRatio: number;
  dscTriggerReason: 'none' | 'lane_split' | 'link_congestion' | 'forced';
  dscTriggerDetail?: string;
  hasHighSpeedPeripherals: boolean;
  dpAltModeLanes: 2 | 4;
  dpAltModeMaxVideoGbps: number;
  isDpAltModeCompatible: boolean;
  storageGbps: number;
  ethernetGbps: number;
  webcamGbps: number;
  kbMouseGbps: number;
  customPeripheralsGbps: number;
  totalDataGbps: number;
  peripheralGbps: number;
  protocolOverheadGbps: number;
  totalRequiredGbps: number;
  isDpAltMode2LaneSplit: boolean;
  connectionMode: 'dp_alt_mode_2lane' | 'dp_alt_mode_4lane' | 'tunneling' | 'usb_data_only';
  videoLaneCapacityGbps: number;
  dataLaneCapacityGbps: number;
  videoHeadroomPercent: number;
  dataHeadroomPercent: number;
  isImpossibleConfig?: boolean;
  isAsymmetricLinkActive?: boolean;
}

export interface PowerRequirements {
  targetWatts: number;
  targetAmps: number;
  targetVolts: number;
  requiresEMarker: boolean;
  isEpr: boolean;
  specificationName: string;
  powerLabel: string;
}

export interface CableRecommendation {
  recommendedTier: CableTierSpec;
  isBandwidthSaturated: boolean;
  isImpossibleConfig: boolean;
  isAsymmetricLinkActive: boolean;
  bandwidthHeadroomPercent: number;
  bandwidthBreakdown: BandwidthBreakdown;
  powerRequirements: PowerRequirements;
  isLengthFeasiblePassive: boolean;
  isLengthFeasibleActive: boolean;
  activeCableRequired: boolean;
  lengthWarning?: string;
  bottlenecks: string[];
  featuresRequiringThunderbolt: string[];
  recommendationSummary: string;
  shoppingChecklist: string[];
  actionableSuggestions?: string[];
}

export interface KnownCable {
  id: string;
  name: string;
  tierId: CableTierId;
  wattageRating: number;
  isEpr: boolean;
  lengthMeters: number;
  isActive: boolean;
  vendor: string;
  description: string;
}

export interface CableCompatibilityTestResult {
  cable: KnownCable;
  isCompatible: boolean;
  issues: string[];
  warnings: string[];
  bandwidthUtilizationPercent: number;
  powerSupportOk: boolean;
  lengthOk: boolean;
  videoSupportOk: boolean;
}

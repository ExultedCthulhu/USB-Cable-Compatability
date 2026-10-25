/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BandwidthBreakdown,
  CableCalculationInput,
  CableRecommendation,
  CableTierId,
  CableTierSpec,
  PowerRequirements,
} from '../types/calculator';
import {
  CABLE_TIER_SPECS,
  CABLE_TIER_ORDER,
  IMPOSSIBLE_TIER_SPEC,
  ETHERNET_PRESETS,
  POWER_PRESETS,
  REFRESH_RATE_PRESETS,
  RESOLUTION_PRESETS,
  STORAGE_PRESETS,
} from './standardsData';

/**
 * Calculates raw video bandwidth per display using VESA CVT-RBv2 blanking timing.
 */
export function calculateRawVideoBandwidth(
  width: number,
  height: number,
  refreshRate: number,
  colorDepth: number, // 8, 10, 12, 16
  colorFormat: 'RGB_444' | 'YCbCr_422' | 'YCbCr_420'
): { rawGbps: number; pixelClockMHz: number; bitsPerPixel: number } {
  // Bits per pixel calculation based on chroma subsampling
  let bitsPerPixel: number;
  if (colorFormat === 'RGB_444') {
    bitsPerPixel = colorDepth * 3; // e.g. 8*3=24, 10*3=30
  } else if (colorFormat === 'YCbCr_422') {
    bitsPerPixel = colorDepth * 2; // e.g. 10*2=20
  } else {
    // YCbCr 4:2:0
    bitsPerPixel = colorDepth * 1.5; // e.g. 10*1.5=15
  }

  // CVT-RBv2 (Coordinated Video Timing - Reduced Blanking v2)
  // Horizontal blanking is fixed at 80 clocks for <= 60Hz or slightly scaled for high refresh
  const horizontalBlanking = Math.max(80, Math.round(width * 0.045));
  const totalHorizontal = width + horizontalBlanking;

  // Vertical blanking typically 32-45 lines for reduced blanking
  const verticalBlanking = Math.max(30, Math.round(height * 0.018));
  const totalVertical = height + verticalBlanking;

  // Pixel clock in MHz
  const pixelClockHz = totalHorizontal * totalVertical * refreshRate;
  const pixelClockMHz = pixelClockHz / 1_000_000;

  // Raw bandwidth in Gbps
  const rawBitsPerSecond = pixelClockHz * bitsPerPixel;
  const rawGbps = rawBitsPerSecond / 1_000_000_000;

  return {
    rawGbps: Number(rawGbps.toFixed(2)),
    pixelClockMHz: Number(pixelClockMHz.toFixed(1)),
    bitsPerPixel,
  };
}

/**
 * Determines the minimum HDMI and DisplayPort standard versions required to run
 * the single-display configuration uncompressed.
 *
 * Uncompressed Video Payload limits:
 * - HDMI 1.4: <= 8.16 Gbps (10.2 Gbps signalling with 8b/10b)
 * - HDMI 2.0: <= 14.40 Gbps (18.0 Gbps signalling with 8b/10b)
 * - HDMI 2.1: <= 42.67 Gbps (48.0 Gbps FRL6 with 16b/18b)
 * - HDMI 2.1+: > 42.67 Gbps
 *
 * - DP 1.2: <= 17.28 Gbps (4 lanes HBR2 with 8b/10b)
 * - DP 1.4: <= 25.92 Gbps (4 lanes HBR3 with 8b/10b)
 * - DP 2.0: <= 77.37 Gbps (4 lanes UHBR20 with 128b/132b)
 * - DP 2.0+: > 77.37 Gbps
 */
export function getRequiredHdmiDpVersions(rawGbps: number): string {
  let hdmi: string;
  if (rawGbps <= 8.16) {
    hdmi = 'HDMI 1.4';
  } else if (rawGbps <= 14.40) {
    hdmi = 'HDMI 2.0';
  } else if (rawGbps <= 42.67) {
    hdmi = 'HDMI 2.1';
  } else {
    hdmi = 'HDMI 2.1+';
  }

  let dp: string;
  if (rawGbps <= 17.28) {
    dp = 'DP 1.2';
  } else if (rawGbps <= 25.92) {
    dp = 'DP 1.4';
  } else if (rawGbps <= 77.37) {
    dp = 'DP 2.0';
  } else {
    dp = 'DP 2.0+';
  }

  return `${hdmi} / ${dp}`;
}

/**
 * Computes all bandwidth components, power needs, and determines the optimal cable.
 * Evaluates lowest viable cable tier FIRST and models DisplayPort Alt Mode physical lane-splitting.
 */
export function computeCableRecommendation(input: CableCalculationInput): CableRecommendation {
  const { display, peripherals, power, desiredLengthMeters } = input;

  // 1. Resolve Display Dimensions & Refresh
  const width =
    display.resolutionPreset === 'custom'
      ? Math.max(640, display.customWidth || 1920)
      : RESOLUTION_PRESETS[display.resolutionPreset].width;

  const height =
    display.resolutionPreset === 'custom'
      ? Math.max(480, display.customHeight || 1080)
      : RESOLUTION_PRESETS[display.resolutionPreset].height;

  const refreshRate =
    display.refreshRatePreset === 'custom'
      ? Math.max(24, display.customRefreshRate || 60)
      : REFRESH_RATE_PRESETS[display.refreshRatePreset].rate;

  const numDisplays = Math.max(1, display.displayCount || 1);

  // 2. Video Bandwidth Metrics
  const { rawGbps: rawVideoPerDisplay } = calculateRawVideoBandwidth(
    width,
    height,
    refreshRate,
    display.colorDepth,
    display.colorFormat
  );

  const uncompressedVideoGbps = Number((rawVideoPerDisplay * numDisplays).toFixed(2));
  const dscCompressionRatio = 3.0; // VESA DSC 1.2a visually lossless 3:1 ratio
  const compressedVideoGbps = Number((uncompressedVideoGbps / dscCompressionRatio).toFixed(2));

  // 3. Peripheral Bandwidth Metrics
  const kbMouseGbps = peripherals.hasStandardKbMouse ? 0.05 : 0; // Standard USB 2.0 HID on D+/D- pins
  const storageGbps = STORAGE_PRESETS[peripherals.storagePreset]?.bandwidthGbps || 0;

  const ethernetGbps =
    peripherals.ethernetPreset === 'custom'
      ? Number(((peripherals.customEthernetMbps || 1000) / 1000).toFixed(2))
      : ETHERNET_PRESETS[peripherals.ethernetPreset]?.bandwidthGbps || 0;

  let webcamGbps = 0;
  if (peripherals.webcamPreset === '1080p') {
    webcamGbps = 0.5;
  } else if (peripherals.webcamPreset === '4k_uncompressed') {
    webcamGbps = 5.0;
  }

  const customPeripheralsGbps = Math.max(0, peripherals.customBandwidthGbps || 0);

  // High-Speed USB 3.x peripherals (residing on high-speed differential pairs)
  const highSpeedDataGbps = Number(
    (storageGbps + ethernetGbps + webcamGbps + customPeripheralsGbps).toFixed(2)
  );

  // Total data bandwidth (including USB 2.0 HID)
  const totalDataGbps = Number((kbMouseGbps + highSpeedDataGbps).toFixed(2));

  // High-speed peripheral presence test: if USB 3.x storage, 1G+ ethernet, or webcam is used (>0.48 Gbps)
  const hasHighSpeedPeripherals = highSpeedDataGbps > 0.48;

  // Protocol packaging & framing overhead (~4-5%, min 0.2 Gbps)
  const protocolOverheadGbps = Number(
    Math.max(0.2, (totalDataGbps + uncompressedVideoGbps) * 0.04).toFixed(2)
  );

  // Peripheral throughput including its protocol framing
  const peripheralGbps = Number(
    (totalDataGbps + Math.max(0.2, totalDataGbps * 0.05)).toFixed(2)
  );

  // 4. Physical DisplayPort Alt Mode Lane-Splitting Architecture (Non-USB4 / Non-Thunderbolt)
  // Standard USB-C 3.2 has 4 high-speed differential pairs:
  // - If high-speed USB 3.x peripherals are present: 2 lanes for USB 3.x data, leaving only 2 lanes for DisplayPort.
  //   2 lanes DP 1.4 (HBR3) = 12.96 Gbps max payload.
  // - If ONLY USB 2.0 peripherals (HID) are present: All 4 lanes can be dedicated to DisplayPort.
  //   4 lanes DP 1.4 (HBR3) = 25.92 Gbps max payload.
  const dpAltModeLanes: 2 | 4 = hasHighSpeedPeripherals ? 2 : 4;
  const dpAltModeMaxVideoGbps = dpAltModeLanes === 2 ? 12.96 : 25.92;
  const isDpAltModeCompatible = display.isDpAltModeCompatible !== false;

  // Identify features that strictly mandate USB4 / Thunderbolt protocol tunneling
  const featuresRequiringThunderbolt: string[] = [];
  const bottlenecks: string[] = [];

  bottlenecks.push('Display video transmission requires DisplayPort Alt Mode or Protocol Tunneling.');

  if (!isDpAltModeCompatible && numDisplays > 0) {
    featuresRequiringThunderbolt.push('DP Alt Mode is disabled/unsupported; video output requires native USB4 or Thunderbolt dynamic protocol tunneling.');
    bottlenecks.push('DP Alt Mode disabled: Video requires native USB4 or Thunderbolt protocol tunneling.');
  }

  if (peripherals.storagePreset === 'nvme_pcie') {
    featuresRequiringThunderbolt.push('PCIe NVMe SSD requires native Thunderbolt 3/4 or USB4 protocol tunneling.');
  }

  if (numDisplays > 1) {
    featuresRequiringThunderbolt.push(`Multi-monitor setup (${numDisplays} displays) requires high-bandwidth USB4 or Thunderbolt 4/5 dock tunneling.`);
  }

  // If 2-lane DP Alt Mode cannot even carry compressed video, USB4/TB is required
  if (hasHighSpeedPeripherals && compressedVideoGbps > 12.96) {
    featuresRequiringThunderbolt.push('Video stream exceeds 2-lane DP 1.4 Alt Mode physical limit (12.96 Gbps) even with DSC; requires USB4 / Thunderbolt dynamic tunneling.');
  } else if (!hasHighSpeedPeripherals && compressedVideoGbps > 25.92) {
    featuresRequiringThunderbolt.push('Video stream exceeds 4-lane DP 1.4 Alt Mode physical limit (25.92 Gbps) even with DSC; requires USB4 / Thunderbolt dynamic tunneling.');
  }

  // 5. Tier Progression & Evaluation (Lowest Viable Cable Tier First)
  // Tiers to evaluate from lowest to highest:
  // 10 Gbps (usb_3_gen2) -> 20 Gbps (usb4_20g) -> 40 Gbps (usb4_40g_tb4) -> 80 Gbps (tb5_80g)
  const candidateTierIds: CableTierId[] = [
    ...(isDpAltModeCompatible || numDisplays === 0 ? (['usb_3_gen2'] as CableTierId[]) : []),
    'usb4_20g',
    'usb4_40g_tb4',
    'tb5_80g',
  ];

  let selectedTierId: CableTierId = 'usb4_40g_tb4';
  let isDscActive = false;
  let dscTriggerReason: 'none' | 'lane_split' | 'link_congestion' | 'forced' = 'none';
  let dscTriggerDetail: string | undefined;

  // Helper function to check if uncompressed video fits within a specific tier
  const testTierUncompressed = (tierId: CableTierId): boolean => {
    const tierSpec = CABLE_TIER_SPECS[tierId];

    // If hardware requires protocol tunneling (PCIe NVMe or multi-display), non-USB4 cannot be used
    if (tierId === 'usb_3_gen2' && featuresRequiringThunderbolt.length > 0) {
      return false;
    }

    if (tierId === 'usb_3_gen2') {
      // DP Alt Mode physical lane split rules apply
      if (uncompressedVideoGbps > dpAltModeMaxVideoGbps) {
        return false;
      }
      // Data capacity check on USB 3.x lane
      if (hasHighSpeedPeripherals && highSpeedDataGbps > tierSpec.maxNetBandwidthGbps) {
        return false;
      }
      return true;
    } else {
      // USB4 / Thunderbolt: Dynamic tunneling across total aggregate bandwidth
      const totalDemand = uncompressedVideoGbps + totalDataGbps + protocolOverheadGbps;
      const tierCapacity = tierId === 'tb5_80g' ? 114.0 : tierSpec.maxNetBandwidthGbps;
      return totalDemand <= tierCapacity;
    }
  };

  // Helper function to check if compressed video fits within a specific tier
  const testTierCompressed = (tierId: CableTierId): { fits: boolean; reason: 'lane_split' | 'link_congestion' } => {
    const tierSpec = CABLE_TIER_SPECS[tierId];

    if (tierId === 'usb_3_gen2' && featuresRequiringThunderbolt.length > 0) {
      return { fits: false, reason: 'link_congestion' };
    }

    if (tierId === 'usb_3_gen2') {
      if (compressedVideoGbps > dpAltModeMaxVideoGbps) {
        return { fits: false, reason: 'lane_split' };
      }
      if (hasHighSpeedPeripherals && highSpeedDataGbps > tierSpec.maxNetBandwidthGbps) {
        return { fits: false, reason: 'link_congestion' };
      }
      const reason = (hasHighSpeedPeripherals && uncompressedVideoGbps > 12.96) ? 'lane_split' : 'link_congestion';
      return { fits: true, reason };
    } else {
      const totalDemand = compressedVideoGbps + totalDataGbps + protocolOverheadGbps;
      const tierCapacity = tierId === 'tb5_80g' ? 114.0 : tierSpec.maxNetBandwidthGbps;
      const fits = totalDemand <= tierCapacity;
      return { fits, reason: 'link_congestion' };
    }
  };

  // Execute tier evaluation based on DSC Mode
  if (display.dscMode === 'forced') {
    isDscActive = true;
    dscTriggerReason = 'forced';
    dscTriggerDetail = 'VESA Display Stream Compression forced on by user setting';

    for (const tierId of candidateTierIds) {
      const res = testTierCompressed(tierId);
      if (res.fits) {
        selectedTierId = tierId;
        break;
      }
    }
  } else if (display.dscMode === 'off') {
    isDscActive = false;
    dscTriggerReason = 'none';

    for (const tierId of candidateTierIds) {
      if (testTierUncompressed(tierId)) {
        selectedTierId = tierId;
        break;
      }
    }
    // If still not matched, fallback to highest tier tb5_80g
    if (!testTierUncompressed(selectedTierId)) {
      selectedTierId = 'tb5_80g';
    }
  } else {
    // dscMode === 'auto'
    // Evaluate lowest viable cable tier FIRST:
    // 1. Check if uncompressedVideoGbps + peripheralGbps fits within a given tier. If yes, keep DSC OFF.
    // 2. If uncompressed exceeds the current tier, check if enabling DSC allows it to fit inside the lower tier.
    //    If yes, trigger DSC so a higher-tier cable is not unnecessarily forced!
    let matched = false;

    for (const tierId of candidateTierIds) {
      // Step 1: Check uncompressed
      if (testTierUncompressed(tierId)) {
        selectedTierId = tierId;
        isDscActive = false;
        dscTriggerReason = 'none';
        matched = true;
        break;
      }

      // Step 2: Check if enabling DSC allows it to fit inside this lower tier
      const compRes = testTierCompressed(tierId);
      if (compRes.fits) {
        selectedTierId = tierId;
        isDscActive = true;
        dscTriggerReason = compRes.reason;
        dscTriggerDetail =
          compRes.reason === 'lane_split'
            ? 'Triggered by 2-lane DP Alt Mode physical pin splitting due to concurrent USB 3.x peripherals (max 12.96 Gbps video lane limit)'
            : `Triggered to fit within ${CABLE_TIER_SPECS[tierId].standardRating} cable link bandwidth`;
        matched = true;
        break;
      }
    }

    if (!matched) {
      selectedTierId = 'tb5_80g';
      isDscActive = true;
      dscTriggerReason = 'link_congestion';
      dscTriggerDetail = 'Extreme bandwidth demand; maximum compression applied';
    }
  }

  // Calculate final effective video bandwidth and total required link payload
  const effectiveVideoGbpsPerDisplay = isDscActive
    ? Number((rawVideoPerDisplay / dscCompressionRatio).toFixed(2))
    : rawVideoPerDisplay;

  const totalVideoGbps = Number((effectiveVideoGbpsPerDisplay * numDisplays).toFixed(2));
  const totalRequiredGbps = Number(
    (totalVideoGbps + totalDataGbps + protocolOverheadGbps).toFixed(2)
  );

  // Hard Link-Capacity Boundary: Maximum single-cable physical capacity is ~114 Gbps usable payload (120 Gbps asymmetric)
  const isImpossibleConfig = totalRequiredGbps > 114.0;
  const isAsymmetricLinkActive =
    !isImpossibleConfig && selectedTierId === 'tb5_80g' && totalRequiredGbps > 76.0;

  if (dscTriggerReason === 'lane_split') {
    bottlenecks.push(
      '2-Lane DP Alt Mode Split: USB 3.x peripherals reserve 2 differential pairs. Video is restricted to 12.96 Gbps, requiring DSC compression.'
    );
  }

  if (isAsymmetricLinkActive) {
    bottlenecks.push(
      'Thunderbolt 5 Asymmetric Link Active: Link dynamically reconfigures to sustained 3-lane downstream transmit (120 Gbps raw / ~114 Gbps net payload) + 1-lane upstream to drive heavy display bandwidth.'
    );
  }

  if (isImpossibleConfig) {
    bottlenecks.push(
      `Exceeds maximum single-cable hardware capacity: Required link bandwidth (${totalRequiredGbps} Gbps) exceeds the 120 Gbps Asymmetric Link limit (~114 Gbps usable payload) of a Thunderbolt 5 cable.`
    );
  }

  const recommendedTier: CableTierSpec = isImpossibleConfig
    ? IMPOSSIBLE_TIER_SPEC
    : isAsymmetricLinkActive
    ? {
        ...CABLE_TIER_SPECS.tb5_80g,
        standardRating: '120 Gbps Asymmetric',
        marketingName: 'Thunderbolt 5 Cable (120 Gbps Asymmetric)',
        maxNetBandwidthGbps: 114.0,
      }
    : CABLE_TIER_SPECS[selectedTierId];

  // Connection Architecture & Channel Isolation
  const isDpAltMode2LaneSplit =
    !isImpossibleConfig &&
    (selectedTierId === 'usb_3_gen2' || selectedTierId === 'usb_3_gen1') &&
    dpAltModeLanes === 2;

  let connectionMode: 'dp_alt_mode_2lane' | 'dp_alt_mode_4lane' | 'tunneling' | 'usb_data_only';
  if (isImpossibleConfig) {
    connectionMode = 'tunneling';
  } else if (selectedTierId === 'usb_2_0') {
    connectionMode = 'usb_data_only';
  } else if (isDpAltMode2LaneSplit) {
    connectionMode = 'dp_alt_mode_2lane';
  } else if (selectedTierId === 'usb_3_gen2' || selectedTierId === 'usb_3_gen1') {
    connectionMode = 'dp_alt_mode_4lane';
  } else {
    connectionMode = 'tunneling';
  }

  const videoLaneCapacityGbps = isDpAltMode2LaneSplit
    ? 12.96
    : connectionMode === 'dp_alt_mode_4lane'
    ? 25.92
    : recommendedTier.maxNetBandwidthGbps;

  const dataLaneCapacityGbps = recommendedTier.maxNetBandwidthGbps;

  // Headroom & Saturation calculation
  let isBandwidthSaturated = false;
  let bandwidthHeadroomPercent = 0;
  let videoHeadroomPercent = 0;
  let dataHeadroomPercent = 0;

  if (isImpossibleConfig) {
    isBandwidthSaturated = true;
    bandwidthHeadroomPercent = 0;
    videoHeadroomPercent = 0;
    dataHeadroomPercent = 0;
  } else if (isDpAltMode2LaneSplit) {
    const isVideoSaturated = totalVideoGbps > videoLaneCapacityGbps;
    const isDataSaturated = highSpeedDataGbps > dataLaneCapacityGbps;
    isBandwidthSaturated = isVideoSaturated || isDataSaturated;

    videoHeadroomPercent = Math.max(
      0,
      Math.round(((videoLaneCapacityGbps - totalVideoGbps) / videoLaneCapacityGbps) * 100)
    );
    dataHeadroomPercent = Math.max(
      0,
      Math.round(((dataLaneCapacityGbps - highSpeedDataGbps) / dataLaneCapacityGbps) * 100)
    );
    bandwidthHeadroomPercent = Math.min(videoHeadroomPercent, dataHeadroomPercent);
  } else {
    const maxNetBandwidth = recommendedTier.maxNetBandwidthGbps;
    isBandwidthSaturated = totalRequiredGbps > maxNetBandwidth;
    bandwidthHeadroomPercent = Math.max(
      0,
      Math.round(((maxNetBandwidth - totalRequiredGbps) / maxNetBandwidth) * 100)
    );
    videoHeadroomPercent = bandwidthHeadroomPercent;
    dataHeadroomPercent = bandwidthHeadroomPercent;
  }

  const breakdown: BandwidthBreakdown = {
    rawVideoGbpsPerDisplay: rawVideoPerDisplay,
    effectiveVideoGbpsPerDisplay,
    totalVideoGbps,
    uncompressedVideoGbps,
    compressedVideoGbps,
    dscApplied: isDscActive,
    dscCompressionRatio,
    dscTriggerReason,
    dscTriggerDetail,
    hasHighSpeedPeripherals,
    dpAltModeLanes,
    dpAltModeMaxVideoGbps,
    isDpAltModeCompatible,
    storageGbps,
    ethernetGbps,
    webcamGbps,
    kbMouseGbps,
    customPeripheralsGbps,
    totalDataGbps,
    peripheralGbps,
    protocolOverheadGbps,
    totalRequiredGbps,
    isDpAltMode2LaneSplit,
    connectionMode,
    videoLaneCapacityGbps,
    dataLaneCapacityGbps,
    videoHeadroomPercent,
    dataHeadroomPercent,
    isImpossibleConfig,
    isAsymmetricLinkActive,
  };

  // 6. Power Delivery Requirements
  let targetWatts = 15;
  let targetAmps = 3;
  let targetVolts = 5;
  let requiresEMarker = false;
  let isEpr = false;

  if (power.pdPreset === 'custom') {
    targetWatts = Math.max(5, Math.min(240, power.customWattage || 65));
    if (targetWatts <= 15) {
      targetVolts = 5;
      targetAmps = targetWatts / 5;
    } else if (targetWatts <= 60) {
      targetVolts = 20;
      targetAmps = targetWatts / 20;
    } else if (targetWatts <= 100) {
      targetVolts = 20;
      targetAmps = 5;
      requiresEMarker = true;
    } else {
      // Extended Power Range (EPR) > 100W up to 240W
      targetVolts = targetWatts <= 140 ? 28 : 48;
      targetAmps = 5;
      requiresEMarker = true;
      isEpr = true;
    }
  } else {
    const preset = POWER_PRESETS[power.pdPreset];
    targetWatts = preset.watts;
    targetAmps = preset.amps;
    targetVolts = preset.volts;
    requiresEMarker = preset.requiresEMarker;
    isEpr = preset.isEpr;
  }

  const powerRequirements: PowerRequirements = {
    targetWatts,
    targetAmps: Number(targetAmps.toFixed(2)),
    targetVolts,
    requiresEMarker,
    isEpr,
    specificationName: isEpr
      ? `USB-PD 3.1 Extended Power Range (EPR) ${targetWatts}W`
      : targetWatts > 60
      ? `USB-PD 3.0 Standard Power Range (SPR) 100W (5A e-Marker)`
      : `USB-PD Standard Power Range (≤60W 3A)`,
    powerLabel: `${targetWatts}W (${targetVolts}V / ${targetAmps}A)`,
  };

  // 7. Length and Signal Integrity checks
  const isLengthFeasiblePassive = desiredLengthMeters <= recommendedTier.maxPassiveLengthMeters;
  const isLengthFeasibleActive = desiredLengthMeters <= recommendedTier.maxActiveLengthMeters;
  const activeCableRequired = !isLengthFeasiblePassive && isLengthFeasibleActive;

  let lengthWarning: string | undefined;
  if (!isLengthFeasibleActive) {
    lengthWarning = `Desired cable length (${desiredLengthMeters}m) exceeds the maximum specification limit (${recommendedTier.maxActiveLengthMeters}m) for ${recommendedTier.officialName}. Signal degradation or total connection failure will occur unless using specialized optical Thunderbolt / USB-C extension systems.`;
  } else if (activeCableRequired) {
    lengthWarning = `Desired cable length (${desiredLengthMeters}m) exceeds the ${recommendedTier.maxPassiveLengthMeters}m passive limit. An ACTIVE cable (with built-in redriver/retimer chipset) is strictly required to maintain full ${recommendedTier.standardRating} speed and signal integrity.`;
  }

  // 8. Shopping checklist items
  const shoppingChecklist: string[] = [];
  const actionableSuggestions: string[] = [
    'Enable DSC (Display Stream Compression) to reduce video stream requirements by up to 66%.',
    'Lower color depth from 16-bit / 10-bit to standard 8-bit.',
    'Reduce refresh rate to 120 Hz or 60 Hz.',
    'Split displays across two independent host ports / cables instead of running a single-cable daisy chain / dock.',
  ];

  if (!isImpossibleConfig) {
    shoppingChecklist.push(
      `Standard: Look for certified "${recommendedTier.marketingName}" or "${recommendedTier.officialName}"`,
      `Bandwidth Rating: Minimum ${recommendedTier.standardRating} stamped or certified`
    );

    if (isEpr) {
      shoppingChecklist.push(
        `Power Rating: Must be EPR 240W (Extended Power Range) certified with e-Marker (up to 48V/5A)`
      );
    } else if (requiresEMarker) {
      shoppingChecklist.push(
        `Power Rating: Must be 100W (5A) certified with integrated e-Marker chip`
      );
    } else {
      shoppingChecklist.push(`Power Rating: Minimum 60W (3A) Standard USB-PD`);
    }

    if (activeCableRequired) {
      shoppingChecklist.push(
        `Cable Type: ACTIVE cable required for ${desiredLengthMeters}m reach (verify active retimer in specifications)`
      );
    } else {
      shoppingChecklist.push(
        `Cable Type: Passive cable is supported up to ${recommendedTier.maxPassiveLengthMeters}m`
      );
    }

    shoppingChecklist.push(`Official Logo: Check for official ${recommendedTier.usbIfLogoName} packaging logo`);
  }

  // Summary message
  const recommendationSummary = isImpossibleConfig
    ? `This display configuration requires ${totalVideoGbps} Gbps of ${display.dscMode === 'off' ? 'uncompressed ' : ''}bandwidth, which exceeds the absolute physical limit of a single USB-C / Thunderbolt 5 cable (120 Gbps asymmetric limit).`
    : isDpAltMode2LaneSplit
    ? `Based on your setup operating in DisplayPort Alt Mode (2-lane physical split: Video ${totalVideoGbps} Gbps on dedicated DP pairs · Data ${totalDataGbps} Gbps on USB 3.x pairs) and ${targetWatts}W Power Delivery, you need a certified ${recommendedTier.officialName} (${recommendedTier.standardRating}) ${isEpr ? 'with 240W EPR certification' : requiresEMarker ? 'with 100W (5A) e-Marker' : ''}. The cable utilizes separate physical pairs providing over 22 Gbps aggregate throughput (up to 12.96 Gbps dedicated video + 10 Gbps USB data).`
    : `Based on your setup requiring ${totalRequiredGbps} Gbps unified tunneled bandwidth and ${targetWatts}W Power Delivery, you need a certified ${recommendedTier.officialName} (${recommendedTier.standardRating}) ${isEpr ? 'with 240W EPR certification' : requiresEMarker ? 'with 100W (5A) e-Marker' : ''}.`;

  return {
    recommendedTier,
    isBandwidthSaturated,
    isImpossibleConfig,
    isAsymmetricLinkActive,
    bandwidthHeadroomPercent,
    bandwidthBreakdown: breakdown,
    powerRequirements,
    isLengthFeasiblePassive,
    isLengthFeasibleActive,
    activeCableRequired,
    lengthWarning: isImpossibleConfig ? undefined : lengthWarning,
    bottlenecks,
    featuresRequiringThunderbolt,
    recommendationSummary,
    shoppingChecklist,
    actionableSuggestions: isImpossibleConfig ? actionableSuggestions : undefined,
  };
}

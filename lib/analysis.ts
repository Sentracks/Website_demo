import { differenceInMinutes } from 'date-fns';
import { CarrierScore, Shipment, ShipmentAnalysis, TemperatureLog } from './types';

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function stdDev(values: number[]): number {
  if (!values.length) return 0;
  const avg = values.reduce((sum, item) => sum + item, 0) / values.length;
  const variance = values.reduce((sum, item) => sum + (item - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function analyzeShipment(shipment: Shipment, logs: TemperatureLog[]): ShipmentAnalysis {
  const sorted = [...logs].sort((a, b) => +new Date(a.recordedAt) - +new Date(b.recordedAt));
  const temps = sorted.map((log) => log.temperature);
  const avgTemp = temps.length ? temps.reduce((sum, t) => sum + t, 0) / temps.length : 0;
  const minTemp = temps.length ? Math.min(...temps) : 0;
  const maxTemp = temps.length ? Math.max(...temps) : 0;
  const tempStdDev = stdDev(temps);

  let excursionCount = 0;
  let totalExcursionMinutes = 0;
  let longestExcursionMinutes = 0;
  let inExcursion = false;
  let currentExcursionStart: string | null = null;

  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const isOutOfRange = current.temperature < shipment.targetTempMin || current.temperature > shipment.targetTempMax;

    if (isOutOfRange && !inExcursion) {
      inExcursion = true;
      excursionCount += 1;
      currentExcursionStart = current.recordedAt;
    }

    if (inExcursion && next) {
      const segmentMinutes = Math.max(0, differenceInMinutes(new Date(next.recordedAt), new Date(current.recordedAt)));
      totalExcursionMinutes += segmentMinutes;
    }

    const nextIsOutOfRange = next
      ? next.temperature < shipment.targetTempMin || next.temperature > shipment.targetTempMax
      : false;

    if (inExcursion && (!next || !nextIsOutOfRange)) {
      const endTime = next ? next.recordedAt : current.recordedAt;
      const startTime = currentExcursionStart ?? current.recordedAt;
      const excursionMinutes = Math.max(0, differenceInMinutes(new Date(endTime), new Date(startTime)));
      longestExcursionMinutes = Math.max(longestExcursionMinutes, excursionMinutes);
      inExcursion = false;
      currentExcursionStart = null;
    }
  }

  const compliancePenalty = totalExcursionMinutes * 0.9 + excursionCount * 6 + Math.max(0, maxTemp - shipment.targetTempMax) * 4;
  const stabilityPenalty = tempStdDev * 10;
  const recoveryPenalty = Math.max(0, longestExcursionMinutes - 15) * 0.8;

  const complianceScore = Math.max(0, round(50 - compliancePenalty));
  const stabilityScore = Math.max(0, round(20 - stabilityPenalty));
  const recoveryScore = Math.max(0, round(15 - recoveryPenalty));
  const punctualityScore = 15;
  const overallScore = Math.max(0, round(complianceScore + stabilityScore + recoveryScore + punctualityScore));

  const riskLevel: ShipmentAnalysis['riskLevel'] = overallScore >= 90 ? 'low' : overallScore >= 75 ? 'medium' : 'high';

  const summary =
    riskLevel === 'low'
      ? 'Shipment remained largely within target range with minimal risk.'
      : riskLevel === 'medium'
        ? 'Shipment had recoverable excursions that warrant review.'
        : 'Shipment showed significant temperature control risk and should be escalated.';

  return {
    shipmentId: shipment.id,
    avgTemp: round(avgTemp),
    minTemp: round(minTemp),
    maxTemp: round(maxTemp),
    tempStdDev: round(tempStdDev),
    excursionCount,
    totalExcursionMinutes,
    longestExcursionMinutes,
    recoveryScore,
    stabilityScore,
    complianceScore,
    overallScore,
    riskLevel,
    summary,
    updatedAt: new Date().toISOString()
  };
}

export function buildCarrierScore(carrierId: string, shipments: Shipment[], analyses: ShipmentAnalysis[]): CarrierScore {
  const relevantShipments = shipments.filter((shipment) => shipment.carrierId === carrierId);
  const relevantAnalyses = analyses.filter((analysis) =>
    relevantShipments.some((shipment) => shipment.id === analysis.shipmentId)
  );

  const shipmentCount = relevantShipments.length;
  const complianceRate = shipmentCount
    ? round((relevantAnalyses.filter((item) => item.totalExcursionMinutes === 0).length / shipmentCount) * 100)
    : 0;
  const averageExcursionMinutes = relevantAnalyses.length
    ? round(relevantAnalyses.reduce((sum, item) => sum + item.totalExcursionMinutes, 0) / relevantAnalyses.length)
    : 0;
  const averageScore = relevantAnalyses.length
    ? round(relevantAnalyses.reduce((sum, item) => sum + item.overallScore, 0) / relevantAnalyses.length)
    : 0;
  const grade: CarrierScore['grade'] = averageScore >= 90 ? 'A' : averageScore >= 80 ? 'B' : averageScore >= 70 ? 'C' : 'D';

  return {
    carrierId,
    shipmentCount,
    complianceRate,
    averageExcursionMinutes,
    averageScore,
    grade,
    updatedAt: new Date().toISOString()
  };
}

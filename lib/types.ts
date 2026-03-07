export type Carrier = {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
};

export type Shipment = {
  id: string;
  shipmentCode: string;
  carrierId: string;
  productType: string;
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  targetTempMin: number;
  targetTempMax: number;
  status: 'in_transit' | 'completed' | 'flagged';
};

export type TemperatureLog = {
  id: string;
  shipmentId: string;
  recordedAt: string;
  temperature: number;
  sensorId: string;
  locationText: string;
};

export type ShipmentAnalysis = {
  shipmentId: string;
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  tempStdDev: number;
  excursionCount: number;
  totalExcursionMinutes: number;
  longestExcursionMinutes: number;
  recoveryScore: number;
  stabilityScore: number;
  complianceScore: number;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  updatedAt: string;
};

export type CarrierScore = {
  carrierId: string;
  shipmentCount: number;
  complianceRate: number;
  averageExcursionMinutes: number;
  averageScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  updatedAt: string;
};

export type DatabaseShape = {
  carriers: Carrier[];
  shipments: Shipment[];
  temperatureLogs: TemperatureLog[];
  shipmentAnalyses: ShipmentAnalysis[];
  carrierScores: CarrierScore[];
};

export type ExternalTemperatureFeedItem = {
  shipmentCode: string;
  recordedAt: string;
  temperature: number;
  sensorId: string;
  locationText: string;
};

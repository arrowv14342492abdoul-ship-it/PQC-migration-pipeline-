export type PurdueLevel =
  | 'Level 0: Physical Process (Sensors & Actuators)'
  | 'Level 1: Basic Control (PLCs, RTUs, IEDs)'
  | 'Level 2: Supervisory Control (HMIs, SCADA)'
  | 'Level 3: Site Operations & Engineering Workstations'
  | 'Level 3.5: Industrial DMZ & Data Diodes'
  | 'Level 4/5: Enterprise IT & Cloud Analytics';

export type OTProtocol =
  | 'Modbus TCP'
  | 'DNP3 Secure'
  | 'OPC UA (IEC 62541)'
  | 'EtherNet/IP & CIP'
  | 'BACnet/SC'
  | 'IEC 61850 (Substations)'
  | 'PROFINET'
  | 'CANopen';

export type ZeroTrustPillar =
  | 'User & Identity (ICAM)'
  | 'Device & Hardware Trust'
  | 'Network & Microsegmentation'
  | 'Application & Workload'
  | 'Data & Command Protection'
  | 'Visibility & Analytics'
  | 'Automation & AI Governance';

export interface NSACSIControl {
  id: string;
  pillar: ZeroTrustPillar;
  purdueLevels: string[];
  title: string;
  nsaGuidanceSnippet: string;
  technicalRequirement: string;
  legacyFlaw: string;
  zeroTrustRemediation: string;
  cryptographicStandard: string;
  priority: 'MANDATORY (CRITICAL)' | 'HIGH (PHASE 1)' | 'RECOMMENDED (PHASE 2)';
  status: 'COMPLIANT' | 'NEEDS_HARDENING' | 'DEFICIENT';
}

export interface OTSectorProfile {
  id: string;
  name: string;
  description: string;
  criticalAssets: string[];
  primaryProtocols: OTProtocol[];
  threatVector: string;
  mitigationHighlight: string;
}

export interface OTCommandSimulation {
  protocol: OTProtocol;
  targetDevice: string;
  functionCode: string;
  payload: string;
  timestamp: string;
  isSigned: boolean;
  pqcSignature?: string;
  status: 'PERMITTED' | 'BLOCKED_BY_ZERO_TRUST' | 'REPLAY_ATTACK_DETECTED';
  verificationLog: string[];
}

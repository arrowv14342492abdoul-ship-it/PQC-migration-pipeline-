import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Network,
  Shield,
  Key,
  Lock,
  Cpu,
  Radio,
  Radar,
  Eye,
  Crosshair,
  Zap,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Activity,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Share2,
  Terminal,
  Binary,
  Check,
  Info,
  Clock,
  HardDrive,
  Copy,
  Sliders,
  Move,
  CornerDownRight,
  Route,
  ArrowUpRight,
} from 'lucide-react';
import { F22FlightMode, F22AvionicsSubsystem } from '../../types/f22Simulator';
import { F22_AVIONICS_SUBSYSTEMS, F22_PQC_MODE_PRESETS } from '../../data/f22SimulatorData';

export interface PqcHybridConfig {
  isPqcHybrid: boolean;
  hybridType: 'ML-KEM-768' | 'ML-KEM-1024' | 'ML-KEM-512' | 'ML-DSA-65' | 'ML-DSA-87' | 'CLASSICAL_ONLY';
  kemSpec: string;
  classicalPartner: string;
  kdfCombiner: string;
  dsaSpec: string;
  classicalDsaPartner: string;
  quantumResistanceBits: number;
  securityCategory: string;
  publicKeyBytes: number;
  ciphertextBytes: number;
  sharedSecretBytes: number;
  encapLatencyUs: number;
  decapLatencyUs: number;
  verifiedThroughput: string;
}

export interface PathNodeDatum extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  acronym: string;
  subsystemRole: string;
  cipHost: string;
  category: 'Core CIP' | 'Sensors' | 'Flight Controls' | 'Weapons' | 'Cryptoprocessor' | 'Tactical Mesh';
  pqcHybrid: PqcHybridConfig;
  busInterfaces: string[];
  nominalThroughputMbps: number;
  radius: number;
  clusterGroup: number;
}

export interface PathLinkDatum extends d3.SimulationLinkDatum<PathNodeDatum> {
  id: string;
  source: string | PathNodeDatum;
  target: string | PathNodeDatum;
  label: string;
  protocol: 'Fibre Channel (400 Mbps)' | 'MIL-STD-1553B' | 'IEEE-1394B FireWire' | 'IFDL Directional Ku-Band';
  bandwidthMbps: number;
  latencyUs: number;
  isHybridPath: boolean;
  cryptoType: 'ML-KEM Session' | 'ML-DSA Signed' | 'Hybrid KEM+DSA' | 'MIL-Bus Raw';
  status: 'ACTIVE' | 'ENCRYPTED' | 'AUTHENTICATED' | 'LPI_ENGAGED';
  bidirectional: boolean;
  packetCount: number;
}

// 12 Authentic F-22 Raptor Avionics Subsystems with Rich PQC-Hybrid Data
const COMMUNICATION_NODES: PathNodeDatum[] = [
  {
    id: 'cip-1',
    name: 'Common Integrated Processor 1',
    acronym: 'CIP 1',
    subsystemRole: 'Sensor Fusion, AESA Signal Processing & Mission Master',
    cipHost: 'CIP 1 Chassis',
    category: 'Core CIP',
    radius: 36,
    clusterGroup: 0,
    nominalThroughputMbps: 400,
    busInterfaces: ['Fibre Channel', 'MIL-STD-1553B', 'High-Speed Optical'],
    pqcHybrid: {
      isPqcHybrid: true,
      hybridType: 'ML-KEM-1024',
      kemSpec: 'NIST FIPS 203 ML-KEM-1024',
      classicalPartner: 'X25519 (ECDH Curve25519)',
      kdfCombiner: 'NIST SP 800-56C Rev 2 (HKDF-SHA384)',
      dsaSpec: 'NIST FIPS 204 ML-DSA-87',
      classicalDsaPartner: 'Ed25519 Sovereign Signature',
      quantumResistanceBits: 256,
      securityCategory: 'Category 5 (CNSA 2.0 Top Secret)',
      publicKeyBytes: 1568,
      ciphertextBytes: 1568,
      sharedSecretBytes: 32,
      encapLatencyUs: 42,
      decapLatencyUs: 48,
      verifiedThroughput: '10,000 Key Exchanges / sec',
    },
  },
  {
    id: 'cip-2',
    name: 'Common Integrated Processor 2',
    acronym: 'CIP 2',
    subsystemRole: 'Stores Release, Electronic Warfare & RACR OMS Kernel',
    cipHost: 'CIP 2 Chassis',
    category: 'Core CIP',
    radius: 36,
    clusterGroup: 0,
    nominalThroughputMbps: 400,
    busInterfaces: ['Fibre Channel', 'MIL-STD-1553B', 'IEEE-1394B FireWire'],
    pqcHybrid: {
      isPqcHybrid: true,
      hybridType: 'ML-KEM-768',
      kemSpec: 'NIST FIPS 203 ML-KEM-768',
      classicalPartner: 'X25519 (32-Byte ECDH)',
      kdfCombiner: 'NIST SP 800-56C Rev 2 (HKDF-SHA384)',
      dsaSpec: 'NIST FIPS 204 ML-DSA-65',
      classicalDsaPartner: 'ECDSA P-256 / Ed25519',
      quantumResistanceBits: 192,
      securityCategory: 'Category 3 (Tactical High-Rate)',
      publicKeyBytes: 1184,
      ciphertextBytes: 1088,
      sharedSecretBytes: 32,
      encapLatencyUs: 28,
      decapLatencyUs: 33,
      verifiedThroughput: '15,000 Key Exchanges / sec',
    },
  },
  {
    id: 'apg-77',
    name: 'AN/APG-77 AESA Radar',
    acronym: 'APG-77',
    subsystemRole: '1,956 T/R Modules LPI Beam Steering & Active Search',
    cipHost: 'CIP 1 Pre-Processor',
    category: 'Sensors',
    radius: 28,
    clusterGroup: 1,
    nominalThroughputMbps: 400,
    busInterfaces: ['High-Speed Optical', 'MIL-STD-1553B'],
    pqcHybrid: {
      isPqcHybrid: true,
      hybridType: 'ML-KEM-768',
      kemSpec: 'NIST FIPS 203 ML-KEM-768 Ephemeral Stream',
      classicalPartner: 'X25519 Dual-Rail KEM',
      kdfCombiner: 'Two-Step Concatenation KDF (SP 800-56C)',
      dsaSpec: 'NIST FIPS 204 ML-DSA-65 Frame Authenticator',
      classicalDsaPartner: 'ECDSA P-256',
      quantumResistanceBits: 192,
      securityCategory: 'Category 3 (Secret)',
      publicKeyBytes: 1184,
      ciphertextBytes: 1088,
      sharedSecretBytes: 32,
      encapLatencyUs: 32,
      decapLatencyUs: 36,
      verifiedThroughput: '5,000 Radar Frames / sec',
    },
  },
  {
    id: 'alr-94',
    name: 'AN/ALR-94 Passive EW Suite',
    acronym: 'ALR-94',
    subsystemRole: '360° Spherical Threat Geolocation & Passive Ranging',
    cipHost: 'CIP 1 EW Core',
    category: 'Sensors',
    radius: 28,
    clusterGroup: 1,
    nominalThroughputMbps: 400,
    busInterfaces: ['Fibre Channel Optical', 'MIL-STD-1553B'],
    pqcHybrid: {
      isPqcHybrid: true,
      hybridType: 'ML-KEM-768',
      kemSpec: 'NIST FIPS 203 ML-KEM-768 Optical Pipe',
      classicalPartner: 'X25519 (ECDH Session)',
      kdfCombiner: 'NIST SP 800-56C Rev 2 Two-Step HKDF',
      dsaSpec: 'NIST FIPS 204 ML-DSA-65 Geolocation Seal',
      classicalDsaPartner: 'Ed25519 Emitter Seal',
      quantumResistanceBits: 192,
      securityCategory: 'Category 3 (Secret)',
      publicKeyBytes: 1184,
      ciphertextBytes: 1088,
      sharedSecretBytes: 32,
      encapLatencyUs: 31,
      decapLatencyUs: 35,
      verifiedThroughput: '1,200 Threat Fixes / sec',
    },
  },
  {
    id: 'cni-vault',
    name: 'CNI Quantum Cryptoprocessor',
    acronym: 'CNI Vault',
    subsystemRole: 'Quantum TRNG Entropy, Root Seed Storage & Tamper Boundary',
    cipHost: 'Cryogenic HSM Enclave',
    category: 'Cryptoprocessor',
    radius: 30,
    clusterGroup: 1,
    nominalThroughputMbps: 100,
    busInterfaces: ['Fibre Channel', 'MIL-STD-1553B', 'Direct Optical Seed'],
    pqcHybrid: {
      isPqcHybrid: true,
      hybridType: 'ML-KEM-1024',
      kemSpec: 'NIST FIPS 203 ML-KEM-1024 Root Key Vault',
      classicalPartner: 'X25519 Sovereign Composite',
      kdfCombiner: 'NIST SP 800-56C Master Key Schedule',
      dsaSpec: 'NIST FIPS 204 ML-DSA-87 Sovereign CA',
      classicalDsaPartner: 'Ed25519 Root of Trust',
      quantumResistanceBits: 256,
      securityCategory: 'Category 5 (Top Secret Sovereign)',
      publicKeyBytes: 1568,
      ciphertextBytes: 1568,
      sharedSecretBytes: 32,
      encapLatencyUs: 45,
      decapLatencyUs: 52,
      verifiedThroughput: 'Continuous 2.4 Gbps TRNG Pool',
    },
  },
  {
    id: 'vms-tvc',
    name: 'Vehicle Management System (VMS)',
    acronym: 'VMS / TVC',
    subsystemRole: 'Quad-Redundant FBW Flight Control & ±20° 2D TVC Nozzles',
    cipHost: 'Distributed Flight Control',
    category: 'Flight Controls',
    radius: 28,
    clusterGroup: 2,
    nominalThroughputMbps: 1,
    busInterfaces: ['MIL-STD-1553B Dual Channel', 'MIL-STD-1773 Optical'],
    pqcHybrid: {
      isPqcHybrid: true,
      hybridType: 'ML-KEM-768',
      kemSpec: 'NIST FIPS 203 ML-KEM-768 Bus Key Schedule',
      classicalPartner: 'X25519 Microsecond Handshake',
      kdfCombiner: 'NIST SP 800-56C Fast Derivation',
      dsaSpec: 'NIST FIPS 204 ML-DSA-87 DO-178C Level A Token',
      classicalDsaPartner: 'Ed25519 Anti-Spoofing Interlock',
      quantumResistanceBits: 192,
      securityCategory: 'Category 5 Command Authenticity',
      publicKeyBytes: 1184,
      ciphertextBytes: 1088,
      sharedSecretBytes: 32,
      encapLatencyUs: 29,
      decapLatencyUs: 32,
      verifiedThroughput: '50 Hz Synchronous Avionics Loop',
    },
  },
  {
    id: 'sms-weapons',
    name: 'Stores Management System (SMS)',
    acronym: 'SMS Weapons',
    subsystemRole: 'AIM-120D / AIM-9X Missile Release & LAU-142/A Pneumatic Ejection',
    cipHost: 'CIP 2 Armament Bus',
    category: 'Weapons',
    radius: 26,
    clusterGroup: 2,
    nominalThroughputMbps: 1,
    busInterfaces: ['MIL-STD-1553B Ch-A/B', 'MIL-STD-1760 Weapon Bus'],
    pqcHybrid: {
      isPqcHybrid: true,
      hybridType: 'ML-KEM-768',
      kemSpec: 'NIST FIPS 203 ML-KEM-768 Terminal Guidance In-Bay Key',
      classicalPartner: 'X25519 Seeker Crypto Handoff',
      kdfCombiner: 'NIST SP 800-56C Two-Step HKDF',
      dsaSpec: 'NIST FIPS 204 ML-DSA-87 Master Arm Release Token',
      classicalDsaPartner: 'Ed25519 Physical Release Interlock',
      quantumResistanceBits: 192,
      securityCategory: 'Category 5 Weapon Fire Authorization',
      publicKeyBytes: 1184,
      ciphertextBytes: 1088,
      sharedSecretBytes: 32,
      encapLatencyUs: 30,
      decapLatencyUs: 34,
      verifiedThroughput: '0.8s Stealth Bay Ejection Window',
    },
  },
  {
    id: 'cockpit-mfd',
    name: 'Cockpit MFD & HUD Displays',
    acronym: 'Cockpit MFD',
    subsystemRole: '8x8 Liquid Crystal Tactical Glass & Wide-Angle HUD Symbology',
    cipHost: 'Display Processor',
    category: 'Core CIP',
    radius: 26,
    clusterGroup: 2,
    nominalThroughputMbps: 400,
    busInterfaces: ['Fibre Channel Optical Video', 'MIL-STD-1553B'],
    pqcHybrid: {
      isPqcHybrid: true,
      hybridType: 'ML-DSA-65',
      kemSpec: 'ML-KEM-768 Ephemeral Display Pipe',
      classicalPartner: 'X25519 Video Feed Stream',
      kdfCombiner: 'NIST SP 800-56C Session Combiner',
      dsaSpec: 'NIST FIPS 204 ML-DSA-65 Frame Authenticity Seal',
      classicalDsaPartner: 'ECDSA P-256 Display Digest',
      quantumResistanceBits: 192,
      securityCategory: 'Category 3 (Pilot Situational Awareness)',
      publicKeyBytes: 1184,
      ciphertextBytes: 1088,
      sharedSecretBytes: 32,
      encapLatencyUs: 25,
      decapLatencyUs: 28,
      verifiedThroughput: '60 Hz Uncompressed Video Refresh',
    },
  },
  {
    id: 'ifdl-mesh',
    name: 'IFDL Intra-Flight Datalink',
    acronym: 'IFDL Mesh',
    subsystemRole: 'Directional Ku-Band Stealth Datalink (4-Ship Raptor Cell Mesh)',
    cipHost: 'CIP 2 RF Enclave',
    category: 'Tactical Mesh',
    radius: 28,
    clusterGroup: 2,
    nominalThroughputMbps: 50,
    busInterfaces: ['MIL-STD-1553B', 'Directional Ku-Band Phased Array'],
    pqcHybrid: {
      isPqcHybrid: true,
      hybridType: 'ML-KEM-1024',
      kemSpec: 'NIST FIPS 203 ML-KEM-1024 Multi-Ship Ratchet',
      classicalPartner: 'X25519 Intra-Flight Mesh Key',
      kdfCombiner: 'NIST SP 800-56C Cyclic Ratchet (30s interval)',
      dsaSpec: 'NIST FIPS 204 ML-DSA-87 Flight Signed Tracks',
      classicalDsaPartner: 'Ed25519 Flight Token',
      quantumResistanceBits: 256,
      securityCategory: 'Category 5 (Top Secret Mesh)',
      publicKeyBytes: 1568,
      ciphertextBytes: 1568,
      sharedSecretBytes: 32,
      encapLatencyUs: 44,
      decapLatencyUs: 50,
      verifiedThroughput: 'Microsecond Directional RF Bursts',
    },
  },
  {
    id: 'cca-wingman',
    name: 'CCA Autonomous Drone Link',
    acronym: 'CCA Drone',
    subsystemRole: 'Manned-Unmanned Teaming (MUM-T) with AI Stealth Drones',
    cipHost: 'RACR OMS Engine',
    category: 'Tactical Mesh',
    radius: 26,
    clusterGroup: 2,
    nominalThroughputMbps: 400,
    busInterfaces: ['IEEE-1394B FireWire', 'Directional Wideband Datalink'],
    pqcHybrid: {
      isPqcHybrid: true,
      hybridType: 'ML-KEM-768',
      kemSpec: 'NIST FIPS 203 ML-KEM-768 Zero-Trust Pairing',
      classicalPartner: 'X25519 Autonomous Enclave',
      kdfCombiner: 'NIST SP 800-56C Rev 2 Two-Step HKDF',
      dsaSpec: 'NIST FIPS 204 ML-DSA-65 UCI Mission Orders',
      classicalDsaPartner: 'Ed25519 Tasking Signature',
      quantumResistanceBits: 192,
      securityCategory: 'Category 3 (OMS Autonomous)',
      publicKeyBytes: 1184,
      ciphertextBytes: 1088,
      sharedSecretBytes: 32,
      encapLatencyUs: 29,
      decapLatencyUs: 34,
      verifiedThroughput: '100 UCI Tasking Orders / sec',
    },
  },
  {
    id: 'bus-controller',
    name: 'Avionics Bus Controller Hub',
    acronym: 'Bus Hub',
    subsystemRole: 'Dual-Redundant MIL-1553B & Fibre Channel Backplane Switch',
    cipHost: 'Physical Backplane',
    category: 'Core CIP',
    radius: 24,
    clusterGroup: 0,
    nominalThroughputMbps: 400,
    busInterfaces: ['Fibre Channel', 'MIL-STD-1553B Dual Redundant'],
    pqcHybrid: {
      isPqcHybrid: false,
      hybridType: 'CLASSICAL_ONLY',
      kemSpec: 'AES-256-GCM Frame Wrapper (Hardware Layer)',
      classicalPartner: 'MIL-STD-1553B Manchester II Encoding',
      kdfCombiner: 'Hardware Backplane Clock',
      dsaSpec: 'Hardware Frame CRC-32 + PQC Token Wrapper',
      classicalDsaPartner: '16-bit Parity Checks',
      quantumResistanceBits: 128,
      securityCategory: 'Layer 1 Physical Transport',
      publicKeyBytes: 0,
      ciphertextBytes: 0,
      sharedSecretBytes: 32,
      encapLatencyUs: 8,
      decapLatencyUs: 8,
      verifiedThroughput: '400 Mbps Raw Wire Capacity',
    },
  },
  {
    id: 'tacan-gps',
    name: 'TACAN & SAASM Anti-Jam GPS',
    acronym: 'TACAN/GPS',
    subsystemRole: 'Tactical Air Navigation & Selective Availability Spoof-Proof GPS',
    cipHost: 'Nav Subsystem',
    category: 'Sensors',
    radius: 24,
    clusterGroup: 1,
    nominalThroughputMbps: 1,
    busInterfaces: ['MIL-STD-1553B Ch-A/B'],
    pqcHybrid: {
      isPqcHybrid: true,
      hybridType: 'ML-KEM-512',
      kemSpec: 'NIST FIPS 203 ML-KEM-512 Compact Nav Key',
      classicalPartner: 'NIST P-256 ECDH',
      kdfCombiner: 'SP 800-56A / HKDF-SHA256',
      dsaSpec: 'NIST FIPS 204 ML-DSA-44 Nav Frame Tag',
      classicalDsaPartner: 'ECDSA P-256 SAASM',
      quantumResistanceBits: 128,
      securityCategory: 'Category 1 (Compact Navigation)',
      publicKeyBytes: 800,
      ciphertextBytes: 768,
      sharedSecretBytes: 32,
      encapLatencyUs: 18,
      decapLatencyUs: 21,
      verifiedThroughput: '100 Nav Fixes / sec Signed',
    },
  },
];

// 14 Realistic Directed Communication Paths Between Subsystems
const COMMUNICATION_PATHS: PathLinkDatum[] = [
  // Path 1: CIP 1 to CIP 2 Core High-Speed Backplane
  {
    id: 'path-cip1-cip2',
    source: 'cip-1',
    target: 'cip-2',
    label: 'High-Speed Inter-CIP Optical Backplane',
    protocol: 'Fibre Channel (400 Mbps)',
    bandwidthMbps: 400,
    latencyUs: 45,
    isHybridPath: true,
    cryptoType: 'Hybrid KEM+DSA',
    status: 'ENCRYPTED',
    bidirectional: true,
    packetCount: 18450,
  },
  // Path 2: APG-77 Radar to CIP 1 Sensor Fusion
  {
    id: 'path-apg77-cip1',
    source: 'apg-77',
    target: 'cip-1',
    label: 'AESA Radar In-Phase & Quadrature (I/Q) Stream',
    protocol: 'Fibre Channel (400 Mbps)',
    bandwidthMbps: 400,
    latencyUs: 32,
    isHybridPath: true,
    cryptoType: 'ML-DSA Signed',
    status: 'AUTHENTICATED',
    bidirectional: false,
    packetCount: 42100,
  },
  // Path 3: ALR-94 EW to CIP 1 Threat Processor
  {
    id: 'path-alr94-cip1',
    source: 'alr-94',
    target: 'cip-1',
    label: 'Spherical Emitter DTOA Ingest & Geolocation',
    protocol: 'Fibre Channel (400 Mbps)',
    bandwidthMbps: 400,
    latencyUs: 35,
    isHybridPath: true,
    cryptoType: 'ML-DSA Signed',
    status: 'AUTHENTICATED',
    bidirectional: false,
    packetCount: 31200,
  },
  // Path 4: CNI Vault to CIP 1 Quantum Entropy Feeding
  {
    id: 'path-cni-cip1',
    source: 'cni-vault',
    target: 'cip-1',
    label: 'Cryogenic TRNG Entropy & Master Seed Pipeline',
    protocol: 'Fibre Channel (400 Mbps)',
    bandwidthMbps: 100,
    latencyUs: 22,
    isHybridPath: true,
    cryptoType: 'ML-KEM Session',
    status: 'ENCRYPTED',
    bidirectional: false,
    packetCount: 8900,
  },
  // Path 5: CNI Vault to CIP 2 Sovereign CA Provisioning
  {
    id: 'path-cni-cip2',
    source: 'cni-vault',
    target: 'cip-2',
    label: 'Sovereign Root CA Attestation & RACR Seeds',
    protocol: 'Fibre Channel (400 Mbps)',
    bandwidthMbps: 100,
    latencyUs: 25,
    isHybridPath: true,
    cryptoType: 'ML-DSA Signed',
    status: 'AUTHENTICATED',
    bidirectional: false,
    packetCount: 7200,
  },
  // Path 6: CIP 1 to VMS / TVC Guidance Commands
  {
    id: 'path-cip1-vms',
    source: 'cip-1',
    target: 'vms-tvc',
    label: 'Autopilot Steering Limits & Mach 1.62 Trim Control',
    protocol: 'MIL-STD-1553B',
    bandwidthMbps: 1,
    latencyUs: 78,
    isHybridPath: true,
    cryptoType: 'ML-DSA Signed',
    status: 'AUTHENTICATED',
    bidirectional: true,
    packetCount: 15400,
  },
  // Path 7: CIP 2 to SMS Weapons Bay Fire Interlock
  {
    id: 'path-cip2-sms',
    source: 'cip-2',
    target: 'sms-weapons',
    label: 'AIM-120D In-Bay Key Loading & Master Arm Token',
    protocol: 'MIL-STD-1553B',
    bandwidthMbps: 1,
    latencyUs: 85,
    isHybridPath: true,
    cryptoType: 'Hybrid KEM+DSA',
    status: 'ENCRYPTED',
    bidirectional: true,
    packetCount: 4600,
  },
  // Path 8: CIP 1 to Cockpit MFD Video Pipe
  {
    id: 'path-cip1-mfd',
    source: 'cip-1',
    target: 'cockpit-mfd',
    label: 'Authenticated Tactical Symbology & Threat Rings',
    protocol: 'Fibre Channel (400 Mbps)',
    bandwidthMbps: 400,
    latencyUs: 28,
    isHybridPath: true,
    cryptoType: 'ML-DSA Signed',
    status: 'AUTHENTICATED',
    bidirectional: false,
    packetCount: 52000,
  },
  // Path 9: CIP 2 to IFDL 4-Ship Raptor Mesh
  {
    id: 'path-cip2-ifdl',
    source: 'cip-2',
    target: 'ifdl-mesh',
    label: '4-Ship Tactical Sensor Mesh & 30s Lattice Ratchet',
    protocol: 'MIL-STD-1553B',
    bandwidthMbps: 50,
    latencyUs: 92,
    isHybridPath: true,
    cryptoType: 'Hybrid KEM+DSA',
    status: 'LPI_ENGAGED',
    bidirectional: true,
    packetCount: 12400,
  },
  // Path 10: CIP 2 to CCA Autonomous Drone
  {
    id: 'path-cip2-cca',
    source: 'cip-2',
    target: 'cca-wingman',
    label: 'Zero-Trust OMS Collaborative Combat Aircraft Link',
    protocol: 'IEEE-1394B FireWire',
    bandwidthMbps: 400,
    latencyUs: 68,
    isHybridPath: true,
    cryptoType: 'Hybrid KEM+DSA',
    status: 'ENCRYPTED',
    bidirectional: true,
    packetCount: 9800,
  },
  // Path 11: Bus Controller to CIP 1 Channel-A
  {
    id: 'path-bus-cip1',
    source: 'bus-controller',
    target: 'cip-1',
    label: 'Multiplex Bus Channel-A Major Cycle Schedule',
    protocol: 'MIL-STD-1553B',
    bandwidthMbps: 1,
    latencyUs: 50,
    isHybridPath: false,
    cryptoType: 'MIL-Bus Raw',
    status: 'ACTIVE',
    bidirectional: true,
    packetCount: 65000,
  },
  // Path 12: Bus Controller to CIP 2 Channel-B
  {
    id: 'path-bus-cip2',
    source: 'bus-controller',
    target: 'cip-2',
    label: 'Multiplex Bus Channel-B Redundant Cycle Schedule',
    protocol: 'MIL-STD-1553B',
    bandwidthMbps: 1,
    latencyUs: 50,
    isHybridPath: false,
    cryptoType: 'MIL-Bus Raw',
    status: 'ACTIVE',
    bidirectional: true,
    packetCount: 65000,
  },
  // Path 13: TACAN/GPS to CIP 1 Navigation Ingest
  {
    id: 'path-tacan-cip1',
    source: 'tacan-gps',
    target: 'cip-1',
    label: 'SAASM Anti-Jam Geodetic Coordinates & Altitude',
    protocol: 'MIL-STD-1553B',
    bandwidthMbps: 1,
    latencyUs: 60,
    isHybridPath: true,
    cryptoType: 'ML-DSA Signed',
    status: 'AUTHENTICATED',
    bidirectional: false,
    packetCount: 14200,
  },
  // Path 14: SMS Weapons to VMS Flight Compensation
  {
    id: 'path-sms-vms',
    source: 'sms-weapons',
    target: 'vms-tvc',
    label: 'Bay Door Pneumatic Transients & CG Shift Alert',
    protocol: 'MIL-STD-1553B',
    bandwidthMbps: 1,
    latencyUs: 42,
    isHybridPath: true,
    cryptoType: 'ML-DSA Signed',
    status: 'AUTHENTICATED',
    bidirectional: true,
    packetCount: 3800,
  },
];

interface F22AvionicsCommunicationPathsGraphProps {
  flightMode?: F22FlightMode;
  onSelectSubsystem?: (subsystem: F22AvionicsSubsystem) => void;
  onOpenCodeView?: (subsystem: F22AvionicsSubsystem) => void;
}

export const F22AvionicsCommunicationPathsGraph: React.FC<F22AvionicsCommunicationPathsGraphProps> = ({
  flightMode = 'Combat',
  onSelectSubsystem,
  onOpenCodeView,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<d3.Simulation<PathNodeDatum, PathLinkDatum> | null>(null);

  // Highlighting & Filtering State
  const [highlightFilter, setHighlightFilter] = useState<
    'all' | 'pqc_hybrid' | 'kem_768' | 'kem_1024' | 'high_bandwidth'
  >('pqc_hybrid');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('cip-1');
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [activeFlightMode, setActiveFlightMode] = useState<F22FlightMode>(flightMode);
  const [isPhysicsRunning, setIsPhysicsRunning] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Multi-Hop Path Tracing State: Source -> Target
  const [traceSourceId, setTraceSourceId] = useState<string>('apg-77');
  const [traceTargetId, setTraceTargetId] = useState<string>('vms-tvc');
  const [isTraceActive, setIsTraceActive] = useState<boolean>(true);

  // Simulation Pulse Trigger
  const [pulseCount, setPulseCount] = useState<number>(0);

  // Synchronize prop
  useEffect(() => {
    setActiveFlightMode(flightMode);
  }, [flightMode]);

  // Selected Node Object
  const selectedNode = useMemo(
    () => COMMUNICATION_NODES.find((n) => n.id === selectedNodeId) || COMMUNICATION_NODES[0],
    [selectedNodeId]
  );

  // Selected Path Object
  const selectedPath = useMemo(
    () => (selectedPathId ? COMMUNICATION_PATHS.find((p) => p.id === selectedPathId) || null : null),
    [selectedPathId]
  );

  // Find shortest multi-hop path between traceSourceId and traceTargetId (BFS)
  const tracedPathIds = useMemo(() => {
    if (!isTraceActive || !traceSourceId || !traceTargetId || traceSourceId === traceTargetId) {
      return new Set<string>();
    }

    // Graph adjacency
    const adj = new Map<string, { neighbor: string; linkId: string }[]>();
    COMMUNICATION_NODES.forEach((n) => adj.set(n.id, []));

    COMMUNICATION_PATHS.forEach((p) => {
      const src = typeof p.source === 'object' ? p.source.id : p.source;
      const tgt = typeof p.target === 'object' ? p.target.id : p.target;
      adj.get(src)?.push({ neighbor: tgt, linkId: p.id });
      if (p.bidirectional) {
        adj.get(tgt)?.push({ neighbor: src, linkId: p.id });
      }
    });

    // BFS queue
    const queue: { node: string; path: string[] }[] = [{ node: traceSourceId, path: [] }];
    const visited = new Set<string>([traceSourceId]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.node === traceTargetId) {
        return new Set(current.path);
      }
      const neighbors = adj.get(current.node) || [];
      for (const edge of neighbors) {
        if (!visited.has(edge.neighbor)) {
          visited.add(edge.neighbor);
          queue.push({
            node: edge.neighbor,
            path: [...current.path, edge.linkId],
          });
        }
      }
    }

    return new Set<string>();
  }, [isTraceActive, traceSourceId, traceTargetId]);

  // Traced Path Nodes
  const tracedNodeIds = useMemo(() => {
    if (tracedPathIds.size === 0) return new Set<string>();
    const nodeSet = new Set<string>([traceSourceId, traceTargetId]);
    COMMUNICATION_PATHS.forEach((p) => {
      if (tracedPathIds.has(p.id)) {
        const src = typeof p.source === 'object' ? p.source.id : p.source;
        const tgt = typeof p.target === 'object' ? p.target.id : p.target;
        nodeSet.add(src);
        nodeSet.add(tgt);
      }
    });
    return nodeSet;
  }, [tracedPathIds, traceSourceId, traceTargetId]);

  // Total End-to-End Latency of Traced Path
  const tracedPathMetrics = useMemo(() => {
    let totalLatency = 0;
    let minBandwidth = 400;
    const protocols: string[] = [];

    COMMUNICATION_PATHS.forEach((p) => {
      if (tracedPathIds.has(p.id)) {
        totalLatency += p.latencyUs;
        if (p.bandwidthMbps < minBandwidth) minBandwidth = p.bandwidthMbps;
        if (!protocols.includes(p.protocol)) protocols.push(p.protocol);
      }
    });

    return {
      hopCount: tracedPathIds.size,
      totalLatencyUs: totalLatency,
      minBandwidthMbps: minBandwidth,
      protocols,
    };
  }, [tracedPathIds]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Helper to map to F22AvionicsSubsystem for code preview
  const getMatchedSubsystem = (nodeId: string): F22AvionicsSubsystem => {
    if (nodeId === 'cip-1') return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'isf-fusion') || F22_AVIONICS_SUBSYSTEMS[0];
    if (nodeId === 'cip-2') return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'racr-oms') || F22_AVIONICS_SUBSYSTEMS[1];
    if (nodeId === 'apg-77') return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'apg77-radar') || F22_AVIONICS_SUBSYSTEMS[2];
    if (nodeId === 'alr-94') return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'alr94-ew') || F22_AVIONICS_SUBSYSTEMS[3];
    if (nodeId === 'vms-tvc') return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'fcs-thrust-vec') || F22_AVIONICS_SUBSYSTEMS[4];
    if (nodeId === 'ifdl-mesh') return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'ifdl-cnsa2') || F22_AVIONICS_SUBSYSTEMS[5];
    return F22_AVIONICS_SUBSYSTEMS[0];
  };

  // -------------------------------------------------------------
  // D3 FORCE SIMULATION RENDERER
  // -------------------------------------------------------------
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 940;
    const height = 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Definitions
    const defs = svg.append('defs');

    // Dual-Tone HUD Glow Filter
    const filter = defs
      .append('filter')
      .attr('id', 'paths-glow')
      .attr('x', '-35%')
      .attr('y', '-35%')
      .attr('width', '170%')
      .attr('height', '170%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3.5').attr('result', 'blur');
    filter
      .append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', (d) => d);

    // Arrow markers for path directions
    const markerColors = [
      { id: 'marker-hybrid-path', color: '#10b981' },
      { id: 'marker-kem-path', color: '#06b6d4' },
      { id: 'marker-traced-path', color: '#38bdf8' },
      { id: 'marker-bus-path', color: '#f59e0b' },
    ];

    markerColors.forEach((m) => {
      defs
        .append('marker')
        .attr('id', m.id)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 30)
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', m.color);
    });

    // Zoom container
    const zoomContainer = svg.append('g').attr('class', 'zoom-paths-container');
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 3.2])
      .on('zoom', (event) => {
        zoomContainer.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Node & Link Datums copy for D3
    const nodesCopy = COMMUNICATION_NODES.map((n) => ({ ...n }));
    const linksCopy = COMMUNICATION_PATHS.map((p) => ({ ...p }));

    // Force Simulation Setup
    const simulation = d3
      .forceSimulation<PathNodeDatum, PathLinkDatum>(nodesCopy)
      .force(
        'link',
        d3
          .forceLink<PathNodeDatum, PathLinkDatum>(linksCopy)
          .id((d) => d.id)
          .distance((l) => {
            const src = typeof l.source === 'object' ? l.source.id : l.source;
            const tgt = typeof l.target === 'object' ? l.target.id : l.target;
            if (
              (src === 'cip-1' && tgt === 'cip-2') ||
              (src === 'cip-2' && tgt === 'cip-1')
            ) {
              return 80; // Core CIP tight backplane
            }
            return 130;
          })
          .strength(0.7)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collide',
        d3.forceCollide<PathNodeDatum>().radius((d) => d.radius + 22)
      )
      .force(
        'radial',
        d3
          .forceRadial<PathNodeDatum>(
            (d) => d.clusterGroup * 155,
            width / 2,
            height / 2
          )
          .strength(0.2)
      );

    simulationRef.current = simulation;

    // Background Military Radar Concentric Rings
    const radarGroup = zoomContainer.append('g').attr('class', 'radar-grid').attr('opacity', 0.2);
    [90, 190, 310, 430].forEach((r) => {
      radarGroup
        .append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#06b6d4')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 6');
    });

    // Communication Paths Layer
    const pathsLayer = zoomContainer.append('g').attr('class', 'paths-layer');
    const nodesLayer = zoomContainer.append('g').attr('class', 'nodes-layer');

    // Create Path Links
    const pathGroups = pathsLayer
      .selectAll('.path-group')
      .data(linksCopy)
      .enter()
      .append('g')
      .attr('class', 'path-group')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedPathId(d.id);
      });

    // Wide transparent hit area
    pathGroups
      .append('line')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 18);

    // Traced Path Neon Glow Backing
    pathGroups
      .filter((d) => tracedPathIds.has(d.id))
      .append('line')
      .attr('class', 'traced-glow')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 7)
      .attr('stroke-opacity', 0.5)
      .attr('filter', 'url(#paths-glow)');

    // Main Visible Path Line
    const pathLines = pathGroups
      .append('line')
      .attr('class', 'main-path-line')
      .attr('stroke', (d) => {
        if (tracedPathIds.has(d.id)) return '#38bdf8'; // Sky neon for traced multi-hop route
        if (d.isHybridPath) return '#10b981'; // Emerald for PQC-Hybrid communication path
        return '#f59e0b'; // Amber for legacy bus
      })
      .attr('stroke-width', (d) => {
        if (tracedPathIds.has(d.id)) return 3.5;
        if (d.id === selectedPathId) return 3.0;
        return 2.0;
      })
      .attr('stroke-dasharray', (d) => (d.protocol.includes('1553B') ? '6 4' : null))
      .attr('stroke-opacity', (d) => {
        if (tracedPathIds.size > 0) {
          return tracedPathIds.has(d.id) ? 1.0 : 0.15;
        }
        if (highlightFilter === 'pqc_hybrid') {
          return d.isHybridPath ? 0.95 : 0.2;
        }
        if (highlightFilter === 'high_bandwidth') {
          return d.bandwidthMbps >= 100 ? 0.95 : 0.2;
        }
        return 0.75;
      })
      .attr('marker-end', (d) => {
        if (tracedPathIds.has(d.id)) return 'url(#marker-traced-path)';
        if (d.isHybridPath) return 'url(#marker-hybrid-path)';
        return 'url(#marker-bus-path)';
      });

    // Animated Packet Traveling Particles
    const pathParticles = pathGroups
      .append('circle')
      .attr('r', (d) => (tracedPathIds.has(d.id) ? 4.5 : 3.0))
      .attr('fill', (d) => (tracedPathIds.has(d.id) ? '#38bdf8' : d.isHybridPath ? '#10b981' : '#f59e0b'))
      .attr('filter', 'url(#paths-glow)')
      .attr('opacity', 0.9);

    // Create Nodes
    const nodeGroups = nodesLayer
      .selectAll('.node-group')
      .data(nodesCopy)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', 'grab')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
        setSelectedPathId(null);
        if (onSelectSubsystem) {
          onSelectSubsystem(getMatchedSubsystem(d.id));
        }
      });

    // Drag capability
    const drag = d3
      .drag<SVGGElement, PathNodeDatum>()
      .on('start', (event, d) => {
        if (!event.active && isPhysicsRunning) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && isPhysicsRunning) simulation.alphaTarget(0);
        if (isPhysicsRunning) {
          d.fx = null;
          d.fy = null;
        }
      });

    nodeGroups.call(drag);

    // =========================================================================
    // PQC-HYBRID HIGHLIGHTING (Rings, Quantum Shields & Auroras)
    // =========================================================================

    // 1. Quantum Hybrid Outer Halo (For nodes with PQC-Hybrid configs)
    nodeGroups
      .filter((d) => d.pqcHybrid.isPqcHybrid)
      .append('circle')
      .attr('r', (d) => d.radius + 12)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.pqcHybrid.hybridType === 'ML-KEM-1024') return '#06b6d4'; // Cyan for Level 5
        if (d.pqcHybrid.hybridType === 'ML-KEM-768') return '#10b981'; // Emerald for Level 3
        return '#38bdf8';
      })
      .attr('stroke-width', (d) => {
        if (highlightFilter === 'pqc_hybrid') return 2.2;
        if (highlightFilter === 'kem_768' && d.pqcHybrid.hybridType === 'ML-KEM-768') return 3.0;
        if (highlightFilter === 'kem_1024' && d.pqcHybrid.hybridType === 'ML-KEM-1024') return 3.0;
        return 1.2;
      })
      .attr('stroke-dasharray', '3 3')
      .attr('opacity', (d) => {
        if (highlightFilter === 'kem_768' && d.pqcHybrid.hybridType !== 'ML-KEM-768') return 0.15;
        if (highlightFilter === 'kem_1024' && d.pqcHybrid.hybridType !== 'ML-KEM-1024') return 0.15;
        return 0.85;
      });

    // 2. Selected Node Radar Pulse Ring
    nodeGroups
      .filter((d) => d.id === selectedNodeId || tracedNodeIds.has(d.id))
      .append('circle')
      .attr('r', (d) => d.radius + 18)
      .attr('fill', 'none')
      .attr('stroke', (d) => (tracedNodeIds.has(d.id) ? '#38bdf8' : '#10b981'))
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5 4')
      .attr('opacity', 0.9)
      .attr('class', 'animate-pulse');

    // 3. Node Main Solid Body Circle
    nodeGroups
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', '#09090b')
      .attr('stroke', (d) => {
        if (tracedNodeIds.has(d.id)) return '#38bdf8';
        if (d.pqcHybrid.isPqcHybrid) {
          if (d.pqcHybrid.hybridType === 'ML-KEM-1024') return '#06b6d4';
          if (d.pqcHybrid.hybridType === 'ML-KEM-768') return '#10b981';
          return '#38bdf8';
        }
        return '#71717a'; // Gray for non-hybrid / physical hub
      })
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 3.5 : 2.2))
      .attr('filter', (d) => (d.pqcHybrid.isPqcHybrid ? 'url(#paths-glow)' : null))
      .attr('opacity', (d) => {
        if (tracedNodeIds.size > 0) {
          return tracedNodeIds.has(d.id) ? 1.0 : 0.25;
        }
        if (highlightFilter === 'kem_768') {
          return d.pqcHybrid.hybridType === 'ML-KEM-768' ? 1.0 : 0.2;
        }
        if (highlightFilter === 'kem_1024') {
          return d.pqcHybrid.hybridType === 'ML-KEM-1024' ? 1.0 : 0.2;
        }
        return 1.0;
      });

    // 4. Node Inner Core
    nodeGroups
      .append('circle')
      .attr('r', (d) => d.radius - 6)
      .attr('fill', (d) => {
        if (d.pqcHybrid.isPqcHybrid) {
          if (d.pqcHybrid.hybridType === 'ML-KEM-1024') return '#06b6d4';
          if (d.pqcHybrid.hybridType === 'ML-KEM-768') return '#10b981';
          return '#38bdf8';
        }
        return '#3f3f46';
      })
      .attr('opacity', 0.18);

    // 5. Node Acronym Label
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-2px')
      .attr('fill', '#ffffff')
      .attr('font-size', (d) => (d.radius >= 32 ? '11px' : '9px'))
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text((d) => d.acronym);

    // 6. Highlighted PQC-Hybrid Badge Label Below Node
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '11px')
      .attr('fill', (d) => {
        if (d.pqcHybrid.hybridType === 'ML-KEM-1024') return '#06b6d4';
        if (d.pqcHybrid.hybridType === 'ML-KEM-768') return '#10b981';
        if (d.pqcHybrid.isPqcHybrid) return '#38bdf8';
        return '#71717a';
      })
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text((d) => {
        if (d.pqcHybrid.hybridType === 'ML-KEM-768') return 'ML-KEM-768';
        if (d.pqcHybrid.hybridType === 'ML-KEM-1024') return 'ML-KEM-1024';
        if (d.pqcHybrid.isPqcHybrid) return d.pqcHybrid.hybridType;
        return 'CLASSICAL';
      });

    // Node hover tooltip
    nodeGroups.append('title').text((d) =>
      `${d.name}\n${d.subsystemRole}\n${
        d.pqcHybrid.isPqcHybrid ? `PQC-HYBRID: ${d.pqcHybrid.kemSpec} + ${d.pqcHybrid.classicalPartner}` : 'Classical Physical Bus'
      }`
    );

    // Simulation Tick Updates
    let tick = 0;
    simulation.on('tick', () => {
      tick++;

      // Update path lines
      pathLines
        .attr('x1', (d) => (typeof d.source === 'object' ? (d.source.x || 0) : 0))
        .attr('y1', (d) => (typeof d.source === 'object' ? (d.source.y || 0) : 0))
        .attr('x2', (d) => (typeof d.target === 'object' ? (d.target.x || 0) : 0))
        .attr('y2', (d) => (typeof d.target === 'object' ? (d.target.y || 0) : 0));

      // Update animated packet particles
      const progress = (tick % 75) / 75;
      pathParticles
        .attr('cx', (d) => {
          const sx = typeof d.source === 'object' ? (d.source.x || 0) : 0;
          const tx = typeof d.target === 'object' ? (d.target.x || 0) : 0;
          return sx + (tx - sx) * progress;
        })
        .attr('cy', (d) => {
          const sy = typeof d.source === 'object' ? (d.source.y || 0) : 0;
          const ty = typeof d.target === 'object' ? (d.target.y || 0) : 0;
          return sy + (ty - sy) * progress;
        });

      // Update node locations
      nodeGroups.attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [
    highlightFilter,
    selectedNodeId,
    selectedPathId,
    tracedPathIds,
    tracedNodeIds,
    isPhysicsRunning,
    pulseCount,
  ]);

  // Reset zoom view
  const handleResetZoom = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(500)
      .call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity);
  };

  // Reheat physics
  const handleReheat = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.6).restart();
      setIsPhysicsRunning(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 overflow-y-auto bg-zinc-950/98 p-6' : 'p-5 space-y-5'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & PQC-HYBRID STATUS HUD                                     */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span>Avionics Communication Paths · PQC-Hybrid Topology</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Directed D3.js force graph mapping inter-subsystem data buses · Distinctively highlighting <strong>PQC-hybrid (ML-KEM-768 / ML-KEM-1024)</strong> cryptographic enclaves
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Reheat Simulation */}
          <button
            type="button"
            onClick={handleReheat}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-800 cursor-pointer transition-colors"
            title="Reheat Spring Physics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer transition-colors"
            title="Reset Zoom & Pan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Pause / Resume */}
          <button
            type="button"
            onClick={() => setIsPhysicsRunning(!isPhysicsRunning)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer transition-colors"
            title={isPhysicsRunning ? 'Pause Physics' : 'Resume Physics'}
          >
            {isPhysicsRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Expand Fullscreen */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand full canvas'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PQC-HYBRID HIGHLIGHTING FILTER & MULTI-HOP TRACER BAR                  */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs font-mono">
        {/* PQC-Hybrid Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase px-2 font-semibold">Highlight:</span>
          <button
            type="button"
            onClick={() => setHighlightFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              highlightFilter === 'all'
                ? 'bg-zinc-800 text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Subsystems
          </button>
          <button
            type="button"
            onClick={() => setHighlightFilter('pqc_hybrid')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              highlightFilter === 'pqc_hybrid'
                ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/80'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PQC-Hybrid Enclaves (11/12)</span>
          </button>
          <button
            type="button"
            onClick={() => setHighlightFilter('kem_768')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              highlightFilter === 'kem_768'
                ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/80'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>ML-KEM-768 Nodes (Combat)</span>
          </button>
          <button
            type="button"
            onClick={() => setHighlightFilter('kem_1024')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              highlightFilter === 'kem_1024'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/80'
                : 'text-zinc-400 hover:text-cyan-300'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>ML-KEM-1024 Nodes (Stealth)</span>
          </button>
        </div>

        {/* Multi-Hop Path Tracer Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-900/90 p-1.5 px-3 rounded-xl border border-zinc-800 text-[11px]">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Route className="w-3.5 h-3.5" />
            <span>Trace Path:</span>
          </div>

          <select
            value={traceSourceId}
            onChange={(e) => setTraceSourceId(e.target.value)}
            className="bg-black text-white p-1 rounded border border-zinc-800 text-xs font-mono cursor-pointer"
          >
            {COMMUNICATION_NODES.map((n) => (
              <option key={n.id} value={n.id}>
                SRC: {n.acronym}
              </option>
            ))}
          </select>

          <ArrowRight className="w-3 h-3 text-zinc-500" />

          <select
            value={traceTargetId}
            onChange={(e) => setTraceTargetId(e.target.value)}
            className="bg-black text-white p-1 rounded border border-zinc-800 text-xs font-mono cursor-pointer"
          >
            {COMMUNICATION_NODES.map((n) => (
              <option key={n.id} value={n.id}>
                DST: {n.acronym}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsTraceActive(!isTraceActive)}
            className={`px-2 py-1 rounded font-bold cursor-pointer transition-colors ${
              isTraceActive
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {isTraceActive ? 'Tracing ON' : 'Trace Off'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. D3 GRAPH CANVAS & TRACED ROUTE SUMMARY                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 7 cols: Interactive D3 Canvas */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-850 bg-black relative overflow-hidden shadow-inner flex flex-col justify-between">
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(16,185,129,0)_50%,rgba(0,0,0,0.8)_50%)] bg-[length:100%_4px]" />

          {/* Canvas Navigation Hint */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 font-mono text-[10px] text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800 backdrop-blur-sm">
            <Move className="w-3 h-3 text-emerald-400" />
            <span>Drag nodes · Highlighted halos denote active PQC-hybrid algorithms</span>
          </div>

          {/* D3 Canvas */}
          <div className="w-full h-[580px] cursor-grab active:cursor-grabbing">
            <svg
              ref={svgRef}
              viewBox="0 0 940 600"
              className="w-full h-full select-none"
              preserveAspectRatio="xMidYMid meet"
            />
          </div>

          {/* Bottom Traced Path Bar */}
          {isTraceActive && tracedPathIds.size > 0 && (
            <div className="border-t border-cyan-900/50 bg-cyan-950/40 p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-cyan-200">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-cyan-400" />
                <span>Active Traced Path:</span>
                <span className="font-bold text-white">
                  {COMMUNICATION_NODES.find((n) => n.id === traceSourceId)?.acronym} →{' '}
                  {COMMUNICATION_NODES.find((n) => n.id === traceTargetId)?.acronym}
                </span>
                <span className="text-[10px] text-cyan-400 font-normal">
                  ({tracedPathMetrics.hopCount} hops)
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <div>
                  End-to-End Latency: <strong className="text-emerald-400">{tracedPathMetrics.totalLatencyUs} µs</strong>
                </div>
                <div>
                  Transports: <strong className="text-white">{tracedPathMetrics.protocols.join(' · ')}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Graph Legend Strip */}
          <div className="border-t border-zinc-850 bg-zinc-950/90 p-3 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-emerald-400 bg-emerald-950 inline-block" />
                <span className="text-emerald-300 font-semibold">PQC-Hybrid (ML-KEM-768)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-cyan-400 bg-cyan-950 inline-block" />
                <span className="text-cyan-300 font-semibold">PQC-Hybrid (ML-KEM-1024)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-zinc-600 bg-zinc-900 inline-block" />
                <span>Physical Bus Hub</span>
              </div>
            </div>

            <div className="text-[10px] text-zinc-500">
              Inspecting: <strong className="text-white">{selectedNode.acronym}</strong>
            </div>
          </div>
        </div>

        {/* Right 5 cols: PQC-Hybrid Node & Path Inspector */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl space-y-4">
          {/* Subsystem Title & PQC Badge */}
          <div className="border-b border-zinc-800 pb-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  {selectedNode.category} · {selectedNode.cipHost}
                </span>
                <h4 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <span>{selectedNode.name}</span>
                </h4>
              </div>
              {selectedNode.pqcHybrid.isPqcHybrid ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-600 text-emerald-300">
                  PQC-HYBRID ACTIVE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-400">
                  PHYSICAL BUS
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {selectedNode.subsystemRole}
            </p>
          </div>

          {/* PQC-Hybrid Technical Specification Card */}
          {selectedNode.pqcHybrid.isPqcHybrid ? (
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>PQC-Hybrid Configuration</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {selectedNode.pqcHybrid.securityCategory.split(' (')[0]}
                </span>
              </div>

              {/* Algorithm Details Grid */}
              <div className="space-y-2 text-[11px] pt-1 border-t border-emerald-900/60">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Post-Quantum KEM:</span>
                  <span className="text-emerald-300 font-bold">{selectedNode.pqcHybrid.kemSpec}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Classical Partner:</span>
                  <span className="text-white font-semibold">{selectedNode.pqcHybrid.classicalPartner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">KDF Combiner:</span>
                  <span className="text-cyan-300">{selectedNode.pqcHybrid.kdfCombiner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Post-Quantum DSA:</span>
                  <span className="text-emerald-300 font-semibold">{selectedNode.pqcHybrid.dsaSpec}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Quantum Security:</span>
                  <span className="text-white font-bold">{selectedNode.pqcHybrid.quantumResistanceBits}-Bit Quantum Resistant</span>
                </div>
              </div>

              {/* Key Sizes & Latency Strip */}
              <div className="grid grid-cols-3 gap-2 text-[10px] pt-2 border-t border-emerald-900/40">
                <div className="p-2 rounded bg-black border border-zinc-850">
                  <div className="text-zinc-500">Public Key</div>
                  <div className="text-white font-bold">{selectedNode.pqcHybrid.publicKeyBytes} B</div>
                </div>
                <div className="p-2 rounded bg-black border border-zinc-850">
                  <div className="text-zinc-500">Ciphertext</div>
                  <div className="text-white font-bold">{selectedNode.pqcHybrid.ciphertextBytes} B</div>
                </div>
                <div className="p-2 rounded bg-black border border-zinc-850">
                  <div className="text-zinc-500">KEM Latency</div>
                  <div className="text-emerald-400 font-bold">{selectedNode.pqcHybrid.encapLatencyUs} µs</div>
                </div>
              </div>

              <div className="text-[10px] text-zinc-400 leading-relaxed bg-zinc-950/60 p-2.5 rounded-lg border border-emerald-950">
                <strong>Why PQC-Hybrid?</strong> Guarantees defense-in-depth: if quantum computers break classical X25519, the Module-Lattice structure preserves confidentiality; if novel lattice cryptanalysis discovers flaws, classical ECDH ensures legacy FIPS compliance remains intact.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-2 font-mono text-xs">
              <div className="font-bold text-white">Physical Transport Backplane Hub</div>
              <p className="text-[11px] text-zinc-400">
                Layer 1 multiplex bus interface. Does not generate cryptographic keys directly; wraps authenticated frames authenticated by CIP 1 and CIP 2 crypto cores.
              </p>
            </div>
          )}

          {/* Connected Communication Paths */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
              <span>Connected Communication Paths</span>
              <span>Click to view link metrics</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {COMMUNICATION_PATHS.filter(
                (p) => p.source === selectedNode.id || p.target === selectedNode.id
              ).map((p) => {
                const isOutbound = p.source === selectedNode.id;
                const peerId = isOutbound ? p.target : p.source;
                const peer = COMMUNICATION_NODES.find((n) => n.id === peerId);
                const isSelected = p.id === selectedPathId;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPathId(p.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                        : 'border-zinc-850 bg-zinc-900/70 hover:bg-zinc-850 text-zinc-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <span>{isOutbound ? '→ To:' : '← From:'} {peer?.acronym}</span>
                        {p.isHybridPath && (
                          <span className="text-[9px] px-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            PQC-HYBRID
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400">{p.protocol}</div>
                    </div>
                    <div className="text-right text-[10px]">
                      <div className="text-emerald-400 font-bold">{p.latencyUs} µs</div>
                      <div className="text-zinc-500">{p.bandwidthMbps} Mbps</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Path Details Card */}
          {selectedPath && (
            <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-zinc-900/90 space-y-2 font-mono text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-white font-bold text-xs">
                <span>{selectedPath.label}</span>
                <span className="text-cyan-400">{selectedPath.bandwidthMbps} Mbps</span>
              </div>
              <div className="text-[11px] text-zinc-400 flex justify-between">
                <span>Crypto Encapsulation:</span>
                <span className="text-emerald-300 font-bold">{selectedPath.cryptoType}</span>
              </div>
              <div className="text-[11px] text-zinc-400 flex justify-between">
                <span>Bus Round-Trip Latency:</span>
                <span className="text-white font-bold">{selectedPath.latencyUs} µs</span>
              </div>
              <div className="text-[11px] text-zinc-400 flex justify-between">
                <span>Frame Status:</span>
                <span className="text-cyan-300 font-semibold">{selectedPath.status}</span>
              </div>
            </div>
          )}

          {/* Inspect Ada Source Button */}
          {onOpenCodeView && (
            <button
              type="button"
              onClick={() => onOpenCodeView(getMatchedSubsystem(selectedNode.id))}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors font-mono"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspect Subsystem Ada 95 / C++ Kernel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

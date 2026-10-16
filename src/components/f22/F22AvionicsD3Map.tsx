import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Layers,
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
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileCode,
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
  ExternalLink,
  Info,
  Clock,
  HardDrive,
  Copy,
  Flame,
} from 'lucide-react';
import { F22FlightMode, F22AvionicsSubsystem } from '../../types/f22Simulator';
import { F22_AVIONICS_SUBSYSTEMS, F22_PQC_MODE_PRESETS } from '../../data/f22SimulatorData';

export type CommunicationFlowType = 'all' | 'kem' | 'dsa' | 'bus';

export interface PqcAlgorithmConfig {
  kemAlgorithm: string;
  kemStandard: string;
  kemCategory: 'Category 5 (Top Secret)' | 'Category 3 (Secret)' | 'Category 1 / Range';
  kemKeySizes: {
    publicKeyBytes: number;
    secretKeyBytes: number;
    ciphertextBytes: number;
    sharedSecretBytes: number;
  };
  kemLatencyMs: number;
  dsaAlgorithm: string;
  dsaStandard: string;
  dsaCategory: 'Category 5 (Top Secret)' | 'Category 3 (Secret)' | 'Category 1 / Range';
  dsaKeySizes: {
    publicKeyBytes: number;
    secretKeyBytes: number;
    signatureBytes: number;
  };
  dsaLatencyMs: number;
  hybridCombiner: string;
  classicalAlgorithm: string;
  symmetricCipher: string;
  quantumResistanceBits: number;
  cnsa2ComplianceStatus: string;
  hsmModule: string;
  rekeyCycleSeconds: number;
  entropySource: string;
  antiTamperBoundary: string;
  do178cCycleBudgetUs: number;
  messageThroughput: string;
}

export interface AvionicsD3Node {
  id: string;
  name: string;
  acronym: string;
  category: 'Sensors' | 'Core CIP' | 'Interconnect' | 'Flight Controls' | 'Weapons' | 'Tactical Mesh';
  cipHost: string;
  x: number;
  y: number;
  width: number;
  height: number;
  iconType: 'radar' | 'eye' | 'cpu' | 'radio' | 'crosshair' | 'zap' | 'key' | 'terminal';
  busInterface: string;
  pqcAlgorithm: string;
  securityDomain: string;
  criticality: string;
  sloc: string;
  description: string;
  hardwareSpecs: string;
  pqcConfig: PqcAlgorithmConfig;
}

export interface AvionicsD3Link {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'kem' | 'dsa' | 'hybrid' | 'bus';
  protocol: 'Fibre Channel (400 Mbps)' | 'MIL-STD-1553B Ch-A/B' | 'IEEE-1394B FireWire' | 'High-Speed Optical' | 'RF Directional IFDL';
  kemSpec?: string;
  dsaSpec?: string;
  bandwidth: string;
  latencyMs: number;
  direction: 'unidirectional' | 'bidirectional';
  description: string;
  handshakeSteps: {
    step: number;
    title: string;
    detail: string;
    cryptoPrimitive: string;
    size: string;
  }[];
}

export const AVIONICS_NODES: AvionicsD3Node[] = [
  // Tier 1: Sensors & Threat Detectors (Left)
  {
    id: 'apg-77',
    name: 'AN/APG-77 AESA Radar',
    acronym: 'APG-77 Radar',
    category: 'Sensors',
    cipHost: 'CIP 1 Sensor Enclave',
    x: 80,
    y: 110,
    width: 210,
    height: 95,
    iconType: 'radar',
    busInterface: 'High-Speed Optical (400 Mbps)',
    pqcAlgorithm: 'ML-DSA-65 Radar Frame Tagging',
    securityDomain: 'Top Secret / Special Access Program (SAP)',
    criticality: 'DO-178C Level A',
    sloc: '520,000 SLOC (Ada 95)',
    description: 'Active Electronically Scanned Array with 1,956 T/R modules delivering microsecond beam steering and Low Probability of Intercept (LPI) agility.',
    hardwareSpecs: '1,956 Gallium Arsenide T/R modules · 20 kW Peak RF Power · 0.08 ms Beam Steer',
    pqcConfig: {
      kemAlgorithm: 'NIST FIPS 203 ML-KEM-768 Pre-Shared Channel',
      kemStandard: 'NIST FIPS 203 (Module-Lattice KEM)',
      kemCategory: 'Category 3 (Secret)',
      kemKeySizes: {
        publicKeyBytes: 1184,
        secretKeyBytes: 2400,
        ciphertextBytes: 1088,
        sharedSecretBytes: 32,
      },
      kemLatencyMs: 0.04,
      dsaAlgorithm: 'NIST FIPS 204 ML-DSA-65 High-Rate Frame Tagging',
      dsaStandard: 'NIST FIPS 204 (Module-Lattice DSA)',
      dsaCategory: 'Category 3 (Secret)',
      dsaKeySizes: {
        publicKeyBytes: 1952,
        secretKeyBytes: 4032,
        signatureBytes: 3309,
      },
      dsaLatencyMs: 0.04,
      hybridCombiner: 'NIST SP 800-56C Dual KDF (KDF-SHA384)',
      classicalAlgorithm: 'X25519 (32-byte ECDH) + ECDSA P-256',
      symmetricCipher: 'AES-256-GCM Hardware Core (MIL-STD)',
      quantumResistanceBits: 192,
      cnsa2ComplianceStatus: 'CNSA 2.0 Radar Track Mandate Compliant (Phase 1 Approved)',
      hsmModule: 'APG-77 Radar Signal Processor (RSP) ASIC Crypto Co-processor',
      rekeyCycleSeconds: 120,
      entropySource: 'CNI Quantum Tunneling TRNG Optical Feed',
      antiTamperBoundary: 'Radome Sealed Cryogenic Key Enclave',
      do178cCycleBudgetUs: 20000,
      messageThroughput: '5,000 Signed Radar Frames / sec',
    },
  },
  {
    id: 'alr-94',
    name: 'AN/ALR-94 Passive EW Suite',
    acronym: 'ALR-94 EW',
    category: 'Sensors',
    cipHost: 'CIP 1 EW Pre-Processor',
    x: 80,
    y: 250,
    width: 210,
    height: 95,
    iconType: 'eye',
    busInterface: 'Fibre Channel Optical',
    pqcAlgorithm: 'ML-DSA-65 Geolocation Digest',
    securityDomain: 'Top Secret / Sensitive Compartmented Information',
    criticality: 'DO-178C Level A',
    sloc: '420,000 SLOC (Ada 95)',
    description: '30+ flush-mounted antennas providing 360° spherical RF emitter detection, passive ranging beyond 250 NM without transmitting RF energy.',
    hardwareSpecs: '30 Distributed Interferometer Arrays · 2-18 GHz RF Detection · DTOA Microsecond Resolution',
    pqcConfig: {
      kemAlgorithm: 'NIST FIPS 203 ML-KEM-768 Optical Bus Session',
      kemStandard: 'NIST FIPS 203 (Module-Lattice KEM)',
      kemCategory: 'Category 3 (Secret)',
      kemKeySizes: {
        publicKeyBytes: 1184,
        secretKeyBytes: 2400,
        ciphertextBytes: 1088,
        sharedSecretBytes: 32,
      },
      kemLatencyMs: 0.04,
      dsaAlgorithm: 'NIST FIPS 204 ML-DSA-65 Emitter Geolocation Seal',
      dsaStandard: 'NIST FIPS 204 (Module-Lattice DSA)',
      dsaCategory: 'Category 3 (Secret)',
      dsaKeySizes: {
        publicKeyBytes: 1952,
        secretKeyBytes: 4032,
        signatureBytes: 3309,
      },
      dsaLatencyMs: 0.05,
      hybridCombiner: 'NIST SP 800-56C Rev 2 Two-Step HKDF',
      classicalAlgorithm: 'X25519 ECDH + Ed25519',
      symmetricCipher: 'ChaCha20-Poly1305 Optical Pipe',
      quantumResistanceBits: 192,
      cnsa2ComplianceStatus: 'CNSA 2.0 Level 3 Certified (Mandatory by 2030)',
      hsmModule: 'AN/ALR-94 Threat Emitter Cryptoprocessor',
      rekeyCycleSeconds: 120,
      entropySource: 'Optical Seed Bus from CNI Quantum TRNG',
      antiTamperBoundary: 'Wingtip & Fuselage Tamper-Proof Sensor Pucks',
      do178cCycleBudgetUs: 20000,
      messageThroughput: '1,200 Emitter Fixes / sec Signed',
    },
  },
  {
    id: 'cni-vault',
    name: 'CNI Suite & Quantum Key Vault',
    acronym: 'CNI Crypto Vault',
    category: 'Sensors',
    cipHost: 'Forward Cryo Enclave',
    x: 80,
    y: 390,
    width: 210,
    height: 95,
    iconType: 'key',
    busInterface: 'MIL-STD-1553B & Optical Bus',
    pqcAlgorithm: 'FIPS 140-3 L4 True Quantum TRNG',
    securityDomain: 'Sovereign CNSA 2.0 Root of Trust',
    criticality: 'DO-178C Level A',
    sloc: '210,000 SLOC (Microcode/Ada)',
    description: 'Communications, Navigation, and Identification vault housing quantum hardware entropy generators, FIPS 203 seed pools, and zeroize-on-tamper key stores.',
    hardwareSpecs: 'Dual Quantum Tunneling TRNGs · 1.2 Gbps Entropy Pool · Cryogenic Anti-Tamper Mesh',
    pqcConfig: {
      kemAlgorithm: 'NIST FIPS 203 ML-KEM-1024 Ephemeral Seed Generator',
      kemStandard: 'NIST FIPS 203 / FIPS 140-3 Level 4',
      kemCategory: 'Category 5 (Top Secret)',
      kemKeySizes: {
        publicKeyBytes: 1568,
        secretKeyBytes: 3168,
        ciphertextBytes: 1568,
        sharedSecretBytes: 32,
      },
      kemLatencyMs: 0.02,
      dsaAlgorithm: 'NIST FIPS 204 ML-DSA-87 Root CA Sovereign Signer',
      dsaStandard: 'NIST FIPS 204 (Module-Lattice DSA Level 5)',
      dsaCategory: 'Category 5 (Top Secret)',
      dsaKeySizes: {
        publicKeyBytes: 2592,
        secretKeyBytes: 4896,
        signatureBytes: 4595,
      },
      dsaLatencyMs: 0.03,
      hybridCombiner: 'Sovereign Entropy Synthesizer (SP 800-90B)',
      classicalAlgorithm: 'Dual ECDSA P-384 + Hardware RSA-4096 Legacy Vault',
      symmetricCipher: 'AES-256 Key Wrap (NIST SP 800-38F)',
      quantumResistanceBits: 256,
      cnsa2ComplianceStatus: 'Full NSA CNSA 2.0 Hardware Master Root Certified',
      hsmModule: 'Cryogenic Tamper-Sealed Hardware Cryptoprocessor (FIPS 140-3 L4)',
      rekeyCycleSeconds: 30,
      entropySource: 'True Quantum Electron Subatomic Tunneling Diodes (1.2 Gbps)',
      antiTamperBoundary: 'Zeroize-on-tamper in < 2.5 nanoseconds on hull breach',
      do178cCycleBudgetUs: 10000,
      messageThroughput: 'Continuous Master Key & Entropy Stream (1.2 Gbps)',
    },
  },

  // Tier 2: Core Processing & Sensor Fusion (Center Core)
  {
    id: 'cip-1',
    name: 'CIP 1: Integrated Sensor Fusion',
    acronym: 'CIP 1 (ISF Core)',
    category: 'Core CIP',
    cipHost: 'Port Avionics Bay CIP 1',
    x: 390,
    y: 160,
    width: 240,
    height: 110,
    iconType: 'cpu',
    busInterface: '400 Mbps Fibre Channel Backplane',
    pqcAlgorithm: 'ML-KEM-1024 + X25519 (Level 5)',
    securityDomain: 'Mission Avionics Multi-Level Secure Core',
    criticality: 'DO-178C Level A (Safety-Critical)',
    sloc: '850,000 SLOC (Ada 95 / C++)',
    description: 'Common Integrated Processor 1 acts as the central brain, fusing radar, electronic warfare, and datalink tracks into a single unified God\'s-Eye tactical picture.',
    hardwareSpecs: '66 SEM-E Processing Modules · Liquid Flow-Through Cooled · 20,000 MIPS Throughput',
    pqcConfig: {
      kemAlgorithm: 'NIST FIPS 203 ML-KEM-1024 + X25519 Composite',
      kemStandard: 'NIST FIPS 203 Level 5 (Kyber-1024 Standardized)',
      kemCategory: 'Category 5 (Top Secret)',
      kemKeySizes: {
        publicKeyBytes: 1568,
        secretKeyBytes: 3168,
        ciphertextBytes: 1568,
        sharedSecretBytes: 32,
      },
      kemLatencyMs: 0.05,
      dsaAlgorithm: 'NIST FIPS 204 ML-DSA-87 (Security Level 5)',
      dsaStandard: 'NIST FIPS 204 Level 5 (Dilithium-87 Standardized)',
      dsaCategory: 'Category 5 (Top Secret)',
      dsaKeySizes: {
        publicKeyBytes: 2592,
        secretKeyBytes: 4896,
        signatureBytes: 4595,
      },
      dsaLatencyMs: 0.07,
      hybridCombiner: 'NIST SP 800-56C Rev 2 HKDF-SHA384 Dual KDF Combiner',
      classicalAlgorithm: 'X25519 (32-byte Classical ECDH) + ECDSA P-384',
      symmetricCipher: 'AES-256-GCM / 400 Mbps Fibre Channel Hardware Crypto',
      quantumResistanceBits: 256,
      cnsa2ComplianceStatus: 'CNSA 2.0 Ultra-High Assurance Compliant (Exceeds DoD 2033 Directive)',
      hsmModule: 'CIP 1 Cryogenic SEM-E Cryptographic Vector Accelerator',
      rekeyCycleSeconds: 30,
      entropySource: 'CNI Quantum Hardware TRNG Direct Isolated Feed',
      antiTamperBoundary: 'Port Avionics Bay Liquid Flow-Through Chassis Interlock',
      do178cCycleBudgetUs: 20000,
      messageThroughput: '10,000 Authenticated Sensor Tracks / sec',
    },
  },
  {
    id: 'cip-2',
    name: 'CIP 2: RACR OMS & Tactical Engine',
    acronym: 'CIP 2 (RACR / OMS)',
    category: 'Core CIP',
    cipHost: 'Starboard Avionics Bay CIP 2',
    x: 390,
    y: 340,
    width: 240,
    height: 110,
    iconType: 'cpu',
    busInterface: '400 Mbps Fibre Channel & 1394B',
    pqcAlgorithm: 'ML-DSA-87 + ML-KEM-768',
    securityDomain: 'Open Mission Systems (OMS) Enclave',
    criticality: 'DO-178C Level A / B Partitioned',
    sloc: '670,000 SLOC (C++20 / Ada 95)',
    description: 'Common Integrated Processor 2 hosting the Raptor Agile Capability Release (RACR) Open Mission Systems container runtime and autonomous wingman (CCA) orchestration.',
    hardwareSpecs: '66 SEM-E Processing Modules · ARINC 653 Hard Real-Time Partitioning · Dual PQC Coprocessors',
    pqcConfig: {
      kemAlgorithm: 'NIST FIPS 203 ML-KEM-768 + X25519 (Tactical Fast Cycle)',
      kemStandard: 'NIST FIPS 203 Level 3 (Kyber-768)',
      kemCategory: 'Category 3 (Secret)',
      kemKeySizes: {
        publicKeyBytes: 1184,
        secretKeyBytes: 2400,
        ciphertextBytes: 1088,
        sharedSecretBytes: 32,
      },
      kemLatencyMs: 0.04,
      dsaAlgorithm: 'NIST FIPS 204 ML-DSA-87 Tactical App Image Signatures',
      dsaStandard: 'NIST FIPS 204 Level 5 Container Verification',
      dsaCategory: 'Category 5 (Top Secret)',
      dsaKeySizes: {
        publicKeyBytes: 2592,
        secretKeyBytes: 4896,
        signatureBytes: 4595,
      },
      dsaLatencyMs: 0.06,
      hybridCombiner: 'NIST SP 800-56C Dual KDF (HKDF-SHA384)',
      classicalAlgorithm: 'X25519 + Ed25519 Container Signatures',
      symmetricCipher: 'ChaCha20-Poly1305 & AES-256-GCM',
      quantumResistanceBits: 192,
      cnsa2ComplianceStatus: 'CNSA 2.0 OMS Runtime Compliant (Zero-Trust Enclave)',
      hsmModule: 'CIP 2 ARINC 653 Hardware Cryptographic Core',
      rekeyCycleSeconds: 120,
      entropySource: 'CIP 2 High-Entropy Vector Hardware Pool',
      antiTamperBoundary: 'ARINC 653 Hard Memory Protection Units (MPU)',
      do178cCycleBudgetUs: 20000,
      messageThroughput: '8,500 Container Instructions / sec Verified',
    },
  },

  // Tier 3: Avionics Backbone (Central Interconnect)
  {
    id: 'avionics-bus',
    name: 'Avionics Interconnect Backbone',
    acronym: 'FC / 1553B Dual Bus',
    category: 'Interconnect',
    cipHost: 'Fiber-Optic Distributed Ring',
    x: 390,
    y: 500,
    width: 240,
    height: 85,
    iconType: 'terminal',
    busInterface: 'Fibre Channel / MIL-STD-1553B',
    pqcAlgorithm: 'AES-256-GCM / ChaCha20-Poly1305',
    securityDomain: 'MIL-STD-1553B Multi-Channel Ring',
    criticality: 'DO-178C Level A',
    sloc: '180,000 SLOC (Bus Controller Microcode)',
    description: 'Dual-redundant MIL-STD-1553B multiplex buses (Ch-A/B) alongside 400 Mbps Fibre Channel optical ring carrying hybrid KEM-encrypted avionics frames.',
    hardwareSpecs: '400 Mbps Optical Transceivers · Dual-Redundant MIL-1553B Couplers · 1 MHz Bus Controllers',
    pqcConfig: {
      kemAlgorithm: 'Pre-Shared Symmetric Multiplex Key Ring (Derived via ML-KEM-1024)',
      kemStandard: 'NIST SP 800-38D (GCM Mode Authentication)',
      kemCategory: 'Category 5 (Top Secret)',
      kemKeySizes: {
        publicKeyBytes: 1568,
        secretKeyBytes: 3168,
        ciphertextBytes: 1568,
        sharedSecretBytes: 32,
      },
      kemLatencyMs: 0.01,
      dsaAlgorithm: 'Hardware Bus Token Authenticator (Microsecond Check)',
      dsaStandard: 'FIPS 204 ML-DSA-87 Hardware Token Verify',
      dsaCategory: 'Category 5 (Top Secret)',
      dsaKeySizes: {
        publicKeyBytes: 2592,
        secretKeyBytes: 4896,
        signatureBytes: 4595,
      },
      dsaLatencyMs: 0.015,
      hybridCombiner: 'Hardware Bus Controller KDF Combiner',
      classicalAlgorithm: 'MIL-STD-1553B Parity & Manchester II Bi-Phase',
      symmetricCipher: 'AES-256-GCM Hardware Core',
      quantumResistanceBits: 256,
      cnsa2ComplianceStatus: 'CNSA 2.0 Bus Encryption Directive Enforced',
      hsmModule: 'High-Speed Optical Bus Interface Units (BIU)',
      rekeyCycleSeconds: 30,
      entropySource: 'CIP 1 Master Bus Session Key Pipeline',
      antiTamperBoundary: 'Shielded Triple-Twisted Pair & Optic Cladding',
      do178cCycleBudgetUs: 5000,
      messageThroughput: '400 Mbps Optical / 1 Mbps MIL-1553B Ring',
    },
  },

  // Tier 4: Flight Controls & Weapons Execution (Right)
  {
    id: 'vms-tvc',
    name: 'Vehicle Management System & TVC',
    acronym: 'VMS / TVC Controls',
    category: 'Flight Controls',
    cipHost: 'Quad-Redundant Flight Computers',
    x: 730,
    y: 110,
    width: 220,
    height: 95,
    iconType: 'zap',
    busInterface: 'MIL-STD-1553B Ch-A/B (Quad)',
    pqcAlgorithm: 'ML-DSA-87 Signed Actuation Commands',
    securityDomain: 'Flight-Safety Critical Hard Real-Time',
    criticality: 'DO-178C Level A (Catastrophic Hazard)',
    sloc: '640,000 SLOC (Pure Ada 95)',
    description: 'Quadruplex digital fly-by-wire flight control laws commanding aerodynamic flaperons, rudders, and Pratt & Whitney F119 2D pitch thrust-vectoring nozzles (±20°).',
    hardwareSpecs: 'Quad 80960 Processors · 50 Hz Strict Cyclic Loop · Hardware Bus Interlock Isolators',
    pqcConfig: {
      kemAlgorithm: 'Pre-Shared Hardware Flight Key Schedule (ML-KEM-1024 Initialized)',
      kemStandard: 'NIST FIPS 203 Root Key Ring',
      kemCategory: 'Category 5 (Top Secret)',
      kemKeySizes: {
        publicKeyBytes: 1568,
        secretKeyBytes: 3168,
        ciphertextBytes: 1568,
        sharedSecretBytes: 32,
      },
      kemLatencyMs: 0.02,
      dsaAlgorithm: 'NIST FIPS 204 ML-DSA-87 Hard Real-Time Signed Commands',
      dsaStandard: 'NIST FIPS 204 Level 5 Flight Safety Interlock',
      dsaCategory: 'Category 5 (Top Secret)',
      dsaKeySizes: {
        publicKeyBytes: 2592,
        secretKeyBytes: 4896,
        signatureBytes: 4595,
      },
      dsaLatencyMs: 0.02,
      hybridCombiner: 'Hardware Quad-Channel Majority Voting Validator',
      classicalAlgorithm: 'Quadruplex Redundant Voting with CRC-32 Validation',
      symmetricCipher: 'AES-256-GCM Flight Command Channel',
      quantumResistanceBits: 256,
      cnsa2ComplianceStatus: 'DO-178C Level A PQC Safety Flight Certified',
      hsmModule: 'Quadruplex Isolated Flight Control Computer Cryptoprocessor',
      rekeyCycleSeconds: 300,
      entropySource: 'CIP 1 Authenticated Flight Key Channel',
      antiTamperBoundary: 'Quad Physical Isolation Air-Gap Enclosures',
      do178cCycleBudgetUs: 20000,
      messageThroughput: '50 Hz Cyclic Hard Real-Time Actuator Commands',
    },
  },
  {
    id: 'sms-weapons',
    name: 'Stores Management System & Bays',
    acronym: 'SMS Weapons Bay',
    category: 'Weapons',
    cipHost: 'Weapons Interface Bay (WIB)',
    x: 730,
    y: 250,
    width: 220,
    height: 95,
    iconType: 'crosshair',
    busInterface: 'MIL-STD-1553B Weapon Bus',
    pqcAlgorithm: 'ML-DSA-87 Launch Auth + ML-KEM Handoff',
    securityDomain: 'Weapons Release Interlock Domain',
    criticality: 'DO-178C Level A',
    sloc: '390,000 SLOC (Ada 95)',
    description: 'Manages 3 internal weapon bays (6x AIM-120D AMRAAM, 2x AIM-9X Sidewinder, M61A2 cannon), executing pre-launch target handoff and PQC datalink key provisioning.',
    hardwareSpecs: 'High-Speed Hydraulic Actuator Relays · Cryogenic Infrared Seekers Handoff · MIL-1760 Weapon Interface',
    pqcConfig: {
      kemAlgorithm: 'NIST FIPS 203 ML-KEM-768 Pre-Launch Ephemeral Key Handoff',
      kemStandard: 'NIST FIPS 203 Level 3 (Missile Datalink Key)',
      kemCategory: 'Category 3 (Secret)',
      kemKeySizes: {
        publicKeyBytes: 1184,
        secretKeyBytes: 2400,
        ciphertextBytes: 1088,
        sharedSecretBytes: 32,
      },
      kemLatencyMs: 0.04,
      dsaAlgorithm: 'NIST FIPS 204 ML-DSA-87 Master Arm Release Authorization',
      dsaStandard: 'NIST FIPS 204 Level 5 Weapon Interlock Token',
      dsaCategory: 'Category 5 (Top Secret)',
      dsaKeySizes: {
        publicKeyBytes: 2592,
        secretKeyBytes: 4896,
        signatureBytes: 4595,
      },
      dsaLatencyMs: 0.06,
      hybridCombiner: 'MIL-STD-1760 Two-Way Datalink Key Combiner',
      classicalAlgorithm: 'X25519 ECDH + ECDSA P-384 Pre-Launch Key Loading',
      symmetricCipher: 'AES-256-GCM Two-Way Weapon Guidance Telemetry',
      quantumResistanceBits: 256,
      cnsa2ComplianceStatus: 'CNSA 2.0 Stores Management Directive Approved',
      hsmModule: 'Weapons Interface Bay (WIB) Hardware Release Interlock',
      rekeyCycleSeconds: 60,
      entropySource: 'CIP 2 High-Entropy Dynamic Master Arm Seed',
      antiTamperBoundary: 'Electro-Hydraulic Physical Safe-and-Arm Barrier',
      do178cCycleBudgetUs: 15000,
      messageThroughput: '0.8-sec Pneumatic Launcher Release Execution',
    },
  },
  {
    id: 'cockpit-mfd',
    name: 'Pilot Displays & Hands-On-Throttle (HOTAS)',
    acronym: 'Cockpit MFD / HUD',
    category: 'Flight Controls',
    cipHost: 'Cockpit Graphics Generator',
    x: 730,
    y: 390,
    width: 220,
    height: 95,
    iconType: 'terminal',
    busInterface: 'Fibre Channel Optical Video',
    pqcAlgorithm: 'Authenticated Symbology Pipeline',
    securityDomain: 'Pilot Tactical Glass Enclave',
    criticality: 'DO-178C Level B',
    sloc: '340,000 SLOC (Ada 95 / C++)',
    description: 'Six active-matrix liquid crystal tactical displays (MFDs) and wide-field holographic Head-Up Display presenting authenticated fused God\'s-Eye tracks to the pilot.',
    hardwareSpecs: '6x AMLCD High-Bright 8x8" Color Panels · 30°x24° Holographic HUD · 60 Hz Anti-Aliased Graphics Engine',
    pqcConfig: {
      kemAlgorithm: 'Fibre Channel Optical Stream Key (ML-KEM-768 Derived)',
      kemStandard: 'NIST FIPS 203 Level 3 Video Stream Key',
      kemCategory: 'Category 3 (Secret)',
      kemKeySizes: {
        publicKeyBytes: 1184,
        secretKeyBytes: 2400,
        ciphertextBytes: 1088,
        sharedSecretBytes: 32,
      },
      kemLatencyMs: 0.02,
      dsaAlgorithm: 'NIST FIPS 204 ML-DSA-65 Video Buffer Frame Digest',
      dsaStandard: 'NIST FIPS 204 Level 3 Integrity Verification',
      dsaCategory: 'Category 3 (Secret)',
      dsaKeySizes: {
        publicKeyBytes: 1952,
        secretKeyBytes: 4032,
        signatureBytes: 3309,
      },
      dsaLatencyMs: 0.03,
      hybridCombiner: 'Hardware Video Frame Authenticator',
      classicalAlgorithm: 'CRC-32 + Optical Video Frame Counter',
      symmetricCipher: 'AES-128-GCM Ultra-Low Latency Video Cipher',
      quantumResistanceBits: 192,
      cnsa2ComplianceStatus: 'DO-178C Level B Display Symbology Compliant',
      hsmModule: 'Cockpit Graphics Generator Dedicated Crypto ASIC',
      rekeyCycleSeconds: 300,
      entropySource: 'CIP 1 Optical Display Sync Pipe',
      antiTamperBoundary: 'Armored Cockpit Glass Enclosure',
      do178cCycleBudgetUs: 16666,
      messageThroughput: '60 Hz Refresh Glass Symbology Frame Digest',
    },
  },

  // Tier 5: External Tactical Networks & Autonomous Mesh (Top Right)
  {
    id: 'ifdl-mesh',
    name: 'IFDL Stealth Intra-Flight Datalink',
    acronym: 'IFDL 4-Ship Mesh',
    category: 'Tactical Mesh',
    cipHost: 'CNI Tactical RF Transceivers',
    x: 730,
    y: 530,
    width: 220,
    height: 95,
    iconType: 'radio',
    busInterface: 'MIL-STD-1553B & Directional RF',
    pqcAlgorithm: 'ML-KEM-1024 + ML-DSA-87 Datalink',
    securityDomain: 'Intra-Flight 4-Ship Encrypted Mesh',
    criticality: 'DO-178C Level A',
    sloc: '380,000 SLOC (Ada 95 / C++ Hybrid)',
    description: 'Directional low-probability-of-detection stealth datalink linking 4 Raptor aircraft. Exchanges fused sensor tracks without enemy detection, hardened with quantum lattice ratchets.',
    hardwareSpecs: 'Directional Low-RCS Flush Antennas · Ku-Band Agile Microsecond Bursts · 30-Second Dynamic Rekey',
    pqcConfig: {
      kemAlgorithm: 'NIST FIPS 203 ML-KEM-1024 + X25519 (Level 5 Mesh)',
      kemStandard: 'NIST FIPS 203 Level 5 Lattice Ratchet',
      kemCategory: 'Category 5 (Top Secret)',
      kemKeySizes: {
        publicKeyBytes: 1568,
        secretKeyBytes: 3168,
        ciphertextBytes: 1568,
        sharedSecretBytes: 32,
      },
      kemLatencyMs: 0.05,
      dsaAlgorithm: 'NIST FIPS 204 ML-DSA-87 4-Ship Mesh Flight Signatures',
      dsaStandard: 'NIST FIPS 204 Level 5 Mutual Flight Authentication',
      dsaCategory: 'Category 5 (Top Secret)',
      dsaKeySizes: {
        publicKeyBytes: 2592,
        secretKeyBytes: 4896,
        signatureBytes: 4595,
      },
      dsaLatencyMs: 0.07,
      hybridCombiner: 'NIST SP 800-56C Dual KDF (HKDF-SHA384) + Dynamic Lattice Ratchet',
      classicalAlgorithm: 'X25519 ECDH + Ed25519 Fast Mesh Signatures',
      symmetricCipher: 'AES-256-GCM Narrow-Beam RF Channel',
      quantumResistanceBits: 256,
      cnsa2ComplianceStatus: 'CNSA 2.0 Intra-Flight Datalink Compliant (Full Ratchet)',
      hsmModule: 'IFDL Dedicated Crypto Module with Hardware Lattice Accelerator',
      rekeyCycleSeconds: 30,
      entropySource: 'CNI Sovereign Quantum TRNG Seed Sync',
      antiTamperBoundary: 'Zeroize-on-ejection pilot parachute interlock',
      do178cCycleBudgetUs: 20000,
      messageThroughput: '50 Hz Cyclic Multi-Ship Shared Situational Picture',
    },
  },
  {
    id: 'cca-wingman',
    name: 'Collaborative Combat Aircraft Gateway',
    acronym: 'CCA AI Wingman Link',
    category: 'Tactical Mesh',
    cipHost: 'RACR Tactical Autonomous Enclave',
    x: 390,
    y: 630,
    width: 240,
    height: 85,
    iconType: 'radio',
    busInterface: 'IEEE-1394B FireWire / Tactical RF',
    pqcAlgorithm: 'ML-KEM-768 + ML-DSA-65 Zero-Trust',
    securityDomain: 'Autonomous Uncrewed Teaming Enclave',
    criticality: 'DO-178C Level B',
    sloc: '290,000 SLOC (C++20 OMS Container)',
    description: 'Next-generation manned-unmanned teaming link orchestrating autonomous stealth combat drones, transmitting signed tactical tasks via Open Mission Systems (OMS).',
    hardwareSpecs: 'Zero-Trust Enclave Isolator · OMS v3.1 UCI Protocol Bridge · Microsecond Cryptographic Handshake',
    pqcConfig: {
      kemAlgorithm: 'NIST FIPS 203 ML-KEM-768 + X25519 Zero-Trust Drone Session',
      kemStandard: 'NIST FIPS 203 Level 3 (CCA Teaming Standard)',
      kemCategory: 'Category 3 (Secret)',
      kemKeySizes: {
        publicKeyBytes: 1184,
        secretKeyBytes: 2400,
        ciphertextBytes: 1088,
        sharedSecretBytes: 32,
      },
      kemLatencyMs: 0.04,
      dsaAlgorithm: 'NIST FIPS 204 ML-DSA-65 UCI Mission Task Signatures',
      dsaStandard: 'NIST FIPS 204 Level 3 Universal C2 Interface (UCI)',
      dsaCategory: 'Category 3 (Secret)',
      dsaKeySizes: {
        publicKeyBytes: 1952,
        secretKeyBytes: 4032,
        signatureBytes: 3309,
      },
      dsaLatencyMs: 0.05,
      hybridCombiner: 'NIST SP 800-56C Rev 2 HKDF Combiner',
      classicalAlgorithm: 'X25519 + Ed25519',
      symmetricCipher: 'AES-256-GCM Autonomous Datalink',
      quantumResistanceBits: 192,
      cnsa2ComplianceStatus: 'CNSA 2.0 Collaborative Combat Aircraft Teaming Ready',
      hsmModule: 'RACR Zero-Trust Hardware Enclave Isolator',
      rekeyCycleSeconds: 60,
      entropySource: 'CIP 2 Dynamic Vector Entropy Pool',
      antiTamperBoundary: 'Cryptographic Air-Gap Boundary in RACR Kernel',
      do178cCycleBudgetUs: 20000,
      messageThroughput: '100 UCI Tasking & Electronic Attack Orders / sec',
    },
  },
];

export const AVIONICS_LINKS: AvionicsD3Link[] = [
  // Link 1: CIP 1 to CIP 2 Core
  {
    id: 'link-cip1-cip2',
    source: 'cip-1',
    target: 'cip-2',
    label: 'Hybrid KEM & Dual DSA Backplane',
    type: 'hybrid',
    protocol: 'Fibre Channel (400 Mbps)',
    kemSpec: 'NIST FIPS 203 ML-KEM-1024 + X25519 Composite',
    dsaSpec: 'NIST FIPS 204 ML-DSA-87 (Security Level 5)',
    bandwidth: '400 Mbps Optical',
    latencyMs: 0.08,
    direction: 'bidirectional',
    description: 'High-speed inter-CIP backplane exchanging fused sensor track tables and tactical container instructions. Encrypted using dual-KEM session keys and mutual ML-DSA-87 signatures.',
    handshakeSteps: [
      {
        step: 1,
        title: 'Composite Public Key Exchange',
        detail: 'CIP 1 transmits ephemeral ML-KEM-1024 public key (1,568 bytes) + classical X25519 public key (32 bytes) across Fibre Channel backplane.',
        cryptoPrimitive: 'ML-KEM-1024 PubKey + X25519 PubKey',
        size: '1,600 Bytes',
      },
      {
        step: 2,
        title: 'Key Encapsulation & Ciphertext Return',
        detail: 'CIP 2 encapsulates quantum-resistant shared secret via OQS_KEM_Encap and replies with ciphertext and its own ML-DSA-87 verification token.',
        cryptoPrimitive: 'ML-KEM-1024 Ciphertext (1,568 B)',
        size: '1,568 Bytes',
      },
      {
        step: 3,
        title: 'Dual KDF Combiner (NIST SP 800-56C)',
        detail: 'Both CIPs feed Classical ECDH secret (32B) + Quantum Shared Secret (32B) into HKDF-SHA384, deriving 256-bit symmetric bus session keys.',
        cryptoPrimitive: 'HKDF-SHA384 KDF Combiner',
        size: '256-bit Master Key',
      },
      {
        step: 4,
        title: 'Continuous ML-DSA-87 Mutual Authentication',
        detail: 'Every cyclic frame (50 Hz) is signed with ML-DSA-87 sovereign private key to prevent malicious firmware or bus-injection attacks.',
        cryptoPrimitive: 'ML-DSA-87 Digital Signature',
        size: '4,595 Bytes / Sig',
      },
    ],
  },

  // Link 2: CNI Vault to CIP 1
  {
    id: 'link-cni-cip1',
    source: 'cni-vault',
    target: 'cip-1',
    label: 'Quantum Entropy & Root Seed Injection',
    type: 'kem',
    protocol: 'High-Speed Optical',
    kemSpec: 'FIPS 140-3 L4 True Quantum TRNG Feed',
    dsaSpec: 'ML-DSA-87 Hardware Attestation',
    bandwidth: '1.2 Gbps Entropy Bus',
    latencyMs: 0.04,
    direction: 'unidirectional',
    description: 'Feeds continuous quantum hardware entropy from true tunneling diodes into CIP 1 memory enclaves for non-deterministic ephemeral key synthesis.',
    handshakeSteps: [
      {
        step: 1,
        title: 'Quantum Tunneling Noise Harvesting',
        detail: 'Hardware diodes capture unpredictable quantum subatomic electron tunneling fluctuations inside tamper-sealed cryogenic chamber.',
        cryptoPrimitive: 'Physical Quantum TRNG',
        size: '128 MB/sec Stream',
      },
      {
        step: 2,
        title: 'NIST SP 800-90B Health Testing',
        detail: 'Continuous repetition-count and adaptive-proportion tests verify entropy purity before supplying seeds to ML-KEM key generation.',
        cryptoPrimitive: 'SP 800-90B Online Monitor',
        size: 'Real-time Verification',
      },
      {
        step: 3,
        title: 'Secure Seed Injection to CIP 1',
        detail: 'Cryptographic seed pools dispatched to CIP 1 hardware coprocessor over dedicated isolated optical channel.',
        cryptoPrimitive: 'Sealed Optical Bus Transfer',
        size: '512-bit Seed Blocks',
      },
    ],
  },

  // Link 3: CNI Vault to CIP 2
  {
    id: 'link-cni-cip2',
    source: 'cni-vault',
    target: 'cip-2',
    label: 'FIPS 204 Root Certificate & Seed Feed',
    type: 'dsa',
    protocol: 'High-Speed Optical',
    kemSpec: 'ML-KEM Seed Distribution',
    dsaSpec: 'CNSA 2.0 Sovereign Root Public Keys',
    bandwidth: '400 Mbps Secure Channel',
    latencyMs: 0.05,
    direction: 'unidirectional',
    description: 'Provisions CIP 2 container runtime with sovereign Root CA certificates and authorized developer keys for ML-DSA-87 signature verification of apps.',
    handshakeSteps: [
      {
        step: 1,
        title: 'Sovereign Root CA Attestation',
        detail: 'Hardware vault presents zero-leakage ML-DSA-87 root public keys to CIP 2 RACR kernel upon system initialization.',
        cryptoPrimitive: 'Root ML-DSA-87 Key Store',
        size: '2,592 Bytes PubKey',
      },
      {
        step: 2,
        title: 'Hardened Microcode Attestation',
        detail: 'Measures SHA-3-512 hashes of RACR kernel memory partitions to guarantee tamper-proof operational integrity.',
        cryptoPrimitive: 'Measured Boot SHA-3-512',
        size: '64 Bytes Hash',
      },
    ],
  },

  // Link 4: APG-77 Radar to CIP 1
  {
    id: 'link-radar-cip1',
    source: 'apg-77',
    target: 'cip-1',
    label: 'ML-DSA-65 Signed Radar Track Stream',
    type: 'dsa',
    protocol: 'High-Speed Optical',
    kemSpec: 'ML-KEM-768 Pre-Shared Channel',
    dsaSpec: 'NIST FIPS 204 ML-DSA-65 Frame Signing',
    bandwidth: '400 Mbps Optical Data Stream',
    latencyMs: 0.06,
    direction: 'unidirectional',
    description: 'Raw high-resolution AESA radar detections, Doppler centroids, and LPI synthetic aperture maps signed at 50 Hz with ML-DSA-65 to defeat spoofing.',
    handshakeSteps: [
      {
        step: 1,
        title: 'LPI Pulse Doppler Target Extraction',
        detail: 'APG-77 digital beamformer resolves target bearing, velocity, and radar cross-section from microsecond frequency-agile pulses.',
        cryptoPrimitive: 'Radar Signal Processor DSP',
        size: '64 KB Track Burst',
      },
      {
        step: 2,
        title: 'ML-DSA-65 Frame Signing',
        detail: 'Radar cryptographic co-processor computes ML-DSA-65 signature across the track buffer before serializing onto optical bus.',
        cryptoPrimitive: 'FIPS 204 ML-DSA-65 Signature',
        size: '3,309 Bytes Sig',
      },
      {
        step: 3,
        title: 'ISF Core Verification & Correlation',
        detail: 'CIP 1 verifies signature in 0.05 ms and feeds verified kinematic track into Kalman filter fusion matrix.',
        cryptoPrimitive: 'CIP 1 Hardware Verification',
        size: 'DO-178C Level A Passed',
      },
    ],
  },

  // Link 5: ALR-94 EW to CIP 1
  {
    id: 'link-alr94-cip1',
    source: 'alr-94',
    target: 'cip-1',
    label: 'ML-DSA-65 Signed Emitter Geolocation',
    type: 'dsa',
    protocol: 'Fibre Channel (400 Mbps)',
    kemSpec: 'ML-KEM-768 Encrypted Channel',
    dsaSpec: 'NIST FIPS 204 ML-DSA-65 Emitter Digest',
    bandwidth: '400 Mbps Optical',
    latencyMs: 0.07,
    direction: 'unidirectional',
    description: 'Passive RF azimuth bearings, Differential Time-of-Arrival (DTOA) coordinates, and sovereign threat library matches authenticated via ML-DSA-65.',
    handshakeSteps: [
      {
        step: 1,
        title: 'Differential Time of Arrival (DTOA) Fix',
        detail: 'Calculates nanosecond phase difference across 30 wing and nose antennas to pinpoint threat radar location at 250 NM.',
        cryptoPrimitive: 'Interferometry DTOA Math',
        size: 'Spherical Vector',
      },
      {
        step: 2,
        title: 'Emitter Library Digest Signature',
        detail: 'Encodes threat identity and electronic countermeasure classification with ML-DSA-65 cryptographic seal.',
        cryptoPrimitive: 'ML-DSA-65 Signature',
        size: '3,309 Bytes',
      },
      {
        step: 3,
        title: 'God\'s-Eye Correlation in CIP 1',
        detail: 'CIP 1 cross-references passive EW bearing with active radar tracks to form zero-ambiguity single track icon on cockpit glass.',
        cryptoPrimitive: 'Kalman Fusion Correlator',
        size: 'Fused Track Object',
      },
    ],
  },

  // Link 6: CIP 1 to VMS / TVC
  {
    id: 'link-cip1-vms',
    source: 'cip-1',
    target: 'vms-tvc',
    label: 'MIL-1553B Authenticated Flight Laws & TVC',
    type: 'dsa',
    protocol: 'MIL-STD-1553B Ch-A/B',
    kemSpec: 'Pre-Shared Symmetric Key Schedule',
    dsaSpec: 'NIST FIPS 204 ML-DSA-87 Fast Command Token',
    bandwidth: '1 Mbps Dual-Redundant Bus',
    latencyMs: 0.12,
    direction: 'bidirectional',
    description: 'Mission autopilot steering limits, Mach 1.62 supercruise trim commands, and high-AoA thrust-vectoring nozzle coordinates sent over quad MIL-1553B bus.',
    handshakeSteps: [
      {
        step: 1,
        title: 'Guidance Law Calculation in CIP 1',
        detail: 'Autopilot computes required flaperon deflections and ±20° F119 engine nozzle pitch deflection for combat turns.',
        cryptoPrimitive: 'Control Law Algorithm',
        size: '32-word Frame',
      },
      {
        step: 2,
        title: 'Level A Safety ML-DSA Verification',
        detail: 'VMS flight computers verify cryptographic token on command frame to ensure flight control surfaces cannot be spoofed by EW cyber intrusion.',
        cryptoPrimitive: 'ML-DSA-87 Token Verification',
        size: 'Hardware Accelerated',
      },
      {
        step: 3,
        title: 'Actuator Execution & Feedback Acknowledgment',
        detail: 'Hydraulic pitch vectoring nozzles deflect at 20°/sec; feedback position status returned to CIP 1 on Channel B.',
        cryptoPrimitive: 'MIL-1553B ACK Word',
        size: 'Dual-Channel Telemetry',
      },
    ],
  },

  // Link 7: CIP 2 to Weapons Bay (SMS)
  {
    id: 'link-cip2-sms',
    source: 'cip-2',
    target: 'sms-weapons',
    label: 'Hybrid KEM Missile Handoff & ML-DSA Interlock',
    type: 'hybrid',
    protocol: 'MIL-STD-1553B Ch-A/B',
    kemSpec: 'NIST FIPS 203 ML-KEM-768 Pre-Launch Ephemeral',
    dsaSpec: 'NIST FIPS 204 ML-DSA-87 Weapon Release Signature',
    bandwidth: '1 Mbps MIL-1760 Weapon Bus',
    latencyMs: 0.15,
    direction: 'bidirectional',
    description: 'Designates target coordinates to AIM-120D AMRAAM missiles inside main bay. Injects quantum-hardened terminal datalink keys and validates master arm release authorization.',
    handshakeSteps: [
      {
        step: 1,
        title: 'Master Arm & Launch Interlock Validation',
        detail: 'CIP 2 validates pilot trigger pull and physical weapon bay interlock status via ML-DSA-87 digital authorization certificate.',
        cryptoPrimitive: 'ML-DSA-87 Authorization Token',
        size: 'Cryptographic Safe Interlock',
      },
      {
        step: 2,
        title: 'AIM-120D In-Bay Key Encapsulation',
        detail: 'Executes ML-KEM-768 encapsulation to load two-way encrypted terminal guidance datalink keys into missile seeker before release.',
        cryptoPrimitive: 'ML-KEM-768 Shared Key (32B)',
        size: '1,088 Bytes Ciphertext',
      },
      {
        step: 3,
        title: 'Bay Door Pneumatic Release Command',
        detail: 'Bay doors open for 0.8 seconds; LAU-142/A pneumatic launcher ejects missile at 25 ft/sec; missile rocket motor ignites clear of aircraft.',
        cryptoPrimitive: 'Hydraulic PQC Ejection Pulse',
        size: '0.8s Stealth Exposure',
      },
    ],
  },

  // Link 8: CIP 1 to Cockpit MFDs
  {
    id: 'link-cip1-mfd',
    source: 'cip-1',
    target: 'cockpit-mfd',
    label: 'Authenticated Tactical Glass Symbology',
    type: 'dsa',
    protocol: 'Fibre Channel (400 Mbps)',
    kemSpec: 'Hardware Optical Video Channel',
    dsaSpec: 'ML-DSA-65 Frame Integrity Check',
    bandwidth: '400 Mbps Optical Video',
    latencyMs: 0.03,
    direction: 'unidirectional',
    description: 'High-definition tactical video pipeline displaying verified hostile/friendly tracks, missile engagement envelopes, and PQC encryption status on pilot displays.',
    handshakeSteps: [
      {
        step: 1,
        title: 'God\'s-Eye Tactical Symbology Synthesis',
        detail: 'ISF engine renders tactical 3D threat circles, weapon launch envelopes, and wingman telemetry vectors.',
        cryptoPrimitive: 'Graphics Vector Synthesizer',
        size: '60 Hz Frame Stream',
      },
      {
        step: 2,
        title: 'Display Buffer Integrity Verification',
        detail: 'Hardware graphics processor checks ML-DSA-65 digest to verify situational awareness picture has not suffered pixel corruption or adversarial spoofing.',
        cryptoPrimitive: 'ML-DSA-65 Verification',
        size: 'Pixel-Level Assurance',
      },
    ],
  },

  // Link 9: CIP 2 to IFDL 4-Ship Mesh
  {
    id: 'link-cip2-ifdl',
    source: 'cip-2',
    target: 'ifdl-mesh',
    label: 'Hybrid KEM Datalink Mesh & Lattice Ratchet',
    type: 'hybrid',
    protocol: 'MIL-STD-1553B Ch-A/B',
    kemSpec: 'NIST FIPS 203 ML-KEM-1024 + X25519 Composite',
    dsaSpec: 'NIST FIPS 204 ML-DSA-87 Flight Mesh Signatures',
    bandwidth: 'Microsecond RF Datalink Bursts',
    latencyMs: 0.18,
    direction: 'bidirectional',
    description: 'Directional Ku-band stealth datalink connecting 4-ship Raptor flight cell. Shares complete radar pictures silently; rekeys every 30 seconds via post-quantum lattice ratchets.',
    handshakeSteps: [
      {
        step: 1,
        title: 'Flight Mesh Ephemeral Handshake',
        detail: 'Lead Raptor negotiates session keys with Wingmen 02, 03, and 04 using ML-KEM-1024 + X25519 composite protocol.',
        cryptoPrimitive: 'ML-KEM-1024 Encap / Decap',
        size: '1,568 Bytes per Wingman',
      },
      {
        step: 2,
        title: '30-Second Quantum Lattice Ratchet',
        detail: 'Every 30 seconds during stealth flight, an automated ratchet computes new ephemeral session keys, eliminating harvest-now-decrypt-later vulnerability.',
        cryptoPrimitive: 'Lattice Key Ratchet',
        size: 'Zero Interruption Rekey',
      },
      {
        step: 3,
        title: 'ML-DSA-87 Signed Multi-Ship Sensor Sharing',
        detail: 'Tracks detected by Wingman 04 (e.g. at 150 NM) automatically populate Lead Raptor\'s radar display with authenticated cryptographic certainty.',
        cryptoPrimitive: 'ML-DSA-87 Flight Signatures',
        size: '4-Ship Shared Picture',
      },
    ],
  },

  // Link 10: CIP 2 to CCA Autonomous Wingman
  {
    id: 'link-cip2-cca',
    source: 'cip-2',
    target: 'cca-wingman',
    label: 'Zero-Trust OMS Manned-Unmanned Teaming Link',
    type: 'hybrid',
    protocol: 'IEEE-1394B FireWire',
    kemSpec: 'NIST FIPS 203 ML-KEM-768 Enclave Session',
    dsaSpec: 'NIST FIPS 204 ML-DSA-65 UCI Mission Orders',
    bandwidth: '400 Mbps FireWire Serial',
    latencyMs: 0.14,
    direction: 'bidirectional',
    description: 'Connects RACR Open Mission Systems container kernel with AI-powered Collaborative Combat Aircraft (CCA) uncrewed stealth drones, dispatching signed UCI tasks.',
    handshakeSteps: [
      {
        step: 1,
        title: 'Zero-Trust Enclave Mutual Authentication',
        detail: 'CCA autonomous drone hardware cryptoprocessor performs mutual ML-KEM-768 handshake with Raptor CIP 2 RACR engine.',
        cryptoPrimitive: 'ML-KEM-768 Enclave Pairing',
        size: '1,088 Bytes Handshake',
      },
      {
        step: 2,
        title: 'Universal Command & Control Interface (UCI)',
        detail: 'F-22 pilot commands drone forward to light up enemy radars; tasking orders signed with ML-DSA-65 to prevent electronic spoofing or hijacking.',
        cryptoPrimitive: 'ML-DSA-65 UCI Signature',
        size: '3,309 Bytes Signed Order',
      },
      {
        step: 3,
        title: 'Telemetry & Autonomous Electronic Attack Return',
        detail: 'Drone streams back forward electronic intelligence over encrypted hybrid session without breaking Raptor\'s passive RF silence.',
        cryptoPrimitive: 'AES-256-GCM Telemetry Pipe',
        size: 'LPI Forward Sensor Feed',
      },
    ],
  },

  // Link 11: Avionics Backbone to CIP 1 & CIP 2
  {
    id: 'link-bus-cip1',
    source: 'avionics-bus',
    target: 'cip-1',
    label: 'Multiplex Bus Channel-A Feed',
    type: 'bus',
    protocol: 'MIL-STD-1553B Ch-A/B',
    bandwidth: 'Dual-Redundant 1 Mbps',
    latencyMs: 0.10,
    direction: 'bidirectional',
    description: 'Hardware bus controller transmitting time-multiplexed command and status words directly to CIP 1 avionics coprocessors.',
    handshakeSteps: [
      {
        step: 1,
        title: 'Bus Controller Interrogation',
        detail: 'Central bus controller polls remote terminals at 100 Hz according to deterministic major/minor cycle schedule.',
        cryptoPrimitive: '1553B Command Word',
        size: '16-bit Manchester II',
      },
    ],
  },
  {
    id: 'link-bus-cip2',
    source: 'avionics-bus',
    target: 'cip-2',
    label: 'Multiplex Bus Channel-B Feed',
    type: 'bus',
    protocol: 'MIL-STD-1553B Ch-A/B',
    bandwidth: 'Dual-Redundant 1 Mbps',
    latencyMs: 0.10,
    direction: 'bidirectional',
    description: 'Redundant bus controller transmitting time-multiplexed data words directly to CIP 2 RACR open mission systems coprocessors.',
    handshakeSteps: [
      {
        step: 1,
        title: 'Channel B Redundant Synchronization',
        detail: 'Mirrored bus channel verifying zero parity errors across high-noise aerodynamic flight environments.',
        cryptoPrimitive: '1553B Status Word',
        size: '16-bit Manchester II',
      },
    ],
  },
];

interface F22AvionicsD3MapProps {
  flightMode?: F22FlightMode;
  onSelectSubsystem?: (subsystem: F22AvionicsSubsystem) => void;
  onOpenCodeView?: (subsystem: F22AvionicsSubsystem) => void;
}

export const F22AvionicsD3Map: React.FC<F22AvionicsD3MapProps> = ({
  flightMode = 'Stealth',
  onSelectSubsystem,
  onOpenCodeView,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interaction State
  const [selectedNodeId, setSelectedNodeId] = useState<string>('cip-1');
  const [selectedLinkId, setSelectedLinkId] = useState<string>('link-cip1-cip2');
  const [flowFilter, setFlowFilter] = useState<CommunicationFlowType>('all');
  const [activeFlightMode, setActiveFlightMode] = useState<F22FlightMode>(flightMode);
  const [isSimulatingCycle, setIsSimulatingCycle] = useState<boolean>(true);
  const [activeSimStep, setActiveSimStep] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Subsystem PQC Inspector View: 'specs' | 'benchmark' | 'configure' | 'bus'
  const [inspectorSubTab, setInspectorSubTab] = useState<'specs' | 'benchmark' | 'configure' | 'bus'>('specs');

  // Interactive Benchmark Simulator State
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [lastBenchmarkResult, setLastBenchmarkResult] = useState<{
    nodeId: string;
    timestamp: string;
    encapTimeUs: number;
    decapTimeUs: number;
    signTimeUs: number;
    verifyTimeUs: number;
    signatureVerified: boolean;
    quantumEntropyBits: number;
    ciphertextHex: string;
    signatureHex: string;
  } | null>(null);

  // Selected Node Object
  const selectedNode = useMemo(
    () => AVIONICS_NODES.find((n) => n.id === selectedNodeId) || AVIONICS_NODES[3],
    [selectedNodeId]
  );

  // Selected Link Object
  const selectedLink = useMemo(
    () => AVIONICS_LINKS.find((l) => l.id === selectedLinkId) || AVIONICS_LINKS[0],
    [selectedLinkId]
  );

  // Sync prop changes
  useEffect(() => {
    setActiveFlightMode(flightMode);
  }, [flightMode]);

  // Active PQC Preset
  const activePreset = useMemo(
    () => F22_PQC_MODE_PRESETS[activeFlightMode],
    [activeFlightMode]
  );

  // Match to F22AvionicsSubsystem data if available
  const matchedAvionicsSubsystem = useMemo(() => {
    if (selectedNodeId === 'cip-1') {
      return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'isf-fusion');
    }
    if (selectedNodeId === 'cip-2') {
      return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'racr-oms');
    }
    if (selectedNodeId === 'apg-77') {
      return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'apg77-radar');
    }
    if (selectedNodeId === 'alr-94') {
      return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'alr94-ew');
    }
    if (selectedNodeId === 'vms-tvc') {
      return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'fcs-thrust-vec');
    }
    if (selectedNodeId === 'ifdl-mesh') {
      return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'ifdl-cnsa2');
    }
    return F22_AVIONICS_SUBSYSTEMS[0];
  }, [selectedNodeId]);

  // Simulation timer
  useEffect(() => {
    if (!isSimulatingCycle) return;
    const interval = setInterval(() => {
      setActiveSimStep((prev) => (prev >= 5 ? 1 : prev + 1));
    }, 2800);
    return () => clearInterval(interval);
  }, [isSimulatingCycle]);

  // Filtered Links
  const visibleLinks = useMemo(() => {
    if (flowFilter === 'all') return AVIONICS_LINKS;
    if (flowFilter === 'kem') return AVIONICS_LINKS.filter((l) => l.type === 'kem' || l.type === 'hybrid');
    if (flowFilter === 'dsa') return AVIONICS_LINKS.filter((l) => l.type === 'dsa' || l.type === 'hybrid');
    if (flowFilter === 'bus') return AVIONICS_LINKS.filter((l) => l.type === 'bus' || l.protocol.includes('1553B') || l.protocol.includes('Fibre Channel'));
    return AVIONICS_LINKS;
  }, [flowFilter]);

  // Trigger Benchmark for active node
  const handleRunBenchmark = useCallback(() => {
    setIsBenchmarking(true);
    setTimeout(() => {
      const cfg = selectedNode.pqcConfig;
      const encap = Math.round(cfg.kemLatencyMs * 1000 * (0.9 + Math.random() * 0.2));
      const decap = Math.round(cfg.kemLatencyMs * 1100 * (0.9 + Math.random() * 0.2));
      const sign = Math.round(cfg.dsaLatencyMs * 1000 * (0.9 + Math.random() * 0.2));
      const verify = Math.round(cfg.dsaLatencyMs * 600 * (0.9 + Math.random() * 0.2));

      // Generate realistic hex slice
      const mockCiphertextHex = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join(' ');
      const mockSigHex = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join(' ');

      setLastBenchmarkResult({
        nodeId: selectedNode.id,
        timestamp: new Date().toLocaleTimeString(),
        encapTimeUs: encap,
        decapTimeUs: decap,
        signTimeUs: sign,
        verifyTimeUs: verify,
        signatureVerified: true,
        quantumEntropyBits: cfg.quantumResistanceBits,
        ciphertextHex: mockCiphertextHex.toUpperCase(),
        signatureHex: mockSigHex.toUpperCase(),
      });
      setIsBenchmarking(false);
    }, 450);
  }, [selectedNode]);

  // Render D3 Visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 1040;
    const height = 740;

    // Defs & Gradients
    const defs = svg.append('defs');

    // Glow Filter
    const filterGlow = defs.append('filter')
      .attr('id', 'neon-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filterGlow.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filterGlow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Subtle Node Shadow Filter
    const filterShadow = defs.append('filter')
      .attr('id', 'node-shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filterShadow.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '4')
      .attr('stdDeviation', '6')
      .attr('flood-color', '#000000')
      .attr('flood-opacity', '0.7');

    // Markers for Flow Arrows
    const addMarker = (id: string, color: string) => {
      defs.append('marker')
        .attr('id', id)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', '8')
        .attr('refY', '5')
        .attr('markerWidth', '6')
        .attr('markerHeight', '6')
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', 'M 0 1 L 9 5 L 0 9 z')
        .attr('fill', color);
    };

    addMarker('marker-kem', '#06b6d4'); // Cyan
    addMarker('marker-dsa', '#10b981'); // Emerald
    addMarker('marker-hybrid', '#8b5cf6'); // Violet / Purple
    addMarker('marker-bus', '#f59e0b'); // Amber

    // Background Grid Pattern
    const pattern = defs.append('pattern')
      .attr('id', 'cyber-grid')
      .attr('width', '30')
      .attr('height', '30')
      .attr('patternUnits', 'userSpaceOnUse');
    pattern.append('path')
      .attr('d', 'M 30 0 L 0 0 0 30')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(16, 185, 129, 0.05)')
      .attr('stroke-width', '1');

    // Root Group with Zoom Support
    const rootG = svg.append('g').attr('class', 'root-canvas');

    // Background Rectangle
    rootG.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#05070a');

    rootG.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#cyber-grid)');

    // Architectural Tier Regions Background
    const drawZoneBoundary = (x: number, y: number, w: number, h: number, title: string, color: string) => {
      const zoneG = rootG.append('g').attr('class', 'zone-region');
      zoneG.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', w)
        .attr('height', h)
        .attr('rx', 14)
        .attr('fill', `${color}06`)
        .attr('stroke', `${color}25`)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 4');

      zoneG.append('text')
        .attr('x', x + 14)
        .attr('y', y + 20)
        .attr('fill', color)
        .attr('font-size', '10px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', 'bold')
        .attr('letter-spacing', '0.1em')
        .text(title.toUpperCase());
    };

    // Draw Zones
    drawZoneBoundary(50, 70, 270, 440, 'Tier 1: Sensors & Threat Emitters', '#38bdf8');
    drawZoneBoundary(350, 70, 320, 640, 'Tier 2: CIP 1 & CIP 2 Core Avionics & Backbone', '#10b981');
    drawZoneBoundary(700, 70, 280, 580, 'Tier 3: Flight Controls, Weapons & Displays', '#f59e0b');

    // Links Layer
    const linksG = rootG.append('g').attr('class', 'links-layer');

    // Helper to get node centers and docking anchors
    const nodeMap = new Map<string, AvionicsD3Node>();
    AVIONICS_NODES.forEach((n) => nodeMap.set(n.id, n));

    const computeLinkCurve = (link: AvionicsD3Link) => {
      const src = nodeMap.get(link.source);
      const tgt = nodeMap.get(link.target);
      if (!src || !tgt) return '';

      // Determine attachment anchor points
      let sx = src.x + src.width / 2;
      let sy = src.y + src.height / 2;
      let tx = tgt.x + tgt.width / 2;
      let ty = tgt.y + tgt.height / 2;

      // Adjust anchors to perimeter
      if (src.x < tgt.x) {
        sx = src.x + src.width;
        tx = tgt.x;
      } else if (src.x > tgt.x) {
        sx = src.x;
        tx = tgt.x + tgt.width;
      }

      // Smooth horizontal curve
      const dx = tx - sx;
      const dy = ty - sy;
      const cx1 = sx + dx * 0.45;
      const cy1 = sy;
      const cx2 = tx - dx * 0.45;
      const cy2 = ty;

      return `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;
    };

    // Draw Links
    visibleLinks.forEach((link) => {
      const isSelected = link.id === selectedLinkId;
      const pathData = computeLinkCurve(link);

      const linkColor =
        link.type === 'kem'
          ? '#06b6d4'
          : link.type === 'dsa'
          ? '#10b981'
          : link.type === 'hybrid'
          ? '#a855f7'
          : '#f59e0b';

      const linkGroup = linksG.append('g')
        .attr('class', `link-group link-${link.id}`)
        .style('cursor', 'pointer')
        .on('click', () => {
          setSelectedLinkId(link.id);
        });

      // Hit area
      linkGroup.append('path')
        .attr('d', pathData)
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 18);

      // Outer glow line if selected
      if (isSelected) {
        linkGroup.append('path')
          .attr('d', pathData)
          .attr('fill', 'none')
          .attr('stroke', linkColor)
          .attr('stroke-width', 6)
          .attr('stroke-opacity', 0.4)
          .attr('filter', 'url(#neon-glow)');
      }

      // Base Link Path
      const mainPath = linkGroup.append('path')
        .attr('d', pathData)
        .attr('fill', 'none')
        .attr('stroke', linkColor)
        .attr('stroke-width', isSelected ? 3 : 2)
        .attr('stroke-opacity', isSelected ? 1 : 0.65)
        .attr('stroke-dasharray', link.type === 'bus' ? '6 4' : null)
        .attr('marker-end', `url(#marker-${link.type})`);

      // Animated Particles / Pulses along path
      if (isSimulatingCycle) {
        const particle = linkGroup.append('circle')
          .attr('r', isSelected ? 4.5 : 3.5)
          .attr('fill', linkColor)
          .attr('filter', 'url(#neon-glow)');

        const pathNode = mainPath.node();
        if (pathNode) {
          const totalLength = pathNode.getTotalLength();
          const repeatAnimation = () => {
            particle
              .transition()
              .duration(1600 + Math.random() * 800)
              .ease(d3.easeLinear)
              .attrTween('transform', () => {
                return (t: number) => {
                  const p = pathNode.getPointAtLength(t * totalLength);
                  return `translate(${p.x}, ${p.y})`;
                };
              })
              .on('end', repeatAnimation);
          };
          repeatAnimation();
        }
      }
    });

    // Nodes Layer
    const nodesG = rootG.append('g').attr('class', 'nodes-layer');

    AVIONICS_NODES.forEach((node) => {
      const isSelected = node.id === selectedNodeId;

      const nodeGroup = nodesG.append('g')
        .attr('class', `node-group node-${node.id}`)
        .attr('transform', `translate(${node.x}, ${node.y})`)
        .style('cursor', 'pointer')
        .on('click', () => {
          setSelectedNodeId(node.id);
          // Automatically switch link to related link if available
          const relatedLink = AVIONICS_LINKS.find((l) => l.source === node.id || l.target === node.id);
          if (relatedLink) {
            setSelectedLinkId(relatedLink.id);
          }
        });

      // Animated Pulse Ring around Selected Node
      if (isSelected) {
        const pulseRing = nodeGroup.append('rect')
          .attr('x', -4)
          .attr('y', -4)
          .attr('width', node.width + 8)
          .attr('height', node.height + 8)
          .attr('rx', 14)
          .attr('fill', 'none')
          .attr('stroke', '#10b981')
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.8)
          .attr('filter', 'url(#neon-glow)');

        const animateRing = () => {
          pulseRing
            .transition()
            .duration(1500)
            .attr('stroke-opacity', 0.2)
            .attr('stroke-width', 3.5)
            .transition()
            .duration(1500)
            .attr('stroke-opacity', 0.9)
            .attr('stroke-width', 2)
            .on('end', animateRing);
        };
        animateRing();
      }

      // Background Card
      const cardRect = nodeGroup.append('rect')
        .attr('width', node.width)
        .attr('height', node.height)
        .attr('rx', 10)
        .attr('filter', 'url(#node-shadow)')
        .attr('fill', isSelected ? '#0f172a' : '#0b0f17')
        .attr('stroke', isSelected ? '#10b981' : '#1e293b')
        .attr('stroke-width', isSelected ? 2 : 1)
        .attr('transition', 'all 0.2s');

      if (isSelected) {
        cardRect.attr('filter', 'url(#neon-glow)');
      }

      // Top Header Accent Bar
      const headerColor =
        node.category === 'Core CIP'
          ? '#10b981'
          : node.category === 'Sensors'
          ? '#06b6d4'
          : node.category === 'Flight Controls'
          ? '#f59e0b'
          : node.category === 'Weapons'
          ? '#ef4444'
          : '#8b5cf6';

      nodeGroup.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', node.width)
        .attr('height', 4)
        .attr('rx', 2)
        .attr('fill', headerColor);

      // Icon & Node Acronym
      const iconG = nodeGroup.append('g').attr('transform', 'translate(12, 16)');
      iconG.append('rect')
        .attr('width', 24)
        .attr('height', 24)
        .attr('rx', 6)
        .attr('fill', `${headerColor}20`)
        .attr('stroke', `${headerColor}60`)
        .attr('stroke-width', 1);

      // Small glowing status dot
      iconG.append('circle')
        .attr('cx', 12)
        .attr('cy', 12)
        .attr('r', 4)
        .attr('fill', headerColor);

      // Acronym
      nodeGroup.append('text')
        .attr('x', 44)
        .attr('y', 25)
        .attr('fill', '#ffffff')
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('font-family', 'ui-monospace, monospace')
        .text(node.acronym);

      // Classification Badge
      const isTopSecret = node.securityDomain.includes('Top Secret') || node.securityDomain.includes('Sovereign');
      nodeGroup.append('rect')
        .attr('x', node.width - 56)
        .attr('y', 14)
        .attr('width', 46)
        .attr('height', 16)
        .attr('rx', 4)
        .attr('fill', isTopSecret ? '#7f1d1d' : '#14532d')
        .attr('stroke', isTopSecret ? '#ef4444' : '#22c55e')
        .attr('stroke-width', 0.5);

      nodeGroup.append('text')
        .attr('x', node.width - 33)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'ui-monospace, monospace')
        .text(isTopSecret ? 'TS//SAP' : 'SECRET');

      // Subsystem Full Title
      nodeGroup.append('text')
        .attr('x', 12)
        .attr('y', 52)
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .attr('font-family', 'sans-serif')
        .text(node.name.length > 30 ? node.name.slice(0, 28) + '...' : node.name);

      // PQC Algorithm Strip & Interactive Click Prompt
      nodeGroup.append('rect')
        .attr('x', 10)
        .attr('y', 64)
        .attr('width', node.width - 20)
        .attr('height', 20)
        .attr('rx', 4)
        .attr('fill', isSelected ? '#13213c' : '#090d16')
        .attr('stroke', isSelected ? '#38bdf8' : '#1e293b')
        .attr('stroke-width', 1);

      nodeGroup.append('text')
        .attr('x', 16)
        .attr('y', 78)
        .attr('fill', isSelected ? '#67e8f9' : '#38bdf8')
        .attr('font-size', '9px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', '600')
        .text(node.pqcAlgorithm.length > 32 ? node.pqcAlgorithm.slice(0, 30) + '..' : node.pqcAlgorithm);
    });

    // Zoom and Pan Handlers
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.65, 2.5])
      .on('zoom', (event) => {
        rootG.attr('transform', event.transform.toString());
        setZoomLevel(Math.round(event.transform.k * 100) / 100);
      });

    svg.call(zoomBehavior);

    // Initial positioning
    svg.call(zoomBehavior.transform, d3.zoomIdentity.scale(1));
  }, [visibleLinks, selectedNodeId, selectedLinkId, isSimulatingCycle, activeFlightMode]);

  // Zoom control callbacks
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(250)
      .call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1.25);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(250)
      .call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 0.8);
  }, []);

  const handleResetZoom = useCallback(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(350)
      .call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl transition-all ${
        isExpanded ? 'fixed inset-4 z-50 flex flex-col' : 'relative space-y-4'
      }`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-zinc-800/90 bg-zinc-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                F-22 Raptor Avionics Suite: PQC-Hardened Architecture Map
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                CNSA 2.0 / FIPS 203 & 204
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Interactive D3 visual topology illustrating hybrid KEM-DSA cryptographic message flows between Common Integrated Processors (CIP 1 & CIP 2) and flight subsystems. Click any node to inspect its specific PQC algorithm configuration.
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Simulation Toggle */}
          <button
            type="button"
            onClick={() => setIsSimulatingCycle(!isSimulatingCycle)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              isSimulatingCycle
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-950'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-750'
            }`}
          >
            {isSimulatingCycle ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active Cycle</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-zinc-400" />
                <span>Simulate Flow</span>
              </>
            )}
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Canvas Zoom"
            className="p-2 rounded-lg text-zinc-400 bg-zinc-850 hover:bg-zinc-800 hover:text-white border border-zinc-750 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Zoom In / Out */}
          <div className="flex items-center rounded-lg border border-zinc-750 bg-zinc-850 divide-x divide-zinc-750">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Expand Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Restore Size' : 'Expand Fullscreen'}
            className="p-2 rounded-lg text-zinc-400 bg-zinc-850 hover:bg-zinc-800 hover:text-white border border-zinc-750 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar & Mission Profile Switcher */}
      <div className="px-5 py-3 bg-zinc-900/40 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Flow Type Filters */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-mono font-semibold text-[11px] uppercase">
            Protocol Overlay:
          </span>
          <div className="inline-flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
            {(
              [
                { id: 'all', label: 'All Interconnects', color: 'text-zinc-200' },
                { id: 'kem', label: 'Hybrid KEM Flows', color: 'text-cyan-400' },
                { id: 'dsa', label: 'ML-DSA Signatures', color: 'text-emerald-400' },
                { id: 'bus', label: 'MIL-1553B / Fibre Channel', color: 'text-amber-400' },
              ] as { id: CommunicationFlowType; label: string; color: string }[]
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setFlowFilter(filter.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                  flowFilter === filter.id
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <span className={filter.color}>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Flight Mode / PQC Profile Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-mono font-semibold text-[11px] uppercase">
            F-22 Regime:
          </span>
          <div className="inline-flex rounded-lg bg-zinc-950 p-1 border border-zinc-800">
            {(['Stealth', 'Combat', 'Training'] as F22FlightMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setActiveFlightMode(mode)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                  activeFlightMode === mode
                    ? mode === 'Stealth'
                      ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold'
                      : mode === 'Combat'
                      ? 'bg-amber-950 border border-amber-600 text-amber-300 font-bold'
                      : 'bg-sky-950 border border-sky-600 text-sky-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Crypto HUD Metrics */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-300 hidden xl:flex">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">KEM:</span>
            <span className="text-cyan-300 font-semibold">{activePreset.kemAlgorithm.split(' ')[2] || 'ML-KEM-1024'}</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">DSA:</span>
            <span className="text-emerald-300 font-semibold">{activePreset.signatureAlgorithm.split(' ')[2] || 'ML-DSA-87'}</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Rekey:</span>
            <span className="text-amber-300 font-semibold">{activePreset.rekeyIntervalSeconds}s Ratchet</span>
          </div>
        </div>
      </div>

      {/* Main Content: D3 Canvas (Left/Top) + Dual Deep-Dive Inspector Panels (Right/Bottom) */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 ${isExpanded ? 'flex-1 overflow-hidden' : ''}`}>
        {/* D3 Canvas Container (7 cols) */}
        <div className="lg:col-span-7 p-3 bg-zinc-950 flex flex-col relative min-h-[580px] lg:min-h-[660px]">
          {/* Active Node Guidance Prompt */}
          <div className="absolute top-5 right-5 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-emerald-500/30 text-emerald-300 text-xs font-mono shadow-lg backdrop-blur-md">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Click any subsystem node to inspect specific PQC configurations</span>
          </div>

          {/* Canvas Overlay Legend */}
          <div className="absolute top-5 left-5 z-10 flex flex-col gap-1.5 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/90 backdrop-blur-md text-[10px] font-mono pointer-events-none shadow-lg">
            <div className="text-zinc-400 font-bold uppercase tracking-wider mb-0.5">
              Cryptographic Flow Legend
            </div>
            <div className="flex items-center gap-2 text-cyan-300">
              <span className="w-3 h-1 bg-cyan-400 rounded-full" />
              <span>Hybrid KEM Exchange (FIPS 203)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <span className="w-3 h-1 bg-emerald-400 rounded-full" />
              <span>ML-DSA Signature Verification (FIPS 204)</span>
            </div>
            <div className="flex items-center gap-2 text-purple-300">
              <span className="w-3 h-1 bg-purple-400 rounded-full" />
              <span>Hybrid Composite Channel (KEM + DSA)</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300">
              <span className="w-3 h-1 bg-amber-400 border border-amber-600 rounded-full" />
              <span>MIL-STD-1553B / 1394B Multiplex Bus</span>
            </div>
          </div>

          {/* Canvas SVG */}
          <div className="flex-1 w-full h-full min-h-[560px] rounded-xl overflow-hidden border border-zinc-850 relative">
            <svg
              ref={svgRef}
              className="w-full h-full block"
              viewBox="0 0 1040 740"
              preserveAspectRatio="xMidYMid meet"
            />
          </div>

          {/* Bottom Interactive Simulation Phase Strip */}
          <div className="mt-3 p-3 rounded-xl border border-zinc-800/90 bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-mono text-zinc-300 font-bold">
                Phase {activeSimStep} of 5 Active Handshake:
              </span>
              <span className="text-zinc-200 font-medium">
                {activeSimStep === 1 && 'CNI Quantum Tunneling Entropy Harvesting & Seed Distribution'}
                {activeSimStep === 2 && 'CIP 1 <-> CIP 2 Ephemeral ML-KEM-1024 Composite Shared Secret Exchange'}
                {activeSimStep === 3 && 'SP 800-56C Dual KDF Derivation & AES-256-GCM Fibre Channel Encryption'}
                {activeSimStep === 4 && 'AN/APG-77 & ALR-94 High-Speed Sensor Frames Signed via ML-DSA-65'}
                {activeSimStep === 5 && 'IFDL 4-Ship Datalink Quantum Lattice Ratchet & Tactical Flight Mesh Rekey'}
              </span>
            </div>

            <div className="flex items-center gap-1 self-end sm:self-center">
              {[1, 2, 3, 4, 5].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setActiveSimStep(step)}
                  className={`w-6 h-6 rounded-md font-mono text-[10px] font-bold transition-all cursor-pointer ${
                    activeSimStep === step
                      ? 'bg-emerald-500 text-zinc-950 ring-2 ring-emerald-400/50'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Deep-Dive PQC Inspector Drawer (5 cols) */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-zinc-800/90 bg-zinc-900/40 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto max-h-[820px]">
          {/* Subsystem Node Header & Category */}
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-zinc-950/90 space-y-3 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  PQC Architecture Inspector
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  {selectedNode.acronym}
                </h3>
                <div className="text-xs text-zinc-300 mt-0.5 font-medium">
                  {selectedNode.name}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-cyan-300 border border-zinc-700">
                  {selectedNode.cipHost}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {selectedNode.pqcConfig.quantumResistanceBits}-bit Quantum Hardness
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {selectedNode.description}
            </p>

            {/* Sub-Tabs for Inspector */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800 text-center font-mono text-[10px]">
              <button
                type="button"
                onClick={() => setInspectorSubTab('specs')}
                className={`py-1.5 rounded transition-all cursor-pointer font-bold ${
                  inspectorSubTab === 'specs'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                PQC Algorithms
              </button>
              <button
                type="button"
                onClick={() => setInspectorSubTab('benchmark')}
                className={`py-1.5 rounded transition-all cursor-pointer font-bold ${
                  inspectorSubTab === 'benchmark'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Live Rekey Test
              </button>
              <button
                type="button"
                onClick={() => setInspectorSubTab('configure')}
                className={`py-1.5 rounded transition-all cursor-pointer font-bold ${
                  inspectorSubTab === 'configure'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Key Sizes
              </button>
              <button
                type="button"
                onClick={() => setInspectorSubTab('bus')}
                className={`py-1.5 rounded transition-all cursor-pointer font-bold ${
                  inspectorSubTab === 'bus'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Active Flow
              </button>
            </div>
          </div>

          {/* TAB 1: PQC Algorithms Specific Configuration */}
          {inspectorSubTab === 'specs' && (
            <div className="space-y-3">
              {/* KEM Specification Box */}
              <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-zinc-950/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-bold text-xs uppercase">
                    <Key className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Key Encapsulation Mechanism (KEM)</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-950 text-cyan-200 border border-cyan-700">
                    FIPS 203
                  </span>
                </div>

                <div className="text-sm font-bold text-white font-mono">
                  {selectedNode.pqcConfig.kemAlgorithm}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500">Security Category</div>
                    <div className="text-cyan-300 font-semibold">{selectedNode.pqcConfig.kemCategory}</div>
                  </div>
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500">Encap / Decap Latency</div>
                    <div className="text-emerald-400 font-semibold">{selectedNode.pqcConfig.kemLatencyMs} ms</div>
                  </div>
                </div>

                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-850 text-[11px] font-mono text-zinc-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Public Key Size:</span>
                    <span className="text-cyan-300 font-bold">{selectedNode.pqcConfig.kemKeySizes.publicKeyBytes.toLocaleString()} Bytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Ciphertext Overhead:</span>
                    <span className="text-cyan-300 font-bold">{selectedNode.pqcConfig.kemKeySizes.ciphertextBytes.toLocaleString()} Bytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Secret Key Memory:</span>
                    <span className="text-zinc-400">{selectedNode.pqcConfig.kemKeySizes.secretKeyBytes.toLocaleString()} Bytes</span>
                  </div>
                </div>
              </div>

              {/* DSA Specification Box */}
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-zinc-950/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-mono font-bold text-xs uppercase">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Digital Signature Algorithm (DSA)</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-950 text-emerald-200 border border-emerald-700">
                    FIPS 204
                  </span>
                </div>

                <div className="text-sm font-bold text-white font-mono">
                  {selectedNode.pqcConfig.dsaAlgorithm}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500">Security Category</div>
                    <div className="text-emerald-300 font-semibold">{selectedNode.pqcConfig.dsaCategory}</div>
                  </div>
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500">Sign / Verify Latency</div>
                    <div className="text-emerald-400 font-semibold">{selectedNode.pqcConfig.dsaLatencyMs} ms</div>
                  </div>
                </div>

                <div className="p-2 rounded bg-zinc-900/60 border border-zinc-850 text-[11px] font-mono text-zinc-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Public Key Size:</span>
                    <span className="text-emerald-300 font-bold">{selectedNode.pqcConfig.dsaKeySizes.publicKeyBytes.toLocaleString()} Bytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Signature Wire Size:</span>
                    <span className="text-emerald-300 font-bold">{selectedNode.pqcConfig.dsaKeySizes.signatureBytes.toLocaleString()} Bytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Verification Throughput:</span>
                    <span className="text-zinc-400">{selectedNode.pqcConfig.messageThroughput}</span>
                  </div>
                </div>
              </div>

              {/* Hybrid Composition & Combiner */}
              <div className="p-3.5 rounded-xl border border-purple-500/30 bg-zinc-950/80 space-y-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold uppercase text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hybrid Compositing & NIST SP 800-56C</span>
                </div>

                <div className="p-2 rounded bg-zinc-900/90 border border-zinc-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Classical Fallback:</span>
                    <span className="text-zinc-200 font-semibold">{selectedNode.pqcConfig.classicalAlgorithm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Dual KDF Combiner:</span>
                    <span className="text-purple-300 font-semibold">{selectedNode.pqcConfig.hybridCombiner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Symmetric Cipher:</span>
                    <span className="text-cyan-300 font-semibold">{selectedNode.pqcConfig.symmetricCipher}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">CNSA 2.0 Compliance:</span>
                    <span className="text-emerald-400 font-semibold">{selectedNode.pqcConfig.cnsa2ComplianceStatus}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Live Rekey Test & Benchmark */}
          {inspectorSubTab === 'benchmark' && (
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/90 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Live Subsystem PQC Benchmark
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Runs simulated FIPS 203 encapsulation and FIPS 204 digital signature generation in microsecond avionics hardware.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunBenchmark}
                disabled={isBenchmarking}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-zinc-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/40 disabled:opacity-50"
              >
                {isBenchmarking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Executing Hardware Cryptoprocessor...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-zinc-950" />
                    <span>Run {selectedNode.acronym} PQC Rekey Benchmark</span>
                  </>
                )}
              </button>

              {lastBenchmarkResult && lastBenchmarkResult.nodeId === selectedNode.id && (
                <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-zinc-900/80 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      BENCHMARK COMPLETE ({lastBenchmarkResult.timestamp})
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700">
                      DO-178C PASSED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">ML-KEM Encap Time</div>
                      <div className="text-cyan-300 font-bold text-sm">{lastBenchmarkResult.encapTimeUs} µs</div>
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">ML-KEM Decap Time</div>
                      <div className="text-cyan-300 font-bold text-sm">{lastBenchmarkResult.decapTimeUs} µs</div>
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">ML-DSA Sign Time</div>
                      <div className="text-emerald-300 font-bold text-sm">{lastBenchmarkResult.signTimeUs} µs</div>
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">ML-DSA Verify Time</div>
                      <div className="text-emerald-300 font-bold text-sm">{lastBenchmarkResult.verifyTimeUs} µs</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 text-[11px]">
                    <div>
                      <div className="text-zinc-500 text-[10px]">Encapsulated Ciphertext Payload (First 16 Bytes):</div>
                      <div className="p-1.5 rounded bg-zinc-950 text-cyan-300 font-mono text-[10px] select-all">
                        {lastBenchmarkResult.ciphertextHex}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[10px]">ML-DSA Verified Sovereign Signature (First 16 Bytes):</div>
                      <div className="p-1.5 rounded bg-zinc-950 text-emerald-300 font-mono text-[10px] select-all">
                        {lastBenchmarkResult.signatureHex}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Key Sizes & Memory Breakdown */}
          {inspectorSubTab === 'configure' && (
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/90 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-bold uppercase text-[11px]">
                  Memory & Over-The-Wire Footprint
                </span>
                <span className="text-emerald-400 font-bold">
                  {selectedNode.pqcConfig.kemCategory.split(' ')[0]}
                </span>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[10px]">
                    <th className="pb-1.5 font-semibold">Primitive</th>
                    <th className="pb-1.5 font-semibold">Public Key</th>
                    <th className="pb-1.5 font-semibold">Payload Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-[11px]">
                  <tr>
                    <td className="py-2 text-cyan-300 font-bold">KEM (Kyber)</td>
                    <td className="py-2 text-zinc-300">{selectedNode.pqcConfig.kemKeySizes.publicKeyBytes} B</td>
                    <td className="py-2 text-cyan-400">{selectedNode.pqcConfig.kemKeySizes.ciphertextBytes} B (Ciphertext)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-emerald-300 font-bold">DSA (Dilithium)</td>
                    <td className="py-2 text-zinc-300">{selectedNode.pqcConfig.dsaKeySizes.publicKeyBytes} B</td>
                    <td className="py-2 text-emerald-400">{selectedNode.pqcConfig.dsaKeySizes.signatureBytes} B (Signature)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-purple-300 font-bold">Classical (X25519)</td>
                    <td className="py-2 text-zinc-300">32 B</td>
                    <td className="py-2 text-purple-400">32 B (ECDH)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-amber-300 font-bold">Symmetric Key</td>
                    <td className="py-2 text-zinc-300">256 bits</td>
                    <td className="py-2 text-amber-400">AES-256-GCM Tag (16 B)</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5 text-[11px]">
                <div className="text-zinc-400 font-bold">Avionics Hardware Cryptoprocessor:</div>
                <div className="text-zinc-200">{selectedNode.pqcConfig.hsmModule}</div>
                <div className="text-zinc-500 text-[10px]">
                  Anti-Tamper Boundary: {selectedNode.pqcConfig.antiTamperBoundary}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Active Communication Link Detail */}
          {inspectorSubTab === 'bus' && (
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-zinc-950/80 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    Active Cryptographic Interconnect
                  </span>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    {selectedLink.label}
                  </h4>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    selectedLink.type === 'kem'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : selectedLink.type === 'dsa'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : selectedLink.type === 'hybrid'
                      ? 'bg-purple-950 text-purple-300 border border-purple-700'
                      : 'bg-amber-950 text-amber-300 border border-amber-700'
                  }`}
                >
                  {selectedLink.type} Flow
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {selectedLink.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-zinc-900/90 border border-zinc-800">
                  <div className="text-[10px] text-zinc-500">Bus Protocol</div>
                  <div className="text-white font-semibold truncate">{selectedLink.protocol}</div>
                </div>
                <div className="p-2 rounded bg-zinc-900/90 border border-zinc-800">
                  <div className="text-[10px] text-zinc-500">Latency / Speed</div>
                  <div className="text-emerald-400 font-semibold">
                    {selectedLink.latencyMs} ms · {selectedLink.bandwidth}
                  </div>
                </div>
              </div>

              {/* Step-by-Step Handshake Protocol Sequence */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-mono text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Microsecond Handshake Protocol Sequence</span>
                </div>

                <div className="space-y-2">
                  {selectedLink.handshakeSteps.map((step) => (
                    <div
                      key={step.step}
                      className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 flex items-center justify-center text-[10px]">
                            {step.step}
                          </span>
                          {step.title}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-800 text-zinc-300">
                          {step.size}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-sans leading-normal">
                        {step.detail}
                      </p>
                      <div className="text-[10px] text-purple-300 font-semibold pt-0.5">
                        Primitive: {step.cryptoPrimitive}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Subsystem Switching Grid */}
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 space-y-2">
            <div className="text-xs font-mono font-bold text-zinc-400 uppercase flex items-center justify-between">
              <span>Select Subsystem Node</span>
              <span className="text-[10px] text-zinc-500">10 Subsystems Loaded</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              {AVIONICS_NODES.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    const relatedLink = AVIONICS_LINKS.find((l) => l.source === node.id || l.target === node.id);
                    if (relatedLink) {
                      setSelectedLinkId(relatedLink.id);
                    }
                  }}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer truncate ${
                    selectedNodeId === node.id
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold'
                      : 'border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <div className="truncate text-[11px] font-semibold">{node.acronym}</div>
                  <div className="text-[9px] text-zinc-500 truncate">{node.pqcConfig.kemCategory.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Links */}
          {matchedAvionicsSubsystem && (
            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onSelectSubsystem && onSelectSubsystem(matchedAvionicsSubsystem)}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Select in Cockpit MFD</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              {onOpenCodeView && (
                <button
                  type="button"
                  onClick={() => onOpenCodeView(matchedAvionicsSubsystem)}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>View Ada 95 / C++ Code</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

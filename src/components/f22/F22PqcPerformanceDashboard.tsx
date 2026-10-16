import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  Cpu,
  Shield,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Download,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Radio,
  Clock,
  Sparkles,
  BarChart3,
  TrendingUp,
  HardDrive,
  Flame,
  ArrowRight,
  Info,
  RefreshCw,
  Search,
  Filter,
  Percent,
} from 'lucide-react';
import { F22FlightMode, F22FlightState } from '../../types/f22Simulator';
import { CbomItem } from '../../types/pqc';

export type ClassicalBaselineAlgorithm = 'X25519-ECDH' | 'NIST-P256-ECDH' | 'RSA-3072';
export type HardwareExecutionProfile = 'CIP1-ASIC' | 'ADA95-SPARK' | 'LEGACY-PPC';
export type AvionicsBusProfile = 'FIBRE-CHANNEL-400M' | 'MIL-STD-1553B' | 'IFDL-AIR-TO-AIR';

export interface LatencyOverheadSample {
  cycle: number;
  timestamp: string;
  mlkem768EncapUs: number;
  mlkem768DecapUs: number;
  mlkem768TotalUs: number;
  classicalBaselineUs: number;
  overheadUs: number; // mlkem768TotalUs - classicalBaselineUs
  overheadPercent: number; // (overheadUs / classicalBaselineUs) * 100
  busSerializationUs: number;
  jitterUs: number;
  flightMode: F22FlightMode;
  ecmActive: boolean;
  budgetHeadroomUs: number; // 200µs - mlkem768TotalUs
  isWithinBudget: boolean;
}

export interface StageDecomposition {
  stage: string;
  category: 'Arithmetic' | 'Entropy' | 'Bus Transit' | 'Hash & KDF';
  classicalUs: number;
  mlkem768Us: number;
  overheadUs: number;
  description: string;
}

interface F22PqcPerformanceDashboardProps {
  flightState?: F22FlightState;
  cbomItems?: CbomItem[]; // <-- Linked live from Auditor Agent
  onTriggerFlightMode?: (mode: F22FlightMode) => void;
  onRekeyTrigger?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const F22PqcPerformanceDashboard: React.FC<F22PqcPerformanceDashboardProps> = ({
  flightState,
  cbomItems = [],
  onTriggerFlightMode,
  onRekeyTrigger,
  onNavigateToTab,
}) => {
  // Configuration State
  const [selectedBaseline, setSelectedBaseline] = useState<ClassicalBaselineAlgorithm>('X25519-ECDH');
  const [hardwareProfile, setHardwareProfile] = useState<HardwareExecutionProfile>('CIP1-ASIC');
  const [busProfile, setBusProfile] = useState<AvionicsBusProfile>('FIBRE-CHANNEL-400M');
  const [isHybridEnvelope, setIsHybridEnvelope] = useState<boolean>(true); // X25519MLKEM768 (1,120B) vs Pure ML-KEM-768 (1,088B)
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeedHz, setStreamSpeedHz] = useState<number>(25); // 10, 25, 50 Hz
  const [timeWindowPoints, setTimeWindowPoints] = useState<number>(50); // 30, 50, 100
  const [ecmStressActive, setEcmStressActive] = useState<boolean>(false);
  const [burstInjectionCycle, setBurstInjectionCycle] = useState<number | null>(null);

  // Auto-sync Classical Baseline when CBOM items arrive from Auditor Agent
  useEffect(() => {
    if (!cbomItems || cbomItems.length === 0) return;
    const primitivesStr = cbomItems.map((c) => c.primitive.toUpperCase()).join(' ');
    if (primitivesStr.includes('RSA')) {
      setSelectedBaseline('RSA-3072');
    } else if (primitivesStr.includes('P-256') || primitivesStr.includes('P256') || primitivesStr.includes('ECDSA')) {
      setSelectedBaseline('NIST-P256-ECDH');
    } else if (primitivesStr.includes('25519')) {
      setSelectedBaseline('X25519-ECDH');
    }
  }, [cbomItems]);

  // Inspected cycle for drill-down modal/strip
  const [inspectedSample, setInspectedSample] = useState<LatencyOverheadSample | null>(null);

  // Active view tab inside dashboard
  const [activeView, setActiveView] = useState<'realtime-curve' | 'distribution' | 'stages' | 'bus-matrix'>('realtime-curve');

  // Filter & Search for Table
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [onlyOverheadSpikes, setOnlyOverheadSpikes] = useState<boolean>(false);

  // Hardware nominal baselines
  const profileMultipliers = useMemo(() => {
    switch (hardwareProfile) {
      case 'CIP1-ASIC':
        return {
          mlkemEncapBase: 36.5,
          mlkemDecapBase: 42.1,
          x25519Base: 42.0,
          p256Base: 58.4,
          rsa3072Base: 245.0,
          noiseScale: 1.2,
          name: 'CIP 1 Hardware Vector ASIC (66 SEM-E Array)',
        };
      case 'ADA95-SPARK':
        return {
          mlkemEncapBase: 78.4,
          mlkemDecapBase: 88.6,
          x25519Base: 72.0,
          p256Base: 96.5,
          rsa3072Base: 380.0,
          noiseScale: 2.5,
          name: 'Ada 95 SPARK High-Integrity Software (DO-178C Level A)',
        };
      case 'LEGACY-PPC':
        return {
          mlkemEncapBase: 124.0,
          mlkemDecapBase: 142.0,
          x25519Base: 98.0,
          p256Base: 135.0,
          rsa3072Base: 580.0,
          noiseScale: 5.0,
          name: 'PowerPC 603e / MIL-STD-1750A Software Emulation',
        };
    }
  }, [hardwareProfile]);

  const busOverheadUs = useMemo(() => {
    switch (busProfile) {
      case 'FIBRE-CHANNEL-400M':
        // ML-KEM-768 ciphertext (1088 bytes) on 400 Mbps = 21.76 µs vs X25519 (32 bytes) = 0.64 µs
        return { mlkemBus: 21.8, classicalBus: 0.6, name: 'Fibre Channel Optical (400 Mbps)' };
      case 'MIL-STD-1553B':
        // ML-KEM-768 on 1 Mbps requires ~34 sub-frames = 87.0 µs vs X25519 = 2.6 µs
        return { mlkemBus: 87.0, classicalBus: 2.6, name: 'MIL-STD-1553B Dual Channel (1 Mbps)' };
      case 'IFDL-AIR-TO-AIR':
        // IFDL narrowbeam RF link = 34.5 µs vs X25519 = 1.1 µs
        return { mlkemBus: 34.5, classicalBus: 1.1, name: 'IFDL Stealth Optical RF (Air-to-Air)' };
    }
  }, [busProfile]);

  // Initial synthetic dataset
  const generateSample = useCallback(
    (cycleNum: number, isBurst: boolean = false): LatencyOverheadSample => {
      const mode = flightState?.flightMode || 'Combat';
      const modeMultiplier = mode === 'Stealth' ? 0.95 : mode === 'Combat' ? 1.08 : 1.0;
      const ecmBurst = ecmStressActive || isBurst ? 22.0 : 0.0;
      const randomJitter = (Math.random() - 0.5) * profileMultipliers.noiseScale * 2;

      // Hybrid X25519MLKEM768 adds classical ECDH execution + 32-byte wire share
      const hybridArithPenalty = isHybridEnvelope ? profileMultipliers.x25519Base * 0.65 : 0;
      const hybridBusPenalty = isHybridEnvelope ? busOverheadUs.classicalBus : 0;

      const encap =
        profileMultipliers.mlkemEncapBase * modeMultiplier +
        hybridArithPenalty * 0.5 +
        randomJitter * 0.4 +
        (isBurst ? 14 : 0);
      const decap =
        profileMultipliers.mlkemDecapBase * modeMultiplier +
        hybridArithPenalty * 0.5 +
        randomJitter * 0.4 +
        (isBurst ? 16 : 0);
      const mlkemBus = busOverheadUs.mlkemBus + hybridBusPenalty + (ecmStressActive ? 18.5 : 0);

      const mlkemTotal = encap + decap + mlkemBus + ecmBurst;

      // Classical baseline selection
      let classicalBase = profileMultipliers.x25519Base;
      if (selectedBaseline === 'NIST-P256-ECDH') {
        classicalBase = profileMultipliers.p256Base;
      } else if (selectedBaseline === 'RSA-3072') {
        classicalBase = profileMultipliers.rsa3072Base;
      }

      const classicalTotal = classicalBase * modeMultiplier + busOverheadUs.classicalBus + randomJitter * 0.2;
      const overheadUs = mlkemTotal - classicalTotal;
      const overheadPercent = (overheadUs / Math.max(1, classicalTotal)) * 100;
      const budgetLimitUs = 200.0; // 50 Hz cyclic crypto budget
      const headroom = budgetLimitUs - mlkemTotal;

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
        Math.floor(now.getMilliseconds() / 10)
      ).padStart(2, '0')}`;

      return {
        cycle: cycleNum,
        timestamp: timeStr,
        mlkem768EncapUs: Number(encap.toFixed(2)),
        mlkem768DecapUs: Number(decap.toFixed(2)),
        mlkem768TotalUs: Number(mlkemTotal.toFixed(2)),
        classicalBaselineUs: Number(classicalTotal.toFixed(2)),
        overheadUs: Number(overheadUs.toFixed(2)),
        overheadPercent: Number(overheadPercent.toFixed(1)),
        busSerializationUs: Number(mlkemBus.toFixed(2)),
        jitterUs: Number((Math.abs(randomJitter) + (ecmStressActive ? 5.2 : 0.8)).toFixed(2)),
        flightMode: mode,
        ecmActive: ecmStressActive || isBurst,
        budgetHeadroomUs: Number(headroom.toFixed(2)),
        isWithinBudget: mlkemTotal <= budgetLimitUs,
      };
    },
    [flightState, profileMultipliers, busOverheadUs, selectedBaseline, ecmStressActive, isHybridEnvelope]
  );

  // Latency samples history
  const [samplesHistory, setSamplesHistory] = useState<LatencyOverheadSample[]>(() => {
    const initial: LatencyOverheadSample[] = [];
    for (let i = 1; i <= 60; i++) {
      initial.push(generateSample(i));
    }
    return initial;
  });

  const nextCycleRef = useRef<number>(61);

  // Real-time tick generator
  useEffect(() => {
    if (!isStreaming) return;

    const intervalMs = Math.max(20, Math.floor(1000 / streamSpeedHz));
    const timer = setInterval(() => {
      const isBurst = burstInjectionCycle !== null && nextCycleRef.current - burstInjectionCycle < 4;
      const sample = generateSample(nextCycleRef.current, isBurst);
      nextCycleRef.current += 1;

      setSamplesHistory((prev) => {
        const next = [...prev, sample];
        // Keep up to 250 data points for deep statistics
        if (next.length > 250) {
          return next.slice(next.length - 250);
        }
        return next;
      });

      if (burstInjectionCycle !== null && nextCycleRef.current - burstInjectionCycle >= 4) {
        setBurstInjectionCycle(null);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isStreaming, streamSpeedHz, generateSample, burstInjectionCycle]);

  // Aggregate Performance Metrics
  const currentSample = samplesHistory[samplesHistory.length - 1] || generateSample(1);

  const aggregateStats = useMemo(() => {
    if (samplesHistory.length === 0) {
      return {
        meanOverheadUs: 0,
        medianOverheadUs: 0,
        p95OverheadUs: 0,
        p99OverheadUs: 0,
        minOverheadUs: 0,
        maxOverheadUs: 0,
        stdDevUs: 0,
        meanMlkemTotalUs: 0,
        meanClassicalUs: 0,
        percentWithinBudget: 100,
        wcetUs: 0,
      };
    }

    const overheads = samplesHistory.map((s) => s.overheadUs).sort((a, b) => a - b);
    const totals = samplesHistory.map((s) => s.mlkem768TotalUs).sort((a, b) => a - b);
    const n = overheads.length;

    const meanOverhead = overheads.reduce((sum, v) => sum + v, 0) / n;
    const meanMlkemTotal = totals.reduce((sum, v) => sum + v, 0) / n;
    const meanClassical = samplesHistory.reduce((sum, s) => sum + s.classicalBaselineUs, 0) / n;

    const median = overheads[Math.floor(n * 0.5)];
    const p95 = overheads[Math.floor(n * 0.95)] || overheads[n - 1];
    const p99 = overheads[Math.floor(n * 0.99)] || overheads[n - 1];
    const min = overheads[0];
    const max = overheads[n - 1];
    const wcet = totals[n - 1]; // Worst case execution time

    const variance = overheads.reduce((sum, v) => sum + Math.pow(v - meanOverhead, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const withinBudgetCount = samplesHistory.filter((s) => s.isWithinBudget).length;
    const percentWithin = (withinBudgetCount / n) * 100;

    return {
      meanOverheadUs: Number(meanOverhead.toFixed(2)),
      medianOverheadUs: Number(median.toFixed(2)),
      p95OverheadUs: Number(p95.toFixed(2)),
      p99OverheadUs: Number(p99.toFixed(2)),
      minOverheadUs: Number(min.toFixed(2)),
      maxOverheadUs: Number(max.toFixed(2)),
      stdDevUs: Number(stdDev.toFixed(2)),
      meanMlkemTotalUs: Number(meanMlkemTotal.toFixed(2)),
      meanClassicalUs: Number(meanClassical.toFixed(2)),
      percentWithinBudget: Number(percentWithin.toFixed(1)),
      wcetUs: Number(wcet.toFixed(2)),
    };
  }, [samplesHistory]);

  // Stage Decomposition Data
  const stageDecompositionData = useMemo<StageDecomposition[]>(() => {
    const isAsic = hardwareProfile === 'CIP1-ASIC';
    return [
      {
        stage: 'TRNG Quantum Entropy Sampling',
        category: 'Entropy',
        classicalUs: isAsic ? 2.1 : 4.5,
        mlkem768Us: isAsic ? 5.4 : 9.8,
        overheadUs: isAsic ? 3.3 : 5.3,
        description:
          '32-byte seed expansion into pseudo-random lattice polynomials A ∈ R_q^(k×k) and error vectors e ∈ R_q^k via SHAKE-128 / SHAKE-256.',
      },
      {
        stage: 'Lattice NTT Polynomial Arithmetic',
        category: 'Arithmetic',
        classicalUs: isAsic ? 28.5 : 54.0, // Point multiplication on Curve25519
        mlkem768Us: isAsic ? 42.8 : 78.5, // 9 NTT transforms + pointwise mult + Barrett reduction
        overheadUs: isAsic ? 14.3 : 24.5,
        description:
          'Number Theoretic Transform (NTT) in Z_3329[X]/(X^256 + 1) for matrix-vector multiplication vs classical 255-bit elliptic curve scalar point multiplication.',
      },
      {
        stage: 'Noise & Centered Binomial Sampling (CBD)',
        category: 'Arithmetic',
        classicalUs: 0.0,
        mlkem768Us: isAsic ? 6.2 : 14.0,
        overheadUs: isAsic ? 6.2 : 14.0,
        description:
          'Sampling polynomial noise vectors from Centered Binomial Distribution η1=2 and η2=2 to enforce LWE hardness. No classical equivalent.',
      },
      {
        stage: 'Bus Payload Serialization & Datalink Transit',
        category: 'Bus Transit',
        classicalUs: busOverheadUs.classicalBus,
        mlkem768Us: busOverheadUs.mlkemBus,
        overheadUs: Number((busOverheadUs.mlkemBus - busOverheadUs.classicalBus).toFixed(2)),
        description:
          `Transferring 1,088-byte ciphertext + 1,184-byte public key vs 32-byte Curve25519 public key across ${busOverheadUs.name}.`,
      },
      {
        stage: 'KDF & Shared Secret Derivation',
        category: 'Hash & KDF',
        classicalUs: isAsic ? 3.2 : 5.8, // HKDF-SHA256
        mlkem768Us: isAsic ? 7.1 : 12.4, // SHA3-512 / SHAKE-256 absorption
        overheadUs: isAsic ? 3.9 : 6.6,
        description:
          'Hashing ephemeral shared secret K = H(K_bar || H(c)) using FIPS 202 Keccak-f[1600] permutation engine.',
      },
    ];
  }, [hardwareProfile, busOverheadUs]);

  // D3 Chart Refs
  const d3RealtimeSvgRef = useRef<SVGSVGElement | null>(null);
  const d3DistributionSvgRef = useRef<SVGSVGElement | null>(null);

  // Render D3 Realtime Latency & Overhead Chart
  useEffect(() => {
    if (activeView !== 'realtime-curve') return;
    const svgEl = d3RealtimeSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = 860;
    const height = 300;
    const margin = { top: 28, right: 35, bottom: 45, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Slice history to timeWindowPoints
    const data = samplesHistory.slice(-timeWindowPoints);
    if (data.length < 2) return;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scale X
    const xScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.cycle) || 1, d3.max(data, (d) => d.cycle) || 60])
      .range([0, innerWidth]);

    // Scale Y (0 to max total or 220 µs)
    const maxVal = Math.max(220, (d3.max(data, (d) => Math.max(d.mlkem768TotalUs, d.classicalBaselineUs)) || 180) * 1.15);
    const yScale = d3.scaleLinear().domain([0, maxVal]).range([innerHeight, 0]);

    // Gradients
    const defs = svg.append('defs');

    // Overhead Delta Area Gradient
    const deltaGrad = defs
      .append('linearGradient')
      .attr('id', 'deltaAreaGradient')
      .attr('x1', '0')
      .attr('y1', '0')
      .attr('x2', '0')
      .attr('y2', '1');
    deltaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4').attr('stop-opacity', '0.35');
    deltaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4').attr('stop-opacity', '0.02');

    // Grid lines
    const yGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#27272a')
      .attr('stroke-dasharray', '3,3');
    g.select('.grid .domain').remove();

    // 200 µs Hard Deadline Target Line
    const budgetY = yScale(200.0);
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', budgetY)
      .attr('y2', budgetY)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,3');

    g.append('text')
      .attr('x', innerWidth - 8)
      .attr('y', budgetY - 6)
      .attr('text-anchor', 'end')
      .attr('fill', '#ef4444')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text('50 Hz Cyclic Hard Crypto Deadline (200.0 µs)');

    // 140 µs Caution / Safety Margin Line
    const warnY = yScale(140.0);
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', warnY)
      .attr('y2', warnY)
      .attr('stroke', '#eab308')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,4')
      .attr('opacity', '0.7');

    g.append('text')
      .attr('x', innerWidth - 8)
      .attr('y', warnY - 5)
      .attr('text-anchor', 'end')
      .attr('fill', '#eab308')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('opacity', '0.85')
      .text('70% Safety Warning Threshold (140.0 µs)');

    // Area between ML-KEM-768 and Classical (Overhead Ribbon)
    const areaOverhead = d3
      .area<LatencyOverheadSample>()
      .x((d) => xScale(d.cycle))
      .y0((d) => yScale(d.classicalBaselineUs))
      .y1((d) => yScale(d.mlkem768TotalUs))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'url(#deltaAreaGradient)')
      .attr('d', areaOverhead);

    // Line 1: Classical Baseline (Amber Dashed)
    const lineClassical = d3
      .line<LatencyOverheadSample>()
      .x((d) => xScale(d.cycle))
      .y((d) => yScale(d.classicalBaselineUs))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,3')
      .attr('d', lineClassical);

    // Line 2: ML-KEM-768 Encap Only (Emerald Dotted)
    const lineEncapOnly = d3
      .line<LatencyOverheadSample>()
      .x((d) => xScale(d.cycle))
      .y((d) => yScale(d.mlkem768EncapUs))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', '0.85')
      .attr('d', lineEncapOnly);

    // Line 3: ML-KEM-768 Total Exchange (Cyan Solid Thick)
    const lineMlkem = d3
      .line<LatencyOverheadSample>()
      .x((d) => xScale(d.cycle))
      .y((d) => yScale(d.mlkem768TotalUs))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 2.8)
      .attr('d', lineMlkem);

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(8)
      .tickFormat((d) => `#${d}`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');
    g.select('.domain').attr('stroke', '#3f3f46');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickFormat((d) => `${d} µs`);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Interactive Hover Overlay & Tooltip
    const tooltipGroup = g.append('g').style('display', 'none');

    const focusLine = tooltipGroup
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    const focusDotMlkem = tooltipGroup
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#06b6d4')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    const focusDotClassical = tooltipGroup
      .append('circle')
      .attr('r', 4.5)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

    const tooltipBox = tooltipGroup.append('g');
    tooltipBox
      .append('rect')
      .attr('width', 190)
      .attr('height', 62)
      .attr('rx', 6)
      .attr('fill', '#09090b')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 1)
      .attr('opacity', 0.94);

    const ttCycle = tooltipBox
      .append('text')
      .attr('x', 8)
      .attr('y', 15)
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold');

    const ttMlkem = tooltipBox
      .append('text')
      .attr('x', 8)
      .attr('y', 30)
      .attr('fill', '#22d3ee')
      .attr('font-size', '9.5px')
      .attr('font-family', 'monospace');

    const ttClassical = tooltipBox
      .append('text')
      .attr('x', 8)
      .attr('y', 43)
      .attr('fill', '#fbbf24')
      .attr('font-size', '9.5px')
      .attr('font-family', 'monospace');

    const ttDelta = tooltipBox
      .append('text')
      .attr('x', 8)
      .attr('y', 56)
      .attr('fill', '#34d399')
      .attr('font-size', '9.5px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold');

    // Overlay Rect for Mousemove
    const bisectCycle = d3.bisector<LatencyOverheadSample, number>((d) => d.cycle).center;

    svg
      .append('rect')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mouseover', () => tooltipGroup.style('display', null))
      .on('mouseout', () => tooltipGroup.style('display', 'none'))
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const xVal = xScale.invert(mx);
        const index = bisectCycle(data, xVal);
        const d = data[index];
        if (!d) return;

        const px = xScale(d.cycle);
        const pyMlkem = yScale(d.mlkem768TotalUs);
        const pyClassical = yScale(d.classicalBaselineUs);

        focusLine.attr('x1', px).attr('x2', px);
        focusDotMlkem.attr('cx', px).attr('cy', pyMlkem);
        focusDotClassical.attr('cx', px).attr('cy', pyClassical);

        const boxX = px > innerWidth - 205 ? px - 198 : px + 10;
        const boxY = Math.max(8, Math.min(innerHeight - 70, pyMlkem - 30));
        tooltipBox.attr('transform', `translate(${boxX},${boxY})`);

        ttCycle.text(`Cycle #${d.cycle} (${d.timestamp})`);
        ttMlkem.text(`ML-KEM-768: ${d.mlkem768TotalUs.toFixed(1)} µs`);
        ttClassical.text(`Classical:  ${d.classicalBaselineUs.toFixed(1)} µs`);
        const sign = d.overheadUs >= 0 ? '+' : '';
        ttDelta.text(`Overhead Δt: ${sign}${d.overheadUs.toFixed(1)} µs (${sign}${d.overheadPercent.toFixed(1)}%)`);
      })
      .on('click', (event) => {
        const [mx] = d3.pointer(event);
        const xVal = xScale.invert(mx);
        const index = bisectCycle(data, xVal);
        const d = data[index];
        if (d) {
          setInspectedSample(d);
        }
      });
  }, [samplesHistory, timeWindowPoints, activeView]);

  // Render D3 Overhead Distribution Histogram
  useEffect(() => {
    if (activeView !== 'distribution') return;
    const svgEl = d3DistributionSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = 860;
    const height = 300;
    const margin = { top: 25, right: 35, bottom: 45, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const values = samplesHistory.map((s) => s.overheadUs);
    if (values.length === 0) return;

    const minVal = Math.floor(d3.min(values) || 0);
    const maxVal = Math.ceil(d3.max(values) || 100);

    const xScale = d3.scaleLinear().domain([minVal - 2, maxVal + 5]).range([0, innerWidth]);

    const histogram = d3
      .bin()
      .domain(xScale.domain() as [number, number])
      .thresholds(18);

    const bins = histogram(values);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length) || 10])
      .range([innerHeight, 0]);

    // Draw Bins
    g.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.x0 || 0) + 1)
      .attr('width', (d) => Math.max(0, xScale(d.x1 || 0) - xScale(d.x0 || 0) - 2))
      .attr('y', (d) => yScale(d.length))
      .attr('height', (d) => innerHeight - yScale(d.length))
      .attr('fill', '#06b6d4')
      .attr('opacity', 0.8)
      .attr('rx', 3);

    // Median & P99 Lines
    const medianX = xScale(aggregateStats.medianOverheadUs);
    const p99X = xScale(aggregateStats.p99OverheadUs);

    // Median Line
    g.append('line')
      .attr('x1', medianX)
      .attr('x2', medianX)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2);

    g.append('text')
      .attr('x', medianX + 4)
      .attr('y', 14)
      .attr('fill', '#10b981')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text(`Median: +${aggregateStats.medianOverheadUs} µs`);

    // P99 Line
    g.append('line')
      .attr('x1', p99X)
      .attr('x2', p99X)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,2');

    g.append('text')
      .attr('x', p99X + 4)
      .attr('y', 28)
      .attr('fill', '#f59e0b')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text(`P99: +${aggregateStats.p99OverheadUs} µs`);

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(10)
      .tickFormat((d) => `+${d} µs`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${d}`);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');
  }, [samplesHistory, activeView, aggregateStats]);

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = [
      'Cycle',
      'Timestamp',
      'FlightMode',
      'MLKEM768_Encap_us',
      'MLKEM768_Decap_us',
      'MLKEM768_Total_us',
      'ClassicalBaseline_us',
      'Overhead_us',
      'Overhead_Percent',
      'BusSerialization_us',
      'Jitter_us',
      'BudgetHeadroom_us',
      'WithinBudget',
    ].join(',');

    const rows = samplesHistory.map((s) =>
      [
        s.cycle,
        s.timestamp,
        s.flightMode,
        s.mlkem768EncapUs,
        s.mlkem768DecapUs,
        s.mlkem768TotalUs,
        s.classicalBaselineUs,
        s.overheadUs,
        s.overheadPercent,
        s.busSerializationUs,
        s.jitterUs,
        s.budgetHeadroomUs,
        s.isWithinBudget ? 'TRUE' : 'FALSE',
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `F22_MLKEM768_Latency_Overhead_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered log table
  const filteredLogs = useMemo(() => {
    return samplesHistory
      .slice()
      .reverse()
      .filter((s) => {
        if (onlyOverheadSpikes && s.overheadUs < aggregateStats.p95OverheadUs) {
          return false;
        }
        if (logSearchQuery.trim() !== '') {
          const q = logSearchQuery.toLowerCase();
          return (
            s.timestamp.includes(q) ||
            s.flightMode.toLowerCase().includes(q) ||
            String(s.cycle).includes(q)
          );
        }
        return true;
      });
  }, [samplesHistory, onlyOverheadSpikes, logSearchQuery, aggregateStats.p95OverheadUs]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Mission Context & PQC Performance Status */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5 shadow-sm">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>NIST FIPS 203 (ML-KEM-768)</span>
              </span>

              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>50 Hz Avionics Loop (20.0 ms frame)</span>
              </span>

              {/* Dynamic DO-178C Top Status Badge */}
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 ${
                  aggregateStats.wcetUs <= 200.0
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/90 border border-rose-500 text-rose-200 animate-pulse'
                }`}
              >
                {aggregateStats.wcetUs <= 200.0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>DO-178C Level A Determinism: PASS ({aggregateStats.wcetUs} µs WCET)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>WCET DEADLINE BREACH: {aggregateStats.wcetUs} µs &gt; 200.0 µs</span>
                  </>
                )}
              </span>

              {/* Add Hybrid Toggle Button right next to it */}
              <button
                type="button"
                onClick={() => setIsHybridEnvelope(!isHybridEnvelope)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition-all cursor-pointer ${
                  isHybridEnvelope
                    ? 'bg-purple-950 border-purple-500/50 text-purple-200'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                }`}
              >
                {isHybridEnvelope ? 'Mode: Hybrid X25519MLKEM768 (1,120 B)' : 'Mode: Pure ML-KEM-768 (1,088 B)'}
              </button>

              {cbomItems && cbomItems.length > 0 && (
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-950/90 border border-purple-500/50 text-purple-300 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span>Auditor CBOM Auto-Synced: {selectedBaseline} ({cbomItems.length} assets)</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-mono flex items-center gap-3">
              <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
              <span>ML-KEM-768 Latency Overhead Dashboard</span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Real-time benchmark engine and flight telemetry monitor tracking the microsecond latency overhead introduced by post-quantum <strong>ML-KEM-768 key encapsulation</strong> over standard classical exchanges (X25519 ECDH / NIST P-256) inside the F-22 Raptor CIP vector architecture.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer transition-all shadow-md ${
                isStreaming
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Pause Stream' : 'Resume 50 Hz Live Feed'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBurstInjectionCycle(nextCycleRef.current);
                if (onRekeyTrigger) onRekeyTrigger();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold font-mono bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 flex items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              <span>Simulate Tactical Rekey Surge</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export CSV Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1: Mean ML-KEM-768 Total */}
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-zinc-950/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase">
            <span>ML-KEM-768 Encap</span>
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
            {currentSample.mlkem768TotalUs.toFixed(1)} <span className="text-xs text-zinc-500">µs</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 flex justify-between">
            <span>Encap: {currentSample.mlkem768EncapUs} µs</span>
            <span>Decap: {currentSample.mlkem768DecapUs} µs</span>
          </div>
        </div>

        {/* Metric 2: Classical Baseline */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-zinc-950/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase">
            <span>Classical Baseline</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
            {currentSample.classicalBaselineUs.toFixed(1)} <span className="text-xs text-zinc-500">µs</span>
          </div>
          <div className="text-[10px] font-mono text-amber-400/90 flex justify-between">
            <span>{selectedBaseline}</span>
            {cbomItems && cbomItems.length > 0 && <span className="text-purple-400 font-bold">● CBOM</span>}
          </div>
        </div>

        {/* Metric 3: Real-Time Net Overhead (Delta t) */}
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 uppercase font-bold">
            <span>Net Latency Overhead</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
            +{currentSample.overheadUs.toFixed(1)} <span className="text-xs text-emerald-500">µs</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400/80 flex justify-between">
            <span>+{currentSample.overheadPercent.toFixed(1)}%</span>
            <span>Mean: +{aggregateStats.meanOverheadUs} µs</span>
          </div>
        </div>

        {/* Metric 4: Cyclic Headroom (200 µs Budget) */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase">
            <span>Avionics Headroom</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300">
            {currentSample.budgetHeadroomUs.toFixed(1)} <span className="text-xs text-zinc-500">µs</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 flex justify-between">
            <span>{(((currentSample.budgetHeadroomUs / 200.0) * 100)).toFixed(1)}% margin</span>
            <span className="text-emerald-400">Within Budget</span>
          </div>
        </div>

        {/* Metric 5: P99 Overhead / WCET */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase">
            <span>P99 Worst-Case WCET</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-300">
            +{aggregateStats.p99OverheadUs.toFixed(1)} <span className="text-xs text-zinc-500">µs</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 flex justify-between">
            <span>Max: +{aggregateStats.maxOverheadUs} µs</span>
            <span>σ = ±{aggregateStats.stdDevUs} µs</span>
          </div>
        </div>

        {/* Metric 6: Datalink Wire Growth */}
        <div
          onClick={() => setIsHybridEnvelope(!isHybridEnvelope)}
          className="p-4 rounded-xl border border-zinc-800 hover:border-cyan-500/50 bg-zinc-950/90 shadow-sm space-y-1 cursor-pointer transition-all group"
          title="Click to toggle between Hybrid Envelope (1,120B) and Pure PQC (1,088B)"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase">
            <span>Wire Payload Size</span>
            <HardDrive className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white flex items-baseline gap-1">
            <span>{isHybridEnvelope ? '1,120' : '1,088'}</span>
            <span className="text-xs text-zinc-500">bytes</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 flex justify-between">
            <span className="text-cyan-300 font-bold">{isHybridEnvelope ? 'Hybrid (1,120B)' : 'Pure (1,088B)'}</span>
            <span className="text-cyan-400 font-bold">{isHybridEnvelope ? '+3,400%' : '+3,300%'}</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & What-If Scenario Matrix Strip */}
      <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Avionics Architecture & Baseline Benchmark Configuration
            </h3>
          </div>
          <div className="text-xs font-mono text-zinc-400">
            Simulate how hardware acceleration, datalink bus types, and classical algorithms shift latency overhead.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Selector 1: Classical Baseline Comparison */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center justify-between">
              <span>1. Classical Exchange Baseline:</span>
              <span className="text-amber-400">{selectedBaseline}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedBaseline('X25519-ECDH')}
                className={`px-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                  selectedBaseline === 'X25519-ECDH'
                    ? 'bg-amber-950 border border-amber-500 text-amber-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                X25519 (ECDH)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBaseline('NIST-P256-ECDH')}
                className={`px-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                  selectedBaseline === 'NIST-P256-ECDH'
                    ? 'bg-amber-950 border border-amber-500 text-amber-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                P-256 (Suite B)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBaseline('RSA-3072')}
                className={`px-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                  selectedBaseline === 'RSA-3072'
                    ? 'bg-amber-950 border border-amber-500 text-amber-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                RSA-3072
              </button>
            </div>
          </div>

          {/* Selector 2: Hardware Execution Profile */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center justify-between">
              <span>2. Execution Hardware Profile:</span>
              <span className="text-cyan-400">{hardwareProfile}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setHardwareProfile('CIP1-ASIC')}
                className={`px-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                  hardwareProfile === 'CIP1-ASIC'
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                CIP 1 ASIC
              </button>
              <button
                type="button"
                onClick={() => setHardwareProfile('ADA95-SPARK')}
                className={`px-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                  hardwareProfile === 'ADA95-SPARK'
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Ada 95 SPARK
              </button>
              <button
                type="button"
                onClick={() => setHardwareProfile('LEGACY-PPC')}
                className={`px-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                  hardwareProfile === 'LEGACY-PPC'
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                PPC 603e (Legacy)
              </button>
            </div>
          </div>

          {/* Selector 3: Avionics Datalink Bus Interface */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-zinc-300 flex items-center justify-between">
              <span>3. Avionics Interconnect Bus:</span>
              <span className="text-purple-400">{busProfile}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setBusProfile('FIBRE-CHANNEL-400M')}
                className={`px-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                  busProfile === 'FIBRE-CHANNEL-400M'
                    ? 'bg-purple-950 border border-purple-500 text-purple-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                FC 400 Mbps
              </button>
              <button
                type="button"
                onClick={() => setBusProfile('MIL-STD-1553B')}
                className={`px-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                  busProfile === 'MIL-STD-1553B'
                    ? 'bg-purple-950 border border-purple-500 text-purple-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                MIL-1553B (1M)
              </button>
              <button
                type="button"
                onClick={() => setBusProfile('IFDL-AIR-TO-AIR')}
                className={`px-2 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                  busProfile === 'IFDL-AIR-TO-AIR'
                    ? 'bg-purple-950 border border-purple-500 text-purple-200'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                IFDL Air Datalink
              </button>
            </div>
          </div>
        </div>

        {/* Tactical Stress & Speed Controls */}
        <div className="pt-2 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-zinc-400">Stream Sampling Rate:</span>
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              {[10, 25, 50].map((hz) => (
                <button
                  key={hz}
                  type="button"
                  onClick={() => setStreamSpeedHz(hz)}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                    streamSpeedHz === hz
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {hz} Hz
                </button>
              ))}
            </div>

            <span className="text-zinc-500">|</span>

            <span className="text-zinc-400">Window:</span>
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              {[30, 50, 100].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => setTimeWindowPoints(pts)}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                    timeWindowPoints === pts
                      ? 'bg-zinc-700 text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {pts} ticks
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEcmStressActive(!ecmStressActive)}
              className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                ecmStressActive
                  ? 'bg-rose-950 border-rose-500 text-rose-200 animate-pulse'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{ecmStressActive ? 'ECM Jamming Stress Active (+Jitter)' : 'Inject ECM Electronic Attack'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const fresh: LatencyOverheadSample[] = [];
                for (let i = 1; i <= 50; i++) {
                  fresh.push(generateSample(i));
                }
                setSamplesHistory(fresh);
                nextCycleRef.current = 51;
              }}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              title="Reset data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualizations Container with View Mode Tabs */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                Interactive D3 Latency Overhead Visualizer
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Direct comparison of ML-KEM-768 key encapsulation against classical baseline under the 200 µs cyclic flight deadline.
            </p>
          </div>

          {/* View Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveView('realtime-curve')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeView === 'realtime-curve'
                  ? 'bg-cyan-600 text-white font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Time-Series Ribbon</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('distribution')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeView === 'distribution'
                  ? 'bg-cyan-600 text-white font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Overhead Distribution (Histogram)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('stages')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeView === 'stages'
                  ? 'bg-cyan-600 text-white font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cryptographic Stage Waterfall</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('bus-matrix')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeView === 'bus-matrix'
                  ? 'bg-cyan-600 text-white font-bold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Bus Architecture Comparison</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: D3 Real-Time Dual-Curve & Delta Ribbon */}
        {activeView === 'realtime-curve' && (
          <div className="space-y-4">
            <div className="relative rounded-xl border border-zinc-850 bg-black p-3 sm:p-5 overflow-hidden">
              <svg
                ref={d3RealtimeSvgRef}
                viewBox="0 0 860 300"
                className="w-full h-72 sm:h-80 select-none overflow-visible"
              />

              {/* Chart Legend Strip */}
              <div className="mt-3 pt-3 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <span className="w-3.5 h-1 bg-cyan-400 rounded-sm" />
                    <span>ML-KEM-768 Total Roundtrip (Encap + Decap + Bus)</span>
                  </div>

                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="w-3.5 h-0.5 bg-amber-400 border-b border-dashed border-amber-400" />
                    <span>Classical Baseline ({selectedBaseline})</span>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="w-3.5 h-0.5 bg-emerald-400 border-b border-dotted border-emerald-400" />
                    <span>Pure KEM Encap Primitive</span>
                  </div>

                  <div className="flex items-center gap-2 text-cyan-400/80">
                    <span className="w-3.5 h-2 bg-cyan-500/20 border border-cyan-500/40 rounded-sm" />
                    <span>Latency Overhead Area (Δt)</span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500">
                  Tip: Hover / scrub or click any data point to inspect that avionics cycle
                </div>
              </div>
            </div>

            {/* Quick Inspection Strip if data point clicked */}
            {inspectedSample && (
              <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 font-mono text-xs space-y-3 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-800/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300 font-bold uppercase">
                      Inspected Cycle #{inspectedSample.cycle}
                    </span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-300">Timestamp: {inspectedSample.timestamp}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white border border-zinc-700">
                      Regime: {inspectedSample.flightMode}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectedSample(null)}
                    className="text-zinc-400 hover:text-white text-xs cursor-pointer"
                  >
                    Close inspection
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-black/60 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase">ML-KEM-768 Total</div>
                    <div className="text-base font-bold text-cyan-300 mt-0.5">
                      {inspectedSample.mlkem768TotalUs.toFixed(1)} µs
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      Encap: {inspectedSample.mlkem768EncapUs} µs | Decap: {inspectedSample.mlkem768DecapUs} µs
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase">Classical Baseline</div>
                    <div className="text-base font-bold text-amber-300 mt-0.5">
                      {inspectedSample.classicalBaselineUs.toFixed(1)} µs
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{selectedBaseline}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-emerald-500/40 bg-emerald-950/20">
                    <div className="text-[10px] text-emerald-300 uppercase font-bold">Added Overhead (Δt)</div>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">
                      +{inspectedSample.overheadUs.toFixed(1)} µs (+{inspectedSample.overheadPercent.toFixed(1)}%)
                    </div>
                    <div className="text-[10px] text-emerald-500 mt-0.5">
                      Bus Transit: {inspectedSample.busSerializationUs} µs
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-zinc-800">
                    <div className="text-[10px] text-zinc-400 uppercase">Cycle Headroom Margin</div>
                    <div className="text-base font-bold text-purple-300 mt-0.5">
                      {inspectedSample.budgetHeadroomUs.toFixed(1)} µs
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Limit: 200.0 µs</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: D3 Distribution / Histogram */}
        {activeView === 'distribution' && (
          <div className="space-y-4">
            <div className="relative rounded-xl border border-zinc-850 bg-black p-3 sm:p-5 overflow-hidden">
              <div className="mb-2 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Frequency Distribution of Latency Overhead (µs)</span>
                <span className="text-emerald-400 font-bold">
                  {aggregateStats.percentWithinBudget}% within 200 µs frame deadline
                </span>
              </div>

              <svg
                ref={d3DistributionSvgRef}
                viewBox="0 0 860 300"
                className="w-full h-72 sm:h-80 select-none overflow-visible"
              />

              <div className="mt-3 pt-3 border-t border-zinc-900 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px]">MIN OVERHEAD</div>
                  <div className="text-white font-bold text-sm">+{aggregateStats.minOverheadUs} µs</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-emerald-400 text-[10px]">MEDIAN OVERHEAD (P50)</div>
                  <div className="text-emerald-300 font-bold text-sm">+{aggregateStats.medianOverheadUs} µs</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-amber-400 text-[10px]">P99 WORST-CASE OVERHEAD</div>
                  <div className="text-amber-300 font-bold text-sm">+{aggregateStats.p99OverheadUs} µs</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-400 text-[10px]">JITTER STD DEVIATION (σ)</div>
                  <div className="text-white font-bold text-sm">±{aggregateStats.stdDevUs} µs</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Cryptographic Stage Waterfall Breakdown */}
        {activeView === 'stages' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-black p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <h4 className="text-sm font-bold text-white font-mono uppercase">
                  Stage-by-Stage Latency Decomposition: ML-KEM-768 vs Classical
                </h4>
                <div className="text-xs font-mono text-zinc-400">
                  Hardware: <span className="text-cyan-400">{profileMultipliers.name}</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {stageDecompositionData.map((stage) => {
                  const maxStageVal = Math.max(stage.mlkem768Us, stage.classicalUs, 50);
                  const mlkemPct = (stage.mlkem768Us / maxStageVal) * 100;
                  const classicalPct = (stage.classicalUs / maxStageVal) * 100;

                  return (
                    <div
                      key={stage.stage}
                      className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{stage.stage}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-850 text-cyan-300 border border-zinc-700">
                            {stage.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-zinc-400">
                            Classical: <strong className="text-amber-400">{stage.classicalUs.toFixed(1)} µs</strong>
                          </span>
                          <span className="text-zinc-600">|</span>
                          <span className="text-zinc-400">
                            ML-KEM-768: <strong className="text-cyan-400">{stage.mlkem768Us.toFixed(1)} µs</strong>
                          </span>
                          <span className="text-zinc-600">|</span>
                          <span className="text-emerald-400 font-bold">
                            Δt: +{stage.overheadUs.toFixed(1)} µs
                          </span>
                        </div>
                      </div>

                      {/* Visual Comparison Bars */}
                      <div className="space-y-1.5 pt-1">
                        {/* Classical Bar */}
                        <div className="flex items-center gap-3">
                          <span className="w-20 text-[11px] text-zinc-500">Classical:</span>
                          <div className="flex-1 bg-zinc-900 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 transition-all duration-300"
                              style={{ width: `${classicalPct}%` }}
                            />
                          </div>
                          <span className="w-14 text-right text-amber-400 font-mono text-[11px]">
                            {stage.classicalUs.toFixed(1)} µs
                          </span>
                        </div>

                        {/* ML-KEM-768 Bar */}
                        <div className="flex items-center gap-3">
                          <span className="w-20 text-[11px] text-zinc-500">ML-KEM-768:</span>
                          <div className="flex-1 bg-zinc-900 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 transition-all duration-300"
                              style={{ width: `${mlkemPct}%` }}
                            />
                          </div>
                          <span className="w-14 text-right text-cyan-400 font-mono text-[11px]">
                            {stage.mlkem768Us.toFixed(1)} µs
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-normal pt-1">{stage.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: Avionics Bus Architecture Comparison Matrix */}
        {activeView === 'bus-matrix' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Optical Fibre Channel */}
              <div
                className={`p-5 rounded-xl border transition-all space-y-3 ${
                  busProfile === 'FIBRE-CHANNEL-400M'
                    ? 'border-purple-500 bg-purple-950/20'
                    : 'border-zinc-800 bg-zinc-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-300">Optical Fibre Channel</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 border border-purple-700 text-purple-200">
                    400 Mbps
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">21.8 µs</div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  Minimal Serialization Penalty
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The primary F-22 high-speed avionics backplane easily absorbs the 1,088-byte ML-KEM-768 ciphertext within 22 microseconds, comfortably inside the safety margin.
                </p>
                <button
                  type="button"
                  onClick={() => setBusProfile('FIBRE-CHANNEL-400M')}
                  className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold text-white cursor-pointer"
                >
                  Activate Fibre Channel Benchmark
                </button>
              </div>

              {/* Card 2: MIL-STD-1553B Dual Redundant Bus */}
              <div
                className={`p-5 rounded-xl border transition-all space-y-3 ${
                  busProfile === 'MIL-STD-1553B'
                    ? 'border-purple-500 bg-purple-950/20'
                    : 'border-zinc-800 bg-zinc-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-300">MIL-STD-1553B Bus</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 border border-amber-700 text-amber-200">
                    1.0 Mbps
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400">87.0 µs</div>
                <div className="text-xs font-mono text-amber-300 font-bold">
                  +65.2 µs Fragmentation Overhead
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Due to the 32-word (64-byte) message boundary on legacy 1553B buses, ML-KEM-768 requires 34 discrete sub-frames, introducing noticeable serial packaging latency.
                </p>
                <button
                  type="button"
                  onClick={() => setBusProfile('MIL-STD-1553B')}
                  className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold text-white cursor-pointer"
                >
                  Activate MIL-1553B Benchmark
                </button>
              </div>

              {/* Card 3: Intra-Flight Data Link (IFDL) */}
              <div
                className={`p-5 rounded-xl border transition-all space-y-3 ${
                  busProfile === 'IFDL-AIR-TO-AIR'
                    ? 'border-purple-500 bg-purple-950/20'
                    : 'border-zinc-800 bg-zinc-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-300">IFDL Air-to-Air RF</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-700 text-cyan-200">
                    Directional Stealth
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-cyan-300">34.5 µs</div>
                <div className="text-xs font-mono text-cyan-400 font-bold">
                  Narrowbeam Multi-Ship Mesh
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Inter-flight data link encrypts formation synchronization frames between 4-ship Raptor cells using frequency-hopped phased arrays with minimal overhead.
                </p>
                <button
                  type="button"
                  onClick={() => setBusProfile('IFDL-AIR-TO-AIR')}
                  className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold text-white cursor-pointer"
                >
                  Activate IFDL Air Benchmark
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DO-178C Level A Determinism & Real-Time Envelope Compliance Card */}
      <div
        className={`p-6 rounded-2xl border shadow-2xl space-y-4 transition-colors ${
          aggregateStats.wcetUs <= 200.0
            ? 'border-zinc-800 bg-zinc-950'
            : 'border-rose-900/60 bg-rose-950/20'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            {aggregateStats.wcetUs <= 200.0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
            )}
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              DO-178C Level A & Flight Loop Envelope Certification Analysis
            </h3>
          </div>
          <span
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all ${
              aggregateStats.wcetUs <= 200.0
                ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950 border-rose-500/60 text-rose-300 animate-pulse'
            }`}
          >
            {aggregateStats.wcetUs <= 200.0
              ? 'WCET STATUS: DETERMINISTIC COMPLIANT'
              : 'WCET STATUS: NON-COMPLIANT (DEADLINE BREACH)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2">
            <div className="text-zinc-400 uppercase text-[11px]">Flight Frame Execution Budget</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">20,000 µs</span>
              <span className="text-zinc-500">(20.0 ms @ 50 Hz)</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Total period allocated to aerodynamic control surface calculations, sensor fusion, and navigation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2">
            <div className="text-zinc-400 uppercase text-[11px]">Sub-Frame Cryptographic Slot</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-cyan-300">200.0 µs</span>
              <span className="text-zinc-500">(1.0% of flight frame)</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Strict execution window guaranteed by the Ada 95 Ravenclaw partition scheduler for asymmetric key re-negotiation.
            </p>
          </div>

          <div
            className={`p-4 rounded-xl bg-black border space-y-2 ${
              aggregateStats.wcetUs <= 200.0
                ? 'border-emerald-500/30 bg-emerald-950/10'
                : 'border-rose-500/60 bg-rose-950/20'
            }`}
          >
            <div
              className={`uppercase text-[11px] font-bold ${
                aggregateStats.wcetUs <= 200.0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              Measured Worst-Case Timing (WCET)
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold ${
                  aggregateStats.wcetUs <= 200.0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {aggregateStats.wcetUs} µs
              </span>
              <span
                className={`font-bold ${
                  aggregateStats.wcetUs <= 200.0 ? 'text-emerald-500' : 'text-rose-400'
                }`}
              >
                (Margin: {(200.0 - aggregateStats.wcetUs).toFixed(1)} µs)
              </span>
            </div>
            <p
              className={`text-[11px] leading-relaxed ${
                aggregateStats.wcetUs <= 200.0 ? 'text-emerald-400/90' : 'text-rose-300/90'
              }`}
            >
              {aggregateStats.wcetUs <= 200.0
                ? 'Empirical maximum latency observed under high-EMCON conditions remains strictly within the avionics safety boundary.'
                : 'CRITICAL: Cryptographic key exchange exceeds the 200 µs Ravenclaw partition slot. Offload NTT polynomial arithmetic to CIP1-ASIC or switch from MIL-STD-1553B to Optical Fibre Channel.'}
            </p>
          </div>
        </div>
      </div>

      {/* Telemetry Log Table with Search & Filter */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Flight Computer Latency Overhead Stream Log</span>
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Live cycle-by-cycle telemetry showing individual encapsulation and baseline delta timings.
            </p>
          </div>

          {/* Search & Spikes Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search cycle, timestamp..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setOnlyOverheadSpikes(!onlyOverheadSpikes)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                onlyOverheadSpikes
                  ? 'bg-rose-950 border-rose-500 text-rose-200'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>{onlyOverheadSpikes ? 'Showing P95 Spikes Only' : 'Filter P95 Spikes'}</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="rounded-xl border border-zinc-850 bg-black overflow-x-auto max-h-96">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 text-[10px] uppercase tracking-wider border-b border-zinc-800 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">Cycle</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Flight Regime</th>
                <th className="py-2.5 px-3">ML-KEM-768 Encap</th>
                <th className="py-2.5 px-3">ML-KEM-768 Decap</th>
                <th className="py-2.5 px-3">Classical Base</th>
                <th className="py-2.5 px-3 text-emerald-400">Overhead (Δt)</th>
                <th className="py-2.5 px-3 text-emerald-400">Overhead %</th>
                <th className="py-2.5 px-3">Bus Transit</th>
                <th className="py-2.5 px-3">Jitter</th>
                <th className="py-2.5 px-3 text-right">Budget Headroom</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredLogs.slice(0, 50).map((log) => {
                const isSpike = log.overheadUs >= aggregateStats.p95OverheadUs;

                return (
                  <tr
                    key={log.cycle}
                    onClick={() => setInspectedSample(log)}
                    className={`hover:bg-zinc-900/60 cursor-pointer transition-colors ${
                      isSpike ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-zinc-300 font-bold">#{log.cycle}</td>
                    <td className="py-2 px-3 text-zinc-400">{log.timestamp}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {log.flightMode}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-cyan-300">{log.mlkem768EncapUs} µs</td>
                    <td className="py-2 px-3 text-cyan-400/80">{log.mlkem768DecapUs} µs</td>
                    <td className="py-2 px-3 text-amber-300">{log.classicalBaselineUs} µs</td>
                    <td className="py-2 px-3 font-bold text-emerald-400">+{log.overheadUs} µs</td>
                    <td className="py-2 px-3 text-emerald-300">+{log.overheadPercent}%</td>
                    <td className="py-2 px-3 text-purple-300">{log.busSerializationUs} µs</td>
                    <td className="py-2 px-3 text-zinc-400">±{log.jitterUs} µs</td>
                    <td className="py-2 px-3 text-right font-bold text-purple-400">
                      {log.budgetHeadroomUs} µs
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

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
  LineChart,
  HardDrive,
} from 'lucide-react';
import { F22FlightMode, F22FlightState } from '../../types/f22Simulator';

export type FlightComputerId = 'CIP-1' | 'CIP-2' | 'VMS' | 'CNI-CRYPTO' | 'OFP-MISSION';

export interface FlightComputerConfig {
  id: FlightComputerId;
  name: string;
  role: string;
  architecture: string;
  busInterface: string;
  color: string;
  nominalLatencyUs: number; // in microseconds
  budgetLimitUs: number; // 200 µs target for 50 Hz avionics loop
  kemEncapWeight: number; // fraction of latency
  kemDecapWeight: number;
  dsaSignWeight: number;
  dsaVerifyWeight: number;
  busTransitWeight: number;
}

export interface ComputerLatencyPoint {
  cycle: number;
  timestamp: number;
  timeLabel: string;
  computerId: FlightComputerId;
  totalUs: number;
  kemEncapUs: number;
  kemDecapUs: number;
  dsaSignUs: number;
  dsaVerifyUs: number;
  busTransitUs: number;
  classicalBaselineUs: number;
  jitterUs: number;
  ratchetEvent: boolean;
}

const ONBOARD_FLIGHT_COMPUTERS: FlightComputerConfig[] = [
  {
    id: 'CIP-1',
    name: 'CIP 1 (Raytheon SEM-E)',
    role: 'Sensor Fusion & Radar Processing',
    architecture: 'Liquid-Cooled 66 SEM-E Vector Cluster',
    busInterface: 'Fibre Channel 400 Mbps / 1553B',
    color: '#06b6d4', // Cyan
    nominalLatencyUs: 68.4,
    budgetLimitUs: 200,
    kemEncapWeight: 0.28,
    kemDecapWeight: 0.32,
    dsaSignWeight: 0.16,
    dsaVerifyWeight: 0.14,
    busTransitWeight: 0.10,
  },
  {
    id: 'CIP-2',
    name: 'CIP 2 (Weapons & EW)',
    role: 'Stores Management & AN/ALR-94 EW',
    architecture: 'Liquid-Cooled 66 SEM-E Redundant Cluster',
    busInterface: 'Fibre Channel 400 Mbps / IEEE 1394B',
    color: '#10b981', // Emerald
    nominalLatencyUs: 73.8,
    budgetLimitUs: 200,
    kemEncapWeight: 0.26,
    kemDecapWeight: 0.30,
    dsaSignWeight: 0.19,
    dsaVerifyWeight: 0.15,
    busTransitWeight: 0.10,
  },
  {
    id: 'VMS',
    name: 'VMS / VCC (Vehicle Management)',
    role: 'Quad-Redundant Flight Control & TVC',
    architecture: 'Hardened Quad-Core ADA Core FBW',
    busInterface: 'MIL-STD-1773 Dual Optical Bus',
    color: '#8b5cf6', // Violet
    nominalLatencyUs: 41.2,
    budgetLimitUs: 120, // ultra strict for flight control
    kemEncapWeight: 0.22,
    kemDecapWeight: 0.26,
    dsaSignWeight: 0.24,
    dsaVerifyWeight: 0.18,
    busTransitWeight: 0.10,
  },
  {
    id: 'CNI-CRYPTO',
    name: 'CNI Cryptoprocessor',
    role: 'IFDL & Link 16 Directional Mesh',
    architecture: 'Tamper-Proof KGV-72 Cryogenic Enclave',
    busInterface: 'Wideband RF Interconnect / 1553B',
    color: '#f59e0b', // Amber
    nominalLatencyUs: 94.6,
    budgetLimitUs: 200,
    kemEncapWeight: 0.30,
    kemDecapWeight: 0.34,
    dsaSignWeight: 0.15,
    dsaVerifyWeight: 0.11,
    busTransitWeight: 0.10,
  },
  {
    id: 'OFP-MISSION',
    name: 'OFP Tactical Processor',
    role: 'Tactical Threat & Cockpit HUD Executive',
    architecture: 'DO-178C Level A Deterministic Core',
    busInterface: 'High-Speed Serial Backplane',
    color: '#38bdf8', // Sky
    nominalLatencyUs: 61.5,
    budgetLimitUs: 200,
    kemEncapWeight: 0.25,
    kemDecapWeight: 0.29,
    dsaSignWeight: 0.21,
    dsaVerifyWeight: 0.15,
    busTransitWeight: 0.10,
  },
];

interface F22AvionicsStatusWidgetProps {
  flightState: F22FlightState;
  onTriggerFlightMode?: (mode: F22FlightMode) => void;
  onRekeyTrigger?: () => void;
}

export const F22AvionicsStatusWidget: React.FC<F22AvionicsStatusWidgetProps> = ({
  flightState,
  onTriggerFlightMode,
  onRekeyTrigger,
}) => {
  // Streaming state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [streamRateHz, setStreamRateHz] = useState<number>(25); // 10, 25, 50 Hz simulation
  const [selectedComputerId, setSelectedComputerId] = useState<FlightComputerId | 'ALL'>('ALL');
  const [activeMetricMode, setActiveMetricMode] = useState<
    'total' | 'kem_dsa' | 'budget' | 'jitter'
  >('total');
  const [stressBurstActive, setStressBurstActive] = useState<boolean>(false);
  const [currentFrameCount, setCurrentFrameCount] = useState<number>(1420);
  const [inspectedCycle, setInspectedCycle] = useState<number | null>(null);

  // History buffer of samples across all computers
  const [samplesHistory, setSamplesHistory] = useState<ComputerLatencyPoint[]>(() => {
    // Generate initial 25 cycles for each computer
    const initial: ComputerLatencyPoint[] = [];
    const now = Date.now();
    for (let c = 1; c <= 25; c++) {
      const ts = now - (26 - c) * 1000;
      const d = new Date(ts);
      const timeLabel = d.toTimeString().split(' ')[0];

      ONBOARD_FLIGHT_COMPUTERS.forEach((comp) => {
        const jitter = (Math.random() - 0.5) * 4.2;
        const total = Math.max(20, comp.nominalLatencyUs + jitter);
        initial.push({
          cycle: c,
          timestamp: ts,
          timeLabel,
          computerId: comp.id,
          totalUs: Number(total.toFixed(2)),
          kemEncapUs: Number((total * comp.kemEncapWeight).toFixed(2)),
          kemDecapUs: Number((total * comp.kemDecapWeight).toFixed(2)),
          dsaSignUs: Number((total * comp.dsaSignWeight).toFixed(2)),
          dsaVerifyUs: Number((total * comp.dsaVerifyWeight).toFixed(2)),
          busTransitUs: Number((total * comp.busTransitWeight).toFixed(2)),
          classicalBaselineUs: Number((total * 0.72).toFixed(2)),
          jitterUs: Number((Math.abs(jitter) + 0.4).toFixed(2)),
          ratchetEvent: c % 8 === 0,
        });
      });
    }
    return initial;
  });

  // D3 DOM references
  const timelineSvgRef = useRef<SVGSVGElement | null>(null);
  const barSvgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Latest cycle data
  const latestCycle = useMemo(() => {
    if (samplesHistory.length === 0) return 1;
    return samplesHistory[samplesHistory.length - 1].cycle;
  }, [samplesHistory]);

  // Latest points per computer
  const latestPerComputer = useMemo(() => {
    const map = new Map<FlightComputerId, ComputerLatencyPoint>();
    for (let i = samplesHistory.length - 1; i >= 0; i--) {
      const pt = samplesHistory[i];
      if (!map.has(pt.computerId)) {
        map.set(pt.computerId, pt);
        if (map.size === ONBOARD_FLIGHT_COMPUTERS.length) break;
      }
    }
    return map;
  }, [samplesHistory]);

  // Overall system metrics calculation
  const overallMetrics = useMemo(() => {
    let sumLatency = 0;
    let maxLatency = 0;
    let totalEncap = 0;
    let totalDecap = 0;
    let totalSign = 0;
    let totalVerify = 0;
    let maxJitter = 0;

    ONBOARD_FLIGHT_COMPUTERS.forEach((comp) => {
      const pt = latestPerComputer.get(comp.id);
      if (pt) {
        sumLatency += pt.totalUs;
        if (pt.totalUs > maxLatency) maxLatency = pt.totalUs;
        totalEncap += pt.kemEncapUs;
        totalDecap += pt.kemDecapUs;
        totalSign += pt.dsaSignUs;
        totalVerify += pt.dsaVerifyUs;
        if (pt.jitterUs > maxJitter) maxJitter = pt.jitterUs;
      }
    });

    const avgLatency = ONBOARD_FLIGHT_COMPUTERS.length > 0
      ? sumLatency / ONBOARD_FLIGHT_COMPUTERS.length
      : 0;

    // Flight budget utilization (against 200 µs target = 0.20 ms out of 20.0 ms 50 Hz frame)
    const budgetPct = (avgLatency / 200) * 100;
    const safetyMarginUs = 200 - avgLatency;

    return {
      avgLatencyUs: Number(avgLatency.toFixed(2)),
      maxLatencyUs: Number(maxLatency.toFixed(2)),
      totalEncapUs: Number(totalEncap.toFixed(2)),
      totalDecapUs: Number(totalDecap.toFixed(2)),
      totalSignUs: Number(totalSign.toFixed(2)),
      totalVerifyUs: Number(totalVerify.toFixed(2)),
      budgetUtilizationPct: Number(budgetPct.toFixed(1)),
      safetyMarginUs: Number(safetyMarginUs.toFixed(1)),
      maxJitterUs: Number(maxJitter.toFixed(2)),
      kemAlgo: flightState.pqcSecurity.kemAlgorithm,
      dsaAlgo: flightState.pqcSecurity.signatureAlgorithm,
      status: avgLatency < 120 ? 'NOMINAL' : avgLatency < 180 ? 'ELEVATED' : 'CRITICAL',
    };
  }, [latestPerComputer, flightState.pqcSecurity]);

  // Mode modifier for latencies
  const flightModeMultiplier = useMemo(() => {
    switch (flightState.flightMode) {
      case 'Stealth':
        return 1.18; // ML-KEM-1024 / ML-DSA-87 high security lattice
      case 'Combat':
        return 0.88; // ML-KEM-768 / ML-DSA-65 fast cycle
      case 'Training':
        return 0.72; // ML-KEM-512 / ML-DSA-44 range
      default:
        return 1.0;
    }
  }, [flightState.flightMode]);

  // Live streaming effect
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.round(1000 / (streamRateHz === 50 ? 25 : streamRateHz === 25 ? 12 : 5));

    const interval = setInterval(() => {
      setCurrentFrameCount((prev) => prev + 1);

      const now = Date.now();
      const d = new Date(now);
      const timeLabel = d.toTimeString().split(' ')[0];

      setSamplesHistory((prev) => {
        const currentMaxCycle = prev.length > 0 ? prev[prev.length - 1].cycle : 0;
        const newCycle = currentMaxCycle + 1;
        const newBatch: ComputerLatencyPoint[] = [];

        ONBOARD_FLIGHT_COMPUTERS.forEach((comp) => {
          let jitter = (Math.random() - 0.5) * 4.8;
          let burstBonus = 0;

          if (stressBurstActive) {
            burstBonus = Math.random() * 45 + 20; // simulate ECM surge / formation ratchet
          }

          const base = comp.nominalLatencyUs * flightModeMultiplier;
          const total = Math.max(15, base + jitter + burstBonus);

          newBatch.push({
            cycle: newCycle,
            timestamp: now,
            timeLabel,
            computerId: comp.id,
            totalUs: Number(total.toFixed(2)),
            kemEncapUs: Number((total * comp.kemEncapWeight).toFixed(2)),
            kemDecapUs: Number((total * comp.kemDecapWeight).toFixed(2)),
            dsaSignUs: Number((total * comp.dsaSignWeight).toFixed(2)),
            dsaVerifyUs: Number((total * comp.dsaVerifyWeight).toFixed(2)),
            busTransitUs: Number((total * comp.busTransitWeight).toFixed(2)),
            classicalBaselineUs: Number((total * 0.70).toFixed(2)),
            jitterUs: Number((Math.abs(jitter) + (stressBurstActive ? 8.2 : 0.6)).toFixed(2)),
            ratchetEvent: newCycle % 10 === 0 || stressBurstActive,
          });
        });

        // Keep last 30 cycles * 5 computers = 150 points
        const maxPoints = 30 * ONBOARD_FLIGHT_COMPUTERS.length;
        const combined = [...prev, ...newBatch];
        return combined.slice(-maxPoints);
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, streamRateHz, flightModeMultiplier, stressBurstActive]);

  // Reset stress burst automatically after 3 seconds
  useEffect(() => {
    if (stressBurstActive) {
      const timer = setTimeout(() => {
        setStressBurstActive(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stressBurstActive]);

  // Handle Inject Rekey / Burst Handshake
  const handleTriggerBurst = () => {
    setStressBurstActive(true);
    if (onRekeyTrigger) onRekeyTrigger();
  };

  // -------------------------------------------------------------
  // D3 RENDERER: Multi-Computer Latency Timeline Chart
  // -------------------------------------------------------------
  const renderTimelineChart = useCallback(() => {
    if (!timelineSvgRef.current) return;

    const svg = d3.select(timelineSvgRef.current);
    svg.selectAll('*').remove();

    const width = 860;
    const height = 300;
    const margin = { top: 25, right: 35, bottom: 45, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Filter computers
    const activeComputers =
      selectedComputerId === 'ALL'
        ? ONBOARD_FLIGHT_COMPUTERS
        : ONBOARD_FLIGHT_COMPUTERS.filter((c) => c.id === selectedComputerId);

    // Group samples by cycle
    const cyclesMap = new Map<number, ComputerLatencyPoint[]>();
    samplesHistory.forEach((pt) => {
      if (
        selectedComputerId === 'ALL' ||
        pt.computerId === selectedComputerId
      ) {
        const list = cyclesMap.get(pt.cycle) || [];
        list.push(pt);
        cyclesMap.set(pt.cycle, list);
      }
    });

    const sortedCycles = Array.from(cyclesMap.keys()).sort((a, b) => a - b);
    if (sortedCycles.length === 0) return;

    const minCycle = sortedCycles[0];
    const maxCycle = sortedCycles[sortedCycles.length - 1];

    // Compute Y domain max
    let maxY = 180;
    samplesHistory.forEach((pt) => {
      if (selectedComputerId === 'ALL' || pt.computerId === selectedComputerId) {
        if (pt.totalUs > maxY) maxY = pt.totalUs;
      }
    });
    maxY = Math.ceil(maxY * 1.15 / 20) * 20; // round up to multiple of 20

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([minCycle, Math.max(minCycle + 1, maxCycle)])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxY])
      .range([innerHeight, 0]);

    // Defs & Gradients
    const defs = svg.append('defs');

    // Create glow filter for military HUD line styling
    const filter = defs.append('filter').attr('id', 'hud-glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'blur');
    filter.append('feMerge').selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', (d) => d);

    // Main Chart Container
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Grid lines (horizontal)
    const yTicks = yScale.ticks(6);
    g.append('g')
      .attr('class', 'grid y-grid')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#27272a')
      .attr('stroke-dasharray', '3 3')
      .attr('stroke-opacity', 0.6);

    // 50 Hz Avionics Flight Budget Allocation Guideline (200 µs = 0.20 ms out of 20 ms frame)
    if (maxY >= 200) {
      const budgetY = yScale(200);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', budgetY)
        .attr('y2', budgetY)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5 3')
        .attr('stroke-opacity', 0.85);

      g.append('text')
        .attr('x', innerWidth - 6)
        .attr('y', budgetY - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#ef4444')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text('▲ 200 µs (0.20 ms) 50 Hz Hardware Budget Limit');
    }

    // 100 µs Nominal Guideline
    const nominalY = yScale(100);
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', nominalY)
      .attr('y2', nominalY)
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 4')
      .attr('stroke-opacity', 0.45);

    g.append('text')
      .attr('x', 6)
      .attr('y', nominalY - 5)
      .attr('text-anchor', 'start')
      .attr('fill', '#06b6d4')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('opacity', 0.7)
      .text('100 µs Optimal Threshold');

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(10, sortedCycles.length))
      .tickFormat((d) => `Cycle #${d}`);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickFormat((d) => `${d} µs`);

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .attr('color', '#52525b')
      .selectAll('text')
      .attr('font-family', 'monospace')
      .attr('font-size', '10px')
      .attr('fill', '#a1a1aa');

    g.append('g')
      .call(yAxis)
      .attr('color', '#52525b')
      .selectAll('text')
      .attr('font-family', 'monospace')
      .attr('font-size', '10px')
      .attr('fill', '#a1a1aa');

    // Axis Titles
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -42)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#71717a')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .text('Negotiation Latency (Microseconds · µs)');

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#71717a')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .text('50 Hz Avionics Cyclic Execution Sequence');

    // Line generator for total latency
    const lineGenerator = d3
      .line<ComputerLatencyPoint>()
      .x((d) => xScale(d.cycle))
      .y((d) => {
        if (activeMetricMode === 'kem_dsa') {
          return yScale(d.kemEncapUs + d.kemDecapUs);
        }
        return yScale(d.totalUs);
      })
      .curve(d3.curveMonotoneX);

    // Area generator for active single selection
    const areaGenerator = d3
      .area<ComputerLatencyPoint>()
      .x((d) => xScale(d.cycle))
      .y0(innerHeight)
      .y1((d) => yScale(d.totalUs))
      .curve(d3.curveMonotoneX);

    // Render curves for each computer
    activeComputers.forEach((comp) => {
      const compSamples = samplesHistory.filter((s) => s.computerId === comp.id);
      if (compSamples.length < 2) return;

      // Single computer selected: show gradient area fill
      if (selectedComputerId === comp.id) {
        const areaGradId = `area-grad-${comp.id}`;
        const grad = defs
          .append('linearGradient')
          .attr('id', areaGradId)
          .attr('x1', '0')
          .attr('y1', '0')
          .attr('x2', '0')
          .attr('y2', '1');

        grad.append('stop').attr('offset', '0%').attr('stop-color', comp.color).attr('stop-opacity', 0.35);
        grad.append('stop').attr('offset', '100%').attr('stop-color', comp.color).attr('stop-opacity', 0.0);

        g.append('path')
          .datum(compSamples)
          .attr('fill', `url(#${areaGradId})`)
          .attr('d', areaGenerator);
      }

      // Draw Main Line
      g.append('path')
        .datum(compSamples)
        .attr('fill', 'none')
        .attr('stroke', comp.color)
        .attr('stroke-width', selectedComputerId === comp.id ? 2.8 : 2.0)
        .attr('stroke-opacity', selectedComputerId === 'ALL' || selectedComputerId === comp.id ? 0.95 : 0.3)
        .attr('filter', 'url(#hud-glow)')
        .attr('d', lineGenerator);

      // Data point nodes
      g.selectAll(`.dot-${comp.id}`)
        .data(compSamples)
        .enter()
        .append('circle')
        .attr('class', `dot-${comp.id}`)
        .attr('cx', (d) => xScale(d.cycle))
        .attr('cy', (d) =>
          activeMetricMode === 'kem_dsa'
            ? yScale(d.kemEncapUs + d.kemDecapUs)
            : yScale(d.totalUs)
        )
        .attr('r', (d) => (d.ratchetEvent ? 4.5 : 2.5))
        .attr('fill', (d) => (d.ratchetEvent ? '#fbbf24' : comp.color))
        .attr('stroke', '#09090b')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.9);
    });

    // Ratchet event markers along top of chart
    const ratchetCycles = sortedCycles.filter((cycle) => {
      const pts = cyclesMap.get(cycle) || [];
      return pts.some((p) => p.ratchetEvent);
    });

    ratchetCycles.forEach((cycle) => {
      const cx = xScale(cycle);
      g.append('line')
        .attr('x1', cx)
        .attr('x2', cx)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2 4')
        .attr('stroke-opacity', 0.4);

      g.append('circle')
        .attr('cx', cx)
        .attr('cy', 8)
        .attr('r', 3)
        .attr('fill', '#f59e0b');
    });

    // Interactive Overlay Guide & Mouse Tracker
    const hoverLine = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3 3')
      .attr('opacity', 0);

    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const cycleHover = Math.round(xScale.invert(mx));
        const pts = cyclesMap.get(cycleHover);

        if (pts && pts.length > 0) {
          hoverLine
            .attr('x1', xScale(cycleHover))
            .attr('x2', xScale(cycleHover))
            .attr('opacity', 1);

          setInspectedCycle(cycleHover);

          if (tooltipRef.current) {
            const rect = timelineSvgRef.current?.getBoundingClientRect();
            if (rect) {
              const tooltipX = Math.min(rect.width - 240, Math.max(10, mx + margin.left - 100));
              tooltipRef.current.style.transform = `translate(${tooltipX}px, 15px)`;
              tooltipRef.current.style.opacity = '1';
            }
          }
        }
      })
      .on('mouseleave', () => {
        hoverLine.attr('opacity', 0);
        setInspectedCycle(null);
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = '0';
        }
      });
  }, [samplesHistory, selectedComputerId, activeMetricMode]);

  // -------------------------------------------------------------
  // D3 RENDERER: Subsystem Horizontal Breakdown Bar Chart
  // -------------------------------------------------------------
  const renderBarChart = useCallback(() => {
    if (!barSvgRef.current) return;

    const svg = d3.select(barSvgRef.current);
    svg.selectAll('*').remove();

    const width = 860;
    const height = 190;
    const margin = { top: 15, right: 65, bottom: 35, left: 165 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const data = ONBOARD_FLIGHT_COMPUTERS.map((comp) => {
      const pt = latestPerComputer.get(comp.id);
      return {
        id: comp.id,
        name: comp.name,
        color: comp.color,
        budget: comp.budgetLimitUs,
        total: pt ? pt.totalUs : comp.nominalLatencyUs,
        encap: pt ? pt.kemEncapUs : comp.nominalLatencyUs * comp.kemEncapWeight,
        decap: pt ? pt.kemDecapUs : comp.nominalLatencyUs * comp.kemDecapWeight,
        sign: pt ? pt.dsaSignUs : comp.nominalLatencyUs * comp.dsaSignWeight,
        verify: pt ? pt.dsaVerifyUs : comp.nominalLatencyUs * comp.dsaVerifyWeight,
        bus: pt ? pt.busTransitUs : comp.nominalLatencyUs * comp.busTransitWeight,
        classical: pt ? pt.classicalBaselineUs : comp.nominalLatencyUs * 0.7,
      };
    });

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.id))
      .range([0, innerHeight])
      .padding(0.3);

    const maxVal = Math.max(160, d3.max(data, (d) => Math.max(d.total, d.budget)) || 160);
    const xScale = d3.scaleLinear().domain([0, maxVal * 1.1]).range([0, innerWidth]);

    // Grid lines
    g.append('g')
      .selectAll('line')
      .data(xScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#27272a')
      .attr('stroke-dasharray', '2 2')
      .attr('stroke-opacity', 0.5);

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat((d) => `${d} µs`);
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .attr('color', '#52525b')
      .selectAll('text')
      .attr('font-family', 'monospace')
      .attr('font-size', '10px')
      .attr('fill', '#a1a1aa');

    const yAxis = d3.axisLeft(yScale).tickFormat((id) => {
      const match = ONBOARD_FLIGHT_COMPUTERS.find((c) => c.id === id);
      return match ? match.name.split(' (')[0] : id;
    });

    g.append('g')
      .call(yAxis)
      .attr('color', '#52525b')
      .selectAll('text')
      .attr('font-family', 'monospace')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#e4e4e7');

    // Render Stacked Breakdown Bars for each Computer
    data.forEach((d) => {
      const y = yScale(d.id) || 0;
      const barHeight = yScale.bandwidth();

      // Background Track
      g.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', innerWidth)
        .attr('height', barHeight)
        .attr('fill', '#18181b')
        .attr('rx', 3);

      // Stacked segments:
      // 1. FIPS 203 Encap (cyan)
      // 2. FIPS 203 Decap (teal)
      // 3. FIPS 204 Sign (emerald)
      // 4. FIPS 204 Verify (sky)
      // 5. Bus Transit (violet)
      let currentX = 0;
      const segments = [
        { label: 'FIPS 203 Encap', val: d.encap, color: '#06b6d4' },
        { label: 'FIPS 203 Decap', val: d.decap, color: '#14b8a6' },
        { label: 'FIPS 204 Sign', val: d.sign, color: '#10b981' },
        { label: 'FIPS 204 Verify', val: d.verify, color: '#38bdf8' },
        { label: 'Bus Transit', val: d.bus, color: '#a855f7' },
      ];

      segments.forEach((seg) => {
        const segWidth = xScale(seg.val);
        g.append('rect')
          .attr('x', currentX)
          .attr('y', y)
          .attr('width', segWidth)
          .attr('height', barHeight)
          .attr('fill', seg.color)
          .attr('opacity', 0.85);
        currentX += segWidth;
      });

      // Budget threshold marker for this computer
      const budgetX = xScale(d.budget);
      g.append('line')
        .attr('x1', budgetX)
        .attr('x2', budgetX)
        .attr('y1', y - 2)
        .attr('y2', y + barHeight + 2)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3 2');

      // Value label on right
      g.append('text')
        .attr('x', currentX + 8)
        .attr('y', y + barHeight / 2 + 3)
        .attr('fill', d.total > d.budget ? '#ef4444' : '#10b981')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text(`${d.total.toFixed(1)} µs`);
    });
  }, [latestPerComputer]);

  // Execute D3 updates when state changes
  useEffect(() => {
    renderTimelineChart();
  }, [renderTimelineChart]);

  useEffect(() => {
    renderBarChart();
  }, [renderBarChart]);

  // Handle export JSON
  const handleExportTelemetry = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            airframe: 'F-22A Raptor Block 35',
            avionicsStandard: 'FIPS 203 / FIPS 204 Hybrid Post-Quantum Implementation',
            flightMode: flightState.flightMode,
            masterFrameCount: currentFrameCount,
            summaryMetrics: overallMetrics,
            onboardComputers: ONBOARD_FLIGHT_COMPUTERS,
            samplesHistory,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `f22_avionics_pqc_latency_stream_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Inspected cycle details
  const inspectedData = useMemo(() => {
    if (inspectedCycle === null) return null;
    return samplesHistory.filter((s) => s.cycle === inspectedCycle);
  }, [inspectedCycle, samplesHistory]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & TELEMETRY HUD BAR                                         */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl border border-emerald-500/30 bg-zinc-950/90 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>Avionics Status: Onboard Flight Computers</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                  <span>NIST FIPS 203 / FIPS 204 Hybrid Key Negotiation Latency</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-semibold">50 Hz Real-Time Bus Watch</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick HUD Metrics Badge Cluster */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 font-mono text-xs">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Avionics Loop</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>50.0 Hz</span>
                <span className="text-[10px] text-emerald-400 font-normal">20.0 ms frame</span>
              </div>
            </div>

            <div className="p-2.5 px-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 font-mono text-xs">
              <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                Hybrid Crypto Overhead
              </div>
              <div className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <span>{overallMetrics.avgLatencyUs} µs</span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  ({overallMetrics.budgetUtilizationPct}% of limit)
                </span>
              </div>
            </div>

            <div className="p-2.5 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 font-mono text-xs">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Frame Counter</div>
              <div className="text-sm font-bold text-cyan-300">
                FRAME #{currentFrameCount.toString().padStart(6, '0')}
              </div>
            </div>

            <div className="p-2.5 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 font-mono text-xs">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Assurance</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CNSA 2.0 PASS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Cryptographic Status Sub-banner */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-zinc-500">KEM Standard:</span>
            <span className="text-cyan-300 font-semibold">{overallMetrics.kemAlgo.split(' (')[0]}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-zinc-500">DSA Standard:</span>
            <span className="text-emerald-300 font-semibold">{overallMetrics.dsaAlgo.split(' (')[0]}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-zinc-500">Safety Margin:</span>
            <span className="text-white font-semibold">+{overallMetrics.safetyMarginUs} µs to frame deadline</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-zinc-500">Worst-Case Jitter:</span>
            <span className="text-amber-300 font-semibold">±{overallMetrics.maxJitterUs} µs</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ONBOARD FLIGHT COMPUTERS TELEMETRY STATUS CARDS                         */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Onboard Flight Computers Cryptographic Enclaves</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Click any computer to isolate its D3 latency time-series
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {ONBOARD_FLIGHT_COMPUTERS.map((comp) => {
            const pt = latestPerComputer.get(comp.id);
            const latency = pt ? pt.totalUs : comp.nominalLatencyUs;
            const isSelected = selectedComputerId === comp.id;
            const pctOfBudget = (latency / comp.budgetLimitUs) * 100;
            const isOverBudget = latency > comp.budgetLimitUs;

            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => setSelectedComputerId(isSelected ? 'ALL' : comp.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/50 shadow-lg'
                    : 'border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      {comp.id}
                    </div>
                    <div className="text-xs font-bold text-white font-mono leading-tight">
                      {comp.name.split(' (')[0]}
                    </div>
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: comp.color }}
                  />
                </div>

                <div className="mt-2.5 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-[10px] text-zinc-400">Negotiation</span>
                    <span
                      className={`text-base font-bold ${
                        isOverBudget ? 'text-rose-400' : 'text-emerald-300'
                      }`}
                    >
                      {latency.toFixed(1)} <span className="text-[10px] font-normal">µs</span>
                    </span>
                  </div>

                  {/* Progress Bar against Allocation Budget */}
                  <div className="mt-1.5 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOverBudget ? 'bg-rose-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, pctOfBudget)}%` }}
                    />
                  </div>

                  <div className="mt-2 text-[10px] font-mono text-zinc-400 space-y-0.5">
                    <div className="truncate text-zinc-400">{comp.role}</div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Max Budget:</span>
                      <span className="text-zinc-300">{comp.budgetLimitUs} µs</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Bus:</span>
                      <span className="text-zinc-300 truncate max-w-[90px]">{comp.busInterface.split(' /')[0]}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE D3 LATENCY TIMELINE CHART                                   */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Live D3.js Hybrid Key Negotiation Latency Stream
              </h4>
            </div>
            <p className="text-xs text-zinc-400">
              Microsecond resolution breakdown of NIST FIPS 203 (ML-KEM) encapsulation/decapsulation and FIPS 204 (ML-DSA) packet verification.
            </p>
          </div>

          {/* Interactive Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Mode Filter */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveMetricMode('total')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeMetricMode === 'total'
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Total Latency
              </button>
              <button
                type="button"
                onClick={() => setActiveMetricMode('kem_dsa')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeMetricMode === 'kem_dsa'
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                KEM Lattice Only
              </button>
            </div>

            {/* Stream Speed Selector */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setStreamRateHz(10)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  streamRateHz === 10
                    ? 'bg-emerald-950 text-emerald-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                10 Hz
              </button>
              <button
                type="button"
                onClick={() => setStreamRateHz(25)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  streamRateHz === 25
                    ? 'bg-emerald-950 text-emerald-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                25 Hz
              </button>
              <button
                type="button"
                onClick={() => setStreamRateHz(50)}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  streamRateHz === 50
                    ? 'bg-emerald-950 text-emerald-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                50 Hz (Live)
              </button>
            </div>

            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 cursor-pointer transition-colors"
              title={isPlaying ? 'Pause stream' : 'Resume stream'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Trigger Rekey Surge */}
            <button
              type="button"
              onClick={handleTriggerBurst}
              className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              title="Simulates intra-flight KEM key ratchet and burst verification surge"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Ratchet Key Surge</span>
            </button>

            {/* Export Telemetry */}
            <button
              type="button"
              onClick={handleExportTelemetry}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
            <span className="text-zinc-300">CIP 1 (Sensor Fusion)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
            <span className="text-zinc-300">CIP 2 (Weapons & EW)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-purple-400 inline-block" />
            <span className="text-zinc-300">VMS (Flight Control)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 inline-block" />
            <span className="text-zinc-300">CNI Cryptoprocessor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-400 inline-block" />
            <span className="text-zinc-300">OFP Tactical Core</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="w-3 h-0.5 bg-amber-400 border-dashed inline-block" />
            <span className="text-amber-400">● Ratchet Resync Marker</span>
          </div>
        </div>

        {/* D3 Timeline Viewport with Interactive Tooltip */}
        <div className="relative rounded-xl border border-zinc-850 bg-black p-2 overflow-hidden">
          <svg
            ref={timelineSvgRef}
            viewBox="0 0 860 300"
            className="w-full h-72 select-none overflow-visible"
            preserveAspectRatio="none"
          />

          {/* D3 Floating Scrub Tooltip */}
          <div
            ref={tooltipRef}
            className="absolute top-2 left-0 pointer-events-none opacity-0 transition-opacity duration-150 p-3 rounded-xl bg-zinc-900/95 border border-zinc-700 shadow-2xl text-xs font-mono text-zinc-200 min-w-[220px] backdrop-blur-md z-30"
          >
            {inspectedData && inspectedData.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-white border-b border-zinc-800 pb-1 flex justify-between">
                  <span>CYCLE #{inspectedData[0].cycle}</span>
                  <span className="text-zinc-400">{inspectedData[0].timeLabel}</span>
                </div>
                {inspectedData.map((pt) => {
                  const comp = ONBOARD_FLIGHT_COMPUTERS.find((c) => c.id === pt.computerId);
                  return (
                    <div key={pt.computerId} className="flex justify-between items-center text-[10px]">
                      <span style={{ color: comp?.color || '#fff' }}>
                        {comp?.name.split(' (')[0]}:
                      </span>
                      <span className="font-bold text-white">{pt.totalUs.toFixed(1)} µs</span>
                    </div>
                  );
                })}
                <div className="pt-1 border-t border-zinc-800/80 text-[10px] text-zinc-400 flex justify-between">
                  <span>Encap/Decap:</span>
                  <span className="text-cyan-300">
                    {(inspectedData[0].kemEncapUs + inspectedData[0].kemDecapUs).toFixed(1)} µs
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. D3 HORIZONTAL COMPONENT BREAKDOWN BARS & FRAME BUDGET ALLOCATION        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* D3 Stacked Component Breakdown Bar Chart (Left 2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Cryptographic Stage Latency Breakdown (µs)
              </h4>
            </div>
            <div className="text-[10px] font-mono text-zinc-400">
              Live Stacked Stage Composition
            </div>
          </div>

          {/* D3 Bar Svg */}
          <div className="rounded-xl border border-zinc-850 bg-black p-2 overflow-hidden">
            <svg
              ref={barSvgRef}
              viewBox="0 0 860 190"
              className="w-full h-48 select-none"
              preserveAspectRatio="none"
            />
          </div>

          {/* Color Breakdown Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
              <span>FIPS 203 Encap</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" />
              <span>FIPS 203 Decap</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              <span>FIPS 204 Sign</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
              <span>FIPS 204 Verify</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" />
              <span>Bus Transit</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-0.5 border-dashed bg-rose-500 inline-block" />
              <span>50 Hz Budget Limit</span>
            </div>
          </div>
        </div>

        {/* 50 Hz Avionics Cyclic Timing Budget Gauges (Right 1 col) */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Avionics 50 Hz Frame Budget
            </h4>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl border border-zinc-850 bg-black/60 space-y-2">
              <div className="flex justify-between text-zinc-400 text-[10px] uppercase">
                <span>Cycle Frame Deadline</span>
                <span className="text-white font-bold">20.0 ms (50 Hz)</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[10px] uppercase">
                <span>Crypto Execution Budget</span>
                <span className="text-cyan-300 font-bold">0.20 ms (200 µs)</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[10px] uppercase">
                <span>Current Realized Usage</span>
                <span className="text-emerald-400 font-bold">
                  {(overallMetrics.avgLatencyUs / 1000).toFixed(4)} ms ({overallMetrics.avgLatencyUs} µs)
                </span>
              </div>

              {/* Visual gauge */}
              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, overallMetrics.budgetUtilizationPct)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-zinc-500 pt-0.5">
                <span>0.0%</span>
                <span className="text-emerald-400 font-bold">
                  {overallMetrics.budgetUtilizationPct}% utilized
                </span>
                <span>100.0%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 space-y-1.5 text-zinc-300">
              <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic Execution Margin</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Avionics flight control tasks (Fly-By-Wire, 2D TVC nozzles) require uninterrupted 50 Hz cycle execution without jitter. Post-quantum operations comfortably operate with <strong>+{overallMetrics.safetyMarginUs} µs</strong> of execution headroom.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-850 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Flight Regime:</span>
                <span className="text-white font-bold">{flightState.flightMode.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Rekey Period:</span>
                <span className="text-zinc-300">{flightState.pqcSecurity.rekeyIntervalSeconds}s Ratchet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Hardware TRNG:</span>
                <span className="text-amber-400">FIPS 140-3 Level 4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

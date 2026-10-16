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
  Network,
  Filter,
  Move,
  CornerDownRight,
} from 'lucide-react';
import { F22FlightMode, F22AvionicsSubsystem } from '../../types/f22Simulator';
import { F22_PQC_MODE_PRESETS, F22_AVIONICS_SUBSYSTEMS } from '../../data/f22SimulatorData';

const getMatchedSubsystem = (nodeId: string): F22AvionicsSubsystem => {
  if (nodeId === 'cip-1') return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'isf-fusion') || F22_AVIONICS_SUBSYSTEMS[0];
  if (nodeId === 'cip-2') return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'racr-oms') || F22_AVIONICS_SUBSYSTEMS[1];
  if (nodeId === 'apg-77') return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'apg77-radar') || F22_AVIONICS_SUBSYSTEMS[2];
  if (nodeId === 'alr-94') return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'alr94-ew') || F22_AVIONICS_SUBSYSTEMS[3];
  if (nodeId === 'vms-tvc') return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'fcs-thrust-vec') || F22_AVIONICS_SUBSYSTEMS[4];
  if (nodeId === 'ifdl-mesh') return F22_AVIONICS_SUBSYSTEMS.find((s) => s.id === 'ifdl-cnsa2') || F22_AVIONICS_SUBSYSTEMS[5];
  return F22_AVIONICS_SUBSYSTEMS[0];
};
import {
  AVIONICS_NODES,
  AVIONICS_LINKS,
  AvionicsD3Node,
  AvionicsD3Link,
  PqcAlgorithmConfig,
  CommunicationFlowType,
} from './F22AvionicsD3Map';

export interface ForceNodeDatum extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  acronym: string;
  category: 'Sensors' | 'Core CIP' | 'Interconnect' | 'Flight Controls' | 'Weapons' | 'Tactical Mesh';
  cipHost: string;
  iconType: 'radar' | 'eye' | 'cpu' | 'radio' | 'crosshair' | 'zap' | 'key' | 'terminal';
  busInterface: string;
  pqcAlgorithm: string;
  securityDomain: string;
  criticality: string;
  sloc: string;
  description: string;
  hardwareSpecs: string;
  pqcConfig: PqcAlgorithmConfig;
  radius: number;
  clusterGroup: number;
}

export interface ForceLinkDatum extends d3.SimulationLinkDatum<ForceNodeDatum> {
  id: string;
  source: ForceNodeDatum | string;
  target: ForceNodeDatum | string;
  label: string;
  type: 'kem' | 'dsa' | 'hybrid' | 'bus';
  protocol: string;
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

interface F22AvionicsForceGraphProps {
  flightMode?: F22FlightMode;
  onSelectSubsystem?: (subsystem: F22AvionicsSubsystem) => void;
  onOpenCodeView?: (subsystem: F22AvionicsSubsystem) => void;
}

export const F22AvionicsForceGraph: React.FC<F22AvionicsForceGraphProps> = ({
  flightMode = 'Stealth',
  onSelectSubsystem,
  onOpenCodeView,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<d3.Simulation<ForceNodeDatum, ForceLinkDatum> | null>(null);

  // Interaction State
  const [selectedNodeId, setSelectedNodeId] = useState<string>('cip-1');
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [flowFilter, setFlowFilter] = useState<CommunicationFlowType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeFlightMode, setActiveFlightMode] = useState<F22FlightMode>(flightMode);
  const [isPhysicsRunning, setIsPhysicsRunning] = useState<boolean>(true);
  const [repulsionStrength, setRepulsionStrength] = useState<number>(-420);
  const [linkDistance, setLinkDistance] = useState<number>(130);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active Tab in the Inspector: 'comparison' (ML-KEM vs ML-DSA) | 'benchmark' | 'details' | 'links'
  const [inspectorView, setInspectorView] = useState<'comparison' | 'benchmark' | 'details' | 'links'>(
    'comparison'
  );

  // Live Benchmark Simulator State
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [benchmarkResult, setBenchmarkResult] = useState<{
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

  // Sync flight mode prop
  useEffect(() => {
    setActiveFlightMode(flightMode);
  }, [flightMode]);

  // Selected Node Object
  const selectedNode = useMemo(
    () => AVIONICS_NODES.find((n) => n.id === selectedNodeId) || AVIONICS_NODES[3],
    [selectedNodeId]
  );

  // Selected Link Object
  const selectedLink = useMemo(
    () => (selectedLinkId ? AVIONICS_LINKS.find((l) => l.id === selectedLinkId) || null : null),
    [selectedLinkId]
  );

  // Connected Links for Selected Node
  const connectedLinks = useMemo(() => {
    return AVIONICS_LINKS.filter(
      (l) => l.source === selectedNodeId || l.target === selectedNodeId
    );
  }, [selectedNodeId]);

  // Connected Neighbor Node IDs
  const connectedNeighborIds = useMemo(() => {
    const set = new Set<string>();
    connectedLinks.forEach((l) => {
      if (l.source === selectedNodeId) set.add(l.target);
      if (l.target === selectedNodeId) set.add(l.source);
    });
    return set;
  }, [connectedLinks, selectedNodeId]);

  // Dynamic PQC Preset according to flight mode
  const activePreset = useMemo(
    () => F22_PQC_MODE_PRESETS[activeFlightMode],
    [activeFlightMode]
  );

  // Category Colors
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Core CIP':
        return '#06b6d4'; // Cyan
      case 'Sensors':
        return '#38bdf8'; // Sky
      case 'Interconnect':
        return '#f59e0b'; // Amber
      case 'Flight Controls':
        return '#10b981'; // Emerald
      case 'Weapons':
        return '#f43f5e'; // Rose
      case 'Tactical Mesh':
        return '#a855f7'; // Purple
      default:
        return '#10b981';
    }
  };

  // Node Radius based on category hierarchy
  const getNodeRadius = (category: string) => {
    if (category === 'Core CIP') return 36;
    if (category === 'Sensors' || category === 'Interconnect') return 28;
    return 24;
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Live Benchmark Trigger
  const handleRunBenchmark = useCallback(() => {
    setIsBenchmarking(true);
    setTimeout(() => {
      const cfg = selectedNode.pqcConfig;
      const modeFactor = activeFlightMode === 'Stealth' ? 1.25 : activeFlightMode === 'Combat' ? 0.9 : 0.75;
      const encap = Math.round(cfg.kemLatencyMs * 1000 * modeFactor * (0.92 + Math.random() * 0.16));
      const decap = Math.round(cfg.kemLatencyMs * 1100 * modeFactor * (0.92 + Math.random() * 0.16));
      const sign = Math.round(cfg.dsaLatencyMs * 1000 * modeFactor * (0.92 + Math.random() * 0.16));
      const verify = Math.round(cfg.dsaLatencyMs * 600 * modeFactor * (0.92 + Math.random() * 0.16));

      // Realistic hex string samples
      const mockCiphertextHex = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join(' ');
      const mockSigHex = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join(' ');

      setBenchmarkResult({
        nodeId: selectedNode.id,
        timestamp: new Date().toLocaleTimeString(),
        encapTimeUs: encap,
        decapTimeUs: decap,
        signTimeUs: sign,
        verifyTimeUs: verify,
        signatureVerified: true,
        quantumEntropyBits: 256,
        ciphertextHex: mockCiphertextHex.toUpperCase(),
        signatureHex: mockSigHex.toUpperCase(),
      });
      setIsBenchmarking(false);
    }, 700);
  }, [selectedNode, activeFlightMode]);

  // -------------------------------------------------------------
  // D3 FORCE SIMULATION RENDERER
  // -------------------------------------------------------------
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 940;
    const height = 620;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Definitions: Filters and Markers
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs
      .append('filter')
      .attr('id', 'force-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    filter
      .append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', (d) => d);

    // Arrow markers for links
    const markerTypes = [
      { id: 'marker-kem', color: '#06b6d4' },
      { id: 'marker-dsa', color: '#10b981' },
      { id: 'marker-hybrid', color: '#a855f7' },
      { id: 'marker-bus', color: '#f59e0b' },
    ];

    markerTypes.forEach((m) => {
      defs
        .append('marker')
        .attr('id', m.id)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 28) // offset from target center
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', m.color);
    });

    // Main Zoom Container
    const zoomContainer = svg.append('g').attr('class', 'zoom-container');

    // Setup D3 Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 3.0])
      .on('zoom', (event) => {
        zoomContainer.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Filter Visible Nodes & Links based on UI state
    let filteredNodes = AVIONICS_NODES.map((n) => {
      let clusterGroup = 2;
      if (n.category === 'Core CIP') clusterGroup = 0;
      else if (n.category === 'Sensors' || n.category === 'Interconnect') clusterGroup = 1;
      return {
        ...n,
        radius: getNodeRadius(n.category),
        clusterGroup,
      } as ForceNodeDatum;
    });

    if (categoryFilter !== 'all') {
      filteredNodes = filteredNodes.filter((n) => n.category === categoryFilter);
    }

    const validNodeIds = new Set(filteredNodes.map((n) => n.id));

    let filteredLinks = AVIONICS_LINKS.filter(
      (l) => validNodeIds.has(l.source) && validNodeIds.has(l.target)
    ).map((l) => ({ ...l } as ForceLinkDatum));

    if (flowFilter !== 'all') {
      if (flowFilter === 'kem') {
        filteredLinks = filteredLinks.filter((l) => l.type === 'kem' || l.type === 'hybrid');
      } else if (flowFilter === 'dsa') {
        filteredLinks = filteredLinks.filter((l) => l.type === 'dsa' || l.type === 'hybrid');
      } else if (flowFilter === 'bus') {
        filteredLinks = filteredLinks.filter((l) => l.type === 'bus');
      }
    }

    // Initialize Force Simulation
    const simulation = d3
      .forceSimulation<ForceNodeDatum, ForceLinkDatum>(filteredNodes)
      .force(
        'link',
        d3
          .forceLink<ForceNodeDatum, ForceLinkDatum>(filteredLinks)
          .id((d) => d.id)
          .distance((l) => {
            const srcId = typeof l.source === 'object' ? l.source.id : l.source;
            const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
            if (
              (srcId === 'cip-1' && tgtId === 'cip-2') ||
              (srcId === 'cip-2' && tgtId === 'cip-1')
            ) {
              return 85; // Core CIP backplane tight pairing
            }
            return linkDistance;
          })
          .strength(0.7)
      )
      .force('charge', d3.forceManyBody().strength(repulsionStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide<ForceNodeDatum>().radius((d) => d.radius + 20)
      )
      .force('radial', d3.forceRadial<ForceNodeDatum>((d) => d.clusterGroup * 150, width / 2, height / 2).strength(0.2));

    simulationRef.current = simulation;

    // Background HUD concentric radar rings
    const hudRings = zoomContainer.append('g').attr('class', 'hud-rings').attr('opacity', 0.25);
    [100, 200, 320, 440].forEach((r) => {
      hudRings
        .append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#06b6d4')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3 5');
    });

    // Crosshairs in the center
    hudRings
      .append('line')
      .attr('x1', width / 2 - 20)
      .attr('x2', width / 2 + 20)
      .attr('y1', height / 2)
      .attr('y2', height / 2)
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 1.5);
    hudRings
      .append('line')
      .attr('x1', width / 2)
      .attr('x2', width / 2)
      .attr('y1', height / 2 - 20)
      .attr('y2', height / 2 + 20)
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 1.5);

    // Links Layer
    const linksLayer = zoomContainer.append('g').attr('class', 'links-layer');
    const nodesLayer = zoomContainer.append('g').attr('class', 'nodes-layer');

    // Create Link Elements
    const linkGroups = linksLayer
      .selectAll('.link-g')
      .data(filteredLinks)
      .enter()
      .append('g')
      .attr('class', 'link-g')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedLinkId(d.id);
        setInspectorView('links');
      });

    // Transparent wide hit-box for links
    linkGroups
      .append('line')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 16);

    // Visible link line
    const linkPaths = linkGroups
      .append('line')
      .attr('class', 'link-line')
      .attr('stroke', (d) => {
        if (d.type === 'kem') return '#06b6d4';
        if (d.type === 'dsa') return '#10b981';
        if (d.type === 'hybrid') return '#a855f7';
        return '#f59e0b';
      })
      .attr('stroke-width', (d) => (d.id === selectedLinkId ? 3.5 : 2))
      .attr('stroke-dasharray', (d) => (d.type === 'bus' ? '6 4' : null))
      .attr('stroke-opacity', (d) => {
        const srcId = typeof d.source === 'object' ? d.source.id : d.source;
        const tgtId = typeof d.target === 'object' ? d.target.id : d.target;
        if (!selectedNodeId) return 0.6;
        if (srcId === selectedNodeId || tgtId === selectedNodeId || d.id === selectedLinkId) {
          return 1.0;
        }
        return 0.15;
      })
      .attr('marker-end', (d) => `url(#marker-${d.type})`);

    // Animated particles on links
    const linkParticles = showParticles
      ? linkGroups
          .append('circle')
          .attr('r', 3)
          .attr('fill', (d) => (d.type === 'kem' ? '#06b6d4' : d.type === 'dsa' ? '#10b981' : '#a855f7'))
          .attr('filter', 'url(#force-glow)')
          .attr('opacity', 0.85)
      : null;

    // Create Node Elements
    const nodeGroups = nodesLayer
      .selectAll('.node-g')
      .data(filteredNodes)
      .enter()
      .append('g')
      .attr('class', 'node-g')
      .style('cursor', 'grab')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
        setSelectedLinkId(null);
        if (onSelectSubsystem) {
          onSelectSubsystem(getMatchedSubsystem(d.id));
        }
      });

    // Drag behavior
    const drag = d3
      .drag<SVGGElement, ForceNodeDatum>()
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
        // keep fixed or unfix based on physics running
        if (isPhysicsRunning) {
          d.fx = null;
          d.fy = null;
        }
      });

    nodeGroups.call(drag);

    // Selected node radiating pulse circle
    nodeGroups
      .filter((d) => d.id === selectedNodeId)
      .append('circle')
      .attr('r', (d) => d.radius + 14)
      .attr('fill', 'none')
      .attr('stroke', (d) => getCategoryColor(d.category))
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 4')
      .attr('opacity', 0.8)
      .attr('class', 'animate-pulse');

    // Node outer border circle
    nodeGroups
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', '#09090b')
      .attr('stroke', (d) => getCategoryColor(d.category))
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 3.5 : 2))
      .attr('filter', (d) => (d.id === selectedNodeId ? 'url(#force-glow)' : null))
      .attr('opacity', (d) => {
        if (!selectedNodeId) return 1.0;
        if (d.id === selectedNodeId || connectedNeighborIds.has(d.id)) return 1.0;
        return 0.25;
      });

    // Node core inner circle
    nodeGroups
      .append('circle')
      .attr('r', (d) => d.radius - 6)
      .attr('fill', (d) => getCategoryColor(d.category))
      .attr('opacity', (d) => (d.id === selectedNodeId ? 0.35 : 0.15));

    // Node Acronym Label
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-2px')
      .attr('fill', '#ffffff')
      .attr('font-size', (d) => (d.radius >= 32 ? '11px' : '9px'))
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text((d) => d.acronym.split(' ')[0]);

    // Active Algorithm Tag Below Node
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '11px')
      .attr('fill', (d) => getCategoryColor(d.category))
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'semibold')
      .attr('pointer-events', 'none')
      .text((d) => {
        if (d.pqcConfig.dsaAlgorithm.includes('ML-DSA')) return 'ML-DSA';
        if (d.pqcConfig.kemAlgorithm.includes('ML-KEM')) return 'ML-KEM';
        return 'PQC-HYBRID';
      });

    // Node Tooltip Label (hover text)
    nodeGroups.append('title').text((d) => `${d.name}\n${d.pqcAlgorithm}\nHost: ${d.cipHost}`);

    // Simulation Tick Update
    let tickCount = 0;
    simulation.on('tick', () => {
      tickCount++;

      // Update link line coordinates
      linkPaths
        .attr('x1', (d) => (typeof d.source === 'object' ? (d.source.x || 0) : 0))
        .attr('y1', (d) => (typeof d.source === 'object' ? (d.source.y || 0) : 0))
        .attr('x2', (d) => (typeof d.target === 'object' ? (d.target.x || 0) : 0))
        .attr('y2', (d) => (typeof d.target === 'object' ? (d.target.y || 0) : 0));

      // Update animated particle positions along links
      if (linkParticles) {
        const progress = (tickCount % 60) / 60;
        linkParticles
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
      }

      // Update node group positions
      nodeGroups.attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Cleanup on unmount or re-render
    return () => {
      simulation.stop();
    };
  }, [
    flowFilter,
    categoryFilter,
    repulsionStrength,
    linkDistance,
    showParticles,
    selectedNodeId,
    selectedLinkId,
    connectedNeighborIds,
    isPhysicsRunning,
  ]);

  // Reheat or toggle simulation
  const handleTogglePhysics = () => {
    if (!simulationRef.current) return;
    if (isPhysicsRunning) {
      simulationRef.current.stop();
      setIsPhysicsRunning(false);
    } else {
      simulationRef.current.alpha(0.3).restart();
      setIsPhysicsRunning(true);
    }
  };

  const handleReheatSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.6).restart();
      setIsPhysicsRunning(true);
    }
  };

  // Reset zoom view
  const handleResetZoom = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(500).call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity);
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 overflow-y-auto bg-zinc-950/98 p-6' : 'p-5 space-y-5'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & INTERACTIVE TOOLBAR                                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span>D3.js Force-Directed Avionics Graph</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Interactive topological physics mapping F-22 PQC subsystems · Click nodes to inspect active <strong>NIST ML-KEM vs ML-DSA</strong> configurations
              </p>
            </div>
          </div>
        </div>

        {/* Global Regime & Flight Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Flight Mode Presets */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveFlightMode('Stealth')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFlightMode === 'Stealth'
                  ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3 h-3 text-emerald-400" />
              <span>Stealth (Level 5)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFlightMode('Combat')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFlightMode === 'Combat'
                  ? 'bg-amber-950 text-amber-300 font-bold border border-amber-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Combat (Level 3)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFlightMode('Training')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFlightMode === 'Training'
                  ? 'bg-sky-950 text-sky-300 font-bold border border-sky-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3 h-3 text-sky-400" />
              <span>Training (Range)</span>
            </button>
          </div>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer transition-colors"
            title="Reset Zoom & Pan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Reheat Simulation */}
          <button
            type="button"
            onClick={handleReheatSimulation}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-800 cursor-pointer transition-colors"
            title="Reheat Physics Spring Simulation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Pause / Resume Physics */}
          <button
            type="button"
            onClick={handleTogglePhysics}
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
      {/* 2. FILTER CONTROLS & PHYSICS TUNING BAR                                   */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Flow Type Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase px-2 font-semibold">Flow:</span>
          <button
            type="button"
            onClick={() => setFlowFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              flowFilter === 'all'
                ? 'bg-zinc-800 text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Relationships
          </button>
          <button
            type="button"
            onClick={() => setFlowFilter('kem')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              flowFilter === 'kem'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                : 'text-zinc-400 hover:text-cyan-300'
            }`}
          >
            <Key className="w-3 h-3 text-cyan-400" />
            <span>ML-KEM (Key Encapsulation)</span>
          </button>
          <button
            type="button"
            onClick={() => setFlowFilter('dsa')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              flowFilter === 'dsa'
                ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>ML-DSA (Digital Signatures)</span>
          </button>
          <button
            type="button"
            onClick={() => setFlowFilter('bus')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              flowFilter === 'bus'
                ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800'
                : 'text-zinc-400 hover:text-amber-300'
            }`}
          >
            <Layers className="w-3 h-3 text-amber-400" />
            <span>Physical Buses</span>
          </button>
        </div>

        {/* Physics Parameter Controls */}
        <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span>Repulsion:</span>
            <input
              type="range"
              min="-700"
              max="-150"
              value={repulsionStrength}
              onChange={(e) => setRepulsionStrength(Number(e.target.value))}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Link Spacing:</span>
            <input
              type="range"
              min="80"
              max="200"
              value={linkDistance}
              onChange={(e) => setLinkDistance(Number(e.target.value))}
              className="w-20 accent-cyan-500 cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowParticles(!showParticles)}
            className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
              showParticles
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            {showParticles ? '⚡ Pulses ON' : '○ Pulses OFF'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN D3 FORCE GRAPH VIEWPORT & INTERACTIVE INSPECTOR                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 7 cols: Interactive D3 Force Graph Canvas */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-850 bg-black relative overflow-hidden shadow-inner flex flex-col justify-between">
          {/* Subtle radar scanline overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(6,182,212,0)_50%,rgba(0,0,0,0.8)_50%)] bg-[length:100%_4px]" />

          {/* Canvas Navigation Cue Banner */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 font-mono text-[10px] text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800 backdrop-blur-sm">
            <Move className="w-3 h-3 text-cyan-400" />
            <span>Drag nodes to spring-position · Scroll to zoom · Click to inspect</span>
          </div>

          <div className="absolute top-3 right-3 z-10 flex items-center gap-2 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
              {activePreset.securityLevel}
            </span>
          </div>

          {/* D3 SVG Canvas */}
          <div className="w-full h-[580px] cursor-grab active:cursor-grabbing">
            <svg
              ref={svgRef}
              viewBox="0 0 940 620"
              className="w-full h-full select-none"
              preserveAspectRatio="xMidYMid meet"
            />
          </div>

          {/* Bottom Graph Legend Strip */}
          <div className="border-t border-zinc-850 bg-zinc-950/90 p-3 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                <span>Core CIP 1/2</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                <span>Sensors & EW</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>Flight Controls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                <span>Weapons Bay</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
                <span>IFDL Mesh / CCA</span>
              </div>
            </div>

            <div className="text-[10px] text-zinc-500">
              Active Selection: <strong className="text-white">{selectedNode.acronym}</strong>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Active Subsystem NIST Algorithm Inspector */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl space-y-4">
          {/* Subsystem Header */}
          <div className="border-b border-zinc-800 pb-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider font-semibold"
                  style={{ color: getCategoryColor(selectedNode.category) }}
                >
                  {selectedNode.category} · {selectedNode.cipHost}
                </span>
                <h4 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <span>{selectedNode.name}</span>
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
                {selectedNode.criticality}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {selectedNode.description}
            </p>

            {/* Sub-view Switcher for Inspector */}
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-mono pt-1">
              <button
                type="button"
                onClick={() => setInspectorView('comparison')}
                className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-colors cursor-pointer ${
                  inspectorView === 'comparison'
                    ? 'bg-zinc-800 text-white font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ML-KEM vs ML-DSA
              </button>
              <button
                type="button"
                onClick={() => setInspectorView('benchmark')}
                className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-colors cursor-pointer ${
                  inspectorView === 'benchmark'
                    ? 'bg-zinc-800 text-white font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Live Benchmark
              </button>
              <button
                type="button"
                onClick={() => setInspectorView('details')}
                className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-colors cursor-pointer ${
                  inspectorView === 'details'
                    ? 'bg-zinc-800 text-white font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Hardware Specs
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* VIEW A: NIST ML-KEM VS ML-DSA SIDE-BY-SIDE MATRIX                     */}
          {/* ===================================================================== */}
          {inspectorView === 'comparison' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="font-bold text-zinc-200 uppercase">Active NIST PQC Standards</span>
                <span className="text-emerald-400 font-semibold">{activePreset.profileName.split(' ')[0]}</span>
              </div>

              {/* Side-by-Side Dual Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. ML-KEM Card (Key Encapsulation) */}
                <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-cyan-950/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs font-bold uppercase">
                      <Key className="w-3.5 h-3.5" />
                      <span>FIPS 203 (ML-KEM)</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 border border-cyan-700 text-cyan-300">
                      Confidentiality
                    </span>
                  </div>

                  <div className="text-xs font-mono font-bold text-white">
                    {selectedNode.pqcConfig.kemAlgorithm.split(' (')[0]}
                  </div>

                  <div className="text-[11px] font-mono text-zinc-300 space-y-1 pt-1 border-t border-cyan-900/60">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Security Category:</span>
                      <span className="text-cyan-300 font-semibold">{selectedNode.pqcConfig.kemCategory.split(' (')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Public Key:</span>
                      <span className="text-white">{selectedNode.pqcConfig.kemKeySizes.publicKeyBytes} Bytes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Ciphertext:</span>
                      <span className="text-white">{selectedNode.pqcConfig.kemKeySizes.ciphertextBytes} Bytes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Shared Secret:</span>
                      <span className="text-cyan-300 font-semibold">{selectedNode.pqcConfig.kemKeySizes.sharedSecretBytes} Bytes (256-bit)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Execution Latency:</span>
                      <span className="text-emerald-400 font-bold">{selectedNode.pqcConfig.kemLatencyMs * 1000} µs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Classical Combiner:</span>
                      <span className="text-zinc-300 truncate max-w-[110px]">{selectedNode.pqcConfig.classicalAlgorithm.split(' ')[0]}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-950 border border-cyan-900/40 text-[10px] text-zinc-400 font-mono">
                    <strong>Avionics Purpose:</strong> Establishes ephemeral symmetric keys across optical backplanes without storing long-term master keys in volatile memory.
                  </div>
                </div>

                {/* 2. ML-DSA Card (Digital Signatures) */}
                <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold uppercase">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>FIPS 204 (ML-DSA)</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 border border-emerald-700 text-emerald-300">
                      Authentication
                    </span>
                  </div>

                  <div className="text-xs font-mono font-bold text-white">
                    {selectedNode.pqcConfig.dsaAlgorithm.split(' (')[0]}
                  </div>

                  <div className="text-[11px] font-mono text-zinc-300 space-y-1 pt-1 border-t border-emerald-900/60">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Security Category:</span>
                      <span className="text-emerald-300 font-semibold">{selectedNode.pqcConfig.dsaCategory.split(' (')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Signature Length:</span>
                      <span className="text-white font-bold">{selectedNode.pqcConfig.dsaKeySizes.signatureBytes} Bytes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Public Key:</span>
                      <span className="text-white">{selectedNode.pqcConfig.dsaKeySizes.publicKeyBytes} Bytes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Verification Latency:</span>
                      <span className="text-emerald-400 font-bold">{selectedNode.pqcConfig.dsaLatencyMs * 1000} µs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Throughput:</span>
                      <span className="text-cyan-300 truncate max-w-[110px]">{selectedNode.pqcConfig.messageThroughput.split(' /')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Classical Fallback:</span>
                      <span className="text-zinc-300">Ed25519 / P-256</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-950 border border-emerald-900/40 text-[10px] text-zinc-400 font-mono">
                    <strong>Avionics Purpose:</strong> Authenticates telemetry frames, flight control pitch limits, and missile fire interlocks to reject adversarial EW spoofing.
                  </div>
                </div>
              </div>

              {/* Hybrid Pairing Explainer Strip */}
              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/70 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-zinc-300 font-bold text-[11px]">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>NIST SP 800-56C Hybrid KDF Combiner</span>
                  </span>
                  <span className="text-emerald-400">{selectedNode.pqcConfig.quantumResistanceBits}-Bit Quantum Strength</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Both algorithms execute concurrently on Raytheon SEM-E vector cryptoprocessors. Session keys are combined with classical curves so legacy DO-178C avionics certifiers maintain baseline non-interference guarantees while gaining quantum immunity.
                </p>
              </div>

              {/* Connected Subsystems Flow List */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex justify-between">
                  <span>Incident Interconnect Links ({connectedLinks.length})</span>
                  <span className="text-zinc-500">Click to inspect handshake</span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {connectedLinks.map((link) => {
                    const isSource = link.source === selectedNode.id;
                    const counterpartId = isSource ? link.target : link.source;
                    const counterpart = AVIONICS_NODES.find((n) => n.id === counterpartId);
                    return (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => {
                          setSelectedLinkId(link.id);
                          setInspectorView('links');
                        }}
                        className="w-full p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 flex items-center justify-between text-left transition-colors cursor-pointer text-xs font-mono group"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                link.type === 'kem'
                                  ? '#06b6d4'
                                  : link.type === 'dsa'
                                  ? '#10b981'
                                  : link.type === 'hybrid'
                                  ? '#a855f7'
                                  : '#f59e0b',
                            }}
                          />
                          <span className="text-white group-hover:text-cyan-300 transition-colors">
                            {counterpart?.acronym || counterpartId}
                          </span>
                          <span className="text-[10px] text-zinc-500">({link.protocol})</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          {link.latencyMs} ms
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW B: LIVE MICROSECOND CRYPTOGRAPHIC BENCHMARK                      */}
          {/* ===================================================================== */}
          {inspectorView === 'benchmark' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Cryptographic Execution Benchmark</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">50 Hz Cycle Validated</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Triggers hardware-accelerated NIST FIPS 203 / FIPS 204 crypto operations on <strong>{selectedNode.pqcConfig.hsmModule}</strong> to verify microsecond envelope compliance against flight control budgets.
                </p>

                <button
                  type="button"
                  onClick={handleRunBenchmark}
                  disabled={isBenchmarking}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-950/40"
                >
                  {isBenchmarking ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Vector Lattice Operations...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-white" />
                      <span>Run Live Microsecond Benchmark</span>
                    </>
                  )}
                </button>
              </div>

              {benchmarkResult && benchmarkResult.nodeId === selectedNode.id ? (
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-white font-bold text-xs flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Benchmark Successful ({benchmarkResult.timestamp})</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Entropy: <strong>{benchmarkResult.quantumEntropyBits} bits</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-black border border-zinc-850">
                      <div className="text-zinc-500 text-[10px]">FIPS 203 Encap</div>
                      <div className="text-sm font-bold text-cyan-300">{benchmarkResult.encapTimeUs} µs</div>
                    </div>
                    <div className="p-2 rounded-lg bg-black border border-zinc-850">
                      <div className="text-zinc-500 text-[10px]">FIPS 203 Decap</div>
                      <div className="text-sm font-bold text-cyan-300">{benchmarkResult.decapTimeUs} µs</div>
                    </div>
                    <div className="p-2 rounded-lg bg-black border border-zinc-850">
                      <div className="text-zinc-500 text-[10px]">FIPS 204 Sign</div>
                      <div className="text-sm font-bold text-emerald-300">{benchmarkResult.signTimeUs} µs</div>
                    </div>
                    <div className="p-2 rounded-lg bg-black border border-zinc-850">
                      <div className="text-zinc-500 text-[10px]">FIPS 204 Verify</div>
                      <div className="text-sm font-bold text-emerald-300">{benchmarkResult.verifyTimeUs} µs</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex justify-between text-zinc-400">
                      <span>Ephemeral Ciphertext Digest (16-Byte Sample):</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(benchmarkResult.ciphertextHex, 'ct')}
                        className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      >
                        {copiedKey === 'ct' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <code className="block p-2 rounded bg-black border border-zinc-850 text-cyan-300 break-all font-mono">
                      {benchmarkResult.ciphertextHex}
                    </code>

                    <div className="flex justify-between text-zinc-400 pt-1">
                      <span>ML-DSA Signature Digest (16-Byte Sample):</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(benchmarkResult.signatureHex, 'sig')}
                        className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        {copiedKey === 'sig' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <code className="block p-2 rounded bg-black border border-zinc-850 text-emerald-300 break-all font-mono">
                      {benchmarkResult.signatureHex}
                    </code>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-500 text-xs">
                  Click the button above to run real-time hardware cryptographic performance tests on this subsystem.
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW C: HARDWARE & ENCLAVE ARCHITECTURE SPECS                         */}
          {/* ===================================================================== */}
          {inspectorView === 'details' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-2">
                <div className="text-white font-bold text-xs uppercase text-zinc-300">
                  Hardware Specifications & Enclave
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Hardware Processor:</span>
                    <span className="text-white font-semibold truncate max-w-[200px]">{selectedNode.hardwareSpecs.split(' · ')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Bus Interface:</span>
                    <span className="text-cyan-300">{selectedNode.busInterface}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">DO-178C Budget:</span>
                    <span className="text-emerald-300">{selectedNode.pqcConfig.do178cCycleBudgetUs / 1000} ms (50 Hz frame)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Software Base:</span>
                    <span className="text-zinc-300">{selectedNode.sloc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Anti-Tamper:</span>
                    <span className="text-amber-300 truncate max-w-[200px]">{selectedNode.pqcConfig.antiTamperBoundary}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-1.5">
                <div className="text-zinc-400 font-bold text-[11px]">CNSA 2.0 Mandate Compliance</div>
                <div className="text-[10px] text-zinc-300 leading-relaxed">
                  {selectedNode.pqcConfig.cnsa2ComplianceStatus}
                </div>
                <div className="text-[10px] text-zinc-500 flex justify-between pt-1 border-t border-zinc-800">
                  <span>Rekey Interval:</span>
                  <span className="text-white font-bold">{selectedNode.pqcConfig.rekeyCycleSeconds} seconds</span>
                </div>
              </div>

              {onOpenCodeView && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenCodeView(getMatchedSubsystem(selectedNode.id));
                  }}
                  className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Inspect Ada 95 / C++ Kernel Source</span>
                </button>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW D: INTERCONNECT LINK HANDSHAKE SEQUENCE                          */}
          {/* ===================================================================== */}
          {inspectorView === 'links' && selectedLink && (
            <div className="space-y-3 font-mono text-xs animate-in fade-in duration-200">
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-xs">{selectedLink.label}</div>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {selectedLink.latencyMs} ms
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">{selectedLink.description}</div>
                <div className="flex justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                  <span>Protocol: <strong>{selectedLink.protocol}</strong></span>
                  <span>Bandwidth: <strong>{selectedLink.bandwidth}</strong></span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">
                  Cryptographic Protocol Handshake Sequence
                </div>
                <div className="space-y-2">
                  {selectedLink.handshakeSteps.map((step) => (
                    <div
                      key={step.step}
                      className="p-2.5 rounded-lg bg-black border border-zinc-850 space-y-1 text-[11px]"
                    >
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="font-bold text-white">
                          Step {step.step}: {step.title}
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono">{step.size}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">{step.detail}</p>
                      <div className="text-[9px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <span>Primitive:</span>
                        <code>{step.cryptoPrimitive}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

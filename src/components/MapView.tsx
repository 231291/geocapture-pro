import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Locate, 
  Search, 
  Ruler, 
  User as UserIcon, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Plus, 
  Filter,
  X,
  Compass,
  MapPin
} from 'lucide-react';
import { GPSPoint, FieldAgentLocation, ProjectTemplate, User } from '../types';
import { getDistanceMeters, formatDistance, toDMS, toUTMApprox } from '../utils/geo';

interface MapViewProps {
  points: GPSPoint[];
  fieldAgents: FieldAgentLocation[];
  currentUser: User;
  currentLocation: { lat: number; lng: number; accuracy: number; altitude?: number } | null;
  templates: ProjectTemplate[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onPointSelect: (point: GPSPoint) => void;
  onQuickCaptureAtLocation: (lat: number, lng: number) => void;
}

const TILE_LAYERS = {
  esri_satellite: {
    name: 'Satélite (Esri World)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  osm_streets: {
    name: 'Callejero (OpenStreetMap)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  carto_dark: {
    name: 'Oscuro (CartoDB Dark)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  open_topo: {
    name: 'Topográfico (OpenTopoMap)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  }
};

export const MapView: React.FC<MapViewProps> = ({
  points,
  fieldAgents,
  currentUser,
  currentLocation,
  templates,
  selectedProjectId,
  onSelectProject,
  onPointSelect,
  onQuickCaptureAtLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const agentsLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const rulerLineRef = useRef<L.Polyline | null>(null);

  // Local state
  const [activeBaseMap, setActiveBaseMap] = useState<keyof typeof TILE_LAYERS>('esri_satellite');
  const [showBaseMapMenu, setShowBaseMapMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPointModal, setSelectedPointModal] = useState<GPSPoint | null>(null);
  const [showAgentsOnMap, setShowAgentsOnMap] = useState(true);
  const [showAccuracyRadius, setShowAccuracyRadius] = useState(true);
  const [rulerPoints, setRulerPoints] = useState<L.LatLng[]>([]);
  const [isRulerActive, setIsRulerActive] = useState(false);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  // Default center
  const initialCenter = currentLocation 
    ? [currentLocation.lat, currentLocation.lng] as [number, number]
    : [18.4861, -69.9312] as [number, number]; // Default Santo Domingo / Field region

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 16,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Base tile layer
      const layerConfig = TILE_LAYERS[activeBaseMap];
      const baseTileLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        maxZoom: 19
      }).addTo(map);

      // Store references
      mapRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      agentsLayerRef.current = L.layerGroup().addTo(map);

      // Handle map clicks
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (isRulerActive) {
          setRulerPoints(prev => {
            const next = [...prev, e.latlng];
            if (next.length >= 2) {
              const dist = getDistanceMeters(
                next[0].lat, next[0].lng,
                next[1].lat, next[1].lng
              );
              setMeasuredDistance(dist);
            }
            return next.slice(-2); // keep last 2 points
          });
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update base map layer when changed
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    const layerConfig = TILE_LAYERS[activeBaseMap];
    L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: 19
    }).addTo(mapRef.current);
  }, [activeBaseMap]);

  // Update User Location Marker & Accuracy Circle
  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;

    const latlng = L.latLng(currentLocation.lat, currentLocation.lng);

    // Update or create user position marker
    if (!userMarkerRef.current) {
      const userIcon = L.divIcon({
        className: 'user-pulse-marker',
        html: `
          <div class="user-pulse-ring"></div>
          <div class="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-slate-950"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      userMarkerRef.current = L.marker(latlng, { icon: userIcon, zIndexOffset: 1000 }).addTo(mapRef.current);
    } else {
      userMarkerRef.current.setLatLng(latlng);
    }

    // Update or create accuracy circle
    if (showAccuracyRadius) {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = L.circle(latlng, {
          radius: currentLocation.accuracy,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(mapRef.current);
      } else {
        accuracyCircleRef.current.setLatLng(latlng);
        accuracyCircleRef.current.setRadius(currentLocation.accuracy);
      }
    } else if (accuracyCircleRef.current) {
      accuracyCircleRef.current.remove();
      accuracyCircleRef.current = null;
    }
  }, [currentLocation, showAccuracyRadius]);

  // Render Captured Points Markers
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filteredPoints = points.filter((pt) => {
      const matchesProject = !selectedProjectId || pt.projectId === selectedProjectId;
      const matchesSearch = !searchQuery || 
        pt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pt.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pt.userName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProject && matchesSearch;
    });

    filteredPoints.forEach((pt) => {
      // Color lookup from project
      const proj = templates.find((t) => t.id === pt.projectId);
      const markerColor = proj?.color || (pt.syncStatus === 'synced' ? '#10b981' : '#f59e0b');

      const isPending = pt.syncStatus === 'pending';

      const pointIcon = L.divIcon({
        className: 'custom-gps-point-marker',
        html: `
          <div class="relative group cursor-pointer transition-transform hover:scale-110">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 ${isPending ? 'border-amber-400 ring-2 ring-amber-500/40' : 'border-white'}" style="background-color: ${markerColor}">
              ${pt.photos.length > 0 ? '📷' : '📍'}
            </div>
            ${isPending ? '<span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border border-slate-900 animate-pulse"></span>' : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: pointIcon });

      marker.on('click', () => {
        setSelectedPointModal(pt);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [points, selectedProjectId, searchQuery, templates]);

  // Render Field Agents Markers
  useEffect(() => {
    if (!mapRef.current || !agentsLayerRef.current) return;

    agentsLayerRef.current.clearLayers();

    if (!showAgentsOnMap) return;

    fieldAgents.forEach((agent) => {
      const agentIcon = L.divIcon({
        className: 'custom-agent-marker',
        html: `
          <div class="relative group flex items-center justify-center">
            <img src="${agent.avatar}" class="w-8 h-8 rounded-full border-2 border-cyan-400 object-cover shadow-lg" />
            <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${agent.status === 'active' || agent.status === 'moving' ? 'bg-emerald-500' : 'bg-slate-500'} border-2 border-slate-900"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([agent.lat, agent.lng], { icon: agentIcon });
      
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div class="p-1 text-slate-100">
          <div class="flex items-center gap-2 mb-1">
            <img src="${agent.avatar}" class="w-7 h-7 rounded-full object-cover" />
            <div>
              <p class="font-bold text-sm leading-tight">${agent.name}</p>
              <p class="text-[11px] text-cyan-400 font-medium">${agent.role}</p>
            </div>
          </div>
          <p class="text-xs text-slate-300">Proyecto: <b>${agent.assignedProject || 'N/A'}</b></p>
          <p class="text-[10px] text-slate-400 font-mono mt-1">Batería: ${agent.batteryLevel}% | ${agent.lastUpdated}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      agentsLayerRef.current?.addLayer(marker);
    });
  }, [fieldAgents, showAgentsOnMap]);

  // Draw Ruler Polyline
  useEffect(() => {
    if (!mapRef.current) return;

    if (rulerLineRef.current) {
      rulerLineRef.current.remove();
      rulerLineRef.current = null;
    }

    if (rulerPoints.length === 2) {
      rulerLineRef.current = L.polyline(rulerPoints, {
        color: '#f59e0b',
        weight: 3,
        dashArray: '6, 6'
      }).addTo(mapRef.current);
    }
  }, [rulerPoints]);

  const handleCenterUser = () => {
    if (!mapRef.current || !currentLocation) return;
    mapRef.current.flyTo([currentLocation.lat, currentLocation.lng], 17, { duration: 1 });
  };

  return (
    <div className="relative w-full h-[calc(100vh-115px)] bg-[#0D0D0D] overflow-hidden">
      
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 max-w-xl mx-auto flex flex-col gap-2">
        
        {/* Search & Project Selector Row */}
        <div className="flex items-center gap-2">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input
              type="text"
              placeholder="Search points or field team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#1A1A1A] border border-[#333333] rounded-md text-xs text-[#E5E5E5] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] shadow-lg"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Project Filter Dropdown */}
          <select
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            className="px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-md text-xs font-medium text-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] shadow-lg cursor-pointer max-w-[160px] truncate"
          >
            <option value="">All Projects</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

        </div>

        {/* Ruler Measurement Banner if active */}
        {isRulerActive && (
          <div className="bg-[#1A1A1A] border border-[#F59E0B] rounded-md p-2.5 text-xs text-[#E5E5E5] flex items-center justify-between shadow-xl animate-fade-in">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#F59E0B] animate-bounce" />
              <span>
                {rulerPoints.length === 0 && 'Click on the map to start measurement'}
                {rulerPoints.length === 1 && 'Click a second point to measure distance'}
                {rulerPoints.length === 2 && measuredDistance && (
                  <strong className="text-[#3B82F6] font-mono text-sm">
                    Distance: {formatDistance(measuredDistance)}
                  </strong>
                )}
              </span>
            </div>
            <button
              onClick={() => {
                setIsRulerActive(false);
                setRulerPoints([]);
                setMeasuredDistance(null);
              }}
              className="p-1 hover:bg-[#262626] rounded text-[#888888]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Floating Action Buttons Side Panel (Right) */}
      <div className="absolute top-20 right-3 z-20 flex flex-col gap-2">
        
        {/* Base Map Selector Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowBaseMapMenu(!showBaseMapMenu)}
            className={`p-2.5 rounded-md border shadow-xl backdrop-blur-md transition-all cursor-pointer ${
              showBaseMapMenu 
                ? 'bg-[#3B82F6] border-[#3B82F6] text-white font-bold' 
                : 'bg-[#1A1A1A] border-[#333333] text-[#E5E5E5] hover:bg-[#262626]'
            }`}
            title="Change map layer"
          >
            <Layers className="w-5 h-5" />
          </button>

          {/* Base Map Selector Menu */}
          {showBaseMapMenu && (
            <div className="absolute right-12 top-0 w-52 bg-[#1A1A1A] border border-[#333333] rounded-md p-2 shadow-2xl space-y-1 animate-scale-in">
              <p className="text-[11px] uppercase font-semibold text-[#888888] px-2 py-1 tracking-wider">
                Base Map Layers
              </p>
              {Object.entries(TILE_LAYERS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveBaseMap(key as keyof typeof TILE_LAYERS);
                    setShowBaseMapMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    activeBaseMap === key
                      ? 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/40 font-semibold'
                      : 'text-[#E5E5E5] hover:bg-[#262626]'
                  }`}
                >
                  <span>{config.name}</span>
                  {activeBaseMap === key && <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center on My Location Button */}
        <button
          onClick={handleCenterUser}
          className="p-2.5 rounded-md bg-[#1A1A1A] border border-[#333333] text-[#E5E5E5] hover:bg-[#262626] hover:text-[#3B82F6] shadow-xl transition-all cursor-pointer"
          title="Center on my GPS location"
        >
          <Locate className="w-5 h-5 text-[#3B82F6]" />
        </button>

        {/* Toggle Field Agents on Map */}
        <button
          onClick={() => setShowAgentsOnMap(!showAgentsOnMap)}
          className={`p-2.5 rounded-md border shadow-xl transition-all cursor-pointer ${
            showAgentsOnMap 
              ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6]' 
              : 'bg-[#1A1A1A] border-[#333333] text-[#888888] hover:bg-[#262626]'
          }`}
          title={showAgentsOnMap ? 'Hide field personnel' : 'Show field personnel'}
        >
          <UserIcon className="w-5 h-5" />
        </button>

        {/* Measure Ruler Tool */}
        <button
          onClick={() => {
            setIsRulerActive(!isRulerActive);
            setRulerPoints([]);
            setMeasuredDistance(null);
          }}
          className={`p-2.5 rounded-md border shadow-xl transition-all cursor-pointer ${
            isRulerActive 
              ? 'bg-[#F59E0B] border-[#F59E0B] text-[#0D0D0D] font-bold' 
              : 'bg-[#1A1A1A] border-[#333333] text-[#E5E5E5] hover:bg-[#262626]'
          }`}
          title="Distance measurement tool"
        >
          <Ruler className="w-5 h-5" />
        </button>

      </div>

      {/* Bottom Floating Coordinates Display Bar */}
      {currentLocation && (
        <div className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-auto z-20 bg-[#1A1A1A] border border-[#333333] rounded-md p-2.5 shadow-2xl text-xs text-[#E5E5E5] flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#3B82F6] animate-spin-slow" />
            <div className="font-mono text-[11px]">
              <span className="text-white font-semibold">
                {currentLocation.lat.toFixed(6)}°, {currentLocation.lng.toFixed(6)}°
              </span>
              <span className="text-[#888888] block sm:inline sm:ml-2">
                UTM: {toUTMApprox(currentLocation.lat, currentLocation.lng)}
              </span>
            </div>
          </div>
          <button
            onClick={() => onQuickCaptureAtLocation(currentLocation.lat, currentLocation.lng)}
            className="px-3 py-1.5 rounded-md bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Capture Here</span>
          </button>
        </div>
      )}

      {/* Point Details Modal when point marker is clicked */}
      {selectedPointModal && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fade-in">
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#333333] pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0D0D0D] text-[#3B82F6] border border-[#3B82F6]/30">
                  {selectedPointModal.projectName}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedPointModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPointModal(null)}
                className="p-1.5 text-[#888888] hover:text-white rounded-md bg-[#0D0D0D] hover:bg-[#262626]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Metadata Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#0D0D0D] p-3 rounded-md border border-[#333333]">
              <div>
                <p className="text-[#888888] text-[10px] uppercase font-semibold tracking-wider">GPS Coordinates</p>
                <p className="text-[#E5E5E5] font-semibold">{selectedPointModal.lat.toFixed(6)}, {selectedPointModal.lng.toFixed(6)}</p>
                <p className="text-[#888888] text-[10px] mt-0.5">{toDMS(selectedPointModal.lat, true)} {toDMS(selectedPointModal.lng, false)}</p>
              </div>
              <div>
                <p className="text-[#888888] text-[10px] uppercase font-semibold tracking-wider">Accuracy / Date</p>
                <p className="text-[#10B981] font-semibold">±{selectedPointModal.accuracy} m</p>
                <p className="text-[#888888] text-[10px] mt-0.5">{new Date(selectedPointModal.timestamp).toLocaleString()}</p>
              </div>
            </div>

            {/* Photos attached */}
            {selectedPointModal.photos.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-1.5">
                  Field Photos
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedPointModal.photos.map((photo, i) => (
                    <img key={i} src={photo} alt="Field photo" className="w-full h-36 object-cover rounded-md border border-[#333333] shadow" />
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Custom Fields Data */}
            <div>
              <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">Survey Attributes:</p>
              <div className="space-y-1.5">
                {Object.entries(selectedPointModal.fieldsData).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-1.5 px-3 bg-[#0D0D0D] rounded-md text-xs border border-[#333333]">
                    <span className="text-[#888888] capitalize">{key.replace('f_', '').replace(/_/g, ' ')}:</span>
                    <span className="text-[#E5E5E5] font-medium">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  onPointSelect(selectedPointModal);
                  setSelectedPointModal(null);
                }}
                className="flex-1 py-2.5 rounded-md bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Complete Details</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

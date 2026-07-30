import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Download, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  FileSpreadsheet,
  Globe,
  Camera,
  ChevronRight,
  X
} from 'lucide-react';
import { GPSPoint, ProjectTemplate } from '../types';
import { exportToGeoJSON, exportToKML, exportToCSV, downloadFile, toDMS } from '../utils/geo';

interface PointListViewProps {
  points: GPSPoint[];
  templates: ProjectTemplate[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onViewOnMap: (point: GPSPoint) => void;
  onDeletePoint: (id: string) => void;
  onSyncPoint: (id: string) => void;
  onSyncAll: () => void;
  onEditPoint?: (point: GPSPoint) => void;
}

export const PointListView: React.FC<PointListViewProps> = ({
  points,
  templates,
  selectedProjectId,
  onSelectProject,
  onViewOnMap,
  onDeletePoint,
  onSyncPoint,
  onSyncAll,
  onEditPoint
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'synced' | 'pending'>('all');
  const [activeExportMenu, setActiveExportMenu] = useState(false);
  const [selectedPointForDetail, setSelectedPointForDetail] = useState<GPSPoint | null>(null);

  // Filter logic
  const filteredPoints = points.filter((pt) => {
    const matchesSearch =
      !searchQuery ||
      pt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProject = !selectedProjectId || pt.projectId === selectedProjectId;
    const matchesStatus = statusFilter === 'all' || pt.syncStatus === statusFilter;

    return matchesSearch && matchesProject && matchesStatus;
  });

  const pendingCount = points.filter((p) => p.syncStatus === 'pending').length;

  // Handlers for exporting GIS files
  const handleExportGeoJSON = () => {
    const geojson = exportToGeoJSON(filteredPoints);
    downloadFile(geojson, `geocapture_puntos_${Date.now()}.geojson`, 'application/geo+json');
    setActiveExportMenu(false);
  };

  const handleExportKML = () => {
    const kml = exportToKML(filteredPoints);
    downloadFile(kml, `geocapture_puntos_${Date.now()}.kml`, 'application/vnd.google-earth.kml+xml');
    setActiveExportMenu(false);
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(filteredPoints);
    downloadFile(csv, `geocapture_puntos_${Date.now()}.csv`, 'text/csv');
    setActiveExportMenu(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-4 animate-fade-in">
      
      {/* Header & Export Toolbar */}
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif italic text-lg text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#3B82F6]" />
              <span>Captured Points ({filteredPoints.length})</span>
            </h2>
            <p className="text-xs text-[#888888]">
              Field records management & GIS data export
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            
            {/* Sync All Button */}
            {pendingCount > 0 && (
              <button
                onClick={onSyncAll}
                className="px-3 py-1.5 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B] rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Sync {pendingCount} Pending</span>
              </button>
            )}

            {/* Export Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveExportMenu(!activeExportMenu)}
                className="px-3 py-1.5 bg-[#0D0D0D] hover:bg-[#262626] text-[#E5E5E5] border border-[#333333] rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#3B82F6]" />
                <span>Export GIS</span>
              </button>

              {activeExportMenu && (
                <div className="absolute right-0 top-10 w-48 bg-[#1A1A1A] border border-[#333333] rounded-md p-2 shadow-2xl z-30 space-y-1 animate-scale-in">
                  <button
                    onClick={handleExportGeoJSON}
                    className="w-full text-left px-3 py-2 hover:bg-[#262626] rounded-md text-xs font-medium text-[#E5E5E5] flex items-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-[#3B82F6]" />
                    <span>GeoJSON (.geojson)</span>
                  </button>
                  <button
                    onClick={handleExportKML}
                    className="w-full text-left px-3 py-2 hover:bg-[#262626] rounded-md text-xs font-medium text-[#E5E5E5] flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-[#10B981]" />
                    <span>Google Earth (.kml)</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-3 py-2 hover:bg-[#262626] rounded-md text-xs font-medium text-[#E5E5E5] flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#F59E0B]" />
                    <span>Excel / CSV (.csv)</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input
              type="text"
              placeholder="Search title, user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-white placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>

          {/* Project Dropdown */}
          <select
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            className="px-3 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] cursor-pointer"
          >
            <option value="">All Projects</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Sync Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] cursor-pointer"
          >
            <option value="all">All Sync Statuses</option>
            <option value="pending">Pending Sync ({pendingCount})</option>
            <option value="synced">Synced to Cloud</option>
          </select>

        </div>
      </div>

      {/* Points List */}
      {filteredPoints.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-10 text-center space-y-3">
          <MapPin className="w-12 h-12 text-[#888888] mx-auto" />
          <p className="text-sm font-semibold text-[#E5E5E5]">No captured points found</p>
          <p className="text-xs text-[#888888]">Adjust filters or capture a new point in the field.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPoints.map((pt) => {
            const isPending = pt.syncStatus === 'pending';
            const proj = templates.find((t) => t.id === pt.projectId);

            return (
              <div
                key={pt.id}
                className="bg-[#1A1A1A] border border-[#333333] hover:border-[#3B82F6]/50 rounded-lg p-4 shadow-lg transition-all space-y-3"
              >
                {/* Top info line */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                        style={{ backgroundColor: proj?.color || '#3B82F6' }}
                      >
                        {pt.projectName}
                      </span>

                      {isPending ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-pulse" />
                          <span>Pending Sync</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Synced</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">{pt.title}</h3>
                  </div>

                  {/* Actions menu */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewOnMap(pt)}
                      className="p-1.5 rounded-md bg-[#0D0D0D] hover:bg-[#262626] text-[#3B82F6] border border-[#333333] transition-colors cursor-pointer"
                      title="View on Map"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {isPending && (
                      <button
                        onClick={() => onSyncPoint(pt.id)}
                        className="p-1.5 rounded-md bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 transition-colors cursor-pointer"
                        title="Sync now"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onDeletePoint(pt.id)}
                      className="p-1.5 rounded-md bg-[#0D0D0D] hover:bg-rose-950/60 text-[#888888] hover:text-rose-400 border border-[#333333] transition-colors cursor-pointer"
                      title="Delete point"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* GPS Coordinates Bar */}
                <div className="p-2.5 bg-[#0D0D0D] rounded-md border border-[#333333] text-xs font-mono grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[#888888] text-[10px] block uppercase font-semibold tracking-wider">Coordinates:</span>
                    <span className="text-[#E5E5E5] font-semibold">{pt.lat.toFixed(6)}, {pt.lng.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-[#888888] text-[10px] block uppercase font-semibold tracking-wider">Accuracy:</span>
                    <span className="text-[#10B981] font-semibold">±{pt.accuracy}m</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[#888888] text-[10px] block uppercase font-semibold tracking-wider">Captured by:</span>
                    <span className="text-[#E5E5E5] font-sans font-medium">{pt.userName} ({new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                  </div>
                </div>

                {/* Custom Fields Summary */}
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {Object.entries(pt.fieldsData).slice(0, 4).map(([k, v]) => (
                    <span key={k} className="px-2.5 py-1 bg-[#0D0D0D] rounded-md text-[11px] text-[#E5E5E5] border border-[#333333]">
                      <strong className="text-[#888888] font-medium capitalize">{k.replace('f_', '')}:</strong> {String(v)}
                    </span>
                  ))}
                  {Object.keys(pt.fieldsData).length > 4 && (
                    <span className="px-2 py-1 bg-[#0D0D0D] rounded-md text-[10px] text-[#888888]">
                      +{Object.keys(pt.fieldsData).length - 4} more...
                    </span>
                  )}
                </div>

                {/* Photos indicator */}
                {pt.photos.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <Camera className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-xs text-[#888888]">{pt.photos.length} photos attached</span>
                    <div className="flex gap-1.5 ml-auto">
                      {pt.photos.map((photo, i) => (
                        <img key={i} src={photo} alt="Thumbnail" className="w-8 h-8 rounded-md object-cover border border-[#333333]" />
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

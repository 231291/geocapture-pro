import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Camera, 
  Save, 
  RotateCcw, 
  MapPin, 
  Check, 
  Star, 
  Sparkles,
  Layers,
  Activity,
  AlertCircle,
  Clock,
  Compass,
  Sliders,
  Trash2,
  FileText
} from 'lucide-react';
import { GPSPoint, ProjectTemplate, User } from '../types';
import { calculateAveragedPosition, toDMS, toUTMApprox } from '../utils/geo';

interface PointCaptureFormProps {
  user: User;
  templates: ProjectTemplate[];
  currentLocation: { lat: number; lng: number; accuracy: number; altitude?: number } | null;
  presetLocation?: { lat: number; lng: number } | null;
  onSavePoint: (point: GPSPoint) => void;
  onCancel?: () => void;
}

export const PointCaptureForm: React.FC<PointCaptureFormProps> = ({
  user,
  templates,
  currentLocation,
  presetLocation,
  onSavePoint,
  onCancel
}) => {
  // Active Project Template
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    templates[0]?.id || 'proj_elec'
  );

  const activeTemplate = templates.find((t) => t.id === selectedProjectId) || templates[0];

  // Coordinates
  const [lat, setLat] = useState<number>(presetLocation?.lat || currentLocation?.lat || 18.4861);
  const [lng, setLng] = useState<number>(presetLocation?.lng || currentLocation?.lng || -69.9312);
  const [altitude, setAltitude] = useState<number>(currentLocation?.altitude || 40);
  const [accuracy, setAccuracy] = useState<number>(currentLocation?.accuracy || 3.5);
  const [manualOverride, setManualOverride] = useState<boolean>(false);

  // Sampling / Averaging Mode
  const [isSampling, setIsSampling] = useState<boolean>(false);
  const [sampleProgress, setSampleProgress] = useState<number>(0);
  const [sampleCount, setSampleCount] = useState<number>(0);

  // Form Fields State
  const [title, setTitle] = useState<string>('');
  const [fieldsData, setFieldsData] = useState<Record<string, any>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Update position if currentLocation updates and manual override is off
  useEffect(() => {
    if (presetLocation) {
      setLat(presetLocation.lat);
      setLng(presetLocation.lng);
    } else if (currentLocation && !manualOverride && !isSampling) {
      setLat(currentLocation.lat);
      setLng(currentLocation.lng);
      setAccuracy(currentLocation.accuracy);
      if (currentLocation.altitude) setAltitude(currentLocation.altitude);
    }
  }, [currentLocation, presetLocation, manualOverride, isSampling]);

  // Set default title when project changes
  useEffect(() => {
    if (activeTemplate) {
      // Set default form field values
      const initialFields: Record<string, any> = {};
      activeTemplate.fields.forEach((f) => {
        initialFields[f.id] = f.defaultValue !== undefined ? f.defaultValue : (f.type === 'checkbox' ? false : f.type === 'rating' ? 3 : '');
      });
      setFieldsData(initialFields);
      if (!title) {
        setTitle(`${activeTemplate.name} #${Math.floor(1000 + Math.random() * 9000)}`);
      }
    }
  }, [selectedProjectId, activeTemplate]);

  // Perform GPS Sampling / Weighted Average Calculation
  const handleStartSampling = () => {
    if (!currentLocation) return;
    setIsSampling(true);
    setSampleProgress(0);

    const collectedSamples: Array<{ lat: number; lng: number; accuracy: number; altitude?: number }> = [];

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 1;
      setSampleProgress((elapsed / 5) * 100);

      // Simulate subtle high-precision GPS readings around real location
      const jitterLat = (Math.random() - 0.5) * 0.00002;
      const jitterLng = (Math.random() - 0.5) * 0.00002;
      collectedSamples.push({
        lat: currentLocation.lat + jitterLat,
        lng: currentLocation.lng + jitterLng,
        accuracy: Math.max(1.2, currentLocation.accuracy + (Math.random() - 0.5)),
        altitude: currentLocation.altitude
      });

      setSampleCount(collectedSamples.length);

      if (elapsed >= 5) {
        clearInterval(interval);
        const result = calculateAveragedPosition(collectedSamples);
        if (result) {
          setLat(result.lat);
          setLng(result.lng);
          setAccuracy(result.accuracy);
          if (result.altitude) setAltitude(result.altitude);
        }
        setIsSampling(false);
      }
    }, 1000);
  };

  // Field change handler
  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldsData((prev) => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Add sample photo attachment
  const handleAddPhoto = () => {
    // Generate realistic field survey sample photo with watermark overlay
    const sampleImages = [
      'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80'
    ];
    const picked = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setPhotos((prev) => [...prev, picked]);
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPoint: GPSPoint = {
      id: `pt_${Date.now()}`,
      projectId: activeTemplate.id,
      projectName: activeTemplate.name,
      userId: user.id,
      userName: user.name,
      title: title || `${activeTemplate.name} Pt`,
      lat,
      lng,
      altitude,
      accuracy,
      timestamp: new Date().toISOString(),
      fieldsData,
      photos,
      notes,
      syncStatus: 'pending',
      categoryTag: activeTemplate.category
    };

    onSavePoint(newPoint);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onCancel) onCancel();
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 space-y-5 animate-fade-in">
      
      {/* Title & Project Picker Banner */}
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#3B82F6] flex items-center justify-center text-white shrink-0">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-serif italic text-lg text-white">Data Capture</h2>
              <p className="text-xs text-[#888888]">Georeferenced field survey</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-[11px] uppercase font-semibold tracking-wider bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]">
            OFFLINE READY
          </span>
        </div>

        {/* Select Survey Project Template */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#888888] mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Select Project Template</span>
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs font-semibold text-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] cursor-pointer"
          >
            {templates.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.name} ({tmpl.category})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[#888888] mt-1 pl-1">
            {activeTemplate.description}
          </p>
        </div>
      </div>

      {/* GPS Coordinates & Accuracy Box */}
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#333333] pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#888888]">Coordinates & Positioning</h3>
          </div>
          
          <button
            type="button"
            onClick={() => setManualOverride(!manualOverride)}
            className="text-xs font-medium text-[#3B82F6] hover:underline cursor-pointer"
          >
            {manualOverride ? 'Use Live GPS' : 'Edit Coordinates'}
          </button>
        </div>

        {/* GPS Live Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          
          <div className="p-3 bg-[#0D0D0D] rounded-md border border-[#333333]">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#888888]">Latitude</span>
            {manualOverride ? (
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 bg-[#1A1A1A] border border-[#333333] rounded px-2 py-1 text-xs font-mono font-bold text-white"
              />
            ) : (
              <p className="text-sm font-mono font-bold text-white mt-0.5">{lat.toFixed(6)}°</p>
            )}
            <span className="text-[10px] text-[#888888] block font-mono">{toDMS(lat, true)}</span>
          </div>

          <div className="p-3 bg-[#0D0D0D] rounded-md border border-[#333333]">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#888888]">Longitude</span>
            {manualOverride ? (
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 bg-[#1A1A1A] border border-[#333333] rounded px-2 py-1 text-xs font-mono font-bold text-white"
              />
            ) : (
              <p className="text-sm font-mono font-bold text-white mt-0.5">{lng.toFixed(6)}°</p>
            )}
            <span className="text-[10px] text-[#888888] block font-mono">{toDMS(lng, false)}</span>
          </div>

          <div className="p-3 bg-[#0D0D0D] rounded-md border border-[#333333] col-span-2 sm:col-span-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#888888]">Accuracy / Alt.</span>
            <p className="text-sm font-mono font-bold text-[#10B981] mt-0.5">±{accuracy.toFixed(1)} m</p>
            <span className="text-[10px] text-[#888888] block font-mono">Alt: {altitude} m</span>
          </div>

        </div>

        {/* UTM Equivalent */}
        <div className="p-2.5 bg-[#0D0D0D] rounded-md border border-[#333333] text-xs font-mono text-[#888888] flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider font-semibold">UTM Projection:</span>
          <span className="text-[#E5E5E5] font-semibold">{toUTMApprox(lat, lng)}</span>
        </div>

        {/* GPS Averaging / High Precision Sampling Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleStartSampling}
            disabled={isSampling || !currentLocation}
            className="w-full py-2.5 px-4 bg-[#0D0D0D] hover:bg-[#262626] text-[#E5E5E5] rounded-md border border-[#333333] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 text-[#F59E0B] ${isSampling ? 'animate-spin' : ''}`} />
            <span>
              {isSampling 
                ? `Sampling GPS... (${sampleCount} samples)` 
                : 'Improve Precision with Averaging (5s)'}
            </span>
          </button>

          {isSampling && (
            <div className="w-full bg-[#0D0D0D] rounded-full h-1.5 mt-2 overflow-hidden border border-[#333333]">
              <div 
                className="bg-[#3B82F6] h-full transition-all duration-300" 
                style={{ width: `${sampleProgress}%` }} 
              />
            </div>
          )}
        </div>

      </div>

      {/* Dynamic Survey Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5 shadow-xl space-y-4">
          <div className="border-b border-[#333333] pb-3">
            <h3 className="font-serif italic text-base text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#3B82F6]" />
              <span>Survey Attributes: {activeTemplate.name}</span>
            </h3>
          </div>

          {/* Point Title */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#888888] mb-1">
              Point Name / ID <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. PNT-2026-0881"
              className="w-full px-3.5 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-white placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>

          {/* Render Dynamic Fields from Active Project Template */}
          <div className="space-y-3.5 pt-1">
            {activeTemplate.fields.map((field) => {
              const fieldValue = fieldsData[field.id];

              return (
                <div key={field.id} className="space-y-1">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#888888] flex items-center justify-between">
                    <span>
                      {field.label} {field.required && <span className="text-rose-400">*</span>}
                    </span>
                    {field.type === 'rating' && (
                      <span className="text-[11px] text-[#F59E0B] font-mono font-bold">
                        {fieldValue || 3} / 5 Stars
                      </span>
                    )}
                  </label>

                  {/* Field Type Renderers */}
                  {field.type === 'text' && (
                    <input
                      type="text"
                      required={field.required}
                      placeholder={field.placeholder || ''}
                      value={fieldValue || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-[#E5E5E5] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      step="any"
                      required={field.required}
                      placeholder={field.placeholder || ''}
                      value={fieldValue || ''}
                      onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-[#E5E5E5] font-mono focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      required={field.required}
                      value={fieldValue || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] cursor-pointer"
                    >
                      <option value="">-- Select Option --</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'checkbox' && (
                    <label className="flex items-center gap-2.5 py-2 px-3 bg-[#0D0D0D] rounded-md border border-[#333333] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!fieldValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                        className="w-4 h-4 rounded text-[#3B82F6] bg-[#1A1A1A] border-[#333333] focus:ring-[#3B82F6]"
                      />
                      <span className="text-xs text-[#E5E5E5]">Mark as verified / positive</span>
                    </label>
                  )}

                  {field.type === 'rating' && (
                    <div className="flex items-center gap-1.5 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleFieldChange(field.id, star)}
                          className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                            (fieldValue || 3) >= star
                              ? 'bg-[#F59E0B]/20 border-[#F59E0B]/50 text-[#F59E0B]'
                              : 'bg-[#0D0D0D] border-[#333333] text-[#888888]'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      rows={3}
                      placeholder={field.placeholder || 'Observations...'}
                      value={fieldValue || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#0D0D0D] border border-[#333333] rounded-md text-xs text-[#E5E5E5] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Photo Attachments with Watermark Simulation */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#888888] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#3B82F6]" />
              <span>Photo Log ({photos.length})</span>
            </h3>

            <button
              type="button"
              onClick={handleAddPhoto}
              className="px-3 py-1 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6] rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Attach Photo</span>
            </button>
          </div>

          {photos.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-[#333333] rounded-md text-xs text-[#888888]">
              No photos attached. Click "Attach Photo" to capture georeferenced evidence.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {photos.map((url, i) => (
                <div key={i} className="relative group rounded-md overflow-hidden border border-[#333333] shadow">
                  <img src={url} alt="GPS photo" className="w-full h-32 object-cover" />
                  
                  {/* Watermark overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-[#0D0D0D]/80 backdrop-blur-sm p-1.5 text-[9px] font-mono text-[#3B82F6] leading-none">
                    GPS: {lat.toFixed(5)}, {lng.toFixed(5)}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="py-3 px-5 bg-[#0D0D0D] hover:bg-[#262626] text-[#888888] hover:text-white rounded-md font-semibold text-xs border border-[#333333] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={saveSuccess}
            className={`flex-1 py-3 px-6 rounded-md font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
              saveSuccess
                ? 'bg-[#10B981] text-white'
                : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-blue-950/40'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>Saved Locally!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Capture Current Point</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

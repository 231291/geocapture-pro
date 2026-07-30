import React, { useState, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { MapView } from './components/MapView';
import { PointCaptureForm } from './components/PointCaptureForm';
import { PointListView } from './components/PointListView';
import { ProjectManager } from './components/ProjectManager';
import { TeamAndProfileView } from './components/TeamAndProfileView';
import { LoginModal } from './components/LoginModal';

import { GPSPoint, ProjectTemplate, User, FieldAgentLocation } from './types';
import { 
  getStoredGPSPoints, 
  saveStoredGPSPoints, 
  getStoredTemplates, 
  saveStoredTemplates, 
  getActiveUser, 
  setActiveUserStorage 
} from './utils/storage';
import { FIELD_AGENTS_LOCATIONS } from './data/mockData';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('map');

  // Network State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // App Data State
  const [points, setPoints] = useState<GPSPoint[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [presetCaptureLocation, setPresetCaptureLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Live GPS Location
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    altitude?: number;
  } | null>(null);

  // Field Agents Live Tracking
  const [fieldAgents, setFieldAgents] = useState<FieldAgentLocation[]>(FIELD_AGENTS_LOCATIONS);

  // Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Load persistent storage on mount
  useEffect(() => {
    async function loadData() {
      const storedPoints = await getStoredGPSPoints();
      const storedTemplates = await getStoredTemplates();
      const storedUser = await getActiveUser();

      setPoints(storedPoints);
      setTemplates(storedTemplates);
      setCurrentUser(storedUser);
    }
    loadData();

    // Listen to online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Real GPS Watcher
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      // Fallback location if geolocation unsupported
      setCurrentLocation({ lat: 18.4861, lng: -69.9312, accuracy: 3.2, altitude: 42 });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 3.5,
          altitude: pos.coords.altitude || 38
        });
      },
      (err) => {
        console.warn('GPS Error or fallback:', err.message);
        // Fallback realistic location if GPS permission denied or mock environment
        setCurrentLocation({ lat: 18.4861, lng: -69.9312, accuracy: 3.2, altitude: 42 });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Save Points whenever updated
  const handleSaveNewPoint = async (newPoint: GPSPoint) => {
    const updated = [newPoint, ...points];
    setPoints(updated);
    await saveStoredGPSPoints(updated);
  };

  // Delete Point
  const handleDeletePoint = async (id: string) => {
    const updated = points.filter((p) => p.id !== id);
    setPoints(updated);
    await saveStoredGPSPoints(updated);
  };

  // Sync Single Point
  const handleSyncPoint = async (id: string) => {
    const updated = points.map((p) => (p.id === id ? { ...p, syncStatus: 'synced' as const } : p));
    setPoints(updated);
    await saveStoredGPSPoints(updated);
  };

  // Sync All Pending Points
  const handleSyncAllPending = async () => {
    const updated = points.map((p) => ({ ...p, syncStatus: 'synced' as const }));
    setPoints(updated);
    await saveStoredGPSPoints(updated);
  };

  // Save / Add Template
  const handleSaveTemplate = async (template: ProjectTemplate) => {
    const existingIndex = templates.findIndex((t) => t.id === template.id);
    let updated: ProjectTemplate[];
    if (existingIndex >= 0) {
      updated = [...templates];
      updated[existingIndex] = template;
    } else {
      updated = [template, ...templates];
    }
    setTemplates(updated);
    await saveStoredTemplates(updated);
  };

  // Delete Template
  const handleDeleteTemplate = async (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    await saveStoredTemplates(updated);
  };

  // Switch Active User
  const handleSwitchUser = async (user: User) => {
    setCurrentUser(user);
    await setActiveUserStorage(user);
  };

  // Quick Capture from Map Tap
  const handleQuickCaptureAtLocation = (lat: number, lng: number) => {
    setPresetCaptureLocation({ lat, lng });
    setActiveTab('capture');
  };

  const handleViewPointOnMap = (point: GPSPoint) => {
    setSelectedProjectId(point.projectId);
    setActiveTab('map');
  };

  const pendingSyncCount = points.filter((p) => p.syncStatus === 'pending').length;
  const activeProject = templates.find((t) => t.id === selectedProjectId);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Cargando GeoCapture Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Header Bar */}
      <HeaderBar
        user={currentUser}
        isOnline={isOnline}
        gpsAccuracy={currentLocation?.accuracy || null}
        pendingSyncCount={pendingSyncCount}
        onSyncAll={handleSyncAllPending}
        onOpenUserModal={() => setIsLoginModalOpen(true)}
        activeProjectName={activeProject?.name}
      />

      {/* Main Content Body */}
      <main className="flex-1 relative">
        {activeTab === 'map' && (
          <MapView
            points={points}
            fieldAgents={fieldAgents}
            currentUser={currentUser}
            currentLocation={currentLocation}
            templates={templates}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onPointSelect={(point) => {
              // Highlight point details
            }}
            onQuickCaptureAtLocation={handleQuickCaptureAtLocation}
          />
        )}

        {activeTab === 'capture' && (
          <PointCaptureForm
            user={currentUser}
            templates={templates}
            currentLocation={currentLocation}
            presetLocation={presetCaptureLocation}
            onSavePoint={(newPoint) => {
              handleSaveNewPoint(newPoint);
              setPresetCaptureLocation(null);
            }}
            onCancel={() => {
              setPresetCaptureLocation(null);
              setActiveTab('map');
            }}
          />
        )}

        {activeTab === 'points' && (
          <PointListView
            points={points}
            templates={templates}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onViewOnMap={handleViewPointOnMap}
            onDeletePoint={handleDeletePoint}
            onSyncPoint={handleSyncPoint}
            onSyncAll={handleSyncAllPending}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectManager
            templates={templates}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        )}

        {activeTab === 'team' && (
          <TeamAndProfileView
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            fieldAgents={fieldAgents}
            points={points}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab !== 'capture') setPresetCaptureLocation(null);
          setActiveTab(tab);
        }}
        pendingSyncCount={pendingSyncCount}
        totalPointsCount={points.length}
      />

      {/* Login & User Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleSwitchUser}
        currentUser={currentUser}
      />

    </div>
  );
}

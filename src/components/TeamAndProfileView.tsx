import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Activity, 
  Battery, 
  MapPin, 
  ShieldCheck, 
  Building, 
  BarChart3, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  Clock, 
  LogOut,
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { User, FieldAgentLocation, GPSPoint } from '../types';
import { DEMO_USERS } from '../data/mockData';

interface TeamAndProfileViewProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  fieldAgents: FieldAgentLocation[];
  points: GPSPoint[];
  onOpenLoginModal: () => void;
}

export const TeamAndProfileView: React.FC<TeamAndProfileViewProps> = ({
  currentUser,
  onSwitchUser,
  fieldAgents,
  points,
  onOpenLoginModal
}) => {
  // Stats
  const totalCaptured = points.length;
  const pendingSync = points.filter((p) => p.syncStatus === 'pending').length;
  const syncedCount = totalCaptured - pendingSync;
  
  const avgAccuracy = points.length > 0
    ? (points.reduce((acc, p) => acc + p.accuracy, 0) / points.length).toFixed(1)
    : '2.5';

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-5 animate-fade-in">
      
      {/* Current Active User Profile Card */}
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#333333] pb-4">
          
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-md object-cover border-2 border-[#3B82F6] shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#1A1A1A]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif italic text-lg text-white">{currentUser.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6] uppercase tracking-wider">
                  {currentUser.role === 'field_tech' ? 'Field Surveyor' : 'Supervisor'}
                </span>
              </div>
              <p className="text-xs text-[#888888] font-mono mt-0.5">{currentUser.email}</p>
              <p className="text-xs text-[#888888] flex items-center gap-1 mt-1">
                <Building className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>{currentUser.department}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLoginModal}
            className="px-3.5 py-2 bg-[#0D0D0D] hover:bg-[#262626] text-[#E5E5E5] border border-[#333333] rounded-md text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <UserCheck className="w-4 h-4 text-[#3B82F6]" />
            <span>Switch User / Login</span>
          </button>

        </div>

        {/* Quick User Switcher Pills */}
        <div>
          <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-2">
            Select Active Field Surveyor:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DEMO_USERS.map((usr) => (
              <button
                key={usr.id}
                onClick={() => onSwitchUser(usr)}
                className={`p-2.5 rounded-md border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  currentUser.id === usr.id
                    ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-white font-bold shadow-md'
                    : 'bg-[#0D0D0D] border-[#333333] text-[#888888] hover:text-white hover:bg-[#262626]'
                }`}
              >
                <img src={usr.avatar} alt={usr.name} className="w-8 h-8 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-[#E5E5E5]">{usr.name}</p>
                  <p className="text-[10px] text-[#888888]">{usr.department.split(' ')[0]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Survey Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#1A1A1A] border border-[#333333] p-4 rounded-lg space-y-1 shadow-lg">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#888888]">Total Points</p>
          <p className="text-2xl font-black text-white font-mono">{totalCaptured}</p>
          <p className="text-[10px] text-[#3B82F6] font-medium">Field Surveyed</p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#333333] p-4 rounded-lg space-y-1 shadow-lg">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#888888]">Synced</p>
          <p className="text-2xl font-black text-[#10B981] font-mono">{syncedCount}</p>
          <p className="text-[10px] text-[#888888]">In Cloud Database</p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#333333] p-4 rounded-lg space-y-1 shadow-lg">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#888888]">Pending Sync</p>
          <p className="text-2xl font-black text-[#F59E0B] font-mono">{pendingSync}</p>
          <p className="text-[10px] text-[#F59E0B]">Offline Queue</p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#333333] p-4 rounded-lg space-y-1 shadow-lg">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#888888]">Avg Accuracy</p>
          <p className="text-2xl font-black text-[#3B82F6] font-mono">±{avgAccuracy}m</p>
          <p className="text-[10px] text-[#888888]">Error Margin</p>
        </div>
      </div>

      {/* Field Agents Tracking Section */}
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#333333] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="font-serif italic text-base text-white">Active Field Surveyors</h3>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>3 Agents Active</span>
          </span>
        </div>

        <div className="space-y-3">
          {fieldAgents.map((agent) => (
            <div
              key={agent.id}
              className="p-4 bg-[#0D0D0D] border border-[#333333] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#333333]"
                  />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0D0D0D] ${
                    agent.status === 'active' || agent.status === 'moving' ? 'bg-[#10B981]' : 'bg-[#888888]'
                  }`} />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                  <p className="text-xs text-[#888888]">{agent.role} &bull; <span className="text-[#3B82F6] font-medium">{agent.assignedProject}</span></p>
                  <p className="text-[10px] font-mono text-[#888888] mt-0.5">
                    Coordinates: {agent.lat.toFixed(4)}°, {agent.lng.toFixed(4)}° (±{agent.accuracy}m)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center font-mono text-xs">
                <div className="flex items-center gap-1 text-[#E5E5E5]">
                  <Battery className="w-4 h-4 text-[#10B981]" />
                  <span>{agent.batteryLevel}%</span>
                </div>

                <span className="px-2.5 py-1 rounded bg-[#1A1A1A] text-[#888888] border border-[#333333] text-[11px]">
                  {agent.lastUpdated}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

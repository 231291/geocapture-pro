import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Navigation, 
  RefreshCw, 
  User as UserIcon, 
  Layers,
  ChevronDown,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';

interface HeaderBarProps {
  user: User;
  isOnline: boolean;
  gpsAccuracy: number | null;
  pendingSyncCount: number;
  onSyncAll: () => void;
  onOpenUserModal: () => void;
  activeProjectName?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  user,
  isOnline,
  gpsAccuracy,
  pendingSyncCount,
  onSyncAll,
  onOpenUserModal,
  activeProjectName
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncClick = async () => {
    if (pendingSyncCount === 0 || !isOnline) return;
    setIsSyncing(true);
    await onSyncAll();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const getAccuracyColor = (acc: number | null) => {
    if (acc === null) return 'text-slate-400 bg-slate-800';
    if (acc <= 5) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50';
    if (acc <= 12) return 'text-amber-400 bg-amber-950/60 border-amber-800/50';
    return 'text-rose-400 bg-rose-950/60 border-rose-800/50';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1A1A1A] border-b border-[#333333] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Brand & Active Project */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md bg-[#3B82F6] flex items-center justify-center font-bold text-white shadow-sm shrink-0">
            <Navigation className="w-4 h-4 text-white font-bold" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base leading-none uppercase">
                TERRA<span className="text-[#3B82F6]">SYNC</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#0D0D0D] text-[#888888] border border-[#333333]">
                v2.4 GIS
              </span>
            </div>
            {activeProjectName && (
              <p className="text-xs text-[#888888] truncate flex items-center gap-1 mt-0.5">
                <Layers className="w-3 h-3 text-[#3B82F6] inline" />
                <span className="truncate">{activeProjectName}</span>
              </p>
            )}
          </div>
        </div>

        {/* System Indicators: GPS Accuracy, Sync & Online Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* GPS Accuracy Chip */}
          <div className={`px-3 py-1 rounded-full border text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
            gpsAccuracy === null 
              ? 'bg-[#0D0D0D] text-[#888888] border-[#333333]' 
              : gpsAccuracy <= 5 
                ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' 
                : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
          }`}>
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {gpsAccuracy !== null ? `±${gpsAccuracy.toFixed(1)}m` : 'GPS Searching'}
            </span>
          </div>

          {/* Sync Button & Pending Counter */}
          <button
            onClick={handleSyncClick}
            disabled={pendingSyncCount === 0 || !isOnline || isSyncing}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border ${
              pendingSyncCount > 0
                ? isOnline
                  ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6] hover:bg-[#3B82F6]/20 cursor-pointer shadow-sm'
                  : 'bg-[#0D0D0D] text-[#888888] border-[#333333] opacity-60'
                : 'bg-[#0D0D0D] text-[#888888] border-[#333333]'
            }`}
            title={pendingSyncCount > 0 ? `${pendingSyncCount} pending syncs` : 'All synced'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#3B82F6]' : ''}`} />
            <span className="hidden xs:inline">
              {pendingSyncCount > 0 ? `${pendingSyncCount} Pend.` : 'Synced'}
            </span>
            {pendingSyncCount > 0 ? (
              <span className="w-4 h-4 rounded-full bg-[#3B82F6] text-white font-bold text-[10px] flex items-center justify-center">
                {pendingSyncCount}
              </span>
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            )}
          </button>

          {/* Online/Offline Status Pill */}
          <div className={`px-3 py-1 rounded-full border text-xs flex items-center gap-1.5 font-medium ${
            isOnline 
              ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]' 
              : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#3B82F6]' : 'bg-[#F59E0B]'}`} />
            <span className="hidden md:inline">{isOnline ? 'ONLINE' : 'OFFLINE ACTIVE'}</span>
          </div>

          {/* Active User Avatar & Switcher */}
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0D0D0D] hover:bg-[#262626] border border-[#333333] transition-colors text-xs text-[#E5E5E5] cursor-pointer"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-[#3B82F6]" />
            ) : (
              <UserIcon className="w-4 h-4 text-[#3B82F6]" />
            )}
            <div className="hidden sm:block text-right leading-tight">
              <div className="font-medium text-xs text-[#E5E5E5]">{user.name.split(' ')[0]}</div>
              <div className="text-[10px] text-[#888888]">{user.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#888888]" />
          </button>

        </div>
      </div>
    </header>
  );
};

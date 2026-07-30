import React from 'react';
import { Map, PlusCircle, List, FolderKanban, Users } from 'lucide-react';

export type NavTab = 'map' | 'capture' | 'points' | 'projects' | 'team';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingSyncCount: number;
  totalPointsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingSyncCount,
  totalPointsCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] border-t border-[#333333] px-2 py-2 sm:px-4">
      <div className="max-w-md mx-auto flex items-center justify-around">
        
        {/* Map Tab */}
        <button
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all cursor-pointer ${
            activeTab === 'map'
              ? 'text-[#3B82F6] font-bold scale-105'
              : 'text-[#888888] hover:text-[#E5E5E5]'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[11px] uppercase tracking-wider font-semibold">Map</span>
        </button>

        {/* Points List Tab */}
        <button
          onClick={() => onTabChange('points')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all cursor-pointer ${
            activeTab === 'points'
              ? 'text-[#3B82F6] font-bold scale-105'
              : 'text-[#888888] hover:text-[#E5E5E5]'
          }`}
        >
          <div className="relative">
            <List className="w-5 h-5" />
            {pendingSyncCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-ping" />
            )}
          </div>
          <span className="text-[11px] uppercase tracking-wider font-semibold">Points ({totalPointsCount})</span>
        </button>

        {/* Quick Capture Floating Center Button */}
        <button
          onClick={() => onTabChange('capture')}
          className="relative -top-4 flex items-center justify-center w-12 h-12 rounded-lg bg-[#3B82F6] text-white font-bold shadow-lg hover:bg-[#2563EB] active:scale-95 transition-all cursor-pointer ring-4 ring-[#0D0D0D]"
          title="Capture GPS Point"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        {/* Projects / Templates Tab */}
        <button
          onClick={() => onTabChange('projects')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'text-[#3B82F6] font-bold scale-105'
              : 'text-[#888888] hover:text-[#E5E5E5]'
          }`}
        >
          <FolderKanban className="w-5 h-5" />
          <span className="text-[11px] uppercase tracking-wider font-semibold">Projects</span>
        </button>

        {/* Team & Profile Tab */}
        <button
          onClick={() => onTabChange('team')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all cursor-pointer ${
            activeTab === 'team'
              ? 'text-[#3B82F6] font-bold scale-105'
              : 'text-[#888888] hover:text-[#E5E5E5]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px] uppercase tracking-wider font-semibold">Team</span>
        </button>

      </div>
    </nav>
  );
};

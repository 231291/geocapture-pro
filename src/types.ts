export type UserRole = 'field_tech' | 'supervisor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  isOnline: boolean;
  lat?: number;
  lng?: number;
  accuracy?: number;
  lastActive?: string;
}

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'checkbox' 
  | 'rating' 
  | 'photo' 
  | 'date' 
  | 'textarea';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For select inputs
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  color: string; // Hex or Tailwind color class
  fields: FormField[];
  createdAt: string;
}

export interface GPSPoint {
  id: string;
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  title: string;
  lat: number;
  lng: number;
  altitude?: number;
  accuracy: number; // in meters
  heading?: number;
  speed?: number;
  timestamp: string;
  fieldsData: Record<string, any>;
  photos: string[];
  syncStatus: 'synced' | 'pending' | 'failed';
  notes?: string;
  categoryTag?: string;
}

export interface FieldAgentLocation {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lat: number;
  lng: number;
  accuracy: number;
  lastUpdated: string;
  batteryLevel?: number;
  status: 'active' | 'moving' | 'idle' | 'offline';
  assignedProject?: string;
}

export interface MapTileLayer {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
}

export interface FilterState {
  searchQuery: string;
  projectId: string;
  syncStatus: 'all' | 'synced' | 'pending';
  userId: string;
  startDate?: string;
  endDate?: string;
}

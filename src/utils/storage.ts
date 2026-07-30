import localforage from 'localforage';
import { GPSPoint, ProjectTemplate, User } from '../types';
import { INITIAL_GPS_POINTS, INITIAL_PROJECT_TEMPLATES, DEMO_USERS } from '../data/mockData';

// Configure localforage instance for offline GIS storage
localforage.config({
  name: 'GeoCapturePro',
  storeName: 'field_gis_data'
});

const STORAGE_KEYS = {
  POINTS: 'geocapture_gps_points_v1',
  TEMPLATES: 'geocapture_project_templates_v1',
  ACTIVE_USER: 'geocapture_active_user_v1',
  SETTINGS: 'geocapture_settings_v1'
};

export interface AppSettings {
  defaultBaseMap: string;
  enableHighAccuracy: boolean;
  autoSyncWhenOnline: boolean;
  minAccuracyThreshold: number; // e.g. 10 meters
  gpsAveragingSamples: number; // e.g. 5 samples
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultBaseMap: 'esri_satellite',
  enableHighAccuracy: true,
  autoSyncWhenOnline: true,
  minAccuracyThreshold: 15,
  gpsAveragingSamples: 5
};

// Storage initialization & getters
export async function getStoredGPSPoints(): Promise<GPSPoint[]> {
  try {
    const saved = await localforage.getItem<GPSPoint[]>(STORAGE_KEYS.POINTS);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    // Seed initial points if empty
    await localforage.setItem(STORAGE_KEYS.POINTS, INITIAL_GPS_POINTS);
    return INITIAL_GPS_POINTS;
  } catch (err) {
    console.error('Error reading stored GPS points:', err);
    return INITIAL_GPS_POINTS;
  }
}

export async function saveStoredGPSPoints(points: GPSPoint[]): Promise<void> {
  try {
    await localforage.setItem(STORAGE_KEYS.POINTS, points);
  } catch (err) {
    console.error('Error saving GPS points:', err);
  }
}

export async function getStoredTemplates(): Promise<ProjectTemplate[]> {
  try {
    const saved = await localforage.getItem<ProjectTemplate[]>(STORAGE_KEYS.TEMPLATES);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    await localforage.setItem(STORAGE_KEYS.TEMPLATES, INITIAL_PROJECT_TEMPLATES);
    return INITIAL_PROJECT_TEMPLATES;
  } catch (err) {
    console.error('Error reading templates:', err);
    return INITIAL_PROJECT_TEMPLATES;
  }
}

export async function saveStoredTemplates(templates: ProjectTemplate[]): Promise<void> {
  try {
    await localforage.setItem(STORAGE_KEYS.TEMPLATES, templates);
  } catch (err) {
    console.error('Error saving templates:', err);
  }
}

export async function getActiveUser(): Promise<User> {
  try {
    const saved = await localforage.getItem<User>(STORAGE_KEYS.ACTIVE_USER);
    if (saved) return saved;
    // Default to first field tech
    return DEMO_USERS[0];
  } catch {
    return DEMO_USERS[0];
  }
}

export async function setActiveUserStorage(user: User): Promise<void> {
  try {
    await localforage.setItem(STORAGE_KEYS.ACTIVE_USER, user);
  } catch (err) {
    console.error('Error saving active user:', err);
  }
}

export async function getStoredSettings(): Promise<AppSettings> {
  try {
    const saved = await localforage.getItem<AppSettings>(STORAGE_KEYS.SETTINGS);
    return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveStoredSettings(settings: AppSettings): Promise<void> {
  try {
    await localforage.setItem(STORAGE_KEYS.SETTINGS, settings);
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

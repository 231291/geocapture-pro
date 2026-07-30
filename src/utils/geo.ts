import { GPSPoint } from '../types';

/**
 * Calculates distance in meters between two lat/lng points using Haversine formula
 */
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance nicely (e.g. 350m or 4.2 km)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Converts Decimal Degrees to DMS (Degrees, Minutes, Seconds)
 */
export function toDMS(coordinate: number, isLatitude: boolean): string {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

  let direction = '';
  if (isLatitude) {
    direction = coordinate >= 0 ? 'N' : 'S';
  } else {
    direction = coordinate >= 0 ? 'E' : 'O';
  }

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

/**
 * Converts Lat/Lng to approximate UTM Zone & Easting/Northing format string
 */
export function toUTMApprox(lat: number, lng: number): string {
  const zoneNumber = Math.floor((lng + 180) / 6) + 1;
  const zoneLetter = lat >= 0 ? 'N' : 'S';
  // Standard simplified Transverse Mercator representation for GIS field display
  const radLat = lat * (Math.PI / 180);
  const northing = Math.round(lat >= 0 ? lat * 111132 : 10000000 + lat * 111132);
  const easting = Math.round(500000 + (lng - (-183 + zoneNumber * 6)) * 111320 * Math.cos(radLat));

  return `${zoneNumber}${zoneLetter} E:${easting.toLocaleString()} N:${northing.toLocaleString()}`;
}

/**
 * Calculates weighted average of GPS coordinate samples for accuracy improvement
 */
export function calculateAveragedPosition(
  samples: Array<{ lat: number; lng: number; accuracy: number; altitude?: number }>
) {
  if (!samples.length) return null;

  let totalWeight = 0;
  let weightedLat = 0;
  let weightedLng = 0;
  let totalAlt = 0;
  let altCount = 0;
  let bestAccuracy = Infinity;

  samples.forEach((s) => {
    // Higher accuracy (smaller meter radius) gets higher weight
    const weight = 1 / Math.max(s.accuracy, 0.5);
    weightedLat += s.lat * weight;
    weightedLng += s.lng * weight;
    totalWeight += weight;

    if (s.altitude !== undefined && s.altitude !== null) {
      totalAlt += s.altitude;
      altCount++;
    }

    if (s.accuracy < bestAccuracy) {
      bestAccuracy = s.accuracy;
    }
  });

  return {
    lat: weightedLat / totalWeight,
    lng: weightedLng / totalWeight,
    accuracy: Math.round(bestAccuracy * 10) / 10,
    altitude: altCount > 0 ? Math.round((totalAlt / altCount) * 10) / 10 : undefined,
    sampleCount: samples.length
  };
}

/**
 * Generates GeoJSON FeatureCollection string from GPS points
 */
export function exportToGeoJSON(points: GPSPoint[]): string {
  const features = points.map((pt) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [pt.lng, pt.lat, pt.altitude || 0]
    },
    properties: {
      id: pt.id,
      titulo: pt.title,
      proyecto: pt.projectName,
      proyecto_id: pt.projectId,
      usuario: pt.userName,
      precisión_m: pt.accuracy,
      fecha_captura: pt.timestamp,
      estado_sincronización: pt.syncStatus,
      fotos_adjuntas: pt.photos.length,
      ...pt.fieldsData
    }
  }));

  const geojson = {
    type: 'FeatureCollection',
    name: 'GeoCapturePro_Export',
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
    },
    features
  };

  return JSON.stringify(geojson, null, 2);
}

/**
 * Generates KML file string for Google Earth / GIS viewing
 */
export function exportToKML(points: GPSPoint[]): string {
  const placemarks = points
    .map(
      (pt) => `
    <Placemark>
      <name>${escapeXml(pt.title)}</name>
      <description><![CDATA[
        <h3>${escapeXml(pt.projectName)}</h3>
        <p><b>Capturado por:</b> ${escapeXml(pt.userName)}</p>
        <p><b>Fecha:</b> ${new Date(pt.timestamp).toLocaleString()}</p>
        <p><b>Precisión GPS:</b> ±${pt.accuracy}m</p>
        <hr/>
        <h4>Campos de Levantamiento:</h4>
        <ul>
          ${Object.entries(pt.fieldsData)
            .map(([k, v]) => `<li><b>${escapeXml(k)}:</b> ${escapeXml(String(v))}</li>`)
            .join('')}
        </ul>
      ]]></description>
      <Point>
        <coordinates>${pt.lng},${pt.lat},${pt.altitude || 0}</coordinates>
      </Point>
    </Placemark>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Levantamiento_GeoCapturePro</name>
    <description>Puntos GPS capturados en terreno con GeoCapture Pro</description>
    ${placemarks}
  </Document>
</kml>`;
}

/**
 * Generates CSV string for Excel / GIS table analysis
 */
export function exportToCSV(points: GPSPoint[]): string {
  if (!points.length) return '';

  // Gather all field keys
  const allFieldKeys = Array.from(
    new Set(points.flatMap((p) => Object.keys(p.fieldsData)))
  );

  const headers = [
    'ID_Punto',
    'Titulo',
    'Proyecto',
    'Usuario',
    'Latitud',
    'Longitud',
    'Altitud_m',
    'Precision_m',
    'Fecha_Hora',
    'Estado_Sinc',
    ...allFieldKeys
  ];

  const rows = points.map((pt) => {
    const fieldValues = allFieldKeys.map((k) => {
      const val = pt.fieldsData[k];
      return val !== undefined && val !== null ? `"${String(val).replace(/"/g, '""')}"` : '""';
    });

    return [
      `"${pt.id}"`,
      `"${pt.title.replace(/"/g, '""')}"`,
      `"${pt.projectName.replace(/"/g, '""')}"`,
      `"${pt.userName.replace(/"/g, '""')}"`,
      pt.lat,
      pt.lng,
      pt.altitude || 0,
      pt.accuracy,
      `"${new Date(pt.timestamp).toISOString()}"`,
      `"${pt.syncStatus}"`,
      ...fieldValues
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Triggers browser download for generated files
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

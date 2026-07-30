import { ProjectTemplate, User, GPSPoint, FieldAgentLocation } from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'usr_1',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@geocapture.io',
    role: 'field_tech',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Geodesia y Catastro',
    isOnline: true,
    lat: 18.4861,
    lng: -69.9312,
    accuracy: 3.5,
    lastActive: 'Hace un momento'
  },
  {
    id: 'usr_2',
    name: 'María Fernández',
    email: 'maria.fernandez@geocapture.io',
    role: 'supervisor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Supervisión Técnica',
    isOnline: true,
    lat: 18.4895,
    lng: -69.9245,
    accuracy: 4.2,
    lastActive: 'Hace 3 min'
  },
  {
    id: 'usr_3',
    name: 'Alejandro Ramos',
    email: 'alejandro.ramos@geocapture.io',
    role: 'field_tech',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Infraestructura Vial',
    isOnline: true,
    lat: 18.4780,
    lng: -69.9410,
    accuracy: 2.8,
    lastActive: 'En movimiento'
  }
];

export const INITIAL_PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'proj_elec',
    name: 'Red Eléctrica y Postes',
    category: 'Infraestructura',
    description: 'Levantamiento de infraestructura de distribución eléctrica, postes, transformadores y acometidas.',
    iconName: 'Zap',
    color: '#f59e0b', // Amber
    createdAt: '2026-01-15',
    fields: [
      { id: 'f_codigo', label: 'Código de Poste/Estructura', type: 'text', required: true, placeholder: 'Ej: PST-10492' },
      { id: 'f_tipo_postage', label: 'Material del Poste', type: 'select', required: true, options: ['Hormigón', 'Madera Tratada', 'Acero Galvanizado', 'Fibra de Vidrio'] },
      { id: 'f_altura', label: 'Altura Aproximada (metros)', type: 'number', required: false, placeholder: '12' },
      { id: 'f_transformador', label: '¿Tiene Transformador?', type: 'checkbox', required: false, defaultValue: false },
      { id: 'f_capacidad_kva', label: 'Capacidad Transformador (kVA)', type: 'select', required: false, options: ['N/A', '15 kVA', '25 kVA', '37.5 kVA', '50 kVA', '75 kVA', '100+ kVA'] },
      { id: 'f_estado_fisico', label: 'Estado de Conservación', type: 'rating', required: true },
      { id: 'f_cables_observacion', label: 'Cables / Acometidas Adicionales', type: 'select', required: false, options: ['Normal', 'Saturado', 'Cables Caídos', 'Fraude Detectado'] },
      { id: 'f_notas', label: 'Observaciones del Terreno', type: 'textarea', required: false, placeholder: 'Detalles sobre vegetación cercana o peligro de colapso...' }
    ]
  },
  {
    id: 'proj_censo',
    name: 'Censo Urbano y Catastro',
    category: 'Catastro',
    description: 'Levantamiento predial, censo de viviendas, comercios y uso de suelo.',
    iconName: 'Home',
    color: '#3b82f6', // Blue
    createdAt: '2026-01-20',
    fields: [
      { id: 'f_clave_catastral', label: 'Clave Catastral / Matrícula', type: 'text', required: true, placeholder: 'CAT-2026-883' },
      { id: 'f_uso_suelo', label: 'Uso de Suelo', type: 'select', required: true, options: ['Residencial', 'Comercial', 'Industrial', 'Mixto', 'Terreno Baldío', 'Equipamiento Público'] },
      { id: 'f_niveles', label: 'Número de Niveles / Pisos', type: 'number', required: true, defaultValue: 1 },
      { id: 'f_habitantes', label: 'Estimado de Habitantes', type: 'number', required: false },
      { id: 'f_servicios', label: 'Servicios Básicos Disponibles', type: 'select', required: false, options: ['Todos los servicios', 'Agua + Electricidad', 'Sólo Electricidad', 'Sin Servicios'] },
      { id: 'f_material_pared', label: 'Material Predominante', type: 'select', required: false, options: ['Bloque/Concreto', 'Ladrillo', 'Madera', 'Mapeo Informal'] },
      { id: 'f_notas', label: 'Notas de Inspección Predial', type: 'textarea', required: false }
    ]
  },
  {
    id: 'proj_forestal',
    name: 'Inventario Arbolado Urbano',
    category: 'Medio Ambiente',
    description: 'Registro geoespacial de árboles urbanos, fitosanidad y riesgo ambiental.',
    iconName: 'Trees',
    color: '#10b981', // Emerald
    createdAt: '2026-02-01',
    fields: [
      { id: 'f_especie', label: 'Nombre o Especie del Árbol', type: 'text', required: true, placeholder: 'Ej: Caoba, Flamboyán, Roble, Palma' },
      { id: 'f_dap', label: 'Diámetro a la Altura del Pecho DAP (cm)', type: 'number', required: true, placeholder: '45' },
      { id: 'f_altura_arbol', label: 'Altura Estimada (m)', type: 'number', required: false, placeholder: '8' },
      { id: 'f_salud', label: 'Estado Fitosanitario', type: 'select', required: true, options: ['Excelente / Sano', 'Plaga Menor', 'Plaga Severa / Enfermo', 'Seco / Muerto'] },
      { id: 'f_riesgo', label: 'Evaluación de Riesgo de Caída', type: 'rating', required: true },
      { id: 'f_conflicto_cable', label: 'Interfiere con Cableado Eléctrico', type: 'checkbox', required: false, defaultValue: false },
      { id: 'f_observaciones', label: 'Observaciones de Cuidados o Poda', type: 'textarea', required: false }
    ]
  },
  {
    id: 'proj_vial',
    name: 'Inspección Vial y Baches',
    category: 'Vialidad',
    description: 'Detección y mapeo de daños en asfalto, señalización y hundimientos viales.',
    iconName: 'AlertTriangle',
    color: '#ef4444', // Red
    createdAt: '2026-02-10',
    fields: [
      { id: 'f_codigo_tramo', label: 'Código o Nombre de Vía', type: 'text', required: true, placeholder: 'Av. 27 de Febrero Km 4' },
      { id: 'f_tipo_dano', label: 'Tipo de Inconveniente', type: 'select', required: true, options: ['Bache / Hueco', 'Grieta Longitudinal', 'Hundimiento', 'Falta de Señalización', 'Semáforo Averiado'] },
      { id: 'f_severidad', label: 'Severidad del Daño', type: 'rating', required: true },
      { id: 'f_dimensiones', label: 'Área Estimada del Daño (m²)', type: 'number', required: false, placeholder: '2.5' },
      { id: 'f_prioridad', label: 'Prioridad de Reparación', type: 'select', required: true, options: ['Baja', 'Media', 'Alta - Peligro Inminente'] },
      { id: 'f_comentarios', label: 'Detalles para Cuadrilla', type: 'textarea', required: false }
    ]
  }
];

export const INITIAL_GPS_POINTS: GPSPoint[] = [
  {
    id: 'pt_101',
    projectId: 'proj_elec',
    projectName: 'Red Eléctrica y Postes',
    userId: 'usr_1',
    userName: 'Carlos Mendoza',
    title: 'Poste Concreto PST-8841',
    lat: 18.4865,
    lng: -69.9318,
    altitude: 42,
    accuracy: 2.1,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    syncStatus: 'synced',
    photos: ['https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80'],
    categoryTag: 'Infraestructura',
    fieldsData: {
      f_codigo: 'PST-8841',
      f_tipo_postage: 'Hormigón',
      f_altura: 14,
      f_transformador: true,
      f_capacidad_kva: '50 kVA',
      f_estado_fisico: 4,
      f_cables_observacion: 'Normal',
      f_notas: 'Estructura en buen estado con transformador trifásico operativo.'
    }
  },
  {
    id: 'pt_102',
    projectId: 'proj_elec',
    projectName: 'Red Eléctrica y Postes',
    userId: 'usr_1',
    userName: 'Carlos Mendoza',
    title: 'Poste Madera PST-8842',
    lat: 18.4878,
    lng: -69.9295,
    altitude: 44,
    accuracy: 3.4,
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    syncStatus: 'synced',
    photos: [],
    categoryTag: 'Infraestructura',
    fieldsData: {
      f_codigo: 'PST-8842',
      f_tipo_postage: 'Madera Tratada',
      f_altura: 10,
      f_transformador: false,
      f_estado_fisico: 2,
      f_cables_observacion: 'Saturado',
      f_notas: 'Poste inclinado 15 grados hacia la calle. Requiere reemplazo por hormigón.'
    }
  },
  {
    id: 'pt_103',
    projectId: 'proj_forestal',
    projectName: 'Inventario Arbolado Urbano',
    userId: 'usr_3',
    userName: 'Alejandro Ramos',
    title: 'Caoba Centenaria #042',
    lat: 18.4842,
    lng: -69.9340,
    altitude: 39,
    accuracy: 1.8,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    syncStatus: 'synced',
    photos: ['https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80'],
    categoryTag: 'Medio Ambiente',
    fieldsData: {
      f_especie: 'Caoba Dominicana (Swietenia mahagoni)',
      f_dap: 68,
      f_altura_arbol: 16,
      f_salud: 'Excelente / Sano',
      f_riesgo: 1,
      f_conflicto_cable: false,
      f_observaciones: 'Árbol patrimonial en zona de parque. Raíces sanas.'
    }
  },
  {
    id: 'pt_104',
    projectId: 'proj_vial',
    projectName: 'Inspección Vial y Baches',
    userId: 'usr_3',
    userName: 'Alejandro Ramos',
    title: 'Bache Severo Carril Izq',
    lat: 18.4890,
    lng: -69.9360,
    altitude: 41,
    accuracy: 4.1,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    syncStatus: 'pending',
    photos: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80'],
    categoryTag: 'Vialidad',
    fieldsData: {
      f_codigo_tramo: 'Av. Winston Churchill #402',
      f_tipo_dano: 'Bache / Hueco',
      f_severidad: 5,
      f_dimensiones: 3.8,
      f_prioridad: 'Alta - Peligro Inminente',
      f_comentarios: 'Hundimiento profundo de 18cm. Varios vehículos han sufrido impactos.'
    }
  },
  {
    id: 'pt_105',
    projectId: 'proj_censo',
    projectName: 'Censo Urbano y Catastro',
    userId: 'usr_2',
    userName: 'María Fernández',
    title: 'Predio Comercial Plaza Central',
    lat: 18.4830,
    lng: -69.9270,
    altitude: 40,
    accuracy: 2.5,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    syncStatus: 'synced',
    photos: [],
    categoryTag: 'Catastro',
    fieldsData: {
      f_clave_catastral: 'CAT-2026-9041',
      f_uso_suelo: 'Comercial',
      f_niveles: 4,
      f_habitantes: 0,
      f_servicios: 'Todos los servicios',
      f_material_pared: 'Bloque/Concreto',
      f_notas: 'Localización verificada con plano catastral oficial.'
    }
  }
];

export const FIELD_AGENTS_LOCATIONS: FieldAgentLocation[] = [
  {
    id: 'usr_1',
    name: 'Carlos Mendoza',
    role: 'Técnico Levantamiento',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lat: 18.4861,
    lng: -69.9312,
    accuracy: 3.5,
    lastUpdated: 'En vivo GPS',
    batteryLevel: 88,
    status: 'active',
    assignedProject: 'Red Eléctrica y Postes'
  },
  {
    id: 'usr_2',
    name: 'María Fernández',
    role: 'Supervisora de Campo',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lat: 18.4895,
    lng: -69.9245,
    accuracy: 4.2,
    lastUpdated: 'Hace 2 min',
    batteryLevel: 64,
    status: 'idle',
    assignedProject: 'Censo Urbano y Catastro'
  },
  {
    id: 'usr_3',
    name: 'Alejandro Ramos',
    role: 'Técnico Vial',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lat: 18.4780,
    lng: -69.9410,
    accuracy: 2.8,
    lastUpdated: 'En movimiento',
    batteryLevel: 92,
    status: 'moving',
    assignedProject: 'Inspección Vial y Baches'
  }
];

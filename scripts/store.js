/* Almacenamiento compartido (localStorage) para clientes y mascotas del CRM */

const CLIENTES_KEY = 'vetrincon-clientes';
const MASCOTAS_KEY = 'vetrincon-mascotas';

function genId() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function emptyMascota() {
  return {
    id: null,
    clienteId: '',
    general: {
      foto: '', nombre: '', especie: 'Perro', raza: '', sexo: 'Macho',
      fechaNacimiento: '', color: '', pelaje: '', tamano: 'Mediano',
      pesoActual: '', pesoIdeal: '', microchip: '', estado: 'Activa',
      fechaAlta: '', observaciones: '',
    },
    medica: {
      alergias: '', alergiasAlimentarias: '', enfermedadesCronicas: '', enfermedadesPrevias: '',
      medicacionActual: '', antecedentesMedicos: '', antecedentesQuirurgicos: '',
      antecedentesHereditarios: '', restricciones: '', observaciones: '',
    },
    contactos: [],
    contactoEmergencia: { nombre: '', telefono: '', relacion: '' },
    esterilizacion: { esterilizado: 'No', fecha: '', tipoProcedimiento: '', veterinario: '', observaciones: '', documentos: '' },
    vacunas: [],
    desparasitaciones: [],
    historia: [],
    medicaciones: [],
    estudios: [],
    cirugias: [],
    turnos: [],
    documentos: [],
    recordatorios: [],
  };
}

const SEED_CLIENTES = [
  { id: 'cli-1', nombre: 'Maria Gomez', telefono: '15 4111-2222', email: 'maria.gomez@mail.com' },
  { id: 'cli-2', nombre: 'Juan Perez', telefono: '15 4333-4444', email: 'juan.perez@mail.com' },
  { id: 'cli-3', nombre: 'Sofia Diaz', telefono: '15 4555-6666', email: 'sofia.diaz@mail.com' },
];

const SEED_MASCOTAS = [
  Object.assign(emptyMascota(), {
    id: 'pet-1', clienteId: 'cli-1',
    general: Object.assign(emptyMascota().general, {
      nombre: 'Firulais', especie: 'Perro', raza: 'Labrador', sexo: 'Macho',
      fechaNacimiento: '2023-03-10', color: 'Dorado', pelaje: 'Corto', tamano: 'Grande',
      pesoActual: '28 kg', pesoIdeal: '27 kg', microchip: '900215002345678',
      estado: 'Activa', fechaAlta: '2023-04-01',
    }),
    vacunas: [
      { nombre: 'Antirrabica', tipo: 'Viral', fechaAplicacion: '2026-05-10', proximaDosis: '2027-05-10', fechaVencimiento: '', laboratorio: '', lote: '', veterinario: '', observaciones: '', certificado: '' },
      { nombre: 'Sextuple', tipo: 'Multiple', fechaAplicacion: '2026-04-15', proximaDosis: '2027-04-15', fechaVencimiento: '', laboratorio: '', lote: '', veterinario: '', observaciones: '', certificado: '' },
    ],
  }),
  Object.assign(emptyMascota(), {
    id: 'pet-2', clienteId: 'cli-1',
    general: Object.assign(emptyMascota().general, {
      nombre: 'Michi', especie: 'Gato', raza: 'Siames', sexo: 'Hembra',
      fechaNacimiento: '2025-01-20', color: 'Crema', pelaje: 'Corto', tamano: 'Pequeño',
      pesoActual: '3.5 kg', pesoIdeal: '4 kg', estado: 'Activa', fechaAlta: '2025-02-01',
    }),
  }),
  Object.assign(emptyMascota(), {
    id: 'pet-3', clienteId: 'cli-2',
    general: Object.assign(emptyMascota().general, {
      nombre: 'Rocky', especie: 'Perro', raza: 'Bulldog Frances', sexo: 'Macho',
      fechaNacimiento: '2021-06-05', color: 'Atigrado', pelaje: 'Corto', tamano: 'Mediano',
      pesoActual: '12 kg', pesoIdeal: '11 kg', estado: 'Activa', fechaAlta: '2021-07-01',
    }),
  }),
  Object.assign(emptyMascota(), {
    id: 'pet-4', clienteId: 'cli-3',
    general: Object.assign(emptyMascota().general, {
      nombre: 'Luna', especie: 'Perro', raza: 'Border Collie', sexo: 'Hembra',
      fechaNacimiento: '2024-02-15', color: 'Blanco y negro', pelaje: 'Medio', tamano: 'Mediano',
      pesoActual: '18 kg', pesoIdeal: '18 kg', estado: 'Activa', fechaAlta: '2024-03-01',
    }),
  }),
  Object.assign(emptyMascota(), {
    id: 'pet-5', clienteId: 'cli-3',
    general: Object.assign(emptyMascota().general, {
      nombre: 'Copito', especie: 'Conejo', raza: 'Enano', sexo: 'Macho',
      fechaNacimiento: '2022-08-01', color: 'Blanco', pelaje: 'Largo', tamano: 'Pequeño',
      pesoActual: '1.8 kg', pesoIdeal: '2 kg', estado: 'Activa', fechaAlta: '2022-08-20',
    }),
  }),
];

function loadClientes() {
  const raw = localStorage.getItem(CLIENTES_KEY);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(CLIENTES_KEY, JSON.stringify(SEED_CLIENTES));
  return SEED_CLIENTES;
}
function saveClientes(list) { localStorage.setItem(CLIENTES_KEY, JSON.stringify(list)); }

function loadMascotas() {
  const raw = localStorage.getItem(MASCOTAS_KEY);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(MASCOTAS_KEY, JSON.stringify(SEED_MASCOTAS));
  return SEED_MASCOTAS;
}
function saveMascotas(list) { localStorage.setItem(MASCOTAS_KEY, JSON.stringify(list)); }

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '';
  const nacimiento = new Date(fechaNacimiento + 'T00:00:00');
  if (isNaN(nacimiento.getTime())) return '';
  const hoy = new Date();
  let anios = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();
  if (hoy.getDate() < nacimiento.getDate()) meses--;
  if (meses < 0) { anios--; meses += 12; }
  if (anios <= 0) return meses <= 0 ? 'Recien nacido' : meses + (meses === 1 ? ' mes' : ' meses');
  return anios + (anios === 1 ? ' año' : ' años') + (meses > 0 ? ' y ' + meses + (meses === 1 ? ' mes' : ' meses') : '');
}

function initialsOf(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
}


import { Person, DefaultRestaurantConfig, DailyServiceConfig, Reservation, DailyServiceDayConfig } from '../types';

// --- Constants for localStorage keys (used by simulator) ---
const DEFAULT_CONFIG_KEY = 'restaurantDefaultConfig';
const DAILY_SERVICE_CONFIG_KEY = 'restaurantDailyServiceConfig';
const RESERVATIONS_KEY = 'restaurantReservations';

// --- Base URL for the real backend API ---
// const API_BASE_URL = 'http://localhost:5000/api'; // Ajusta això a la URL del teu backend

// --- Helper to generate unique IDs for simulated data ---
const generateUniqueId = (prefix: string = 'item'): string => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// --- In-memory cache / initial load from localStorage (FOR SIMULATOR ONLY) ---
let localDefaultConfig: DefaultRestaurantConfig | null = null;
let localDailyServiceConfig: DailyServiceConfig = {};
let localReservations: Reservation[] = [];
let dataInitialized = false;

const initializeSimulatedData = () => {
  if (dataInitialized) return;

  const storedDefaultConfig = localStorage.getItem(DEFAULT_CONFIG_KEY);
  localDefaultConfig = storedDefaultConfig ? JSON.parse(storedDefaultConfig) : null;

  const storedDailyConfig = localStorage.getItem(DAILY_SERVICE_CONFIG_KEY);
  localDailyServiceConfig = storedDailyConfig ? JSON.parse(storedDailyConfig) : {};

  const storedReservations = localStorage.getItem(RESERVATIONS_KEY);
  localReservations = storedReservations ? JSON.parse(storedReservations) : [];
  
  dataInitialized = true;
  console.log("API (Simulat): Dades inicialitzades des de localStorage o per defecte.");
};

// --- People ---
// Per ara, les persones es mantenen simulades al frontend.
// Si es mouen al backend, aquestes funcions farien crides a /api/people.
const reservableNames: string[] = [
  "Ana Pérez (ana.perez@example.com)", "Carlos López (carlos.lopez@example.com)", "Sofía Gómez (sofia.gomez@example.com)", "Luis Rodríguez (luis.rodriguez@example.com)", "Elena Fernández (elena.fernandez@example.com)",
];
const additionalAttendableNames: string[] = [
  "Lucía Torres (lucia.torres@example.com)", "David Ruiz (david.ruiz@example.com)", "Paula Jiménez (paula.jimenez@example.com)", "Daniel Vázquez (daniel.vazquez@example.com)", "Sara Castillo (sara.castillo@example.com)",
];
let reservablePeopleCache: Person[] = [];
let attendablePeopleCache: Person[] = [];

const parseNameAndEmail = (nameWithEmail: string): { name: string, email?: string } => {
  const match = nameWithEmail.match(/(.+?)\s?\(?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?\)?/);
  if (match) {
    return { name: match[1].trim(), email: match[2] };
  }
  return { name: nameWithEmail.trim() };
};

const generatePeople = (namesWithEmails: string[]): Person[] => {
  return namesWithEmails.map((rawName) => {
    const { name, email } = parseNameAndEmail(rawName);
    return { id: generateUniqueId('person'), name, email };
  });
};

export const fetchReservablePeople = async (): Promise<Person[]> => {
  initializeSimulatedData();
  if (reservablePeopleCache.length === 0) {
    reservablePeopleCache = generatePeople(reservableNames);
  }
  // ----- REAL API CALL (Example) -----
  // try {
  //   const response = await fetch(`${API_BASE_URL}/people?role=reservable`);
  //   if (!response.ok) throw new Error(`Error en obtenir persones reservables: ${response.statusText}`);
  //   reservablePeopleCache = await response.json();
  //   return reservablePeopleCache;
  // } catch (error) {
  //   console.error("Error fetching reservable people from API:", error);
  //   // Fallback to simulator or throw error
  //   addNotification('error', 'No s\'han pogut carregar les persones que poden reservar des del servidor.');
  //   throw error; // O retornar simulades:
  //   // if (reservablePeopleCache.length === 0) reservablePeopleCache = generatePeople(reservableNames);
  //   // return [...reservablePeopleCache];
  // }
  return new Promise(resolve => setTimeout(() => resolve([...reservablePeopleCache]), 50));
};

export const fetchAttendablePeople = async (): Promise<Person[]> => {
  initializeSimulatedData();
  if (attendablePeopleCache.length === 0) {
    const allNames = Array.from(new Set([...reservableNames, ...additionalAttendableNames]));
    attendablePeopleCache = generatePeople(allNames);
  }
  // ----- REAL API CALL (Example) -----
  // try {
  //   const response = await fetch(`${API_BASE_URL}/people?role=attendable`); // O un endpoint /api/people/all
  //   if (!response.ok) throw new Error(`Error en obtenir persones assistents: ${response.statusText}`);
  //   attendablePeopleCache = await response.json();
  //   return attendablePeopleCache;
  // } catch (error) {
  //   console.error("Error fetching attendable people from API:", error);
  //   // addNotification('error', 'No s\'han pogut carregar les persones assistents des del servidor.');
  //   throw error; // O retornar simulades:
  //   // if (attendablePeopleCache.length === 0) {
  //   //   const allNames = Array.from(new Set([...reservableNames, ...additionalAttendableNames]));
  //   //   attendablePeopleCache = generatePeople(allNames);
  //   // }
  //   // return [...attendablePeopleCache];
  // }
  return new Promise(resolve => setTimeout(() => resolve([...attendablePeopleCache]), 50));
};


// --- Default Config ---
export const getDefaultConfig = async (): Promise<DefaultRestaurantConfig | null> => {
  initializeSimulatedData();
  // ----- REAL API CALL -----
  // try {
  //   const response = await fetch(`${API_BASE_URL}/configuration/default`);
  //   if (response.status === 404) return null;
  //   if (!response.ok) throw new Error(`Error en obtenir configuració per defecte: ${response.statusText}`);
  //   return await response.json();
  // } catch (error) {
  //   console.error("Error fetching default config from API:", error);
  //   throw error;
  // }
  return new Promise(resolve => setTimeout(() => resolve(localDefaultConfig ? {...localDefaultConfig} : null), 50));
};

export const saveDefaultConfig = async (config: DefaultRestaurantConfig): Promise<DefaultRestaurantConfig> => {
  initializeSimulatedData();
  // ----- REAL API CALL -----
  // try {
  //   const response = await fetch(`${API_BASE_URL}/configuration/default`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(config),
  //   });
  //   if (!response.ok) throw new Error(`Error en desar configuració per defecte: ${response.statusText}`);
  //   return await response.json();
  // } catch (error) {
  //   console.error("Error saving default config to API:", error);
  //   throw error;
  // }
  localDefaultConfig = { ...config };
  localStorage.setItem(DEFAULT_CONFIG_KEY, JSON.stringify(localDefaultConfig));
  return new Promise(resolve => setTimeout(() => resolve({ ...localDefaultConfig! }), 50));
};

// --- Daily Service Config ---
export const getDailyServiceConfig = async (): Promise<DailyServiceConfig> => {
  initializeSimulatedData();
  // ----- REAL API CALL -----
  // try {
  //   const response = await fetch(`${API_BASE_URL}/configuration/daily`);
  //   if (!response.ok) throw new Error(`Error en obtenir configuració diària: ${response.statusText}`);
  //   return await response.json();
  // } catch (error) {
  //   console.error("Error fetching daily config from API:", error);
  //   throw error;
  // }
  return new Promise(resolve => setTimeout(() => resolve({ ...localDailyServiceConfig }), 50));
};

export const saveDailyServiceConfig = async (updatedDailyConfigsData: DailyServiceDayConfig[]): Promise<DailyServiceConfig> => {
  initializeSimulatedData();
  // ----- REAL API CALL -----
  // try {
  //   // El backend podria esperar DailyServiceDayConfig[] i retornar DailyServiceConfig
  //   const response = await fetch(`${API_BASE_URL}/configuration/daily`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(updatedDailyConfigsData), // Envia l'array complet de DailyServiceDayConfig
  //   });
  //   if (!response.ok) throw new Error(`Error en desar configuració diària: ${response.statusText}`);
  //   return await response.json(); // El backend hauria de retornar el DailyServiceConfig actualitzat
  // } catch (error) {
  //   console.error("Error saving daily config to API:", error);
  //   throw error;
  // }
  const newDailyConfig: DailyServiceConfig = {};
  updatedDailyConfigsData.forEach(dayConfig => {
    const { date, reservedSeatsCount, reservationsOnDayCount, ...rest } = dayConfig;
    newDailyConfig[date] = rest;
  });
  localDailyServiceConfig = newDailyConfig;
  localStorage.setItem(DAILY_SERVICE_CONFIG_KEY, JSON.stringify(localDailyServiceConfig));
  return new Promise(resolve => setTimeout(() => resolve({ ...localDailyServiceConfig }), 50));
};

// --- Reservations ---
interface GetReservationsFilters {
  date?: string;
  reservedById?: string;
  attendeeId?: string;
  month?: string; // YYYY-MM
  includeCancelled?: boolean;
}

export const getReservations = async (filters?: GetReservationsFilters): Promise<Reservation[]> => {
  initializeSimulatedData();
  // ----- REAL API CALL -----
  // try {
  //   const queryParams = new URLSearchParams();
  //   if (filters?.date) queryParams.append('date', filters.date);
  //   if (filters?.reservedById) queryParams.append('reservedById', filters.reservedById);
  //   if (filters?.attendeeId) queryParams.append('attendeeId', filters.attendeeId);
  //   if (filters?.month) queryParams.append('month', filters.month);
  //   if (filters?.includeCancelled) queryParams.append('includeCancelled', filters.includeCancelled.toString());
  //   
  //   const response = await fetch(`${API_BASE_URL}/reservations?${queryParams.toString()}`);
  //   if (!response.ok) throw new Error(`Error en obtenir reserves: ${response.statusText}`);
  //   return await response.json();
  // } catch (error) {
  //   console.error("Error fetching reservations from API:", error);
  //   throw error;
  // }
  
  // Simulador amb filtre bàsic per data si es proveeix
  let filteredSimulatedReservations = [...localReservations.map(r => ({...r}))];
  if (filters?.date) {
    filteredSimulatedReservations = filteredSimulatedReservations.filter(r => r.date === filters.date);
  }
  // Altres filtres es podrien implementar aquí per a la simulació si cal
  return new Promise(resolve => setTimeout(() => resolve(filteredSimulatedReservations), 50));
};

// DTO per a crear/actualitzar reserva, incloent opcions d'email
export interface ReservationSubmitData extends Omit<Reservation, 'id' | 'cancellationReason'> {
  sendEmailNotification?: boolean;
  customEmailMessage?: string;
}

export const addReservation = async (reservationData: ReservationSubmitData): Promise<Reservation> => {
  initializeSimulatedData();
  // ----- REAL API CALL -----
  // try {
  //   const response = await fetch(`${API_BASE_URL}/reservations`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(reservationData), // Envia totes les dades, incloent les d'email
  //   });
  //   if (!response.ok) throw new Error(`Error en afegir reserva: ${response.statusText}`);
  //   return await response.json(); // El backend retorna la reserva completa amb ID
  // } catch (error) {
  //   console.error("Error adding reservation to API:", error);
  //   throw error;
  // }
  const newReservation: Reservation = {
    ...(reservationData as Omit<Reservation, 'id'>), // Cast per a simulador
    id: generateUniqueId('res'),
  };
  localReservations.push(newReservation);
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(localReservations));
  return new Promise(resolve => setTimeout(() => resolve({ ...newReservation }), 50));
};

export const updateReservation = async (reservationToUpdate: ReservationSubmitData & {id: string} ): Promise<Reservation> => {
  initializeSimulatedData();
  // ----- REAL API CALL -----
  // try {
  //   const response = await fetch(`${API_BASE_URL}/reservations/${reservationToUpdate.id}`, {
  //     method: 'PUT',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(reservationToUpdate),
  //   });
  //   if (!response.ok) throw new Error(`Error en actualitzar reserva: ${response.statusText}`);
  //   return await response.json();
  // } catch (error) {
  //   console.error("Error updating reservation in API:", error);
  //   throw error;
  // }
  const index = localReservations.findIndex(r => r.id === reservationToUpdate.id);
  if (index !== -1) {
    localReservations[index] = { ...(reservationToUpdate as Reservation) }; // Cast per a simulador
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(localReservations));
    return new Promise(resolve => setTimeout(() => resolve({ ...localReservations[index] }), 50));
  }
  return Promise.reject(new Error("Reserva no trobada per actualitzar (simulador)."));
};

export const deleteReservation = async (reservationId: string, reason: string): Promise<void> => {
  initializeSimulatedData();
  // ----- REAL API CALL (Soft Delete) -----
  // try {
  //   const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}?reason=${encodeURIComponent(reason)}`, {
  //     method: 'DELETE',
  //   });
  //   // Per a DELETE, sovint es retorna 204 No Content si té èxit
  //   if (!response.ok && response.status !== 204) { 
  //     throw new Error(`Error en eliminar reserva: ${response.statusText}`);
  //   }
  //   // No hi ha cos JSON per a 204, així que no fem response.json()
  //   return Promise.resolve();
  // } catch (error) {
  //   console.error("Error deleting reservation in API:", error);
  //   throw error;
  // }

  // SIMULATOR: Implementa soft delete si vols, o manté eliminació física
  // Per ara, simulació d'eliminació física
  const initialLength = localReservations.length;
  // Per simular soft delete, hauries de trobar la reserva i marcar un camp 'isCancelled' i 'cancellationReason'
  localReservations = localReservations.filter(r => r.id !== reservationId);
  if (localReservations.length < initialLength) {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(localReservations));
    // Aquí podries afegir la lògica per marcar la reserva com a cancel·lada
    // Per exemple:
    // const resIndex = localReservations.findIndex(r => r.id === reservationId);
    // if (resIndex > -1) { 
    //   localReservations[resIndex].isCancelled = true; 
    //   localReservations[resIndex].cancellationReason = reason;
    // }
    return new Promise(resolve => setTimeout(resolve, 50));
  }
  return Promise.reject(new Error("Reserva no trobada per eliminar (simulador)."));
};

// --- Reset ---
export const resetAllData = async (): Promise<void> => {
  // ----- REAL API CALL -----
  // try {
  //   const response = await fetch(`${API_BASE_URL}/admin/reset`, { method: 'POST' });
  //   if (!response.ok) throw new Error(`Error en restablir dades: ${response.statusText}`);
  //   return Promise.resolve();
  // } catch (error) {
  //   console.error("Error resetting data via API:", error);
  //   throw error;
  // }
  localStorage.removeItem(DEFAULT_CONFIG_KEY);
  localStorage.removeItem(DAILY_SERVICE_CONFIG_KEY);
  localStorage.removeItem(RESERVATIONS_KEY);
  
  localDefaultConfig = null;
  localDailyServiceConfig = {};
  localReservations = [];
  reservablePeopleCache = [];
  attendablePeopleCache = [];
  dataInitialized = false;
  
  return new Promise(resolve => setTimeout(resolve, 50));
};

// Helper per a notificacions (opcional, si App.tsx no ho gestiona)
// export const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
//   // Aquesta funció hauria de ser injectada o gestionada per l'estat global de l'aplicació (com ja fas a App.tsx)
//   console.log(`[Notification-${type}]: ${message}`);
// };
    
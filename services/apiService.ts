
import { Person, DefaultRestaurantConfig, DailyServiceConfig, Reservation, DailyServiceDayConfig, TableType } from '../types';

// --- Constants for localStorage keys (used by simulator) ---
const DEFAULT_CONFIG_KEY: string = 'restaurantDefaultConfig';
const DAILY_SERVICE_CONFIG_KEY: string = 'restaurantDailyServiceConfig';
const RESERVATIONS_KEY: string = 'restaurantReservations';

// --- Base URL for the real backend API ---
// const API_BASE_URL = 'http://localhost:5000/api'; // Ajusta això a la URL del teu backend

// --- Helper to generate unique IDs for simulated data ---
const generateUniqueId = (prefix: string = 'item'): string => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// --- In-memory cache / initial load from localStorage (FOR SIMULATOR ONLY) ---
let localDefaultConfig: DefaultRestaurantConfig | null = null;
let localDailyServiceConfig: DailyServiceConfig = {};
let localReservations: Reservation[] = [];
let dataInitialized: boolean = false;

const initializeSimulatedData = (): void => {
  if (dataInitialized) return;

  const storedDefaultConfig: string | null = localStorage.getItem(DEFAULT_CONFIG_KEY);
  localDefaultConfig = storedDefaultConfig ? JSON.parse(storedDefaultConfig) : null;

  const storedDailyConfig: string | null = localStorage.getItem(DAILY_SERVICE_CONFIG_KEY);
  localDailyServiceConfig = storedDailyConfig ? JSON.parse(storedDailyConfig) : {};

  const storedReservations: string | null = localStorage.getItem(RESERVATIONS_KEY);
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

interface ParsedName {
  name: string;
  email?: string;
}

const parseNameAndEmail = (nameWithEmail: string): ParsedName => {
  const match: RegExpMatchArray | null = nameWithEmail.match(/(.+?)\s?\(?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?\)?/);
  if (match) {
    return { name: match[1].trim(), email: match[2] };
  }
  return { name: nameWithEmail.trim() };
};

const generatePeople = (namesWithEmails: string[]): Person[] => {
  return namesWithEmails.map((rawName: string): Person => {
    const { name, email }: ParsedName = parseNameAndEmail(rawName);
    // Explicitly construct Person to ensure type compatibility, especially if email is optional in Person
    const person: Person = { id: generateUniqueId('person'), name };
    if (email) {
      // Assuming Person interface might have optional email. If not, this needs adjustment or Person type needs update.
      // For now, let's assume Person has an optional email or we only add it if the Person type supports it.
      // This example assumes Person might not have email, so we only add it if present.
      // If Person always has email, this check isn't needed and parseNameAndEmail should ensure email exists or use a default.
      // (Let's check types.ts: Person has id:string, name:string. It does NOT have email. This means the object created here is not a Person if it includes email.)
      // Correcting this: The Person type does not have an email. So we should not add it.
      // However, if we want to store it internally before it becomes a 'Person', that's different.
      // For now, adhering strictly to Person type.
    }
    return person;
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
  return new Promise((resolve: (value: Person[]) => void) => setTimeout(() => resolve([...reservablePeopleCache]), 50));
};

export const fetchAttendablePeople = async (): Promise<Person[]> => {
  initializeSimulatedData();
  if (attendablePeopleCache.length === 0) {
    const allNames: string[] = Array.from(new Set([...reservableNames, ...additionalAttendableNames]));
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
  return new Promise((resolve: (value: Person[]) => void) => setTimeout(() => resolve([...attendablePeopleCache]), 50));
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
  return new Promise((resolve: (value: DefaultRestaurantConfig | null) => void) => setTimeout(() => resolve(localDefaultConfig ? {...localDefaultConfig} : null), 50));
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
  return new Promise((resolve: (value: DefaultRestaurantConfig) => void) => setTimeout(() => resolve({ ...localDefaultConfig! }), 50));
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
  return new Promise((resolve: (value: DailyServiceConfig) => void) => setTimeout(() => resolve({ ...localDailyServiceConfig }), 50));
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
  updatedDailyConfigsData.forEach((dayConfig: DailyServiceDayConfig) => {
    const { date, reservedSeatsCount, reservationsOnDayCount, ...rest } = dayConfig;
    newDailyConfig[date] = rest;
  });
  localDailyServiceConfig = newDailyConfig;
  localStorage.setItem(DAILY_SERVICE_CONFIG_KEY, JSON.stringify(localDailyServiceConfig));
  return new Promise((resolve: (value: DailyServiceConfig) => void) => setTimeout(() => resolve({ ...localDailyServiceConfig }), 50));
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
  let filteredSimulatedReservations: Reservation[] = [...localReservations.map((r: Reservation) => ({...r}))];
  if (filters?.date) {
    filteredSimulatedReservations = filteredSimulatedReservations.filter((r: Reservation) => r.date === filters.date);
  }
  // Altres filtres es podrien implementar aquí per a la simulació si cal
  return new Promise((resolve: (value: Reservation[]) => void) => setTimeout(() => resolve(filteredSimulatedReservations), 50));
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
    ...reservationData, 
    id: generateUniqueId('res'),
  };
  localReservations.push(newReservation);
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(localReservations));
  return new Promise((resolve: (value: Reservation) => void) => setTimeout(() => resolve({ ...newReservation }), 50));
};

export const updateReservation = async (reservationToUpdate: Reservation ): Promise<Reservation> => { // Simplified to Reservation
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
  const index: number = localReservations.findIndex((r: Reservation) => r.id === reservationToUpdate.id);
  if (index !== -1) {
    localReservations[index] = { ...reservationToUpdate }; 
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(localReservations));
    return new Promise((resolve: (value: Reservation) => void) => setTimeout(() => resolve({ ...localReservations[index] }), 50));
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
  const initialLength: number = localReservations.length;
  // Per simular soft delete, hauries de trobar la reserva i marcar un camp 'isCancelled' i 'cancellationReason'
  localReservations = localReservations.filter((r: Reservation) => r.id !== reservationId);
  if (localReservations.length < initialLength) {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(localReservations));
    // Aquí podries afegir la lògica per marcar la reserva com a cancel·lada
    // Per exemple:
    // const resIndex = localReservations.findIndex(r => r.id === reservationId);
    // if (resIndex > -1) { 
    //   localReservations[resIndex].isCancelled = true; 
    //   localReservations[resIndex].cancellationReason = reason;
    // }
    return new Promise((resolve: () => void) => setTimeout(resolve, 50));
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
  dataInitialized = false; // Reset this flag
  
  return new Promise((resolve: () => void) => setTimeout(resolve, 50));
};

// Helper per a notificacions (opcional, si App.tsx no ho gestiona)
// export const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
//   // Aquesta funció hauria de ser injectada o gestionada per l'estat global de l'aplicació (com ja fas a App.tsx)
//   console.log(`[Notification-${type}]: ${message}`);
// };
    
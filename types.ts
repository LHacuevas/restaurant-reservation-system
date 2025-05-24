export interface Person {
  id: string;
  name: string;
}

export enum TableType {
  FOUR_SEATER = 4,
  SIX_SEATER = 6,
}

export interface Table {
  id: string;
  capacity: TableType;
  name: string; 
}

export interface Reservation {
  id: string;
  tableId: string;
  date: string; // YYYY-MM-DD
  reservedById: string; 
  attendeeIds: string[];
  isClosedByUser: boolean; // User explicitly closed it
  notes?: string;
  cancellationReason?: string; // Opcional per futur
}

// Represents the default configuration for table numbers if no daily override exists
export interface DefaultRestaurantConfig {
  fourSeaterTables: number;
  sixSeaterTables: number;
}

// Represents the specific configuration for a single day
export interface DailyServiceDayConfig {
  date: string; // YYYY-MM-DD
  isActive: boolean;
  fourSeaterTables: number;
  sixSeaterTables: number;
  // Per visualització a ServiceDayConfigurator
  reservedSeatsCount?: number; 
  reservationsOnDayCount?: number;
}

export type DailyServiceConfig = Record<string, Omit<DailyServiceDayConfig, 'date' | 'reservedSeatsCount' | 'reservationsOnDayCount'>>;


export interface NotificationMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type AppView = 'setup' | 'booking' | 'configureServiceDays' | 'searchReservations' | 'newReservationFinder'; 

// Props per ReservationModal
export interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reservationDetails: Omit<Reservation, 'id'>) => void;
  table: Table | null;
  date: string | null;
  reservablePeople: Person[];
  attendablePeople: Person[];
  existingReservation?: Reservation | null;
  allReservations: Reservation[]; 
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void; 
}

// Props per ServiceDayConfigurator
export interface ServiceDayConfiguratorProps {
  defaultConfig: DefaultRestaurantConfig;
  existingDailyConfig: DailyServiceConfig;
  reservations: Reservation[]; 
  onSave: (updatedDailyConfigs: DailyServiceDayConfig[]) => void;
  onResetApp: () => void;
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

// Props per NewReservationFinder
export interface NewReservationFinderProps {
  dailyServiceConfig: DailyServiceConfig;
  defaultConfig: DefaultRestaurantConfig | null;
  reservations: Reservation[];
  // Canviat per navegar a BookingSystem amb la data i els comensals
  onViewDayAvailability: (date: string, numGuests: number) => void; 
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  // Aquests es podrien eliminar si no s'utilitzen directament al cercador
  // reservablePeople: Person[]; 
  // attendablePeople: Person[];
}

// Props per SearchReservations
export interface SearchReservationsProps {
  reservations: Reservation[];
  reservablePeople: Person[];
  attendablePeople: Person[];
  onEditReservation: (reservation: Reservation) => void;
  onViewDayBookings: (date: string) => void; 
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  dailyServiceConfig: DailyServiceConfig; 
  defaultConfig: DefaultRestaurantConfig | null; 
}

// Props per BookingSystem
export interface BookingSystemProps {
  defaultConfig: DefaultRestaurantConfig | null;
  dailyServiceConfig: DailyServiceConfig;
  reservations: Reservation[];
  reservablePeople: Person[];
  attendablePeople: Person[];
  onMakeReservation: (table: Table, date: string) => void;
  onEditReservation: (reservation: Reservation) => void;
  onDeleteReservation: (reservationId: string, reason?: string) => void; // Motiu opcional
  onNavigateToConfig: () => void;
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  initialDate?: string; 
  initialGuests?: number; // Per pre-seleccionar o informar del context de la cerca
}

// Props per TableCard
export interface TableCardProps {
  table: Table;
  reservation?: Reservation;
  onBook: () => void;
  onEdit: () => void;
  onDelete: () => void;
  reservablePeople: Person[];
  attendablePeople: Person[]; // Afegit per mostrar noms d'assistents
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  message: string;
  promptLabel?: string; // Etiqueta per al camp del motiu
  showPrompt?: boolean; // Si es mostra o no el camp del motiu
  confirmButtonText?: string;
  cancelButtonText?: string;
}
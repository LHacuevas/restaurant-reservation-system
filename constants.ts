// 0 = Diumenge, 1 = Dilluns, ..., 6 = Dissabte
// Aquesta constant pot ser utilitzada com a suggeriment inicial per la configuració de dies,
// però la font de veritat seran les configuracions diàries.
export const SUGGESTED_AVAILABLE_DAYS_OF_WEEK: number[] = [2, 4]; // Dimarts, Dijous

export const MAX_UPCOMING_DAYS_TO_SHOW_IN_CONFIG = 30; // Mostra els propers 30 dies a la configuració
export const MAX_UPCOMING_DAYS_TO_SHOW_IN_BOOKING = 60; // Mostra els propers 60 dies disponibles per reservar (incrementat)

export const DEFAULT_SHIFT_NAME = "Sopar";

export const APP_TITLE = "ReservaTaula";

export const VIEW_TITLES = {
  setup: "Configuració Inicial del Restaurant",
  booking: "Sistema de Reserves",
  configureServiceDays: "Configurar Dies de Servei i Taules",
  newReservationFinder: "Cercar Llocs Lliures", // Actualitzat
  searchReservations: "Cercar Reserves Existents", // Actualitzat
};

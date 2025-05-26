
import React, { useState, useMemo } from 'react';
import { DailyServiceConfig, DefaultRestaurantConfig, Reservation, Table, TableType } from '../types';
import { VIEW_TITLES, MAX_UPCOMING_DAYS_TO_SHOW_IN_BOOKING, SUGGESTED_AVAILABLE_DAYS_OF_WEEK } from '../constants';
import { SearchIcon, CalendarIcon, InformationCircleIcon, PlusCircleIcon } from './icons'; 
import type { NewReservationFinderProps } from '../types';

const formatDateToYYYYMMDD = (date: Date): string => date.toISOString().split('T')[0];

const generateTablesForDay = (date: string, daySpecificConfig?: Omit<DailyServiceConfig[string], 'isActive'>, defaultConfig?: DefaultRestaurantConfig): Table[] => {
  const tables: Table[] = [];
  let fourSeaters = 0;
  let sixSeaters = 0;
  const configToUse = daySpecificConfig || defaultConfig;
  if (configToUse) {
    fourSeaters = configToUse.fourSeaterTables;
    sixSeaters = configToUse.sixSeaterTables;
  }
  for (let i = 0; i < fourSeaters; i++) {
    tables.push({ id: `${date}_4s_${i + 1}`, capacity: TableType.FOUR_SEATER, name: `Taula F${i + 1} (4p)` });
  }
  for (let i = 0; i < sixSeaters; i++) {
    tables.push({ id: `${date}_6s_${i + 1}`, capacity: TableType.SIX_SEATER, name: `Taula S${i + 1} (6p)` });
  }
  return tables;
};

export const NewReservationFinder: React.FC<NewReservationFinderProps> = ({
  dailyServiceConfig,
  defaultConfig,
  reservations,
  onViewDayAvailability, // Canviat de onInitiateReservation
  addNotification,
}) => {
  const [numGuests, setNumGuests] = useState<string>('2');
  const [preferEmptyTable, setPreferEmptyTable] = useState<boolean>(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]); // Array de dates (string YYYY-MM-DD)
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const guests = parseInt(numGuests, 10);
    if (isNaN(guests) || guests <= 0) {
      addNotification('error', 'Si us plau, introduïu un nombre de comensals vàlid.');
      return;
    }
    if (guests > 20) {
        addNotification('error', 'La cerca està limitada a un màxim de 20 comensals.');
        return;
    }

    const foundDates: Set<string> = new Set(); // Utilitzar Set per evitar duplicats
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 0; i < MAX_UPCOMING_DAYS_TO_SHOW_IN_BOOKING; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dateStr = formatDateToYYYYMMDD(currentDate);

      const dayConfig = dailyServiceConfig[dateStr];
      let isActiveToday = false;
      let tablesForThisDay: Table[] = [];

      if (dayConfig && dayConfig.isActive) {
        isActiveToday = true;
        tablesForThisDay = generateTablesForDay(dateStr, dayConfig, defaultConfig || undefined);
      } else if (!dayConfig && defaultConfig) {
        const dayOfWeek = currentDate.getDay();
        if (SUGGESTED_AVAILABLE_DAYS_OF_WEEK.includes(dayOfWeek)) {
          isActiveToday = true;
          tablesForThisDay = generateTablesForDay(dateStr, undefined, defaultConfig);
        }
      }

      if (isActiveToday) {
        for (const table of tablesForThisDay) {
          if (table.capacity >= guests) {
            const reservationOnTable: Reservation | undefined = reservations.find((r: Reservation) => r.date === dateStr && r.tableId === table.id);
            if (preferEmptyTable) {
              if (!reservationOnTable) {
                foundDates.add(dateStr);
                break; // N'hi ha prou amb una taula per marcar el dia com a disponible
              }
            } else {
              if (!reservationOnTable || (!reservationOnTable.isClosedByUser && (table.capacity - reservationOnTable.attendeeIds.length >= guests))) {
                foundDates.add(dateStr);
                break; 
              }
            }
          }
        }
      }
    }
    setAvailableDates(Array.from(foundDates).sort()); // Convertir a array i ordenar
    setSearchPerformed(true);
    if (foundDates.size === 0) {
        addNotification('info', 'No s\'han trobat dies amb taules disponibles per als criteris seleccionats.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto"> {/* Reduït max-w per a una vista més centrada */}
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2 flex items-center">
            <SearchIcon className="w-8 h-8 mr-3 text-indigo-600" />
            {VIEW_TITLES.newReservationFinder}
          </h1>
          <p className="text-gray-600 mb-6">Trobeu dies amb disponibilitat per a la vostra visita.</p>

          <form onSubmit={handleSearch} className="space-y-4 p-4 border border-indigo-200 rounded-lg bg-indigo-50 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label htmlFor="numGuests" className="block text-sm font-medium text-gray-700">Nombre de Comensals</label>
                <input
                  type="number"
                  id="numGuests"
                  value={numGuests}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumGuests(e.target.value)}
                  min="1"
                  max="20" 
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="relative flex items-start pt-2 md:pt-0 md:self-center md:mt-5"> {/* Alineació vertical */}
                  <div className="flex h-6 items-center">
                  <input
                      id="preferEmptyTable"
                      type="checkbox"
                      checked={preferEmptyTable}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreferEmptyTable(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                      <label htmlFor="preferEmptyTable" className="font-medium text-gray-700">Prefereixo taula buida</label>
                  </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <SearchIcon className="w-5 h-5 mr-2" />
              Cercar Dies Disponibles
            </button>
          </form>

          {searchPerformed && availableDates.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-gray-800">Dies amb Disponibilitat:</h2>
              <ul className="space-y-2">
                {availableDates.map((date: string) => (
                  <li key={date}>
                    <button
                      onClick={() => onViewDayAvailability(date, parseInt(numGuests, 10))}
                      className="w-full text-left flex items-center justify-between p-3 bg-green-100 hover:bg-green-200 rounded-md border border-green-300 text-green-800 hover:text-green-900 transition-colors"
                    >
                      <span className="font-medium">
                        {new Date(date + 'T00:00:00').toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <span className="flex items-center text-sm">
                        Veure Taules <PlusCircleIcon className="w-4 h-4 ml-1.5" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {searchPerformed && availableDates.length === 0 && (
             <div className="text-center py-10">
                <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-xl text-gray-700">Cap dia disponible.</p>
                <p className="text-sm text-gray-500">Proveu d'ajustar els criteris de cerca.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Reservation, Person, DailyServiceConfig, DefaultRestaurantConfig, TableType } from '../types';
import { VIEW_TITLES } from '../constants';
import { SearchIcon, UsersIcon, CalendarIcon, PencilIcon, InformationCircleIcon } from './icons'; 
import type { SearchReservationsProps } from '../types';


const getTableNameFromId = (tableId: string, date: string, dailyConfig: DailyServiceConfig, defaultConfig: DefaultRestaurantConfig | null): string => {
    const dayConf: DailyServiceConfig[string] | undefined = dailyConfig[date];
    const configToUse: DefaultRestaurantConfig | DailyServiceConfig[string] | null | undefined = dayConf?.isActive ? dayConf : defaultConfig;

    if (configToUse) {
        const parts = tableId.split('_'); 
        if (parts.length === 3) {
            const type = parts[1];
            const num = parts[2];
            if (type === '4s') return `Taula F${num} (4p)`;
            if (type === '6s') return `Taula S${num} (6p)`;
        }
    }
    const nameOnly = tableId.replace(`${date}_`, '');
    const capacityMatch = nameOnly.match(/\((\d+)p\)/);
    return capacityMatch ? nameOnly : `${nameOnly} (capacitat desconeguda)`;
};


export const SearchReservations: React.FC<SearchReservationsProps> = ({
  reservations,
  reservablePeople,
  attendablePeople,
  onEditReservation,
  onViewDayBookings,
  addNotification,
  dailyServiceConfig,
  defaultConfig,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>('');
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  const allPeopleMap = useMemo((): Map<string, string> => {
    const map = new Map<string, string>();
    reservablePeople.forEach((p: Person) => map.set(p.id, p.name));
    attendablePeople.forEach((p: Person) => map.set(p.id, p.name)); 
    return map;
  }, [reservablePeople, attendablePeople]);

  const filteredReservations = useMemo((): Reservation[] => {
    if (!searchPerformed) return [];
    if (!searchTerm && !searchDate) return []; 

    return reservations.filter((res: Reservation) => {
      let matchName: boolean = true;
      if (searchTerm) {
        const lowerSearchTerm: string = searchTerm.toLowerCase();
        const reservedByName: string | undefined = allPeopleMap.get(res.reservedById)?.toLowerCase();
        const attendeesNames: (string | undefined)[] = res.attendeeIds.map((id: string) => allPeopleMap.get(id)?.toLowerCase());
        
        matchName = (reservedByName?.includes(lowerSearchTerm) || 
                     attendeesNames.some((name?: string) => name?.includes(lowerSearchTerm))) ?? false;
      }
      
      let matchDate: boolean = true;
      if (searchDate) {
        matchDate = res.date === searchDate;
      }
      
      return matchName && matchDate;
    });
  }, [searchTerm, searchDate, reservations, allPeopleMap, searchPerformed]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
     if (!searchTerm && !searchDate) {
      addNotification('info', 'Si us plau, introduïu un terme de cerca o seleccioneu una data.');
      setSearchPerformed(false); 
      return;
    }
    setSearchPerformed(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8"> {/* Fons més clar */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2 flex items-center">
            <SearchIcon className="w-8 h-8 mr-3 text-indigo-600" />
            {VIEW_TITLES.searchReservations}
          </h1>
          <p className="text-gray-700 mb-6">Cerqueu reserves existents per nom o data.</p> {/* Text més fosc */}

          <form onSubmit={handleSearch} className="space-y-4 p-4 border border-indigo-300 rounded-lg bg-indigo-100 mb-8"> {/* Vora i fons amb més contrast */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-800">Nom del Comensal / Qui Reserva</label> {/* Text més fosc */}
                <input
                  type="text"
                  id="searchTerm"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-600 sm:text-sm text-gray-900" /* Vora i text més foscos */
                  placeholder="p.ex., Ana Pérez"
                />
              </div>
              <div>
                <label htmlFor="searchDate" className="block text-sm font-medium text-gray-800">Data de la Reserva</label> {/* Text més fosc */}
                <input
                  type="date"
                  id="searchDate"
                  value={searchDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-600 sm:text-sm text-gray-900" /* Vora i text més foscos */
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <SearchIcon className="w-5 h-5 mr-2" />
              Cercar Reserves
            </button>
          </form>

          {searchPerformed && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resultats ({filteredReservations.length}):</h2> {/* Text més fosc */}
              {filteredReservations.length > 0 ? (
                <ul className="space-y-4">
                  {filteredReservations.map((res: Reservation) => (
                    <li key={res.id} className="p-4 border border-gray-300 rounded-md shadow-sm bg-white hover:shadow-lg transition-shadow"> {/* Vora més visible */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                        <div>
                            <p className="text-lg font-semibold text-indigo-800"> {/* Text més fosc */}
                                {getTableNameFromId(res.tableId, res.date, dailyServiceConfig, defaultConfig)}
                            </p>
                            <p className="text-sm text-gray-700"> {/* Text més fosc */}
                                {new Date(res.date + 'T00:00:00').toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex space-x-2">
                            <button
                                onClick={() => onEditReservation(res)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center"
                                title="Modificar Reserva"
                            >
                                <PencilIcon className="w-4 h-4 mr-1" /> Modificar
                            </button>
                            <button
                                onClick={() => onViewDayBookings(res.date)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center" /* Text més fosc per a millor contrast */
                                title="Veure Ocupació del Dia"
                            >
                                <CalendarIcon className="w-4 h-4 mr-1" /> Veure Dia
                            </button>
                        </div>
                      </div>
                      <div className="text-sm space-y-1 mt-1 pt-2 border-t border-gray-300 text-gray-800"> {/* Text més fosc per defecte */}
                        <p><span className="font-medium text-gray-900">Feta per:</span> {allPeopleMap.get(res.reservedById) || 'Desconegut'}</p>
                        <p><span className="font-medium text-gray-900">Assistents ({res.attendeeIds.length}):</span> {res.attendeeIds.map((id: string) => allPeopleMap.get(id) || 'Desconegut').join(', ')}</p>
                        {res.isClosedByUser && <p className="text-red-700 font-medium">Taula tancada per l'usuari.</p>} {/* Text més fosc */}
                        {res.notes && <p><span className="font-medium text-gray-900">Notes:</span> <span className="italic">{res.notes}</span></p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-10">
                    <InformationCircleIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" /> {/* Color d'icona més fosc */}
                    <p className="text-xl text-gray-700">No s'han trobat reserves amb aquests criteris.</p> {/* Text més fosc */}
                    <p className="text-sm text-gray-600">Intenteu ampliar la cerca o revisar els termes introduïts.</p> {/* Text més fosc */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
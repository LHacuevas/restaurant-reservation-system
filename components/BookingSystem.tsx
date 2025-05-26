
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Person, Reservation, Table, TableType, DefaultRestaurantConfig, DailyServiceConfig, DailyServiceDayConfig } from '../types';
import { MAX_UPCOMING_DAYS_TO_SHOW_IN_BOOKING, DEFAULT_SHIFT_NAME, APP_TITLE, SUGGESTED_AVAILABLE_DAYS_OF_WEEK } from '../constants';
import { UsersIcon, CalendarIcon, TimeIcon, PencilIcon, TrashIcon, PlusCircleIcon, TableIcon, WrenchScrewdriverIcon as ConfigIcon, InformationCircleIcon } from './icons'; 
import type { BookingSystemProps, TableCardProps } from '../types'; 
import { ConfirmationModal } from './ConfirmationModal';

// Define the TableWithReservation interface at the module level
interface TableWithReservation extends Table {
  reservation?: Reservation;
}

const formatDateToYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const generateTablesForDay = (date: string, daySpecificConfig?: Omit<DailyServiceDayConfig, 'date' | 'isActive' | 'reservedSeatsCount' | 'reservationsOnDayCount'>, defaultConfig?: DefaultRestaurantConfig): Table[] => {
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


const TableCard: React.FC<TableCardProps> = ({ 
  table, 
  reservation, 
  onBook, 
  onEdit, 
  onDelete, 
  reservablePeople,
  attendablePeople 
}) => {
  
  const reservedByPerson: Person | null = reservation ? reservablePeople.find(p => p.id === reservation.reservedById) || null : null;
  const attendeeCount: number = reservation ? reservation.attendeeIds.length : 0;

  const isFullyBooked: boolean = !!reservation && (reservation.isClosedByUser || attendeeCount >= table.capacity);

  const attendeeNameList = useMemo(() => {
    if (!reservation) return [];
    return reservation.attendeeIds
      .map((id: string) => attendablePeople.find(p => p.id === id)?.name)
      .filter((name): name is string => !!name); 
  }, [reservation, attendablePeople]);

  return (
    <div className={`rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all duration-300 ease-in-out transform hover:shadow-xl hover:-translate-y-1 ${
        isFullyBooked ? 'bg-red-200 border-red-500' : 
        reservation ? 'bg-yellow-200 border-yellow-500' : 
        'bg-green-200 border-green-500' 
      } border-2`}
    >
      <div>
        <div className="flex items-center mb-2">
          <TableIcon className={`w-7 h-7 mr-2 ${isFullyBooked ? 'text-red-700' : reservation ? 'text-yellow-700' : 'text-green-700'}`} /> 
          <h3 className="text-xl font-semibold text-gray-900">{table.name}</h3> 
        </div>
        <p className="text-sm text-gray-800 mb-1 flex items-center"> 
          <UsersIcon className="w-4 h-4 mr-1.5 text-gray-600" /> Capacitat: {table.capacity} persones
        </p>
        
        {reservation ? (
          <>
            <p className={`text-sm font-medium ${isFullyBooked ? 'text-red-800' : 'text-yellow-800'}`}> 
              {isFullyBooked ? 'Reservada (Completa)' : 'Parcialment Reservada'} ({attendeeCount}/{table.capacity})
            </p>
            {reservedByPerson && <p className="text-xs text-gray-700 mt-1">Per: {reservedByPerson.name}</p>} 
            {attendeeNameList.length > 0 && (
              <div className="mt-1">
                <p className="text-xs text-gray-700">Comensals:</p> 
                {attendeeNameList.map((name, index) => (
                  <div key={index} className="text-xs text-gray-700 ml-2 truncate" title={name}>- {name}</div> 
                ))}
              </div>
            )}
            {reservation.isClosedByUser && <p className="text-xs text-red-700 mt-1 font-semibold">Taula Tancada per l'Usuari</p>}
            {reservation.notes && <p className="text-xs text-gray-700 mt-1 italic">Notes: <span className="text-gray-800">{reservation.notes.substring(0,30)}{reservation.notes.length > 30 ? '...' : ''}</span></p>}
             <div className="mt-3 pt-3 border-t border-gray-400 flex space-x-2"> 
              <button 
                onClick={onEdit}
                className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md flex items-center justify-center"
                aria-label={`Editar reserva per ${table.name}`}
              >
                <PencilIcon className="w-3 h-3 mr-1" /> Editar
              </button>
              <button 
                onClick={onDelete} 
                className="flex-1 text-xs bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-3 rounded-md flex items-center justify-center"
                 aria-label={`Eliminar reserva per ${table.name}`}
              >
                <TrashIcon className="w-3 h-3 mr-1" /> Eliminar
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-green-800 font-medium">Disponible</p> 
        )}
      </div>
      {!reservation && (
        <button
          onClick={onBook}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 flex items-center justify-center"
          aria-label={`Reservar ${table.name}`}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2"/> Reservar Taula
        </button>
      )}
    </div>
  );
};


export const BookingSystem: React.FC<BookingSystemProps> = ({
  defaultConfig,
  dailyServiceConfig,
  reservations,
  reservablePeople,
  attendablePeople,
  onMakeReservation,
  onEditReservation,
  onDeleteReservation,
  onNavigateToConfig,
  addNotification,
  initialDate,
  initialGuests, 
}) => {
  const upcomingActiveDates = useMemo((): string[] => {
    const dates: string[] = [];
    let currentDate = new Date(); // Changed to let as it's modified
    currentDate.setHours(0, 0, 0, 0); 

    for (let i = 0; i < (MAX_UPCOMING_DAYS_TO_SHOW_IN_BOOKING * 2) + 30 && dates.length < MAX_UPCOMING_DAYS_TO_SHOW_IN_BOOKING; i++) {
      const dateStrToTest = formatDateToYYYYMMDD(currentDate);
      const dailyConf = dailyServiceConfig[dateStrToTest];
      
      let isActiveToday = false;
      if (dailyConf) { 
        isActiveToday = dailyConf.isActive;
      } else if (defaultConfig) { 
        const dayOfWeek = currentDate.getDay();
        isActiveToday = SUGGESTED_AVAILABLE_DAYS_OF_WEEK.includes(dayOfWeek);
      }

      if (isActiveToday) {
        dates.push(dateStrToTest);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, [dailyServiceConfig, defaultConfig]);
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialDate && upcomingActiveDates.includes(initialDate)) {
      return initialDate;
    }
    if (upcomingActiveDates.length > 0) {
      return upcomingActiveDates[0];
    }
    return '';
  });

  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState<boolean>(false);
  const [reservationToDeleteId, setReservationToDeleteId] = useState<string | null>(null);
  const [tableDetailsForDeletePrompt, setTableDetailsForDeletePrompt] = useState<{ name: string; date: string } | null>(null);


  useEffect(() => {
    let newSelectedDate = selectedDate;
    let dateChanged = false;

    if (initialDate && upcomingActiveDates.includes(initialDate)) {
        if (newSelectedDate !== initialDate) {
            newSelectedDate = initialDate;
            dateChanged = true;
        }
    } else if (upcomingActiveDates.length > 0) {
        if (!newSelectedDate || !upcomingActiveDates.includes(newSelectedDate)) {
            newSelectedDate = upcomingActiveDates[0];
            dateChanged = true;
        }
    } else if (upcomingActiveDates.length === 0 && newSelectedDate) {
        newSelectedDate = ''; 
        dateChanged = true;
    }

    if (dateChanged) {
        setSelectedDate(newSelectedDate);
    }
  }, [upcomingActiveDates, initialDate, selectedDate]);


  const tablesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    const dayConfigFromDaily: DailyServiceDayConfig | undefined = dailyServiceConfig[selectedDate];
    let tables: Table[];

    if (dayConfigFromDaily && dayConfigFromDaily.isActive) {
        tables = generateTablesForDay(selectedDate, dayConfigFromDaily, defaultConfig || undefined);
    } else if (!dayConfigFromDaily && defaultConfig) {
        const dateObj: Date = new Date(selectedDate + 'T00:00:00');
        const dayOfWeek: number = dateObj.getDay();
        if (SUGGESTED_AVAILABLE_DAYS_OF_WEEK.includes(dayOfWeek)) {
            tables = generateTablesForDay(selectedDate, undefined, defaultConfig);
        } else {
            tables = []; 
        }
    } else {
        tables = []; 
    }
    
    return tables.map((table: Table): TableWithReservation => {
      const reservation: Reservation | undefined = reservations.find(r => r.tableId === table.id && r.date === selectedDate);
      return { ...table, reservation };
    });
  }, [selectedDate, dailyServiceConfig, defaultConfig, reservations]);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleBookTable = useCallback((tableId: string) => {
    const tableData: TableWithReservation | undefined = tablesForSelectedDate.find(t => t.id === tableId);
    if (tableData && selectedDate) {
      // onMakeReservation expects a Table, not TableWithReservation.
      // We need to ensure we pass only the Table properties.
      const { reservation, ...tableOnlyData } = tableData;
      onMakeReservation(tableOnlyData, selectedDate);
    }
  }, [tablesForSelectedDate, selectedDate, onMakeReservation]);

  const handleEditExistingReservation = useCallback((tableId: string) => {
     const tableData: TableWithReservation | undefined = tablesForSelectedDate.find(t => t.id === tableId);
     if (tableData && tableData.reservation) {
        onEditReservation(tableData.reservation);
     }
  }, [tablesForSelectedDate, onEditReservation]);

  const handleDeleteExistingReservation = useCallback((tableId: string) => {
    const tableData: TableWithReservation | undefined = tablesForSelectedDate.find(t => t.id === tableId);
    if (tableData && tableData.reservation) {
      setReservationToDeleteId(tableData.reservation.id);
      setTableDetailsForDeletePrompt({ name: tableData.name, date: new Date(selectedDate + 'T00:00:00').toLocaleDateString('ca-ES')});
      setIsDeleteConfirmModalOpen(true);
    } else {
        console.warn(`[Delete] No reservation found for tableId: ${tableId} on selectedDate: ${selectedDate}`);
        addNotification('error', 'No s\'ha trobat la reserva per eliminar o la taula no existeix.');
    }
  }, [selectedDate, tablesForSelectedDate, addNotification]);

  const handleConfirmDelete = (reason: string) => {
    if (reservationToDeleteId) {
      if (!reason.trim()) {
         // The modal itself should handle this, but as a fallback or if modal changes
         addNotification('error', 'Cal indicar un motiu per eliminar la reserva.');
         setIsDeleteConfirmModalOpen(true); // Keep modal open or re-open if alert used in modal
         return;
      }
      onDeleteReservation(reservationToDeleteId, reason);
      setReservationToDeleteId(null);
      setTableDetailsForDeletePrompt(null);
      setIsDeleteConfirmModalOpen(false);
    }
  };


  if (!defaultConfig) {
     return (
      <div className="p-8 text-center text-gray-700">
        <p className="text-xl">La configuració per defecte del restaurant no està definida.</p>
        <button 
            onClick={onNavigateToConfig}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
            Anar a Configuració Inicial
        </button>
      </div>
     );
  }

  if (upcomingActiveDates.length === 0 && !selectedDate) {
    return (
      <div className="p-8 text-center text-gray-700">
        <p className="text-xl">No hi ha propers dies de servei configurats o actius.</p>
        <p className="mt-2">Podeu configurar els dies de servei i el nombre de taules a la secció de configuració.</p>
         <button 
            onClick={onNavigateToConfig}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
        >
            <ConfigIcon className="w-4 h-4 mr-2"/> Configurar Dies de Servei
        </button>
      </div>
    );
  }
  
  if (!selectedDate && upcomingActiveDates.length > 0) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-xl text-gray-600 animate-pulse">Carregant dates disponibles...</p></div>;
  }

  const currentDayEffectiveConfig: Pick<DailyServiceDayConfig, 'fourSeaterTables' | 'sixSeaterTables'> | Pick<DefaultRestaurantConfig, 'fourSeaterTables' | 'sixSeaterTables'> | null = 
    selectedDate && dailyServiceConfig[selectedDate]?.isActive 
      ? dailyServiceConfig[selectedDate]
      : (selectedDate && defaultConfig && SUGGESTED_AVAILABLE_DAYS_OF_WEEK.includes(new Date(selectedDate + 'T00:00:00').getDay()) 
          ? defaultConfig 
          : null);

  const numFourSeaters: number = currentDayEffectiveConfig?.fourSeaterTables || 0;
  const numSixSeaters: number = currentDayEffectiveConfig?.sixSeaterTables || 0;
  const totalTablesForDay = tablesForSelectedDate.length;

  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => {
          setIsDeleteConfirmModalOpen(false);
          setReservationToDeleteId(null);
          setTableDetailsForDeletePrompt(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminació de Reserva"
        message={`Segur que voleu eliminar la reserva per a ${tableDetailsForDeletePrompt?.name || 'aquesta taula'} el ${tableDetailsForDeletePrompt?.date || 'aquesta data'}?\nAquesta acció no es pot desfer.`}
        showPrompt={true}
        promptLabel="Motiu de l'eliminació (obligatori):"
        confirmButtonText="Sí, Eliminar Reserva"
      />
      <div className="min-h-screen bg-slate-50"> 
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-500" /> 
                </div>
                <select
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full md:w-auto pl-10 pr-4 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-600 text-gray-800 bg-white hover:bg-gray-50" 
                  aria-label="Selecciona una data"
                >
                  {upcomingActiveDates.map(dateStr => (
                    <option key={dateStr} value={dateStr}>
                      {new Date(dateStr + 'T00:00:00').toLocaleDateString('ca-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>
               <button
                  onClick={onNavigateToConfig}
                  className="w-full md:w-auto px-4 py-2 text-sm font-medium text-indigo-700 border border-indigo-700 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
              >
                  <ConfigIcon className="w-4 h-4 mr-2"/> Configurar Dies
              </button>
          </div>

          {initialGuests && selectedDate && (
               <div className="mb-6 p-3 bg-blue-100 border border-blue-400 rounded-lg shadow text-center"> 
                  <p className="text-sm text-blue-800 flex items-center justify-center"> 
                      <InformationCircleIcon className="w-5 h-5 mr-2"/>
                      Mostrant disponibilitat per a una cerca de <strong>{initialGuests} comensal{initialGuests > 1 ? 's' : ''}</strong> per al dia seleccionat.
                  </p>
              </div>
          )}

          {selectedDate ? (
          <div className="mb-6 p-4 bg-indigo-200 rounded-lg shadow"> 
            <h2 className="text-xl font-semibold text-indigo-900 flex items-center"> 
              <TimeIcon className="w-6 h-6 mr-2 text-indigo-800" /> 
              Disponibilitat per a: <span className="ml-2 font-bold">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span> ({DEFAULT_SHIFT_NAME})
            </h2>
             {currentDayEffectiveConfig ? (
              <p className="text-sm text-indigo-800 mt-1"> 
                  Mostrant {totalTablesForDay} taules: {numFourSeaters} x 4-persones, {numSixSeaters} x 6-persones.
              </p>
              ) : (
              <p className="text-sm text-red-800 mt-1">Aquest dia no té servei actiu configurat.</p> 
              )}
          </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-200 rounded-lg shadow"> 
               <p className="text-lg text-yellow-900">Si us plau, seleccioneu una data per veure la disponibilitat de taules.</p> 
            </div>
          )}

          {selectedDate && tablesForSelectedDate.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {tablesForSelectedDate.map((tableItem: TableWithReservation) => (
                <TableCard
                  key={tableItem.id}
                  table={{id: tableItem.id, capacity: tableItem.capacity, name: tableItem.name}} // Pass only Table properties
                  reservation={tableItem.reservation}
                  onBook={() => handleBookTable(tableItem.id)}
                  onEdit={() => handleEditExistingReservation(tableItem.id)}
                  onDelete={() => handleDeleteExistingReservation(tableItem.id)}
                  reservablePeople={reservablePeople}
                  attendablePeople={attendablePeople} 
                />
              ))}
            </div>
          ) : selectedDate ? (
            <div className="text-center py-12">
              <TableIcon className="w-16 h-16 text-gray-500 mx-auto mb-4"/> 
              <p className="text-xl text-gray-800">No hi ha taules configurades o actives per a aquest dia.</p> 
              <p className="text-sm text-gray-600 mt-1">Comproveu la configuració de dies de servei o seleccioneu una altra data.</p> 
            </div>
          ) : null}
        </main>
        <footer className="py-8 text-center border-t border-gray-300 bg-slate-100"> 
          <p className="text-sm text-gray-700">&copy; {new Date().getFullYear()} {APP_TITLE}. Tots els drets reservats.</p> 
        </footer>
      </div>
    </>
  );
};

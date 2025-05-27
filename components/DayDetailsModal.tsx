import React, { useState } from 'react'; // Added useState
import { DailyServiceDayConfig, DefaultRestaurantConfig, Reservation, Person, Table, TableType } from '../types';
import { UsersIcon, PrinterIcon } from './icons'; 
import { PrintableDayDetails } from './PrintableDayDetails'; // Added import

// Helper function (can be moved to utils later if shared with BookingSystem.tsx)
// NOTE: This version is slightly adapted. BookingSystem's version takes an Omit<...> for daySpecificConfig
const generateTablesForDayInModal = (
    date: string, 
    daySpecificConfig: DailyServiceDayConfig, 
    defaultConfig: DefaultRestaurantConfig
): Table[] => {
    const tables: Table[] = [];
    let fourSeaters = 0;
    let sixSeaters = 0;

    // Use daySpecificConfig if active, otherwise default if daySpecificConfig implies it should use default (e.g. isActive but 0 tables)
    // For this modal, we assume dayConfig is the one to use if it's active.
    if (daySpecificConfig.isActive) {
        fourSeaters = daySpecificConfig.fourSeaterTables;
        sixSeaters = daySpecificConfig.sixSeaterTables;
    } else { // If the day is not active as per its own config, show no tables from it
        // This case might need refinement based on whether we want to show default tables on an inactive specifically configured day
        return []; 
    }
    // Fallback to default if daySpecificConfig has 0 tables but is active (though UI should prevent this)
    // Or if daySpecificConfig is not provided (not the case here as it's a required prop)

    for (let i = 0; i < fourSeaters; i++) {
        tables.push({ id: `${date}_4s_${i + 1}`, capacity: TableType.FOUR_SEATER, name: `Taula F${i + 1} (4p)` });
    }
    for (let i = 0; i < sixSeaters; i++) {
        tables.push({ id: `${date}_6s_${i + 1}`, capacity: TableType.SIX_SEATER, name: `Taula S${i + 1} (6p)` });
    }
    return tables;
};


export interface DayDetailsModalProps {
  dayConfig: DailyServiceDayConfig;
  defaultRestaurantConfig: DefaultRestaurantConfig; // Keep for generateTables logic consistency
  allReservationsForDate: Reservation[];
  reservablePeople: Person[];
  attendablePeople: Person[];
  onClose: () => void;
  onPrint: () => void; // Added for future print functionality
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  dayConfig,
  defaultRestaurantConfig,
  allReservationsForDate,
  reservablePeople,
  attendablePeople,
  onClose,
  onPrint, // This prop will be called after print dialog, if needed for parent notification
}) => {
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const tablesForDay = generateTablesForDayInModal(dayConfig.date, dayConfig, defaultRestaurantConfig);

  const getPersonNameById = (id: string, peopleList: Person[]): string => {
    return peopleList.find(p => p.id === id)?.name || 'Desconegut';
  };

  const handlePrintClick = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      if (onPrint) { // Call the original onPrint prop if it exists, e.g. for parent notification
        onPrint();
      }
    }, 100); // Timeout to allow state to update and component to re-render for printing
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto no-print"> {/* Added no-print to main overlay */}
      <div className={`bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full flex flex-col ${isPrinting ? 'overflow-visible max-h-none printable-modal-content' : 'max-h-[90vh]'}`}>
        {isPrinting ? (
            <PrintableDayDetails
                dayConfig={dayConfig}
                tablesForDay={tablesForDay}
                allReservationsForDate={allReservationsForDate}
                reservablePeople={reservablePeople}
                attendablePeople={attendablePeople}
            />
        ) : (
            <> {/* Original modal content wrapped in a fragment */}
                <div className="no-print flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        Detalls del Dia: {new Date(dayConfig.date + 'T00:00:00').toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>

                <div className="no-print flex-grow overflow-y-auto space-y-4 pr-2">
                     {tablesForDay.length === 0 && <p className="text-gray-600">No hi ha taules configurades o el servei no està actiu per a aquest dia.</p>}
                      {tablesForDay.map(table => {
                        const reservation = allReservationsForDate.find(r => r.tableId === table.id);
                        const reservedBy = reservation ? getPersonNameById(reservation.reservedById, reservablePeople) : null;
                        const attendees = reservation ? reservation.attendeeIds.map(id => getPersonNameById(id, attendablePeople)) : [];
            
                        return (
                          <div key={table.id} className="p-3 border rounded-md shadow-sm bg-gray-50">
                            <h3 className="text-lg font-semibold text-indigo-700">{table.name} (Capacitat: {table.capacity})</h3>
                            {reservation ? (
                              <div className="mt-1 text-sm">
                                <p><strong className="text-gray-700">Estat:</strong> <span className="font-medium text-red-600">Reservada</span></p>
                                <p><strong className="text-gray-700">Reservada per:</strong> {reservedBy}</p>
                                {attendees.length > 0 && (
                                  <div>
                                    <strong className="text-gray-700">Comensals ({attendees.length}):</strong>
                                    <ul className="list-disc list-inside ml-4">
                                      {attendees.map((name, index) => <li key={index} className="text-gray-600">{name}</li>)}
                                    </ul>
                                  </div>
                                )}
                                {reservation.isClosedByUser && <p className="text-xs text-red-700 mt-1 font-semibold">Taula Tancada per l'Usuari</p>}
                                {reservation.notes && <p><strong className="text-gray-700">Notes:</strong> <span className="italic text-gray-600">{reservation.notes}</span></p>}
                              </div>
                            ) : (
                              <p className="text-sm text-green-600 font-medium">Estat: Disponible</p>
                            )}
                          </div>
                        );
                      })}
                </div>

                <div className="no-print mt-6 pt-4 border-t flex justify-end space-x-3">
                    <button
                        onClick={handlePrintClick} 
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                    >
                        <PrinterIcon className="w-4 h-4 mr-2"/> Imprimir
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Tancar
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};


import React, { useState, useEffect, useMemo } from 'react';
import { DefaultRestaurantConfig, DailyServiceConfig, DailyServiceDayConfig, Reservation, TableType } from '../types';
import { MAX_UPCOMING_DAYS_TO_SHOW_IN_CONFIG, SUGGESTED_AVAILABLE_DAYS_OF_WEEK, APP_TITLE, VIEW_TITLES } from '../constants';
import { CalendarIcon, CheckCircleIcon, XCircleIcon, TrashIcon, CogIcon, UsersIcon } from './icons';
import type { ServiceDayConfiguratorProps } from '../types'; 

const formatDateToYYYYMMDD = (date: Date): string => date.toISOString().split('T')[0];

export const ServiceDayConfigurator: React.FC<ServiceDayConfiguratorProps> = ({
  defaultConfig,
  existingDailyConfig,
  reservations,
  onSave,
  onResetApp,
  addNotification,
}) => {
  const [dailyConfigs, setDailyConfigs] = useState<DailyServiceDayConfig[]>([]);
  const [selectedDayForDetails, setSelectedDayForDetails] = useState<DailyServiceDayConfig | null>(null);

  useEffect(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const initialConfigs: DailyServiceDayConfig[] = [];

    for (let i = 0; i < MAX_UPCOMING_DAYS_TO_SHOW_IN_CONFIG; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr: string = formatDateToYYYYMMDD(date);
      const existing: Omit<DailyServiceDayConfig, "date" | "reservedSeatsCount" | "reservationsOnDayCount"> | undefined = existingDailyConfig[dateStr];

      const reservationsOnThisDay: Reservation[] = reservations.filter((r: Reservation) => r.date === dateStr);
      const reservedSeats: number = reservationsOnThisDay.reduce((sum: number, r: Reservation) => sum + r.attendeeIds.length, 0);
      
      if (existing) {
        initialConfigs.push({
          date: dateStr,
          isActive: existing.isActive,
          fourSeaterTables: existing.fourSeaterTables,
          sixSeaterTables: existing.sixSeaterTables,
          reservedSeatsCount: reservedSeats,
          reservationsOnDayCount: reservationsOnThisDay.length,
        });
      } else {
        const dayOfWeek = date.getDay();
        initialConfigs.push({
          date: dateStr,
          isActive: SUGGESTED_AVAILABLE_DAYS_OF_WEEK.includes(dayOfWeek),
          fourSeaterTables: defaultConfig.fourSeaterTables,
          sixSeaterTables: defaultConfig.sixSeaterTables,
          reservedSeatsCount: reservedSeats,
          reservationsOnDayCount: reservationsOnThisDay.length,
        });
      }
    }
    setDailyConfigs(initialConfigs);
  }, [defaultConfig, existingDailyConfig, reservations]);

  const handleDayConfigChange = (
    date: string, 
    field: keyof Omit<DailyServiceDayConfig, 'date' | 'reservedSeatsCount' | 'reservationsOnDayCount'>, 
    value: string | number | boolean
  ) => {
    const currentConfig = dailyConfigs.find(c => c.date === date);
    if (!currentConfig) return;

    if (field === 'isActive' && value === false && currentConfig.reservationsOnDayCount && currentConfig.reservationsOnDayCount > 0) {
      addNotification('error', `No es pot desactivar el dia ${new Date(date + 'T00:00:00').toLocaleDateString('ca-ES', {day: '2-digit', month: 'short'})} perquè té ${currentConfig.reservationsOnDayCount} reserva(s). Si us plau, cancel·leu les reserves primer.`);
      return;
    }

    if ((field === 'fourSeaterTables' || field === 'sixSeaterTables')) {
        const numericValue: number = Number(value);
        const originalTableCount: number = currentConfig[field as 'fourSeaterTables' | 'sixSeaterTables'];

        if (numericValue < originalTableCount) {
            const tableType: TableType = field === 'fourSeaterTables' ? TableType.FOUR_SEATER : TableType.SIX_SEATER;
            const capacityChar: string = field === 'fourSeaterTables' ? 'F' : 'S';
            
            for (let i: number = numericValue + 1; i <= originalTableCount; i++) {
                const tableIdToCheck: string = `${date}_${tableType === TableType.FOUR_SEATER ? '4s' : '6s'}_${i}`;
                const hasReservation: boolean = reservations.some((r: Reservation) => r.tableId === tableIdToCheck && r.date === date);
                if (hasReservation) {
                    addNotification('error', `No es pot reduir el nombre de taules de ${tableType} persones. La taula ${capacityChar}${i} té una reserva.`);
                    return; 
                }
            }
        }
    }

    setDailyConfigs((prevConfigs: DailyServiceDayConfig[]) =>
      prevConfigs.map((config: DailyServiceDayConfig) =>
        config.date === date ? { ...config, [field]: value } : config
      )
    );
  };

  const handleSaveChanges = () => {
    const updatedConfigsWithCounts: DailyServiceDayConfig[] = dailyConfigs.map((dc: DailyServiceDayConfig) => {
        const reservationsOnThisDay: Reservation[] = reservations.filter((r: Reservation) => r.date === dc.date);
        const reservedSeats: number = reservationsOnThisDay.reduce((sum: number, r: Reservation) => sum + r.attendeeIds.length, 0);
        return {
            ...dc,
            reservedSeatsCount: reservedSeats,
            reservationsOnDayCount: reservationsOnThisDay.length,
        };
    });
    onSave(updatedConfigsWithCounts); 
    addNotification('success', 'Configuració diària desada correctament!');
  };


  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-300"> {/* Vora més visible */}
            <div>
              <h1 className="text-3xl font-bold text-indigo-700 flex items-center">
                <CogIcon className="w-8 h-8 mr-3 text-indigo-600" />
                {VIEW_TITLES.configureServiceDays}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Gestioneu els dies de servei i el nombre de taules disponibles per a cada dia.
              </p>
            </div>
             <button
                onClick={onResetApp}
                title="Restablir tota l'aplicació (configuració i reserves)"
                className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
            >
                <TrashIcon className="w-4 h-4 mr-2"/> Restablir Aplicació
            </button>
          </div>

          <div className="space-y-6">
            {dailyConfigs.map((config: DailyServiceDayConfig) => {
              const reservationsInfo = config.isActive && (config.reservationsOnDayCount ?? 0) > 0 ? (
                  (<span className="text-xs flex items-center text-blue-800 bg-blue-200 px-2 py-0.5 rounded-full"> {/* Colors amb més contrast */}
                      <UsersIcon className="w-3 h-3 mr-1" />
                      {config.reservationsOnDayCount} reserva(s) / {config.reservedSeatsCount} comensal(s)
                  </span>)
              ) : null;

              const noReservationsInfo = config.isActive && (config.reservationsOnDayCount === 0 || config.reservationsOnDayCount === undefined) ? (
                  (<span className="text-xs text-gray-600">Cap reserva</span>) /* Text lleugerament més fosc */
              ) : null;

              return (
              <div key={config.date} className={`p-4 rounded-md border ${config.isActive ? 'bg-green-50 border-green-300' : 'bg-gray-100 border-gray-300'}`}> {/* Fons i vores més visibles */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {new Date(config.date + 'T00:00:00').toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}> {/* Colors amb més contrast */}
                        {config.isActive ? 'Servei Actiu' : 'Servei Inactiu'}
                        </span>

                        {reservationsInfo}
                        {noReservationsInfo}
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex-shrink-0">
                    <button
                      onClick={() => handleDayConfigChange(config.date, 'isActive', !config.isActive)}
                      className={`p-2 rounded-full transition-colors ${config.isActive ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-400 hover:bg-gray-500 text-white'}`} /* Millora de botó desactivat */
                      aria-label={config.isActive ? 'Desactivar servei per aquest dia' : 'Activar servei per aquest dia'}
                    >
                      {config.isActive ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setSelectedDayForDetails(config)}
                      className="ml-2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                      aria-label="Veure detalls del dia"
                    >
                      {/* Podrías usar un icono aquí si quieres, ej. <EyeIcon className="w-5 h-5" /> */}
                      Detalls
                    </button>
                  </div>
                </div>

                {config.isActive && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-dashed border-gray-300"> {/* Vora més visible */}
                    <div>
                      <label htmlFor={`four-${config.date}`} className="block text-sm font-medium text-gray-700">Taules de 4p:</label>
                      <input
                        type="number"
                        id={`four-${config.date}`}
                        value={config.fourSeaterTables}
                        min="0" max="30"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDayConfigChange(config.date, 'fourSeaterTables', parseInt(e.target.value, 10))}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor={`six-${config.date}`} className="block text-sm font-medium text-gray-700">Taules de 6p:</label>
                      <input
                        type="number"
                        id={`six-${config.date}`}
                        value={config.sixSeaterTables}
                         min="0" max="20"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDayConfigChange(config.date, 'sixSeaterTables', parseInt(e.target.value, 10))}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>

          {selectedDayForDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                <h2 className="text-xl font-bold mb-4">
                  Detalls del Dia: {new Date(selectedDayForDetails.date + 'T00:00:00').toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                {/* Aquí irá el contenido del DayDetailsModal */}
                <p>Mesas y reservas aparecerán aquí...</p>
                <button
                  onClick={() => setSelectedDayForDetails(null)}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Tancar
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-300 flex justify-end"> {/* Vora més visible */}
            <button
              onClick={handleSaveChanges}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-lg"
            >
              Desar Canvis de Configuració Diària
            </button>
          </div>
        </div>
         <footer className="mt-8 text-center">
            <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} {APP_TITLE}. Configurant el futur de les teves reserves.</p> {/* Text més fosc */}
        </footer>
      </div>
    </div>
  );
};
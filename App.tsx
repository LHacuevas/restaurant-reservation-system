
import React, { useState, useEffect, useCallback } from 'react';
import { DefaultRestaurantConfig, Table, TableType, Reservation, Person, NotificationMessage, DailyServiceConfig, AppView, DailyServiceDayConfig } from './types';
import * as apiService from './services/apiService'; // Import all from apiService
import { RestaurantSetup } from './components/RestaurantSetup';
import { BookingSystem } from './components/BookingSystem';
import { ReservationModal } from './components/ReservationModal';
import { ServiceDayConfigurator } from './components/ServiceDayConfigurator';
import { NewReservationFinder } from './components/NewReservationFinder';
import { SearchReservations } from './components/SearchReservations';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, TableIcon as AppIcon, CogIcon, CalendarIcon as BookingIcon, SearchIcon, PlusCircleIcon as NewBookingIcon } from './components/icons'; 
import { APP_TITLE, VIEW_TITLES } from './constants';


const App: React.FC = () => {
  const [defaultTableConfig, setDefaultTableConfig] = useState<DefaultRestaurantConfig | null>(null);
  const [dailyServiceConfig, setDailyServiceConfig] = useState<DailyServiceConfig>({});
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  const [reservablePeople, setReservablePeople] = useState<Person[]>([]);
  const [attendablePeople, setAttendablePeople] = useState<Person[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentReservationTarget, setCurrentReservationTarget] = useState<{ table: Table; date: string } | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const [currentView, setCurrentView] = useState<AppView>('booking'); // Default to booking
  const [selectedDateForBookingSystem, setSelectedDateForBookingSystem] = useState<string | undefined>(undefined);
  const [numGuestsForBookingSystem, setNumGuestsForBookingSystem] = useState<number | undefined>(undefined);


  const addNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const newNotification = { id: Date.now(), type, message };
    setNotifications((prev: NotificationMessage[]) => [newNotification, ...prev.slice(0, 2)]); 
    setTimeout(() => {
      setNotifications((prev: NotificationMessage[]) => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // await apiService.initializeData(); // Ensure initialized if not done by individual calls
        const [
            defConfig, 
            dailyConf, 
            reservs, 
            resPeople, 
            attPeople
        ]: [
            DefaultRestaurantConfig | null, 
            DailyServiceConfig, 
            Reservation[], 
            Person[], 
            Person[]
        ] = await Promise.all([
          apiService.getDefaultConfig(),
          apiService.getDailyServiceConfig(),
          apiService.getReservations(),
          apiService.fetchReservablePeople(),
          apiService.fetchAttendablePeople()
        ]);
        
        setDefaultTableConfig(defConfig);
        setDailyServiceConfig(dailyConf);
        setReservations(reservs);
        setReservablePeople(resPeople);
        setAttendablePeople(attPeople);
        setError(null);

        if (!defConfig) {
          setCurrentView('setup');
        } else if (currentView === 'setup' && defConfig) {
            setCurrentView('configureServiceDays');
        } else {
            // If config exists, try to restore last known view or default to booking
            const lastView = localStorage.getItem('lastAppView') as AppView | null;
            setCurrentView(lastView || 'booking');
        }

      } catch (err: unknown) {
        console.error("Error en carregar dades inicials:", err);
        const errorMessage = err instanceof Error ? err.message : "No s'han pogut carregar les dades.";
        setError(`No s'han pogut carregar les dades necessàries: ${errorMessage}`);
        addNotification('error', `Error en carregar dades inicials: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [addNotification]); // currentView removed from deps as it's set inside


  // Persist currentView to localStorage
  useEffect(() => {
    if (currentView !== 'setup') { // Don't save 'setup' as a persistent view
        localStorage.setItem('lastAppView', currentView);
    }
  }, [currentView]);


  const handleDefaultConfigSubmit = async (newConfig: DefaultRestaurantConfig) => {
    try {
      setIsLoading(true);
      const savedConfig = await apiService.saveDefaultConfig(newConfig);
      setDefaultTableConfig(savedConfig);
      addNotification('success', 'Configuració per defecte del restaurant desada!');
      setCurrentView('configureServiceDays'); 
    } catch (err: unknown) {
      addNotification('error', 'Error en desar la configuració per defecte.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDailyServiceConfigSave = async (updatedDailyConfigsData: DailyServiceDayConfig[]) => {
     try {
      setIsLoading(true);
      const savedDailyConfig = await apiService.saveDailyServiceConfig(updatedDailyConfigsData);
      setDailyServiceConfig(savedDailyConfig);
      addNotification('success', 'Configuració diària desada correctament!');
    } catch (err: unknown) {
      addNotification('error', 'Error en desar la configuració diària.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleResetApp = async () => {
    if (window.confirm("Segur que voleu restablir tota la configuració? Això esborrarà la configuració per defecte, la configuració diària i totes les reserves.")) {
        try {
            setIsLoading(true);
            await apiService.resetAllData();
            setDefaultTableConfig(null);
            setDailyServiceConfig({});
            setReservations([]);
            addNotification('info', 'Aplicació restablerta.');
            setCurrentView('setup');
            localStorage.removeItem('lastAppView');
        } catch (err: unknown) {
            addNotification('error', 'Error en restablir l\'aplicació.');
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handleOpenModalForNew = (table: Table, date: string) => {
    setCurrentReservationTarget({ table, date });
    setEditingReservation(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (reservation: Reservation) => {
    const dayConf: DailyServiceConfig[string] | undefined = dailyServiceConfig[reservation.date];
    // Use current defaultTableConfig from state
    const effectiveDefaultConfig: DefaultRestaurantConfig | null = defaultTableConfig; 
    const configForTableGeneration: DailyServiceConfig[string] | DefaultRestaurantConfig | null | undefined = dayConf?.isActive ? dayConf : effectiveDefaultConfig;

    let tableCapacity: TableType = TableType.FOUR_SEATER; 
    let tableNameSuffix: string = "";
    let tableNamePrefix: string ="Taula";

    if (configForTableGeneration) { 
        const tableIdParts: string[] = reservation.tableId.split('_'); 
        const typePart: string = tableIdParts.length > 1 ? tableIdParts[1] : ""; 
        const indexPart: string = tableIdParts.length > 2 ? tableIdParts[2] : "";

        if (typePart.startsWith('4s')) {
            tableCapacity = TableType.FOUR_SEATER;
            tableNameSuffix = `F${indexPart}`;
        } else if (typePart.startsWith('6s')) {
            tableCapacity = TableType.SIX_SEATER;
            tableNameSuffix = `S${indexPart}`;
        } else { 
           tableNamePrefix = reservation.tableId.split(' (')[0]; // Get name before capacity
           const nameMatch: RegExpMatchArray | null = reservation.tableId.match(/\((\d+)p\)/);
           if (nameMatch && nameMatch[1]) {
             tableCapacity = parseInt(nameMatch[1], 10) as TableType;
           }
        }
    } else { // Fallback if no config, try to parse from tableId itself (less reliable)
        const nameMatch: RegExpMatchArray | null = reservation.tableId.match(/\((\d+)p\)/);
        if (nameMatch && nameMatch[1]) {
           tableCapacity = parseInt(nameMatch[1], 10) as TableType;
        }
        tableNamePrefix = reservation.tableId.split(' (')[0];
    }
    
    const tableForModal: Table = {
        id: reservation.tableId,
        capacity: tableCapacity, 
        name: `${tableNamePrefix} ${tableNameSuffix} (${tableCapacity}p)`.replace(/\s+/g, ' ').trim() // Clean up potential double spaces
    };

    setCurrentReservationTarget({ table: tableForModal, date: reservation.date });
    setEditingReservation(reservation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentReservationTarget(null);
    setEditingReservation(null);
  };

  const handleReservationSubmit = async (reservationDetails: Omit<Reservation, 'id'>) => {
    setIsLoading(true);
    try {
      if (editingReservation) { 
          const updatedReservationData: Reservation = { ...reservationDetails, id: editingReservation.id };
          const updatedRes: Reservation = await apiService.updateReservation(updatedReservationData);
          setReservations((prev: Reservation[]) => 
              prev.map((r: Reservation) => r.id === updatedRes.id ? updatedRes : r)
          );
          addNotification('success', `Reserva per a ${currentReservationTarget?.table.name} actualitzada.`);
      } else { 
          const newReservation: Reservation = await apiService.addReservation(reservationDetails);
          setReservations((prev: Reservation[]) => [...prev, newReservation]);
          addNotification('success', `Taula ${currentReservationTarget?.table.name} reservada!`);
      }
      handleCloseModal();
    } catch (err: unknown) {
       addNotification('error', `Error en desar la reserva: ${err instanceof Error ? err.message : 'Error desconegut'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReservation = async (reservationId: string, reason?: string) => {
    setIsLoading(true);
    try {
        await apiService.deleteReservation(reservationId, reason || 'No especificat');
        setReservations((prev: Reservation[]) => prev.filter(r => r.id !== reservationId));
        addNotification('info', `Reserva eliminada. Motiu: ${reason || 'No especificat'}.`);
    } catch (err: unknown) {
        addNotification('error', `Error en eliminar la reserva: ${err instanceof Error ? err.message : 'Error desconegut'}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleNavigateToBookingSystemView = (date: string, numGuests?: number) => {
    setSelectedDateForBookingSystem(date); 
    setNumGuestsForBookingSystem(numGuests);
    setCurrentView('booking'); 
    const displayDate: Date = new Date(date+'T00:00:00');
    let message: string = `Mostrant reserves per al ${displayDate.toLocaleDateString('ca-ES', { day: 'numeric', month: 'long' })}`;
    if (numGuests) {
        message += ` (cerca per a ${numGuests} comensal${numGuests > 1 ? 's' : ''})`;
    }
    // addNotification('info', message + "."); // Potser massa sorollós per a cada navegació
  };
  
  // Handle loading states more gracefully
  if (isLoading && currentView === 'setup') { // Only full page loader for initial setup
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-xl text-gray-600 animate-pulse">Carregant Gestor de Restaurant...</p></div>;
  }
   if (isLoading && !defaultTableConfig && currentView !== 'setup') { // If still loading core config and not in setup
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-xl text-gray-600 animate-pulse">Carregant configuració...</p></div>;
  }


  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-red-50 p-4"><p className="text-xl text-red-600">{error}</p></div>;
  }
  
  const NotificationArea: React.FC<{}> = () => (
    <div className="fixed top-4 right-4 z-[100] w-full max-w-xs space-y-3">
      {notifications.map((notif: NotificationMessage) => {
        let bgColor: string, textColor: string, IconComponent: React.ElementType;
        switch (notif.type) {
          case 'success': bgColor = 'bg-green-600'; textColor = 'text-white'; IconComponent = CheckCircleIcon; break;
          case 'error': bgColor = 'bg-red-600'; textColor = 'text-white'; IconComponent = XCircleIcon; break;
          default: bgColor = 'bg-blue-600'; textColor = 'text-white'; IconComponent = InformationCircleIcon; break; // 'info' or other types
        }
        return (
          <div key={notif.id} className={`${bgColor} ${textColor} p-3 rounded-md shadow-lg flex items-start space-x-2 animate-fadeInOut`}>
            <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{notif.message}</p>
          </div>
        );
      })}
       <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );

  const renderView = (): JSX.Element | null => {
    if (isLoading && defaultTableConfig) { // Loading indicator if core config is loaded but other data might be fetching
        // Could be a subtle top bar loader, or just let components handle their specific loading if any
    }

    switch (currentView) {
      case 'setup':
        return <RestaurantSetup onConfigSubmit={handleDefaultConfigSubmit} initialConfig={defaultTableConfig || undefined} />;
      case 'configureServiceDays':
        if (!defaultTableConfig) return <RestaurantSetup onConfigSubmit={handleDefaultConfigSubmit} />;
        return <ServiceDayConfigurator 
                  defaultConfig={defaultTableConfig} 
                  existingDailyConfig={dailyServiceConfig} 
                  reservations={reservations}
                  reservablePeople={reservablePeople} 
                  attendablePeople={attendablePeople} 
                  onSave={handleDailyServiceConfigSave} 
                  onResetApp={handleResetApp}
                  addNotification={addNotification}
                />;
      case 'booking':
        if (!defaultTableConfig) return <RestaurantSetup onConfigSubmit={handleDefaultConfigSubmit} />;
        return (
          <BookingSystem
            key={selectedDateForBookingSystem} 
            defaultConfig={defaultTableConfig}
            dailyServiceConfig={dailyServiceConfig}
            reservations={reservations}
            reservablePeople={reservablePeople}
            attendablePeople={attendablePeople}
            onMakeReservation={handleOpenModalForNew}
            onEditReservation={handleOpenModalForEdit}
            onDeleteReservation={handleDeleteReservation}
            onNavigateToConfig={() => setCurrentView('configureServiceDays')}
            addNotification={addNotification}
            initialDate={selectedDateForBookingSystem} 
            initialGuests={numGuestsForBookingSystem}
          />
        );
      case 'newReservationFinder':
        if (!defaultTableConfig) return <RestaurantSetup onConfigSubmit={handleDefaultConfigSubmit} />;
        return <NewReservationFinder 
                  dailyServiceConfig={dailyServiceConfig}
                  defaultConfig={defaultTableConfig}
                  reservations={reservations}
                  onViewDayAvailability={handleNavigateToBookingSystemView}
                  addNotification={addNotification}
                />;
      case 'searchReservations':
        if (!defaultTableConfig) return <RestaurantSetup onConfigSubmit={handleDefaultConfigSubmit} />;
        return <SearchReservations 
                  reservations={reservations}
                  reservablePeople={reservablePeople}
                  attendablePeople={attendablePeople}
                  onEditReservation={handleOpenModalForEdit}
                  onViewDayBookings={handleNavigateToBookingSystemView}
                  addNotification={addNotification}
                  dailyServiceConfig={dailyServiceConfig}
                  defaultConfig={defaultTableConfig}
                />;
      default:
        // This case should ideally not be reached if logic is sound.
        // Fallback to setup if something unexpected happens.
        addNotification('error', `Vista desconeguda: ${currentView}. Redirigint a la configuració inicial.`);
        setCurrentView('setup'); 
        return <RestaurantSetup onConfigSubmit={handleDefaultConfigSubmit} />;
    }
  };
  
  interface NavButtonProps {
    view: AppView;
    label: string;
    icon?: React.ReactNode;
  }

  const NavButton: React.FC<NavButtonProps> = ({ view, label, icon }) => (
    <button
        onClick={() => {
          if (view === 'booking') {
            setSelectedDateForBookingSystem(undefined); 
            setNumGuestsForBookingSystem(undefined);
          }
          setCurrentView(view);
        }}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${currentView === view ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'}`}
        aria-current={currentView === view ? 'page' : undefined}
        title={label}
    >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
    </button>
  );

  return (
    <>
      <NotificationArea />
      {defaultTableConfig && currentView !== 'setup' && (
        <nav className="bg-indigo-600 shadow-lg sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <AppIcon className="h-8 w-8 text-white" />
                <span className="font-semibold text-xl text-white ml-2">{APP_TITLE}</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-1">
                  <NavButton view="booking" label={VIEW_TITLES.booking} icon={<BookingIcon className="w-5 h-5" />} />
                  <NavButton view="newReservationFinder" label={VIEW_TITLES.newReservationFinder} icon={<NewBookingIcon className="w-5 h-5" />} />
                  <NavButton view="searchReservations" label={VIEW_TITLES.searchReservations} icon={<SearchIcon className="w-5 h-5" />} />
                  <NavButton view="configureServiceDays" label={VIEW_TITLES.configureServiceDays} icon={<CogIcon className="w-5 h-5" />} />
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}
      <div className={defaultTableConfig && currentView !== 'setup' ? "mt-0" : ""}>
        {renderView()}
      </div>
      {isModalOpen && currentReservationTarget && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleReservationSubmit}
          table={currentReservationTarget.table}
          date={currentReservationTarget.date}
          reservablePeople={reservablePeople}
          attendablePeople={attendablePeople}
          existingReservation={editingReservation}
          allReservations={reservations} 
          addNotification={addNotification}
        />
      )}
    </>
  );
};

export default App;

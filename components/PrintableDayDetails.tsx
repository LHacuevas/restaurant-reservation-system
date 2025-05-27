import React from 'react';
import { DailyServiceDayConfig, Reservation, Person, Table } from '../types';

// Props will be similar to DayDetailsModal but might not need everything (e.g., onClose, onPrint functions)
// It will receive tablesForDay directly as it's processed in DayDetailsModal.
export interface PrintableDayDetailsProps {
  dayConfig: DailyServiceDayConfig;
  tablesForDay: Table[]; // Assuming tables are generated before passing to this component
  allReservationsForDate: Reservation[];
  reservablePeople: Person[];
  attendablePeople: Person[];
}

export const PrintableDayDetails: React.FC<PrintableDayDetailsProps> = ({
  dayConfig,
  tablesForDay,
  allReservationsForDate,
  reservablePeople,
  attendablePeople,
}) => {
  const getPersonNameById = (id: string, peopleList: Person[]): string => {
    return peopleList.find(p => p.id === id)?.name || 'Desconegut';
  };

  return (
    <div className="printable-content">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-content, .printable-content * {
              visibility: visible;
            }
            .printable-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1rem;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .no-print {
                display: none !important;
            }
          }
        `}
      </style>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Detalls del Dia: {new Date(dayConfig.date + 'T00:00:00').toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </h1>
      {tablesForDay.length === 0 && <p>No hi ha taules configurades o el servei no està actiu per a aquest dia.</p>}
      {tablesForDay.map(table => {
        const reservation = allReservationsForDate.find(r => r.tableId === table.id);
        const reservedBy = reservation ? getPersonNameById(reservation.reservedById, reservablePeople) : null;
        const attendees = reservation ? reservation.attendeeIds.map(id => getPersonNameById(id, attendablePeople)) : [];

        return (
          <div key={table.id} style={{ pageBreakInside: 'avoid', marginBottom: '15px', border: '1px solid #ccc', padding: '10px' }}>
            <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#333' }}>{table.name} (Capacitat: {table.capacity})</h3>
            {reservation ? (
              <div style={{ fontSize: '0.9em' }}>
                <p><strong>Estat:</strong> Reservada</p>
                <p><strong>Reservada per:</strong> {reservedBy}</p>
                {attendees.length > 0 && (
                  <div>
                    <strong>Comensals ({attendees.length}):</strong>
                    <ul style={{ listStyle: 'disc', marginLeft: '20px', paddingLeft: '0px' }}>
                      {attendees.map((name, index) => <li key={index}>{name}</li>)}
                    </ul>
                  </div>
                )}
                {reservation.isClosedByUser && <p style={{color: 'red', fontStyle: 'italic' }}>Taula Tancada per l'Usuari</p>}
                {reservation.notes && <p><strong>Notes:</strong> <em style={{whiteSpace: 'pre-wrap'}}>{reservation.notes}</em></p>}
              </div>
            ) : (
              <p style={{ fontSize: '0.9em', color: 'green' }}>Estat: Disponible</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
```


import React, { useState, useEffect } from 'react';
import { Person, Reservation, Table } from '../types';
import { PersonSelector } from './PersonSelector';
import { UsersIcon, XCircleIcon as RemoveIcon } from './icons'; 
import type { ReservationModalProps } from '../types'; 

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  table,
  date,
  reservablePeople,
  attendablePeople,
  existingReservation,
  allReservations, 
  addNotification,
}) => {
  const [reservedById, setReservedById] = useState<string>('');
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
  const [isClosedByUser, setIsClosedByUser] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (existingReservation) {
      setReservedById(existingReservation.reservedById);
      setAttendeeIds(existingReservation.attendeeIds);
      setIsClosedByUser(existingReservation.isClosedByUser);
      setNotes(existingReservation.notes || '');
    } else {
      setReservedById('');
      setAttendeeIds([]);
      setIsClosedByUser(false);
      setNotes('');
    }
  }, [existingReservation, isOpen]);

  if (!isOpen || !table || !date) return null;

  const handleAttendeeChange = (ids: string[]) => {
    setAttendeeIds(ids);
  };

  const removeAttendee = (idToRemove: string) => {
    setAttendeeIds(prevIds => prevIds.filter(id => id !== idToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservedById) {
      addNotification('error', 'Si us plau, seleccioneu qui fa la reserva.');
      return;
    }
    if (attendeeIds.length === 0) {
      addNotification('error', 'Si us plau, afegiu almenys un assistent.');
      return;
    }
    if (attendeeIds.length > table.capacity) {
      addNotification('error', `El nombre d'assistents (${attendeeIds.length}) no pot excedir la capacitat de la taula de ${table.capacity}.`);
      return;
    }

    const reservationsOnSameDate = allReservations.filter(
      r => r.date === date && r.id !== (existingReservation?.id || '')
    );

    for (const aid of attendeeIds) {
      const person = attendablePeople.find(p => p.id === aid);
      if (reservationsOnSameDate.some(r => r.attendeeIds.includes(aid))) {
        addNotification('error', `L'assistent ${person?.name || aid} ja té una altra reserva per a aquest dia (${new Date(date + 'T00:00:00').toLocaleDateString('ca-ES')}).`);
        return;
      }
    }

    onSubmit({
      tableId: table.id,
      date,
      reservedById,
      attendeeIds,
      isClosedByUser,
      notes,
    });
    onClose();
  };
  
  const currentCapacity = table.capacity as number;
  const selectedAttendees = attendablePeople.filter(p => attendeeIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="reservation-modal-title"> {/* Opacitat de fons lleugerament augmentada */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 id="reservation-modal-title" className="text-2xl font-semibold text-gray-800">
            {existingReservation ? 'Editar Reserva' : 'Nova Reserva'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-2xl" aria-label="Tancar modal">&times;</button> {/* Color de botó tancar més fosc */}
        </div>

        <div className="mb-4 p-3 bg-indigo-100 rounded-md border border-indigo-200"> {/* Vora afegida per a millor definició */}
          <p className="text-sm text-indigo-800"><span className="font-semibold">Taula:</span> {table.name}</p> {/* Text més fosc */}
          <p className="text-sm text-indigo-800"><span className="font-semibold">Data:</span> {new Date(date + 'T00:00:00').toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-sm text-indigo-800"><span className="font-semibold">Capacitat:</span> {table.capacity} persones</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonSelector
            id="reservedBy"
            label="Reserva feta per"
            people={reservablePeople}
            selectedPersonId={reservedById}
            onChange={(id) => setReservedById(id as string)}
            required
          />

          <div>
            <PersonSelector
              id="attendees"
              label="Assistents"
              people={attendablePeople}
              selectedPersonIds={attendeeIds}
              onChange={(ids) => handleAttendeeChange(ids as string[])}
              allowMultiple
              maxSelections={currentCapacity}
              required
            />
            {selectedAttendees.length > 0 && (
              <div className="mt-2 space-y-1 border border-gray-300 rounded-md p-2 max-h-32 overflow-y-auto bg-gray-50"> {/* Fons lleugerament diferent */}
                <p className="text-xs text-gray-600 mb-1">Assistents seleccionats:</p>
                {selectedAttendees.map(person => (
                  <div key={person.id} className="flex items-center justify-between text-sm bg-white px-2 py-1 rounded border border-gray-200"> {/* Vora per a cada element */}
                    <span className="text-gray-800">{person.name}</span> {/* Text més fosc */}
                    <button 
                      type="button" 
                      onClick={() => removeAttendee(person.id)} 
                      className="text-red-600 hover:text-red-800" /* Color de botó més fosc */
                      aria-label={`Eliminar ${person.name} dels assistents`}
                    >
                      <RemoveIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center text-sm text-gray-700 mt-1"> {/* Text més fosc */}
              <UsersIcon className="w-4 h-4 mr-1 text-gray-500" />
              <span>Seleccionats {attendeeIds.length} de {currentCapacity} llocs.</span>
            </div>
          </div>
          
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="isClosedByUser"
                name="isClosedByUser"
                type="checkbox"
                checked={isClosedByUser}
                onChange={(e) => setIsClosedByUser(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="isClosedByUser" className="font-medium text-gray-900">
                Tancar aquesta taula
              </label>
              <p className="text-gray-600">No es permetran altres reserves. Podeu afegir més convidats més tard fins a la capacitat màxima.</p>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (opcional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Qualsevol petició especial o detall..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" /* Colors de botó cancel·lar actualitzats */
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {existingReservation ? 'Actualitzar Reserva' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};